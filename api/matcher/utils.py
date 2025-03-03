from typing import Any, Dict, List

import pandas as pd


class BaseMatcher:
    def __init__(self, name: str, weight: int = 1) -> None:
        self.name = name
        self.weight = weight

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
            [{"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp", "status": "idle"},
            {"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp", "status": "idle"}, ...]
        """
        pass
