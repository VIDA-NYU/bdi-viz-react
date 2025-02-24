import random
from typing import Any, Dict, List, Tuple

import pandas as pd
from rapidfuzz import fuzz, process, utils

from .utils import BaseMatcher


class RapidFuzzValueMatcher(BaseMatcher):
    def __init__(self, name: str, weight: int = 1) -> None:
        super().__init__(name, weight)

    def top_matches(
        self, source: pd.DataFrame, target: pd.DataFrame, top_k: int = 20, **kwargs
    ) -> List[Dict[str, Any]]:
        matches = self._get_matches(source, target, top_k)
        matcher_candidates = self._layer_candidates(matches, self.name)
        return matcher_candidates

    def _get_matches(
        self, source: pd.DataFrame, target: pd.DataFrame, top_k: int
    ) -> Dict[str, Dict[str, float]]:
        ret = {}

        for source_column in source.columns:
            ret[source_column] = {}
            source_scores = []
            # Check if source column is numeric
            if pd.api.types.is_numeric_dtype(source[source_column]):
                for target_column in target.columns:
                    if pd.api.types.is_numeric_dtype(target[target_column]):
                        ret[source_column][target_column] = 1
            elif pd.api.types.is_bool_dtype(source[source_column]):
                for target_column in target.columns:
                    if pd.api.types.is_bool_dtype(target[target_column]):
                        ret[source_column][target_column] = 1
            else:
                source_values = source[source_column].dropna().astype(str).tolist()
                for target_column in target.columns:
                    target_values = target[target_column].dropna().astype(str).tolist()
                    score = self._get_value_matching_score(source_values, target_values)
                    if score > 0:
                        source_scores.append((target_column, score))
                source_scores = sorted(source_scores, key=lambda x: x[1], reverse=True)[
                    :top_k
                ]
                for target_column, score in source_scores:
                    ret[source_column][target_column] = score
        return ret

    def _get_value_matching_score(
        self, source_values: List, target_values: List
    ) -> float:
        """
        Calculate the value matching score between two columns
        """
        if len(target_values) >= 50:
            target_values = random.sample(target_values, 50)

        total_score = 0

        for source_v in source_values:
            scores = [
                fuzz.ratio(source_v, target_v, processor=utils.default_process) / 100
                for target_v in target_values
            ]
            max_target_v = target_values[scores.index(max(scores))]
            max_score = max(scores)

            total_score += max_score
        return total_score / len(source_values)

    def _layer_candidates(
        self,
        matches: Dict[str, Dict[str, float]],
        matcher: str,
    ) -> List[Dict[str, Any]]:
        layered_candidates = []
        for source_col, target_scores in matches.items():
            for target_col, score in target_scores.items():
                candidate = {
                    "sourceColumn": source_col,
                    "targetColumn": target_col,
                    "score": score,
                    "matcher": matcher,
                    "status": "idle",
                }
                layered_candidates.append(candidate)

        return layered_candidates
