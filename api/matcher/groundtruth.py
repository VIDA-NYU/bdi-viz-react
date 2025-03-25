import os
from typing import Any, Dict, List

import pandas as pd

from .utils import BaseMatcher

class GroundtruthMatcher(BaseMatcher):
    def __init__(self, name: str, weight: int = 1) -> None:
        if os.path.exists(name) == False:
            raise ValueError(
                f"Groundtruth file {name} not found."
            )
        self.gt_csv = pd.read_csv(name)
        super().__init__("groundtruth", weight)

    def top_matches(
        self, source: pd.DataFrame, target: pd.DataFrame, top_k: int = 20, **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Get the top n matches for the given source column.

        Args:
            source_column (str): The source column name
            top_n (int): The number of top matches to return

        Returns:
            List[Dict[str, Any]]: A list of dictionaries with the following structure:
            [{"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp"},
            {"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp"}, ...]
        """

        matcher_candidates = self._layer_candidates_gt(self.gt_csv)
        return matcher_candidates
    
    def _layer_candidates_gt(
        self, top_candidates: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        layered_candidates = []
        for _, row in top_candidates.iterrows():
            candidate = {
                "sourceColumn": row["original_paper_variable_names"],
                "targetColumn": row["GDC_format_variable_names"],
                "score": 1.0,
                "matcher": "groundtruth",
                "status": "accepted",
            }
            layered_candidates.append(candidate)
        return layered_candidates