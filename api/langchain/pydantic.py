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


class AgentDiagnosis(BaseModel):
    """Diagnosis from the agent based on user operation, here's an example:

    {
        "operation": "accept",
        "candidate": {
            "score": 0.8277086615562439,
            "sourceColumn": "id",
            "targetColumn": "sample_type_id"
        },
        "references": [
            {
                "score": 0.8277086615562439,
                "sourceColumn": "id",
                "targetColumn": "sample_type_id"
            },
            ...
        ],
        "uniqueValues": {
            "sourceColumn": ["1", "2", "3", "4", "5"],
            "targetColumns": [
                {
                    "targetColumn": "sample_type_id",
                    "uniqueValues": ["1", "2", "3", "4", "5"]
                },
                ...
            ]
        }

    """

    status: str = Field(description="The status of the diagnosis: success or failure")
    response: str = Field(description="The response from the agent")
    diagnosis: List[DiagnoseObject] = Field(
        description="""The diagnosis for user operation, the list looks like:
        [
            {
                "reason": "The source column name and target column name are exact match",
                "confidence": 0.9,
            },
            {
                "reason": "The source column name and target column name are similar",
                "confidence": 0.7,
            },
            {
                "reason": "The source values and target values are aligned",
                "confidence": 0.6,
            }
            ...
        ]""",
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
    entry: str = Field(description="The entry of the relative knowledge")
    description: str = Field(description="The description of the relative knowledge")


class CandidateExplanation(BaseModel):
    """Explanation for the candidate based on the diagnosis.
    Including the explanations on the connection between source column and target column, source values and target values.
    Noted that neither the column names nor the values might not be exactly the same, you should infer it semantically based on your knowledge and the information from RAG.
    e.g.
    """

    is_match: bool = Field(
        description="The flag to indicate if the candidate is a match"
    )
    explanations: List[ExplanationObject] = Field(
        description="""
        The explanations for the candidate, the list looks like:
        [
            {
                "type": "name",
                "content": "The source column name and target column name are exact match",
                "confidence": 0.9,
            },
            {
                "type": "token",
                "content": "The source column name and target column name are similar",
                "confidence": 0.7,
            },
            {
                "type": "value",
                "content": "The source values and target values are aligned",
                "confidence": 0.6,
            }
            ...
        ]
        """
    )
    matching_values: List[List[str]] = Field(
        description="""The possible matching values according to your knowledge and the information from RAG on the source values and target values,
        the list looks like:
        [
            ["ia", "FIGO IA"],
            ["ib", "FIGO IB"],
            ["iia", "FIGO IIA"],
        ]
        
        If you don't have any matching values or you think the candidate might not match, it will be an empty list.
        """
    )
    relative_knowledge: List[RelativeKnowledge] = Field(
        description="""The relative knowledge you think is related to the candidate from RAG retrived by the agent.
        Note that the knowledge should be important and relevant to the candidate.
        e.g. for candidate "ajcc_pathlogic_n" to "stage", the relative knowledge might be: AJCC, UICC, etc.
        """
    )
