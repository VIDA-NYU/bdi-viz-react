import logging
import os
from typing import Dict, List, Tuple

from langchain_core.tools import tool

from ..langchain.rag import RAG

logger = logging.getLogger("bdiviz_flask.sub")


@tool
def retrieve_from_rag(query: str, topk: int = 3) -> List[str]:
    """
    Retrieve the related schema information from RAG, given a query.
    This is a tool that can help the agent get diagnosis from an user operation,
    e.g. you could infer the reason why user accept a matching candidate based on the related schema datatype or description.
    Args:
        query (str): The query to search for, for example "What is AJCC in GDC?"
        topk (int, optional): The number of results to return. Defaults to 3.
    Returns:
        List[str]: The related context from the biomedical schema.
    """
    related_documents = RAG.retrieve(query, topk)
    context = [doc.page_content for doc in related_documents]
    print(f"[RAG Researcher] Retrieved the related context: {context}")
    logger.info(f"[RAG Researcher] Retrieved the related context: {context}")
    return context
