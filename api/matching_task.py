import difflib
import hashlib
import json
import logging
import os
import threading
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
from torch import Tensor

from .candidate_quadrants import CandidateQuadrants
from .clusterer.embedding_clusterer import EmbeddingClusterer
from .matcher.bdikit import BDIKitMatcher
from .matcher.magneto import MagnetoMatcher
from .matcher.rapidfuzz import RapidFuzzMatcher
from .matcher.valentine import ValentineMatcher
from .matcher_weight.weight_updater import WeightUpdater
from .utils import load_gdc_ontology, load_pdc_ontology

logger = logging.getLogger("bdiviz_flask.sub")

DEFAULT_PARAMS = {
    "encoding_mode": "header_values_verbose",
    "sampling_mode": "mixed",
    "sampling_size": 10,
    "topk": 20,
    "include_strsim_matches": False,
    "include_embedding_matches": True,
    "embedding_threshold": 0.1,
    "include_equal_matches": True,
    "use_bp_reranker": True,
    "use_gpt_reranker": False,
}


class MatchingTask:
    def __init__(
        self,
        top_k: int = 20,
        clustering_model="Snowflake/snowflake-arctic-embed-m",
        update_matcher_weights: bool = True,
    ) -> None:
        self.lock = threading.Lock()
        self.top_k = top_k

        self.candidate_quadrants = None
        self.matchers = {
            "jaccard_distance_matcher": ValentineMatcher("jaccard_distance_matcher"),
            "ct_learning": BDIKitMatcher("ct_learning"),
            "magneto_ft": MagnetoMatcher("magneto_ft"),
            "magneto_zs": MagnetoMatcher("magneto_zs"),
        }

        self.clustering_model = clustering_model
        self.source_df = None
        self.target_df = None
        self.cached_candidates = self._initialize_cache()
        self.history = UserOperationHistory()

        self.update_matcher_weights = update_matcher_weights

    def _initialize_cache(self) -> Dict[str, Any]:
        return {
            "source_hash": None,
            "target_hash": None,
            "candidates": [],
            "source_clusters": None,
            "target_clusters": None,
            "value_matches": {},
        }

    def update_dataframe(
        self, source_df: Optional[pd.DataFrame], target_df: Optional[pd.DataFrame]
    ):
        with self.lock:
            if source_df is not None:
                self.source_df = source_df
                logger.info(f"[MatchingTask] Source dataframe updated!")
            if target_df is not None:
                self.target_df = target_df
                logger.info(f"[MatchingTask] Target dataframe updated!")

        self._initialize_value_matches()

    def get_candidates(self, is_candidates_cached: bool = True) -> Dict[str, list]:
        with self.lock:
            if self.source_df is None or self.target_df is None:
                raise ValueError("Source and Target dataframes must be provided.")

            source_hash, target_hash = self._compute_hashes()
            cached_json = self._import_cache_from_json()
            candidates = []

            if self._is_cache_valid(cached_json, source_hash, target_hash):
                self.cached_candidates = cached_json
                candidates = cached_json["candidates"]

            elif is_candidates_cached and self._is_cache_valid(
                self.cached_candidates, source_hash, target_hash
            ):
                candidates = self.get_cached_candidates()
            else:
                candidates = self._generate_candidates(
                    source_hash, target_hash, is_candidates_cached
                )

            if self.update_matcher_weights:
                self.weight_updater = WeightUpdater(
                    matchers=self.matchers,
                    candidates=candidates,
                    alpha=0.1,
                    beta=0.1,
                )

            return candidates

    def update_exact_matches(self) -> List[Dict[str, Any]]:
        return self.get_candidates()

    def _compute_hashes(self) -> Tuple[int, int]:
        source_hash = int(
            hashlib.sha256(
                pd.util.hash_pandas_object(self.source_df, index=True).values
            ).hexdigest(),
            16,
        )
        target_hash = int(
            hashlib.sha256(
                pd.util.hash_pandas_object(self.target_df, index=True).values
            ).hexdigest(),
            16,
        )
        return source_hash, target_hash

    def _is_cache_valid(
        self, cache: Dict[str, Any], source_hash: int, target_hash: int
    ) -> bool:
        return (
            cache
            and cache["source_hash"] == source_hash
            and cache["target_hash"] == target_hash
        )

    def _generate_candidates(
        self, source_hash: int, target_hash: int, is_candidates_cached: bool
    ) -> Dict[str, list]:
        embedding_clusterer = EmbeddingClusterer(
            params={
                "embedding_model": self.clustering_model,
                "topk": self.top_k,
                **DEFAULT_PARAMS,
            }
        )
        source_embeddings, target_embeddings = embedding_clusterer.get_embeddings(
            source_df=self.source_df, target_df=self.target_df
        )

        source_clusters = self._generate_source_clusters(source_embeddings)
        target_clusters = self._generate_target_clusters(target_embeddings)

        # Apply candidate quadrants
        self.candidate_quadrants = CandidateQuadrants(
            source=self.source_df,
            target=self.target_df,
            top_k=self.top_k,
        )

        layered_candidates = []
        # numeric_columns = []
        for source_column in self.source_df.columns:
            layered_candidates.extend(
                self.candidate_quadrants.get_easy_target_json(source_column)
            )

            # if pd.api.types.is_numeric_dtype(self.source_df[source_column].dtype):
            #     numeric_columns.append(source_column)
            #     continue

            # target_df = self.candidate_quadrants.get_potential_target_df(source_column)
            # if target_df is None:  # No potential matches
            #     continue
        for matcher_name, matcher_instance in self.matchers.items():
            matcher_candidates = matcher_instance.top_matches(
                source=self.source_df,
                target=self.target_df,
                top_k=self.top_k,
            )
            layered_candidates.extend(matcher_candidates)

        # if numeric_columns:
        #     target_df = self.candidate_quadrants.get_potential_numeric_target_df()
        #     source_df = self.source_df[numeric_columns]
        #     for matcher_name, matcher_instance in self.matchers.items():
        #         logger.info(
        #             f"Running matcher: {matcher_name} on source {numeric_columns}..."
        #         )
        #         matcher_candidates = matcher_instance.top_matches(
        #             source=source_df,
        #             target=target_df,
        #             top_k=self.top_k,
        #         )
        #         layered_candidates.extend(matcher_candidates)

        easy_match_keys = {
            (candidate["sourceColumn"], candidate["targetColumn"])
            for candidate in layered_candidates
            if candidate["matcher"] == "candidate_quadrants"
        }
        layered_candidates = [
            candidate
            for candidate in layered_candidates
            if candidate["matcher"] == "candidate_quadrants"
            or (candidate["sourceColumn"], candidate["targetColumn"])
            not in easy_match_keys
        ]

        # Generate value matches for each candidate
        for candidate in layered_candidates:
            self._generate_value_matches(
                candidate["sourceColumn"], candidate["targetColumn"]
            )

        if is_candidates_cached:
            self.cached_candidates = {
                "source_hash": source_hash,
                "target_hash": target_hash,
                "candidates": layered_candidates,
                "source_clusters": source_clusters,
                "target_clusters": target_clusters,
                "value_matches": self.cached_candidates["value_matches"],
            }
            self._export_cache_to_json(self.cached_candidates)

        return layered_candidates

    def _generate_source_clusters(
        self, source_embeddings: Tensor
    ) -> Dict[str, List[str]]:
        knn = NearestNeighbors(
            n_neighbors=min(10, len(self.source_df.columns)), metric="cosine"
        )
        knn.fit(np.array(source_embeddings))
        clusters_idx = [
            knn.kneighbors([source_embedding], return_distance=False)[0]
            for source_embedding in source_embeddings
        ]

        clusters = {
            self.source_df.columns[i]: [
                self.source_df.columns[idx] for idx in cluster_idx
            ]
            for i, cluster_idx in enumerate(clusters_idx)
        }
        return clusters

    def _generate_target_clusters(self, target_embeddings: Tensor) -> List[List[str]]:
        kmeans = KMeans(n_clusters=min(20, len(self.target_df.columns)))
        kmeans.fit(np.array(target_embeddings))
        clusters_idx = kmeans.labels_

        clusters = {}
        for i, target_column in enumerate(self.target_df.columns):
            cluster_idx = clusters_idx[i]
            if cluster_idx not in clusters:
                clusters[cluster_idx] = []
            clusters[cluster_idx].append(target_column)

        return list(clusters.values())

    def _generate_gdc_ontology(self) -> List[Dict]:
        candidates = self.get_cached_candidates()
        return load_gdc_ontology(candidates)
        # return load_pdc_ontology(candidates)

    def _initialize_value_matches(self) -> None:
        self.cached_candidates["value_matches"] = {}
        for source_col in self.source_df.columns:
            source_unique_values = []
            if not pd.api.types.is_numeric_dtype(self.source_df[source_col].dtype):
                source_unique_values = self.get_source_unique_values(source_col)

            self.cached_candidates["value_matches"][source_col] = {
                "source_unique_values": source_unique_values,
                "targets": {},
            }

    def _generate_value_matches(self, source_column: str, target_column: str) -> None:
        if (
            target_column
            in self.cached_candidates["value_matches"][source_column]["targets"]
        ):
            return

        source_values = self.cached_candidates["value_matches"][source_column][
            "source_unique_values"
        ]
        if not source_values:  # Source unique values are empty
            return

        target_values = self.get_target_unique_values(target_column)

        match_results = {
            "From": [],
            "To": [],
        }
        for source_v in source_values:
            match_results["From"].append(source_v)
            best_matches = difflib.get_close_matches(
                source_v, target_values, n=1, cutoff=0.1
            )
            if best_matches:
                best_norm = best_matches[0]
                match_results["To"].append(best_norm)
            else:
                match_results["To"].append("")

        self.cached_candidates["value_matches"][source_column]["targets"][
            target_column
        ] = list(match_results["To"])

    def accept_cached_candidate(self, candidate: Dict[str, Any]) -> None:
        cached_candidates = self.get_cached_candidates()
        for cached_candidate in cached_candidates:
            if (
                cached_candidate["sourceColumn"] == candidate["sourceColumn"]
                and cached_candidate["targetColumn"] == candidate["targetColumn"]
            ):
                cached_candidate["status"] = "accepted"
        self.set_cached_candidates(cached_candidates)

    def reject_cached_candidate(self, candidate: Dict[str, Any]) -> None:
        cached_candidates = self.get_cached_candidates()
        for cached_candidate in cached_candidates:
            if (
                cached_candidate["sourceColumn"] == candidate["sourceColumn"]
                and cached_candidate["targetColumn"] == candidate["targetColumn"]
            ):
                cached_candidate["status"] = "rejected"
        self.set_cached_candidates(cached_candidates)

    def discard_cached_column(self, source_col: str) -> None:
        cached_candidates = self.get_cached_candidates()
        for candidate in cached_candidates:
            if candidate["sourceColumn"] == source_col:
                candidate["status"] = "discarded"
        self.set_cached_candidates(cached_candidates)

    def append_cached_column(self, column_name: str) -> None:
        cached_candidates = self.get_cached_candidates()
        for candidate in cached_candidates:
            if (
                column_name == candidate["sourceColumn"]
                and candidate["status"] == "discarded"
            ):
                if candidate["matcher"] in ["candidate_quadrants"]:
                    candidate["status"] = "accepted"
                else:
                    candidate["status"] = "idle"

        self.set_cached_candidates(cached_candidates)

    def to_frontend_json(self) -> dict:
        return {
            "candidates": self.get_cached_candidates(),  # sourceColumn, targetColumn, score, matcher
            "sourceClusters": self._format_source_clusters_for_frontend(),
            # "targetClusters": self.get_cached_target_clusters(),  # [["column1", "column2", ...], [], []]
            "matchers": self.get_matchers(),
        }

    def unique_values_to_frontend_json(self) -> dict:
        return {
            "sourceUniqueValues": [
                {
                    "sourceColumn": source_col,
                    "uniqueValues": self.get_source_value_bins(source_col),
                }
                for source_col in self.source_df.columns
            ],
            "targetUniqueValues": [
                {
                    "targetColumn": target_col,
                    "uniqueValues": self.get_target_value_bins(target_col),
                }
                for target_col in self.target_df.columns
            ],
        }

    def value_matches_to_frontend_json(self) -> List[Dict[str, any]]:
        value_matches = self.cached_candidates["value_matches"]
        ret_json = []
        for source_col, source_items in value_matches.items():
            source_json = {
                "sourceColumn": source_col,
                "sourceValues": source_items["source_unique_values"],
                "targets": [],
            }
            for target_col, target_unique_values in source_items["targets"].items():
                source_json["targets"].append(
                    {
                        "targetColumn": target_col,
                        "targetValues": target_unique_values,
                    }
                )
            ret_json.append(source_json)
        return ret_json

    def _format_source_clusters_for_frontend(self) -> List[Dict[str, Any]]:
        source_clusters = self.get_cached_source_clusters()
        return [
            {"sourceColumn": source_col, "cluster": cluster}
            for source_col, cluster in source_clusters.items()
        ]

    def _export_cache_to_json(self, json_obj: Dict) -> None:
        output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
        with open(output_path, "w") as f:
            json.dump(json_obj, f, indent=4)

    def _import_cache_from_json(self) -> Optional[Dict]:
        output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
        if os.path.exists(output_path):
            with open(output_path, "r") as f:
                return json.load(f)

    def _bucket_column(self, df: pd.DataFrame, col: str) -> List[Dict[str, Any]]:
        col_obj = df[col].dropna()
        if col_obj.dtype in ["object", "category", "bool"]:
            counter = col_obj.value_counts()[:10].to_dict()
            return [
                {"value": str(key), "count": int(value)}
                for key, value in counter.items()
                if value >= 1
            ]
        elif col_obj.dtype in ["int64", "float64"]:
            col_obj = col_obj.dropna()  # Drop NaN values
            if len(col_obj) == 0:
                return []
            min = col_obj.min()
            max = col_obj.max()
            bins = np.linspace(min, max, num=10)
            counter = np.histogram(col_obj, bins=bins)[0]
            return [
                {"value": f"{int(bins[i])}-{int(bins[i+1])}", "count": int(counter[i])}
                for i in range(len(counter))
            ]
        else:
            logger.warning(f"Column {col} is of type {col_obj.dtype}.")
            return []

    def undo(self) -> Optional["UserOperation"]:
        logger.info("Undoing last operation...")
        operation = self.history.undo_last_operation()
        if operation:
            self.undo_operation(
                operation.operation, operation.candidate, operation.references
            )
            return operation._json_serialize()
        return None

    def redo(self) -> Optional["UserOperation"]:
        logger.info("Redoing last operation...")
        operation = self.history.redo_last_operation()
        if operation:
            self.apply_operation(
                operation.operation, operation.candidate, operation.references
            )
            return operation._json_serialize()
        return None

    def apply_operation(
        self,
        operation: str,
        candidate: Dict[str, Any],
        references: List[Dict[str, Any]],
    ) -> None:
        logger.info(f"Applying operation: {operation}, on candidate: {candidate}...")

        candidates = self.get_cached_candidates()
        if self.update_matcher_weights:
            self.weight_updater.update_weights(
                operation, candidate["sourceColumn"], candidate["targetColumn"]
            )

        # Add operation to history
        self.history.add_operation(UserOperation(operation, candidate, references))

        if operation == "accept":
            self.accept_cached_candidate(candidate)
            # self.set_cached_candidates(
            #     [
            #         cached_candidate
            #         for cached_candidate in candidates
            #         if (cached_candidate["sourceColumn"] != candidate["sourceColumn"])
            #         or (cached_candidate["targetColumn"] == candidate["targetColumn"])
            #     ] + [candidate]
            # )
        elif operation == "reject":
            self.reject_cached_candidate(candidate)
            # self.set_cached_candidates(
            #     [
            #         cached_candidate
            #         for cached_candidate in candidates
            #         if not (
            #             cached_candidate["sourceColumn"] == candidate["sourceColumn"]
            #             and cached_candidate["targetColumn"]
            #             == candidate["targetColumn"]
            #         )
            #     ]
            # )
        elif operation == "discard":
            self.discard_cached_column(candidate["sourceColumn"])
        else:
            raise ValueError(f"Operation {operation} not supported.")

    def undo_operation(
        self,
        operation: str,
        candidate: Dict[str, Any],
        references: List[Dict[str, Any]],
    ) -> None:
        logger.info(f"Undoing operation: {operation}, on candidate: {candidate}... \n")

        # candidates = self.get_cached_candidates()

        # if operation in ["accept", "reject", "discard"]:
        #     self.set_cached_candidates(
        #         [
        #             c
        #             for c in candidates
        #             if c["sourceColumn"] != candidate["sourceColumn"]
        #         ]
        #         + references
        #     )
        last_status = candidate["status"]
        if operation in ["accept", "reject"]:
            candidate["status"] = last_status
            self.update_cached_candidate(candidate)
        elif operation == "discard":
            self.append_cached_column(candidate["sourceColumn"])
        else:
            raise ValueError(f"Operation {operation} not supported.")

    def get_source_df(self) -> pd.DataFrame:
        return self.source_df

    def get_target_df(self) -> pd.DataFrame:
        return self.target_df

    def get_source_value_bins(self, source_col: str) -> List[Dict[str, Any]]:
        if self.source_df is None or source_col not in self.source_df.columns:
            raise ValueError(
                f"Source column {source_col} not found in the source dataframe."
            )
        return self._bucket_column(self.source_df, source_col)

    def get_source_unique_values(self, source_col: str, n: int = 20) -> List[str]:
        if self.source_df is None or source_col not in self.source_df.columns:
            raise ValueError(
                f"Source column {source_col} not found in the source dataframe."
            )
        # if pd.api.types.is_numeric_dtype(self.source_df[source_col].dtype):
        #     return []
        return sorted(
            list(self.source_df[source_col].dropna().unique().astype(str)[:n])
        )

    def get_target_value_bins(self, target_col: str) -> List[Dict[str, Any]]:
        if self.target_df is None or target_col not in self.target_df.columns:
            raise ValueError(
                f"Target column {target_col} not found in the target dataframe."
            )
        return self._bucket_column(self.target_df, target_col)

    def get_target_unique_values(self, target_col: str, n: int = 40) -> List[str]:
        if self.target_df is None or target_col not in self.target_df.columns:
            raise ValueError(
                f"Target column {target_col} not found in the target dataframe."
            )
        # if pd.api.types.is_numeric_dtype(self.target_df[target_col].dtype):
        #     return []
        return list(self.target_df[target_col].dropna().unique().astype(str)[:n])

    def get_cached_candidates(self) -> List[Dict[str, Any]]:
        return self.cached_candidates["candidates"]

    def set_cached_candidates(self, candidates: List[Dict[str, Any]]) -> None:
        self.cached_candidates["candidates"] = candidates

    def get_value_matches(self) -> Dict[str, Dict[str, Any]]:
        return self.cached_candidates["value_matches"]

    def update_cached_candidate(self, candidate: List[Dict[str, Any]]) -> None:
        candidates = self.get_cached_candidates()
        for index, c in enumerate(candidates):
            if (
                c["sourceColumn"] == candidate["sourceColumn"]
                and c["targetColumn"] == candidate["targetColumn"]
            ):
                candidates[index]["status"] = candidate["status"]

                break
        self.set_cached_candidates(candidates)

    def get_cached_source_clusters(self) -> Dict[str, List[str]]:
        return self.cached_candidates["source_clusters"] or {}

    def get_cached_target_clusters(self) -> List[List[str]]:
        return self.cached_candidates["target_clusters"] or []

    def get_matchers(self) -> List[Dict[str, any]]:
        return [
            {"name": key, "weight": item.weight} for key, item in self.matchers.items()
        ]

    def get_accepted_candidates(self) -> pd.DataFrame:
        candidates_set = set()
        for candidate in self.get_cached_candidates():
            if candidate["status"] == "accepted":
                candidates_set.add(
                    (candidate["sourceColumn"], candidate["targetColumn"])
                )

        target_columns = []
        ret_df = self.source_df.copy()
        for source_col, target_col in candidates_set:
            target_columns.append(target_col)
            ret_df[target_col] = self.source_df[source_col]

        return ret_df[target_columns]

    def get_accepted_mappings(self) -> List[Dict[str, str]]:
        """
        Export a json like structure for all accepted mappings:
        {
            "sourceColumn": "source_column_1",
            "targetColumn": "target_column_1",
            "valueMatches": [
                {
                    "from": "value1",
                    "to": "value2"
                },
                ...
            ]
        }
        """
        candidates_set = set()
        for candidate in self.get_cached_candidates():
            if candidate["status"] == "accepted":
                candidates_set.add(
                    (candidate["sourceColumn"], candidate["targetColumn"])
                )

        ret = []
        for source_col, target_col in candidates_set:
            if source_col not in self.get_value_matches():
                continue
            if target_col not in self.get_value_matches()[source_col]["targets"]:
                value_matches = []
            else:
                value_matches = self.get_value_matches()[source_col]["targets"][
                    target_col
                ]
            ret.append(
                {
                    "sourceColumn": source_col,
                    "targetColumn": target_col,
                    "valueMatches": [
                        {"from": from_val, "to": to_val}
                        for from_val, to_val in zip(
                            self.get_source_unique_values(source_col), value_matches
                        )
                    ],
                }
            )
        return ret

    def set_source_value_matches(
        self, source_col: str, from_val: str, to_val: str
    ) -> None:
        self.cached_candidates["value_matches"][source_col]["source_unique_values"] = [
            to_val if val == from_val else val
            for val in self.cached_candidates["value_matches"][source_col][
                "source_unique_values"
            ]
        ]

    def set_source_value(self, column: str, from_val: str, to_val: str) -> None:
        logger.info(f"Setting value {from_val} to {to_val} in column {column}...")
        self.source_df[column] = self.source_df[column].replace(from_val, to_val)
        self.set_source_value_matches(column, from_val, to_val)


class UserOperationHistory:
    def __init__(self) -> None:
        self.history: List["UserOperation"] = []
        self.redo_stack: List["UserOperation"] = []

    def add_operation(self, operation: "UserOperation") -> None:
        self.history.append(operation)
        self.redo_stack.clear()  # Clear redo stack on new operation

    def undo_last_operation(self) -> Optional["UserOperation"]:
        if self.history:
            operation = self.history.pop()
            self.redo_stack.append(operation)
            return operation
        return None

    def redo_last_operation(self) -> Optional["UserOperation"]:
        if self.redo_stack:
            operation = self.redo_stack.pop()
            return operation
        return None

    def get_history(self) -> List[Dict[str, Any]]:
        return self.history

    def export_history_for_frontend(self) -> List[Dict[str, Any]]:
        return [op._json_serialize() for op in self.history]


class UserOperation:
    def __init__(
        self,
        operation: str,
        candidate: Dict[str, Any],
        references: List[Dict[str, Any]],
    ) -> None:
        self.operation = operation
        self.candidate = candidate
        self.references = references

    def _json_serialize(self) -> Dict[str, Any]:
        return {
            "operation": self.operation,
            "candidate": self.candidate,
        }
