import logging
import os
from typing import Dict, List, Tuple

from langchain_core.tools import tool

logger = logging.getLogger("bdiviz_flask.sub")


@tool
def update_embedder(embedder: str):
    """Update the embedding model for the matching task.
    If you suggest base on the reason that the current embedding model is not performing well, you can update the embedding model here.

    Args:
        embedder (str): The embedding model to update, e.g. "sentence-transformers/all-mpnet-base-v2"
    """
    pass


matcher_tweaker_tools = [update_embedder]
