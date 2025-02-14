from typing import Any, Dict, List, Tuple

import pandas as pd
from valentine import valentine_match
from valentine.algorithms import BaseMatcher as ValentineBaseMatcher
from valentine.algorithms import (
    Coma,
    Cupid,
    DistributionBased,
    JaccardDistanceMatcher,
    SimilarityFlooding,
)

from .utils import BaseMatcher


class ValentineMatcher(BaseMatcher):
    def __init__(self, name: str, weight: int = 1) -> None:
        super().__init__(name, weight)

    def top_matches(
        self, source: pd.DataFrame, target: pd.DataFrame, top_k: int = 20, **kwargs
    ) -> List[Dict[str, Any]]:
        matcher = self._get_matcher_object(self.name)
        matches = valentine_match(source, target, matcher)

        matcher_candidates = self._layer_candidates_valentine(matches, self.name)
        return matcher_candidates

    def _layer_candidates_valentine(
        self,
        matches: Dict[Tuple[Tuple[str, str], Tuple[str, str]], float],
        matcher: str,
    ) -> List[Dict[str, Any]]:
        layered_candidates = []
        for key, score in matches.items():
            source_tuple = key[0]
            target_tuple = key[1]
            candidate = {
                "sourceColumn": source_tuple[1],
                "targetColumn": target_tuple[1],
                "score": score,
                "matcher": matcher,
            }

            layered_candidates.append(candidate)
        return layered_candidates

    def _get_matcher_object(self, name: str) -> ValentineBaseMatcher:
        name = name.lower()
        if name == "coma":
            return Coma()
        elif name == "cupid":
            return Cupid()
        elif name == "similarityflooding" or name == "similarity_flooding":
            return SimilarityFlooding()
        elif name == "jaccarddistancematcher" or name == "jaccard_distance_matcher":
            return JaccardDistanceMatcher()
        elif name == "distributionbased" or name == "distribution_based":
            return DistributionBased()
        else:
            raise ValueError(f"Matcher {name} not found in allowed Valentine matchers")
