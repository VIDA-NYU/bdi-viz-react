import logging
from typing import Dict, List, Tuple

from langchain_core.tools import tool

from ..matching_task import MATCHING_TASK

logger = logging.getLogger("bdiviz_flask.sub")


@tool
def get_source_column_info(source_column: str) -> Tuple[str, List[str]]:
    """
    Get the source column information to help your reasoning, including the column name and the unique values.

    Args:
        source_column (str): The source column name

    Returns:
        tuple: The source column name and the unique values
    """
    source_df = MATCHING_TASK.source_df
    if source_df is None:
        return None, None
    if source_column not in source_df.columns:
        return None, None

    logger.info(f"[Dataset Analyzer] Get information for {source_column}......")
    return source_column, source_df[source_column].astype(str).unique()


@tool
def get_source_column_candidates_info(source_column: str) -> Dict[str, List[str]]:
    """
    Get the source column candidates information to help your reasoning, including the column name and the unique values.
    All the candidates are from the target dataframe.

    Args:
        source_column (str): The source column name

    Returns:
        tuple: The source column name and the candidates
    """
    candidates_dict = MATCHING_TASK.get_cached_candidates()
    target_df = MATCHING_TASK.target_df
    target_info = {}

    if source_column not in candidates_dict:
        return target_info

    logger.info(
        f"[Dataset Analyzer] Get candidates information for {source_column}......"
    )

    for target_column, _ in candidates_dict[source_column]:
        if target_column not in target_df.columns:
            continue
        target_info[target_column] = target_df[target_column].astype(str).unique()
    return target_info


dataset_analyzer_tools = [
    get_source_column_info,
    get_source_column_candidates_info,
]
