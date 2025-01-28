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
from .pydantic import ActionResponse, AgentSuggestions, CandidateExplanation

logger = logging.getLogger("bdiviz_flask.sub")

FN_CANDIDATES = [
    {
        "sourceColumn": "Tumor_Site",
        "targetColumn": "site_of_resection_or_biopsy",
        "sourceValues": [
            "Posterior endometrium",
            "Anterior endometrium",
            "Other, specify",
        ],
        "targetValues": [
            "Other specified parts of female genital organs",
            "Endometrium",
        ],
    },
    {
        "sourceColumn": "Histologic_type",
        "targetColumn": "primary_diagnosis",
        "sourceValues": ["Endometrioid", "Serous", "Clear cell", "Carcinosarcoma"],
        "targetValues": ["Serous adenocarcinofibroma", "clear cell", "Carcinosarcoma"],
    },
]

FP_CANDIDATES = [
    {
        "sourceColumn": "Gender",
        "targetColumn": "relationship_gender",
        "sourceValues": ["Female", "Male"],
        "targetValues": ["female", "male"],
    },
    {
        "sourceColumn": "Ethnicity",
        "targetColumn": "race",
        "sourceValues": ["Not-Hispanic or Latino", "Hispanic or Latino"],
        "targetValues": ["native hawaiian or other pacific islander", "white", "asian"],
    },
    {
        "sourceColumn": "FIGO_stage",
        "targetColumn": "iss_stage",
        "sourceValues": ["IIIC1", "IA", "IIIB"],
        "targetValues": ["I", "II", "III"],
    },
    {
        "sourceColumn": "tumor_Stage-Pathological",
        "targetColumn": "figo_stage",
        "sourceValues": ["Stage I", "Stage II", "Stage III"],
        "targetValues": ["Stage I", "Stage II", "Stage III"],
    },
    {
        "sourceColumn": "tumor_Stage-Pathological",
        "targetColumn": "ajcc_pathologic_t",
        "sourceValues": ["Stage I", "Stage II", "Stage III"],
        "targetValues": ["T0", "T1a", "T2b"],
    },
    {
        "sourceColumn": "Path_Stage_Reg_Lymph_Nodes-pN",
        "targetColumn": "uicc_clinical_n",
        "sourceValues": ["pN1 (FIGO IIIC1)", "pN0", "pNX"],
        "targetValues": ["N1", "N0", "NX"],
    },
    {
        "sourceColumn": "Path_Stage_Primary_Tumor-pT",
        "targetColumn": "ajcc_pathologic_stage",
        "sourceValues": ["pT1b (FIGO IB)", "pT3a (FIGO IIIA)", "pT1 (FIGO I)"],
        "targetValues": ["Stage I", "Stage IB", "StageIIIA"],
    },
    {
        "sourceColumn": "Clin_Stage_Dist_Mets-cM",
        "targetColumn": "uicc_pathologic_m",
        "sourceValues": ["cM0", "cM1"],
        "targetValues": ["cM0 (i+)", "M0", "M1"],
    },
]


class Agent:
    def __init__(self) -> None:
        # OR claude-3-5-sonnet-20240620
        # self.llm = ChatAnthropic(model="claude-3-5-sonnet-latest")
        # self.llm = ChatOllama(base_url='https://ollama-asr498.users.hsrn.nyu.edu', model='llama3.1:8b-instruct-fp16', temperature=0.2)
        # self.llm = ChatTogether(model="meta-llama/Llama-3.3-70B-Instruct-Turbo")
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
        self.agent_config = {"configurable": {"thread_id": "bdiviz-1"}}

        self.memory = MemorySaver()
        self.is_initialized = False

    def initialize(self, results: List[Dict[str, Any]]) -> None:
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
        prompt = f"""
    Diagnose the following user operation:
        - Source Column: {candidate["sourceColumn"]}
        - Target Column: {candidate["targetColumn"]}
        - Source Value Sample: {candidate["sourceValues"]}
        - Target Value Sample: {candidate["targetValues"]}

    **Instructions**:
    1. Assess if the source and target columns are a valid match.
    2. Provide four (4) possible explanations for why these columns might be mapped together.
    3. Suggest potential matching value pairs based on the provided samples, ensuring they are relevant to the source and target columns. For numeric columns, do not return potential value pairs.
    4. Generate any relevant context or key terms ("relative knowledge") about the source and target columns.
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
        prompt = f"""
You have identified a false positive in the candidate mappings.
Please keep this in mind as you proceed with the following user operations.
    - Source Column: {candidate["sourceColumn"]}
    - Target Column: {candidate["targetColumn"]}
    - Source Value Sample: {candidate["sourceValues"]}
    - Target Value Sample: {candidate["targetValues"]}
"""
        logger.info(f"[REMEMBER-FP] Prompt: {prompt}")
        self.invoke_system(prompt)

    def remember_fn(self, candidate: Dict[str, Any]) -> None:
        logger.info(f"[Agent] Remembering the false negative...")
        prompt = f"""
You have identified a false negative in the candidate mappings.
Please keep this in mind as you proceed with the following user operations.
    - Source Column: {candidate["sourceColumn"]}
    - Target Column: {candidate["targetColumn"]}
    - Source Value Sample: {candidate["sourceValues"]}
    - Target Value Sample: {candidate["targetValues"]}
"""
        logger.info(f"[REMEMBER-FN] Prompt: {prompt}")
        self.invoke_system(prompt)

    def invoke(
        self, prompt: str, tools: List, output_structure: BaseModel
    ) -> BaseModel:
        output_parser = PydanticOutputParser(pydantic_object=output_structure)

        prompt = self.generate_prompt(prompt, output_parser)
        agent_executor = create_react_agent(self.llm, tools, checkpointer=self.memory)

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
        agent_executor = create_react_agent(self.llm, [], checkpointer=self.memory)
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
