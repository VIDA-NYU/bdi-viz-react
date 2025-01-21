import hashlib
import json
import logging
import os
from typing import Any, Dict, List, Optional, Tuple

import bdikit as bdi
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.neighbors import NearestNeighbors
from torch import Tensor

from .matcher.embedding_clusterer import EmbeddingClusterer
from .utils import download_model_pt

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
FT_MODEL_URL = "https://nyu.box.com/shared/static/g2d3r1isdxrrxdcvqfn2orqgjfneejz1.pth"

ALLOWED_BDI_MATCHERS = [
    "magneto_zs_bp",
    "magneto_ft_bp",
    "ct_learning",
    "similarity_flooding",
    "coma",
    "cupid",
    "distribution_based",
    "jaccard_distance",
]


class MatchingTask:
    def __init__(
        self,
        top_k: int = 20,
        clustering_model="sentence-transformers/all-mpnet-base-v2",
    ) -> None:
        self.top_k = top_k
        self.bdi_matchers = [
            "magneto_zs_bp",
            "magneto_ft_bp",
        ]
        self.clustering_model = self._download_model(clustering_model)
        self.source_df = None
        self.target_df = None
        self.cached_candidates = self._initialize_cache()

    def _initialize_cache(self) -> Dict[str, Any]:
        return {
            "source_hash": None,
            "target_hash": None,
            "candidates": [],
            "source_clusters": None,
            "target_clusters": None,
        }

    def _download_model(self, model_name: str) -> str:
        try:
            return download_model_pt(model_name, f"{model_name.split('/')[-1]}")
        except Exception as e:
            logger.error(f"Error downloading model: {e}")
            return model_name

    def update_dataframe(
        self, source_df: Optional[pd.DataFrame], target_df: Optional[pd.DataFrame]
    ):
        if source_df is not None:
            self.source_df = source_df
            logger.info(f"[MatchingTask] Source dataframe updated!")
        if target_df is not None:
            self.target_df = target_df
            logger.info(f"[MatchingTask] Target dataframe updated!")

    def get_candidates(self, is_candidates_cached: bool = True) -> Dict[str, list]:
        if self.source_df is None or self.target_df is None:
            raise ValueError("Source and Target dataframes must be provided.")

        source_hash, target_hash = self._compute_hashes()
        cached_json = self._import_cache_from_json()

        if self._is_cache_valid(cached_json, source_hash, target_hash):
            self.cached_candidates = cached_json
            return cached_json["candidates"]

        if is_candidates_cached and self._is_cache_valid(
            self.cached_candidates, source_hash, target_hash
        ):
            return self.cached_candidates["candidates"]

        return self._generate_candidates(source_hash, target_hash, is_candidates_cached)

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

        layered_candidates = []
        for matcher in self.bdi_matchers:
            if matcher not in ALLOWED_BDI_MATCHERS:
                raise ValueError(f"Matcher {matcher} not supported.")

            logger.info(f"Running matcher: {matcher}...")
            embedding_candidates = bdi.top_matches(
                source=self.source_df,
                target=self.target_df,
                top_k=self.top_k,
                method=matcher,
            )
            matcher_candidates = self._layer_candidates_bdi(
                embedding_candidates, matcher
            )
            layered_candidates.extend(matcher_candidates)

        if is_candidates_cached:
            self.cached_candidates = {
                "source_hash": source_hash,
                "target_hash": target_hash,
                "candidates": layered_candidates,
                "source_clusters": source_clusters,
                "target_clusters": target_clusters,
            }
            self._export_cache_to_json(self.cached_candidates)

        return layered_candidates

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

    def discard_cached_column(self, source_col: str) -> None:
        cached_candidates_dict = self.get_cached_candidates()
        if source_col in cached_candidates_dict:
            self.set_cached_candidates(
                [
                    cached_candidate
                    for cached_candidate in candidates
                    if cached_candidate["sourceColumn"] != source_col
                ]
            )

    def append_cached_column(
        self, column_name: str, candidates: List[Tuple[str, float]]
    ) -> None:
        cached_candidates_dict = self.get_cached_candidates()
        cached_candidates_dict[column_name] = candidates
        self.cached_candidates["candidates"] = cached_candidates_dict

    def to_frontend_json(self) -> dict:
        return {
            "candidates": self.get_cached_candidates(),
            "sourceClusters": self._format_source_clusters_for_frontend(),
            "targetClusters": self.get_cached_target_clusters(),
        }

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

    def apply_operation(
        self,
        operation: str,
        candidate: Dict[str, Any],
        references: List[Dict[str, Any]],
    ) -> None:
        logger.info(f"Applying operation: {operation}, on candidate: {candidate}...")

        candidates = self.get_cached_candidates()
        if operation == "accept":
            self.set_cached_candidates(
                [
                    cached_candidate
                    for cached_candidate in candidates
                    if (cached_candidate["sourceColumn"] != candidate["sourceColumn"])
                    or (cached_candidate["targetColumn"] == candidate["targetColumn"])
                ]
            )
        elif operation == "reject":
            self.set_cached_candidates(
                [
                    cached_candidate
                    for cached_candidate in candidates
                    if not (
                        cached_candidate["sourceColumn"] == candidate["sourceColumn"]
                        and cached_candidate["targetColumn"]
                        == candidate["targetColumn"]
                    )
                ]
            )
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

        candidates = self.get_cached_candidates()

        if operation in ["accept", "reject", "discard"]:
            self.set_cached_candidates(candidates + references)
        else:
            raise ValueError(f"Operation {operation} not supported.")

    def get_source_df(self) -> pd.DataFrame:
        return self.source_df

    def get_target_df(self) -> pd.DataFrame:
        return self.target_df

    def get_source_unique_values(self, source_col: str) -> List[str]:
        if self.source_df is None or source_col not in self.source_df.columns:
            raise ValueError(
                f"Source column {source_col} not found in the source dataframe."
            )
        return self.source_df[source_col].unique().tolist()[:10]

    def get_target_unique_values(self, target_col: str) -> List[str]:
        if self.target_df is None or target_col not in self.target_df.columns:
            raise ValueError(
                f"Target column {target_col} not found in the target dataframe."
            )
        return self.target_df[target_col].unique().tolist()[:10]

    def get_cached_candidates(self) -> List[Dict[str, Any]]:
        return self.cached_candidates["candidates"]

    def set_cached_candidates(self, candidates: List[Dict[str, Any]]) -> None:
        self.cached_candidates["candidates"] = candidates

    def get_cached_source_clusters(self) -> Dict[str, List[str]]:
        return self.cached_candidates["source_clusters"] or {}

    def get_cached_target_clusters(self) -> List[List[str]]:
        return self.cached_candidates["target_clusters"] or []

    def get_bdi_matchers(self) -> List[str]:
        return self.bdi_matchers

    def set_bdi_matchers(self, bdi_matchers: List[str]) -> None:
        self.bdi_matchers = [
            matcher for matcher in bdi_matchers if matcher in ALLOWED_BDI_MATCHERS
        ]


MATCHING_TASK = MatchingTask(clustering_model=FT_MODEL_URL)
