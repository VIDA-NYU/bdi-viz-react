from langchain_core.tools import tool
from langchain_community.document_loaders import DataFrameLoader

from ..matching_task import MatchingTask

@tool
def read_source_dataframe(matching_task: MatchingTask):
    """
    Read the source data from the request

    Args:
        matching_task (MatchingTask): The matching task object
    """
    loader = DataFrameLoader(matching_task.source_df)
    return loader.load()