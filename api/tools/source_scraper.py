import logging
import os
from typing import Dict, List, Tuple

from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.tools import tool

logger = logging.getLogger("bdiviz_flask.sub")


@tool
def scraping_websource(query: str, topk: int = 5) -> List[Dict[str, str]]:
    """
    Search the web for the query and return the topk results.
    Args:
        query (str): The query to search for.
        topk (int, optional): Number of results to return. Defaults to 5.
    Returns:
        List[Dict[str, str]]: List of dictionaries containing the following
        [
            {
                'snippet': 'Small cell lung cancer (SCLC) is ...',
                'title': 'Top advances of the year: Small cell lung cancer',
                'link': 'https://acsjournals.onlinelibrary.wiley.com/doi/full/10.1002/cncr.35770'},
            },
            ...
        ]
    """

    search = DuckDuckGoSearchResults(output_format="list")

    # query = f"{query}"

    results = search.invoke(query)[:topk]

    return results
