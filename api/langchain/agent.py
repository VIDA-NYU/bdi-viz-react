import logging
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()
from flask.logging import default_handler
from langchain.output_parsers import PydanticOutputParser
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel

from .pydantic import AgentDiagnosis

logger = logging.getLogger("bdiviz_flask.sub")


class Agent:
    def __init__(self) -> None:
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")
        self.memory = MemorySaver()

    def diagnose(self, diagnose: Dict[str, Any]) -> AgentDiagnosis:
        logger.info(f"[Agent] Diagnosing the agent...")
        # logger.info(f"{diagnose}")

        prompt = f"""
Please diagnose the following user operation:

Operation: {diagnose["operation"]}
Candidate: {diagnose["candidate"]}
References: {diagnose["references"]}
Unique Values: {diagnose["uniqueValues"]}

"""

        response = self.invoke(
            prompt=prompt,
            tools=[],
            output_structure=AgentDiagnosis,
        )

        return response

    def make_suggestion(self, diagnosis: Dict[str, float]) -> None:
        logger.info(f"[Agent] Making suggestion to the agent...")
        logger.info(f"{diagnosis}")

        prompt = f"""
The user choose the most applicable diagnosis based on the previous user operation:
{diagnosis}

Please suggest a corresponding suggestion for it based on the diagnosis and the suggestions and diagnoses in your memory.
The suggested action to choose from:
prune_candidates - suggest pruning some candidates base on your expertise from RAG.
update_embedder - suggest change to a more accurate model for this task if you think none of the matchings are right.


"""

        response = self.invoke(
            prompt=prompt,
            tools=[],
            output_structure=AgentDiagnosis,
        )

        return response

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
