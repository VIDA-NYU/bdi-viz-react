from typing import Any, Dict, List, Tuple

import pandas as pd
from magneto import Magneto

from ..utils import download_model_pt
from .utils import BaseMatcher

FT_MODEL_URL = "https://nyu.box.com/shared/static/g2d3r1isdxrrxdcvqfn2orqgjfneejz1.pth"


class MagnetoMatcher(BaseMatcher):
    ALLOWED_MAGNETO_PARAMS = {
        "magneto_zs": {
            "use_bp_reranker": False,
            "use_gpt_reranker": False,
        },
        "magneto_ft": {
            "encoding_mode": "header_values_verbose",
            "embedding_model": download_model_pt(FT_MODEL_URL, "magneto-gdc-v0.1"),
            "use_bp_reranker": False,
            "use_gpt_reranker": False,
        },
    }

    def __init__(self, name: str, weight: int = 1) -> None:
        if name not in MagnetoMatcher.ALLOWED_MAGNETO_PARAMS:
            raise ValueError(
                f"Matcher {name} not found in the list of allowed Magneto matchers: {ALLOWED_MAGNETO_PARAMS.keys()}"
            )
        super().__init__(name, weight)

    def top_matches(
        self, source: pd.DataFrame, target: pd.DataFrame, top_k: int = 20, **kwargs
    ) -> List[Dict[str, Any]]:
        matcher = Magneto(
            topk=top_k, **MagnetoMatcher.ALLOWED_MAGNETO_PARAMS[self.name]
        )
        matches = matcher.get_matches(source, target)
        matcher_candidates = self._layer_candidates_magneto(matches, self.name)
        return matcher_candidates

    def _layer_candidates_magneto(
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
                "status": "idle",
            }

            layered_candidates.append(candidate)
        return layered_candidates
