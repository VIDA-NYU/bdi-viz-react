from typing import Dict, List, Optional, Tuple, Union

from pydantic import BaseModel, Field


class AgentResponse(BaseModel):
    """Response from the agent."""

    status: str = Field(description="The status of the response: success or failure")
    response: str = Field(description="The response from the agent")
    candidates: Optional[Dict[str, List[Tuple[str, float]]]] = Field(
        default=None,
        description="""The candidates for source column(s), the layered dictionary looks like:
        {
            "source_column_1": [
                ("target_column_1", 0.9),
                ("target_column_15", 0.7),
                ...
            ],
            "source_column_2": [
                ("target_column_6", 0.5),
                ...
            ]
            ...
        }""",
    )


class DiagnoseObject(BaseModel):
    """Object for single diagnosing the agent based on user operation."""

    reason: str = Field(description="The reason for the diagnosis")
    confidence: float = Field(description="The confidence of the diagnosis")


class AgentAction(BaseModel):
    action: str = Field(
        description="""
                        The action for the agent, must be one of the following:
                            prune_candidates - suggest pruning some candidates base on your expertise from RAG.
                            update_embedder - suggest change to a more accurate model for this task if you think none of the matchings are right.
                            undo - undo the last action taken by the user because you think it was a mistake.
                        """
    )
    reason: str = Field(description="The reason for the action")
    confidence: float = Field(description="The confidence of the action")


class AgentSuggestions(BaseModel):
    actions: List[AgentAction] = Field(
        description="""The agent actions suggected based on the diagnosis user selected."""
    )


class ExplanationObject(BaseModel):
    type: str = Field(
        description="""
                      The type of the explanation, from the following types: 
                        - name: this explanation is inferred from the column names
                        - token: this explanation is inferred from the tokens in the column names or values
                        - value: this explanation is inferred from the values in the column
                        - semantic: this explanation is inferred from the semantical relationship between the source and target
                      """
    )
    content: str = Field(description="The content of the explanation")
    confidence: float = Field(
        description="The confidence of the explanation, from 0 to 1"
    )


class RelativeKnowledge(BaseModel):
    entry: str = Field(
        description="The entry of the relative knowledge. Example: FIGO, AJCC, UICC"
    )
    description: str = Field(description="The description of the relative knowledge")


class CandidateExplanation(BaseModel):
    """Explanation for the candidate based on the diagnosis."""

    is_match: bool = Field(description="Flag indicating if the candidate is a match")
    explanations: List[ExplanationObject] = Field(
        description="List of explanations for the candidate."
    )
    matching_values: List[List[Union[str, float, int, bool, None]]] = Field(
        description="""Possible matching values between source and target values.
        Example:
        [
            ["ia", "FIGO IA"],
            ["ib", "FIGO IB"],
            ["iia", "FIGO IIA"],
        ]
        """
    )
    relative_knowledge: List[RelativeKnowledge] = Field(
        description="""Relevant knowledge related to the candidate in RelativeKnowledge format.
        """
    )


class ActionResponse(BaseModel):
    status: str = Field(description="The status of the action: success or failure")
    response: str = Field(description="The response from the agent")
    action: str = Field(
        description="""The action on candidates, must be one of:
        prune - prune the target candidates list from the existing candidates.
        replace - replace the target candidates list with the new candidates.
        """
    )
    target_candidates: Optional[Dict[str, List[Tuple[str, float]]]] = Field(
        default=None,
        description="""The updated candidates for source column(s), the layered dictionary looks like:
        {
            "source_column_1": [
                ("target_column_1", 0.9),
                ("target_column_15", 0.7),
                ...
            ],
            "source_column_2": [
                ("target_column_6", 0.5),
                ...
            ]
            ...
        }""",
    )


class TargetClusterInfo(BaseModel):
    """Target cluster information from the agent."""

    name: str = Field(description="The name of the target cluster")
    keywords: List[str] = Field(description="The keywords of the target cluster")
    description: str = Field(description="The description of the target cluster")


class TargetClusters(BaseModel):
    """Target clusters from the agent."""

    clusters: List[TargetClusterInfo] = Field(description="The target clusters")
