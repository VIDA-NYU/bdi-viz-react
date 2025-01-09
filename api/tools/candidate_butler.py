import logging
from typing import Dict, List, Tuple

from langchain_core.tools import tool

from ..matching_task import MATCHING_TASK

logger = logging.getLogger("bdiviz_flask.sub")


@tool
def read_all_source_columns() -> List[str]:
    """
    Read all the source columns from the heapmap.

    Returns:
        list: The list of source columns
    """
    candidates_dict = MATCHING_TASK.get_cached_candidates()
    logger.info("[Candidate Butler] Get all source columns......")
    return list(candidates_dict.keys())


@tool
def read_source_column_candidate_details(
    source_column: str,
) -> Dict[str, List[Tuple[str, float]]]:
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
        return {source_column: candidates_dict[source_column]}


@tool
def read_source_cluster_details(
    source_column: str,
) -> Dict[str, List[Tuple[str, float]]]:
    """
    Reads the details of the source cluster for a given source column.

    Args:
        source_column (str): The name of the source column for which to read the cluster details.
    Returns:
        Dict[str, List[Tuple[str, float]]]: A dictionary where the key is the source column name and the value
        is a list of tuples, each containing a candidate string and its associated float value.
    """

    top_neighbors = 3
    candidates_dict = MATCHING_TASK.get_cached_candidates()
    source_cluster = MATCHING_TASK.get_cached_source_clusters()[source_column][
        1 : top_neighbors + 1
    ]

    logger.info(f"[Candidate Butler] Read source cluster for {source_column}......")

    return {
        column: candidates_dict[column]
        for column in source_cluster
        if column != source_column
    }


@tool
def read_all_candidates() -> Dict[str, List[Tuple[str, float]]]:
    """
    Read all the candidates from the heapmap.

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
    logger.info("[Candidate Butler] Get all source columns......")
    return candidates_dict


@tool
def update_candidates(candidates: Dict[str, List[Tuple[str, float]]]):
    """
    Updates the heatmap with refined candidate mappings.

    - Source columns (keys) must match those from read_candidates.
    - Target column names (first item in each tuple) must not be changed.
    - Filter or remove tuples to refine each column's candidates.

    Args:
        candidates (dict):
            Example:
            {
                "source_col_1": [("target_col_1", 0.9), ("target_col_2", 0.7)],
                "source_col_2": [("target_col_3", 0.8)]
            }
    """
    logger.info(
        f"[Candidate Butler] Update candidates to the matching task {candidates}......"
    )
    MATCHING_TASK.update_cached_candidates(candidates)


candidate_butler_tools = [
    update_candidates,
]
