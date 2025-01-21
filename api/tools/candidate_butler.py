import logging
from typing import Any, Dict, List, Tuple

from langchain_core.tools import tool

from ..matching_task import MATCHING_TASK

logger = logging.getLogger("bdiviz_flask.sub")


# @tool
# def read_all_source_columns() -> List[str]:
#     """
#     Read all the source columns from the heapmap.

#     Returns:
#         list: The list of source columns
#     """
#     candidates_dict = MATCHING_TASK.get_cached_candidates()
#     logger.info("[Candidate Butler] Get all source columns......")
#     return list(candidates_dict.keys())


# @tool
# def read_source_column_candidate_details(
#     source_column: str,
# ) -> Dict[str, List[Tuple[str, float]]]:
#     """
#     Read the candidates from the heapmap for the given source column.

#     Args:
#         source_column (str): The source column name

#     Returns:
#         dict: The candidates for the source column, the layered dictionary looks like:
#         {
#             "source_column_1": [
#                 ("target_column_1", 0.9),
#                 ("target_column_15", 0.7),
#                 ...
#             ],
#             "source_column_2": [
#                 ("target_column_6", 0.5),
#                 ...
#             ]
#             ...
#         }

#     """
#     candidates_dict = MATCHING_TASK.get_cached_candidates()
#     logger.info(f"[Candidate Butler] Read candidates for {source_column}......")
#     if source_column in candidates_dict:
#         return {source_column: candidates_dict[source_column]}


@tool
def read_source_cluster_details(
    source_column: str,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Reads the details of the source cluster for a given source column.

    Args:
        source_column (str): The name of the source column for which to read the cluster details.
    Returns:
        Dict[str, List[Tuple[str, float]]]: A dictionary where the key is the source column name and the value
        is a list of tuples, each containing a candidate string and its associated float value.
    """

    top_neighbors = 3
    cached_candidates = MATCHING_TASK.get_cached_candidates()
    source_cluster = MATCHING_TASK.get_cached_source_clusters()[source_column][
        1 : top_neighbors + 1
    ]

    logger.info(f"[Candidate Butler] Read source cluster for {source_column}......")

    return {
        column: [
            candidate
            for candidate in cached_candidates
            if candidate["sourceColumn"] == column
        ]
        for column in source_cluster
        if column != source_column
    }


@tool
def update_candidates(candidates: List[Dict[str, Any]]):
    """
    Updates the heatmap with refined candidate mappings.

    - Source columns (keys) must match those from read_candidates.
    - Target column names (first item in each tuple) must not be changed.
    - Filter or remove items to refine each column's candidates.
    - Matcher names (second item in each tuple) must not be changed.

    Args:
        candidates (dict):
            Example:
            [
                {"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp"},
                {"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp"},
                ...
            ]
    """
    logger.info(
        f"[Candidate Butler] Update candidates to the matching task {candidates}......"
    )
    cached_candidates = MATCHING_TASK.get_cached_candidates()
    sources_to_update = set([candidate["sourceColumn"] for candidate in candidates])
    cached_candidates = [
        candidate
        for candidate in cached_candidates
        if candidate["sourceColumn"] not in sources_to_update
    ]
    cached_candidates.extend(candidates)

    MATCHING_TASK.set_cached_candidates(cached_candidates)

    return {"status": "success"}


@tool
def discard_source_column(column_name: str):
    """
    Discard a source column from the heatmap.
    If you think non of the candidates are correct, you can discard the column.

    Args:
        column_name (str): The name of the column to discard
    """

    logger.info(f"[Candidate Butler] Discard column {column_name}......")
    MATCHING_TASK.discard_cached_column(column_name)

    return {"status": "success"}


candidate_butler_tools = [
    update_candidates,
    discard_source_column,
]
