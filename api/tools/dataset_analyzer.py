import logging
from typing import Dict, List, Tuple

from langchain_core.tools import tool

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
    pass


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
    pass


dataset_analyzer_tools = [
    get_source_column_info,
    get_source_column_candidates_info,
]
