import logging
from typing import Dict, List, Tuple

from langchain_core.tools import tool

from ..matching_task import MATCHING_TASK

logger = logging.getLogger("bdiviz_flask.sub")

@tool
def read_candidates(source_column: str):
    """
    Read the candidates from the heapmap for the given source column.

    Args:
        source_column (str): The source column name
    
    Returns:
        dict: The candidates for the source column, the layered dictionary looks like:
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
        }

    """
    candidates_dict = MATCHING_TASK.get_cached_candidates()
    logger.info(f"[Candidate Butler] Read candidates for {source_column}......")
    if source_column in candidates_dict:
        return {
            source_column: candidates_dict[source_column]
        }

@tool
def update_candidates(candidates: Dict[str, List[Tuple[str, float]]]):
    """
    Update the candidates back to heapmap.
    
    The source columns should be exactly the same from the read_candidates tool, within each source column, the target column names (first element of the tuple) shouldn't be changed.
    However, you need to select/filter the candidates for each source column and update them to a more accurate list.

    Args:
        candidates (dict): The candidates dictionary to update, the layered dictionary looks like:
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
        }
    """
    logger.info(f"[Candidate Butler] Update candidates to the matching task {candidates}......")
    MATCHING_TASK.update_cached_candidates(candidates)



candidate_butler_tools = [
    read_candidates,
    update_candidates
]