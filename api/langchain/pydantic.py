from typing import Optional
from typing import Dict, List, Tuple
from pydantic import BaseModel, Field


class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
    rating: Optional[int] = Field(
        default=None, description="How funny the joke is, from 1 to 10"
    )

class AgentResponse(BaseModel):
    """Response from the agent.
    """

    status: str = Field(description="The status of the response: success or failure")
    response: str = Field(description="The response from the agent")
    candidates: Optional[Dict[str, List[Tuple[str, float]]]] = Field(
        default=None, description="""The candidates for the source column, the layered dictionary looks like:
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
        }"""
    )