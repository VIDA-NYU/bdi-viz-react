import logging
import os
from typing import Dict, List, Tuple

from langchain_core.tools import tool

# from ..langchain.rag import RAG

logger = logging.getLogger("bdiviz_flask.sub")


@tool
def retrieve_from_rag(query: str, topk: int = 2) -> List[str]:
    """
    Retrieve related schema info from RAG for a given query.
    Args:
        query (str): The search query, e.g., "What is AJCC in GDC?", "What is FIGO?", "Tumour staging", etc.
        topk (int, optional): Number of results to return. Defaults to 2.
    Returns:
        List[str]: Related context from the biomedical schema.
    """
    # related_documents = RAG.retrieve(query, topk)
    # context = [doc.page_content for doc in related_documents]
    # print(f"[RAG Researcher] Retrieved the related context: {context}")
    # logger.info(f"[RAG Researcher] Retrieved the related context: {context}")
    # return context
    return []
