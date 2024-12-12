import logging
import os
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()
from flask.logging import default_handler
from langchain.output_parsers import PydanticOutputParser
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel

logger = logging.getLogger("bdiviz_flask.sub")


class Agent:
    def __init__(self) -> None:
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")
        self.memory = MemorySaver()

    def invoke(
        self, prompt: str, tools: List, output_structure: BaseModel
    ) -> BaseModel:
        output_parser = PydanticOutputParser(pydantic_object=output_structure)

        prompt = self.generate_prompt(prompt, output_parser)
        agent_executor = create_react_agent(self.llm, tools, checkpointer=self.memory)

        responses = []
        config = {"configurable": {"thread_id": "bdiviz-1"}}
        for chunk in agent_executor.stream(
            {"messages": [HumanMessage(content=prompt)]}, config
        ):
            logger.info(chunk)
            logger.info("----")
            responses.append(chunk)

        final_response = responses[-1]["agent"]["messages"][0].content
        response = output_parser.parse(final_response)

        return response

    def bind_tools(self, tools: List, tool_choice: Optional[str] = None) -> None:
        if tool_choice is not None:
            return self.llm.bind_tools(tools, tool_choice=tool_choice)
        else:
            logger.info(f"[Agent] Binding tools to the agent...")
            return self.llm.bind_tools(tools)

    def generate_prompt(self, prompt: str, output_parser: PydanticOutputParser) -> str:
        instructions = output_parser.get_format_instructions()
        template = f"""
You are a helpful assistant on BDI-Viz: A heatmap visualizaition tool for schema matching.
You are an assistant that must return information in a strict schema.
Do not provide any reasoning, apologies, or explanations.
Directly return the JSON in the exact schema described below. 
No extra text before or after the JSON.

{instructions}

Prompt: {prompt}
"""
        return template


AGENT = Agent()
