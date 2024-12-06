import os
from dotenv import load_dotenv
load_dotenv()
from pydantic import BaseModel

from langchain_anthropic import ChatAnthropic

class Agent:
    def __init__(self) -> None:
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-20240620")

    def invoke(self, prompt: str, output_structure: BaseModel) -> BaseModel:
        structured_llm = self.llm.with_structured_output(output_structure)
        response = structured_llm.invoke(prompt)
        return response

    


