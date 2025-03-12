from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field


class AgentResponse(BaseModel):
    """Response from the agent."""

    status: str = Field(description="The status of the response: success or failure")
    response: str = Field(description="The response from the agent")
    candidates: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="""The candidates for source column(s), the layered dictionary looks like:
        [
            {"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp"},
            {"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp"},
            ...
        ]
        """,
    )


class CandidateObject(BaseModel):
    """Object for single candidate match or mismatch."""

    sourceColumn: str = Field(description="The source column name")
    targetColumn: str = Field(description="The target column name")
    score: float = Field(description="The score of the candidate")
    # matcher: str = Field(description="The matcher used for the candidate")


class SearchResponse(BaseModel):
    """Response from the agent search."""

    status: str = Field(description="The status of the response: success or failure")
    candidates: Optional[List[CandidateObject]] = Field(
        description="The searched candidates"
    )


class DiagnoseObject(BaseModel):
    """Object for single diagnosing the agent based on user operation."""

    reason: str = Field(description="The reason for the diagnosis")
    confidence: float = Field(description="The confidence of the diagnosis")


class AgentAction(BaseModel):
    action: str = Field(description="""The action for the agent.""")
    reason: str = Field(description="The reason for the action")
    confidence: float = Field(description="The confidence of the action")


class AgentSuggestions(BaseModel):
    actions: List[AgentAction] = Field(
        description="""The agent actions suggected based on the diagnosis user selected."""
    )


class Explanation(BaseModel):
    """Detailed explanation for a candidate match or mismatch."""

    type: str = Field(
        description="""Type of explanation, can be one of the following:
                        - semantic: based on semantic relationships
                        - name: based on column names
                        - token: based on tokens in column names or values
                        - value: based on values in the column"""
    )
    reason: str = Field(description="Detailed content of the explanation")
    reference: Optional[str] = Field(
        description="Reference to the explanation, if available"
    )
    confidence: Optional[float] = Field(
        description="Confidence level of the explanation, ranging from 0 to 1"
    )
    is_match: bool = Field(description="Indicates if the explanation supports a match")


class RelevantKnowledge(BaseModel):
    entry: str = Field(
        description="The entry of the relevant knowledge. Example: FIGO, AJCC, UICC"
    )
    description: str = Field(description="The description of the relevant knowledge")


class CandidateExplanation(BaseModel):
    """Explanation for the candidate based on the diagnosis."""

    explanations: List[Explanation] = Field(
        description="List of explanations for the candidate."
    )
    is_match: bool = Field(description="Flag indicating if the candidate is a match")
    relevant_knowledge: List[RelevantKnowledge] = Field(
        description="""Relevant knowledge related to the candidate in RelevantKnowledge format.
        """
    )


class SuggestedValueMappings(BaseModel):
    """Value mappings between source and target values."""

    sourceColumn: str = Field(description="The source column name")
    targetColumn: str = Field(description="The target column name")
    matchingValues: List[List[Union[str, float, int, bool, None]]] = Field(
        description="""Possible matching values between source and target values.
        Example:
        [
            ["ia", "FIGO IA"],
            ["ib", "FIGO IB"],
            ["iia", "FIGO IIA"],
        ]
        """
    )


class ActionResponse(BaseModel):
    status: str = Field(description="The status of the action: success or failure")
    response: str = Field(description="The response from the agent")
    action: str = Field(
        description="""The action on candidates, must be one of:
        prune - prune the target candidates list from the existing candidates.
        replace - replace the target candidates list with the new candidates.
        undo - undo the last action taken by the user.
        """
    )
    target_candidates: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="""The updated candidates for source column(s), the layered dictionary looks like:
        [
            {"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp"},
            {"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp"},
            ...
        ]""",
    )


class TargetClusterInfo(BaseModel):
    """Target cluster information from the agent."""

    name: str = Field(description="The name of the target cluster")
    keywords: List[str] = Field(description="The keywords of the target cluster")
    description: str = Field(description="The description of the target cluster")


class TargetClusters(BaseModel):
    """Target clusters from the agent."""

    clusters: List[TargetClusterInfo] = Field(description="The target clusters")


class RelatedSource(BaseModel):
    """Related source from the agent."""

    snippet: str = Field(description="The snippet of the related source")
    title: str = Field(description="The title of the related source")
    link: str = Field(description="The link of the related source")


class RelatedSources(BaseModel):
    """Related sources from the agent."""

    sources: List[RelatedSource] = Field(description="The related sources")
