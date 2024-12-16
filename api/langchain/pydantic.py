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
    """Object for single diagnosing the agent based on user operation.
    """
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
