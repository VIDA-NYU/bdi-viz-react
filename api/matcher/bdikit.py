from typing import Any, Dict, List

import bdikit as bdi
import pandas as pd

from .utils import BaseMatcher

ALLOWED_BDI_MATCHERS = [
    "ct_learning",
    "magneto_zs_bp",
    "magneto_ft_bp",
    "magneto_zs_llm",
    "magneto_ft_llm",
]


class BDIKitMatcher(BaseMatcher):
    def __init__(self, name: str, weight: int = 1) -> None:
        if name not in ALLOWED_BDI_MATCHERS:
            raise ValueError(
                f"Matcher {name} not found in the list of allowed BDI matchers: {ALLOWED_BDI_MATCHERS}"
            )
        super().__init__(name, weight)

    def top_matches(
        self, source: pd.DataFrame, target: pd.DataFrame, top_k: int = 20, **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Get the top n matches for the given source column.

        Args:
            source_column (str): The source column name
            top_n (int): The number of top matches to return

        Returns:
            Dict[str, List[Tuple[str, float]]]: A dictionary where the key is the source column name and the value, e.g.
            [{"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp"},
            {"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp"}, ...]
        """
        embedding_candidates = bdi.top_matches(
            source=source,
            target=target,
            top_k=top_k,
            method=self.name,
        )
        matcher_candidates = self._layer_candidates_bdi(embedding_candidates, self.name)
        return matcher_candidates

    def _layer_candidates_bdi(
        self, top_candidates: pd.DataFrame, matcher: str
    ) -> List[Dict[str, Any]]:
        layered_candidates = []
        for _, row in top_candidates.iterrows():
            candidate = {
                "sourceColumn": row["source"],
                "targetColumn": row["target"],
                "score": row["similarity"],
                "matcher": matcher,
            }

            layered_candidates.append(candidate)
        return layered_candidates
