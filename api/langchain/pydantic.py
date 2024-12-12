from typing import Dict, List, Optional, Tuple

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
