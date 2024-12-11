import os
from typing import Optional, List
import logging
from dotenv import load_dotenv
load_dotenv()
from pydantic import BaseModel
from flask.logging import default_handler

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage

logger = logging.getLogger("bdiviz_flask.sub")

class Agent:
    def __init__(self) -> None:
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")

    def invoke(self, prompt: str, tools: List, output_structure: BaseModel) -> BaseModel:
        messages = [HumanMessage(prompt)]
        llm_with_tools = self.llm.bind_tools(tools)
        # structured_llm = self.llm.with_structured_output(output_structure)

        ai_message = llm_with_tools.invoke(prompt)
        messages.append(ai_message)

        logger.info(f"[Agent] Tool call: {ai_message.tool_calls}")
        if ai_message.tool_calls is not None:
            for tool_call in ai_message.tool_calls:
                tool_dict = {}
                for tool in tools:
                    tool_dict[tool.name] = tool
                selected_tool = tool_dict[tool_call["name"].lower()]
                tool_msg = selected_tool.invoke(tool_call)
                messages.append(tool_msg)
        
        response = llm_with_tools.with_structured_output(output_structure).invoke(messages)

        return response

    
    def bind_tools(self, tools: List, tool_choice: Optional[str] = None) -> None:
        if tool_choice is not None:
            return self.llm.bind_tools(tools, tool_choice=tool_choice)
        else:
            logger.info(f"[Agent] Binding tools to the agent...")
            return self.llm.bind_tools(tools)


AGENT = Agent()