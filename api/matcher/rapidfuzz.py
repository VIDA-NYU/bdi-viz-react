from typing import Any, Dict, List, Tuple

import pandas as pd
from rapidfuzz import fuzz, utils

from .utils import BaseMatcher


class RapidFuzzMatcher(BaseMatcher):
    def __init__(self, name: str, weight: int = 1) -> None:
        self.threshold = 0.95
        super().__init__(name, weight)

    def top_matches(
        self, source: pd.DataFrame, target: pd.DataFrame, top_k: int = 20, **kwargs
    ) -> List[Dict[str, Any]]:
        matches = self._get_matches(source, target)
        matcher_candidates = self._layer_candidates(matches, self.name)
        return matcher_candidates

    def _get_matches(
        self, source: pd.DataFrame, target: pd.DataFrame
    ) -> Dict[Tuple, float]:
        matches = {}
        for source_column in source.columns:
            for target_column in target.columns:
                score = (
                    fuzz.WRatio(
                        source_column, target_column, processor=utils.default_process
                    )
                    / 100
                )
                if score > 0:
                    matches[(source_column, target_column)] = score
        return matches

    def _layer_candidates(
        self,
        matches: Dict[Tuple, float],
        matcher: str,
    ) -> List[Dict[str, Any]]:
        layered_candidates = []
        for key, score in matches.items():
            if score < self.threshold:
                continue
            source_column = key[0]
            target_column = key[1]
            candidate = {
                "sourceColumn": source_column,
                "targetColumn": target_column,
                "score": score,
                "matcher": matcher,
            }

            layered_candidates.append(candidate)
        return layered_candidates
