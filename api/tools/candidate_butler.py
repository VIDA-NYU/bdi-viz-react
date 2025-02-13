import logging
from typing import Any, Dict, List, Tuple, Union

from langchain.tools.base import StructuredTool
from langchain_core.tools import tool

from ..session_manager import SESSION_MANAGER

logger = logging.getLogger("bdiviz_flask.sub")


class CandidateButler:
    def __init__(self, session: str):
        self.matching_task = SESSION_MANAGER.get_session(session).matching_task

    def get_toolset(self):
        return [
            StructuredTool.from_function(
                func=self.update_candidates,
                name="update_candidates",
            ),
            # StructuredTool.from_function(
            #     func=self.discard_source_column,
            #     name="discard_source_column",
            # ),
        ]

    def read_source_cluster_details(
        self,
        source_column: str,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Reads the details of the source cluster for a given source column.

        Args:
            source_column (str): The name of the source column for which to read the cluster details.
        Returns:
            Dict[str, List[Tuple[str, float]]]: A dictionary where the key is the source column name and the value
            is a list of tuples, each containing a candidate string and its associated float value.
        """

        top_neighbors = 1
        cached_candidates = self.matching_task.get_cached_candidates()
        source_cluster = self.matching_task.get_cached_source_clusters()[source_column][
            1 : top_neighbors + 1
        ]

        logger.info(f"[Candidate Butler] Read source cluster for {source_column}......")

        return {
            column: [
                candidate
                for candidate in cached_candidates
                if candidate["sourceColumn"] == column
            ]
            for column in source_cluster
            if column != source_column
        }

    def update_candidates(
        self, candidates: List[Dict[str, Union[str, float]]]
    ) -> Dict[str, str]:
        """
        Updates the heatmap with refined candidate mappings.

        - Source columns (keys) must match those from read_candidates.
        - Target column names (first item in each tuple) must not be changed.
        - Filter or remove items to refine each column's candidates.
        - Matcher names (second item in each tuple) must not be changed.

        Args:
            candidates (dict):
                Example:
                [
                    {"sourceColumn": "source_column_1", "targetColumn": "target_column_1", "score": 0.9, "matcher": "magneto_zs_bp"},
                    {"sourceColumn": "source_column_1", "targetColumn": "target_column_15", "score": 0.7, "matcher": "magneto_zs_bp"},
                    ...
                ]
        """
        logger.info(
            f"[Candidate Butler] Update candidates to the matching task {candidates}......"
        )
        cached_candidates = self.matching_task.get_cached_candidates()
        sources_to_update = set([candidate["sourceColumn"] for candidate in candidates])
        cached_candidates = [
            candidate
            for candidate in cached_candidates
            if candidate["sourceColumn"] not in sources_to_update
        ]
        cached_candidates.extend(candidates)

        self.matching_task.set_cached_candidates(cached_candidates)

        return {"status": "success"}

    def discard_source_column(self, column_name: str):
        """
        Discard a source column from the heatmap.
        If you think non of the candidates are correct, you can discard the column.

        Args:
            column_name (str): The name of the column to discard
        """

        logger.info(f"[Candidate Butler] Discard column {column_name}......")
        self.matching_task.discard_cached_column(column_name)

        return {"status": "success"}
