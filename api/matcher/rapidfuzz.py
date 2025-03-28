import logging
from typing import Any, Dict, List, Tuple

import pandas as pd
from rapidfuzz import fuzz, process, utils

from .utils import BaseMatcher

logger = logging.getLogger("bdiviz_flask.sub")


class RapidFuzzMatcher(BaseMatcher):
    def __init__(self, name: str, weight: int = 1) -> None:
        self.threshold = 0.0
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
        target_columns = target.columns
        for source_column in source.columns:
            ret[source_column] = {}
            matches = process.extract(
                source_column,
                target_columns,
                scorer=lambda x, y, score_cutoff: fuzz.ratio(x, y),
                processor=utils.default_process,
                limit=top_k,
            )
            exact_matches = process.extract(
                source_column,
                [match[0] for match in matches],
                scorer=lambda x, y, score_cutoff: fuzz.WRatio(x, y, score_cutoff=95),
                processor=utils.default_process,
                limit=top_k,
            )
            exact_matches = {match[0] for match in exact_matches if match[1] >= 95}

            for match in matches:
                if match[0] in exact_matches:
                    score = 1.0
                else:
                    score = match[1] / 100
                if score > 0:
                    ret[source_column][match[0]] = score
        return ret

    def _layer_candidates(
        self,
        matches: Dict[str, Dict[str, float]],
        matcher: str,
    ) -> List[Dict[str, Any]]:
        layered_candidates = []
        for source_column, target_columns in matches.items():
            for target_column, score in target_columns.items():
                candidate = {
                    "sourceColumn": source_column,
                    "targetColumn": target_column,
                    "score": score,
                    "matcher": matcher,
                    "status": "idle",
                }
            layered_candidates.append(candidate)
        return layered_candidates
