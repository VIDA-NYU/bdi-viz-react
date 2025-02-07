import logging
from typing import Any, Dict, Generator, List, Optional

from dotenv import load_dotenv

load_dotenv()
from langchain.output_parsers import PydanticOutputParser
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

# from langchain_anthropic import ChatAnthropic
# from langchain_ollama import ChatOllama
# from langchain_together import ChatTogether
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel

from ..tools.candidate_butler import candidate_butler_tools, read_source_cluster_details
from ..tools.rag_researcher import retrieve_from_rag
from .memory import MemoryRetriver
from .pydantic import ActionResponse, AgentSuggestions, CandidateExplanation

logger = logging.getLogger("bdiviz_flask.sub")


class Agent:
    def __init__(self) -> None:
        # OR claude-3-5-sonnet-20240620
        # self.llm = ChatAnthropic(model="claude-3-5-sonnet-latest")
        # self.llm = ChatOllama(base_url='https://ollama-asr498.users.hsrn.nyu.edu', model='llama3.1:8b-instruct-fp16', temperature=0.2)
        # self.llm = ChatOllama(model="deepseek-r1:1.5b", temperature=0.2)
        # self.llm = ChatTogether(model="meta-llama/Llama-3.3-70B-Instruct-Turbo")
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
        self.agent_config = {"configurable": {"thread_id": "bdiviz-1"}}

        self.memory = MemorySaver()
        self.store = MemoryRetriver()
        self.is_initialized = False

    def initialize(self, results: Optional[List[Dict[str, Any]]] = None) -> None:
        logger.info(f"[Agent] Initializing the agent...")
        system_messages = [
            """You are a helpful assistant for BDI-Viz: A heatmap visualization tool for schema matching.
    Your task is to assist with schema matching operations and provide information in a strict schema format.
    Avoid providing any reasoning, apologies, or explanations.""",
            # f"""Here are the candidates for all available matchers:
            # {results}
            # Keep these candidates in mind as you proceed with the following user operations."""
        ]

        self.invoke_system(system_messages[0])
        self.is_initialized = True

    def explain(self, candidate: Dict[str, Any]) -> CandidateExplanation:
        logger.info(f"[Agent] Explaining the candidate...")
        # logger.info(f"{diagnose}")

        # search for related false negative / false positive candidates
        related_matches = self.store.search_matches(candidate["sourceColumn"], limit=3)
        related_mismatches = self.store.search_mismatches(
            f"{candidate['sourceColumn']}::{candidate['targetColumn']}", limit=3
        )

        prompt = f"""
Please analyze the details of the following user operation:
- Source Column: {candidate["sourceColumn"]}
- Target Column: {candidate["targetColumn"]}
- Source Sample Values: {candidate["sourceValues"]}
- Target Sample Values: {candidate["targetValues"]}

Related Matches:
{related_matches}

Related Mismatches:
{related_mismatches}

Instructions:
1. Carefully review the related matches and mismatches. Compare these historical mappings with the current candidate to validate the match.
2. Evaluate whether the source and target columns can be validly matched by assessing:
    a. The similarity between the column names.
    b. The alignment of the sample values from each column.
    c. The history of false and true selections linked with these columns.
3. Provide up to four possible explanations for why these columns might be mapped together, referencing the historical matches and mismatches if necessary.
4. For categorical (non-numeric) columns, suggest potential pairs of matching values based on the sample data. If the values are numeric, do not return any pairs.
5. Include any additional context or key terms (i.e., "relative knowledge") that could support or contradict the current mapping.
        """
        logger.info(f"[EXPLAIN] Prompt: {prompt}")
        response = self.invoke(
            prompt=prompt,
            tools=[retrieve_from_rag],
            output_structure=CandidateExplanation,
        )
        return response

    def make_suggestion(
        self, user_operation: Dict[str, Any], diagnosis: Dict[str, float]
    ) -> AgentSuggestions:
        logger.info(f"[Agent] Making suggestion to the agent...")
        # logger.info(f"{diagnosis}")

        diagnosis_str = "\n".join(f"{key}: {value}" for key, value in diagnosis.items())
        user_operation_str = "\n".join(
            f"{key}: {value}" for key, value in user_operation.items()
        )

        prompt = f"""
    User Operation:
    {user_operation_str}

    Diagnosis:
    {diagnosis_str}

    **Instructions**:
    1. Generate 2-3 suggestions based on the user operation and diagnosis:
        - **undo**: Undo the last action if it seems incorrect.
        - **prune_candidates**: Suggest pruning candidates based on RAG expertise.
        - **update_embedder**: Recommend a more accurate model if matchings seem wrong.
    2. Provide a brief explanation for each suggestion.
    3. Include a confidence score for each suggestion.
    """

        # logger.info(f"[SUGGESTION] Prompt: {prompt}")

        response = self.invoke(
            prompt=prompt,
            tools=[],
            output_structure=AgentSuggestions,
        )

        return response

    def apply(
        self, action: Dict[str, Any], previous_operation: Dict[str, Any]
    ) -> Optional[ActionResponse]:
        user_operation = previous_operation["operation"]
        candidate = previous_operation["candidate"]
        # references = previous_operation["references"]

        source_cluster = read_source_cluster_details(candidate["sourceColumn"])

        logger.info(f"[Agent] Applying the action: {action}")

        if action["action"] == "prune_candidates":
            tools = candidate_butler_tools + [retrieve_from_rag]
            prompt = f"""
You have access to the user's previous operations and the related source column clusters. 
Your goal is to help prune (remove) certain candidate mappings in the related source columns based on the user's decisions following the instructions below.

**Previous User Operation**:
Operation: {user_operation}
Candidate: {candidate}

**Related Source Columns and Their Candidates**:
{source_cluster}

**Instructions**:
1. Identify **Related Source Columns and Their Candidates**.
2. Consult Domain Knowledge (using **retrieve_from_rag**) if any clarifications are needed.
3. Decide Which Candidates to Prune based on your understanding and the user’s previous operations, then compile the candidates after pruning into a **dictionary** like this:
    [
        {{"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp"}},
        {{"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp"}},
        ...
    ]
4. Call **update_candidates** with this updated dictionary as the parameter to refine the heatmap.
                """

            logger.info(f"[ACTION-PRUNE] Prompt: {prompt}")
            response = self.invoke(
                prompt=prompt,
                tools=tools,
                output_structure=ActionResponse,
            )
            return response

        elif action["action"] == "undo":
            return ActionResponse(
                status="success",
                response="Action successfully undone.",
                action="undo",
            )
        else:
            logger.info(f"[Agent] Applying the action: {action}")
            return

    def remember_fp(self, candidate: Dict[str, Any]) -> None:
        logger.info(f"[Agent] Remembering the false positive...")
        self.store.put_mismatch(candidate)

    def remember_fn(self, candidate: Dict[str, Any]) -> None:
        logger.info(f"[Agent] Remembering the false negative...")
        self.store.put_match(candidate)

    def invoke(
        self, prompt: str, tools: List, output_structure: BaseModel
    ) -> BaseModel:
        output_parser = PydanticOutputParser(pydantic_object=output_structure)

        prompt = self.generate_prompt(prompt, output_parser)
        agent_executor = create_react_agent(
            self.llm, tools, store=self.store
        )  # checkpointer=self.memory

        responses = []
        for chunk in agent_executor.stream(
            {"messages": [HumanMessage(content=prompt)]}, self.agent_config
        ):
            logger.info(chunk)
            logger.info("----")
            responses.append(chunk)

        final_response = responses[-1]["agent"]["messages"][0].content
        response = output_parser.parse(final_response)

        return response

    def invoke_system(self, prompt: str) -> Generator[AIMessage, None, None]:
        agent_executor = create_react_agent(self.llm, store=self.store)
        for chunk in agent_executor.stream(
            {"messages": [SystemMessage(content=prompt)]}, self.agent_config
        ):
            logger.info(chunk)
            yield chunk

    def bind_tools(self, tools: List, tool_choice: Optional[str] = None) -> None:
        if tool_choice is not None:
            return self.llm.bind_tools(tools, tool_choice=tool_choice)
        else:
            logger.info(f"[Agent] Binding tools to the agent...")
            return self.llm.bind_tools(tools)

    def generate_prompt(self, prompt: str, output_parser: PydanticOutputParser) -> str:
        instructions = output_parser.get_format_instructions()
        template = f"""
Directly return the JSON in the exact schema described below. 
No extra text before or after the JSON.

{instructions}

Prompt: {prompt}
"""
        return template


AGENT = Agent()
