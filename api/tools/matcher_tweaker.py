import logging
import os
from typing import Dict, List, Tuple

from langchain_core.tools import tool

from ..matching_task import MATCHING_TASK

logger = logging.getLogger("bdiviz_flask.sub")


@tool
def update_embedder(embedder: str):
    """Update the embedding model for the matching task.
    If you suggest base on the reason that the current embedding model is not performing well, you can update the embedding model here.

    Args:
        embedder (str): The embedding model to update, e.g. "sentence-transformers/all-mpnet-base-v2"
    """
    MATCHING_TASK.update_embedding_model(embedder)
    logger.info(f"[Candidate Butler] Updated the embedding model to {embedder}......")

    os.remove("matching_results.json")
    results = MATCHING_TASK.get_candidates(cache_candidates=True)
    logger.info(f"[Candidate Butler] Updated the candidates: {results}")


matcher_tweaker_tools = [update_embedder]
