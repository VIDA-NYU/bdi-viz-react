import hashlib
import json
import logging
import os
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors

from .matcher.embedding_matcher import EmbeddingMatcher

logger = logging.getLogger("bdiviz_flask.sub")

DEFAULT_PARAMS = {
    "embedding_model": "sentence-transformers/all-mpnet-base-v2",
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
    """
    Matching Task class
    - Store source and target dataframes
    - Store the EmbeddingMatcher object
    - provide tools for agent to interact with the EmbeddingMatcher
    """

    def __init__(self) -> None:
        self.embeddingMatcher = EmbeddingMatcher(params=DEFAULT_PARAMS)
        self.source_df = None
        self.target_df = None
        self.cached_candidates = {
            "source_hash": None,
            "target_hash": None,
            "candidates": None,
            "source_clusters": None,
        }

    def update_dataframe(
        self, source_df: Optional[pd.DataFrame], target_df: Optional[pd.DataFrame]
    ):
        if source_df is not None:
            self.source_df = source_df
            logger.info(f"[MatchingTask] Source dataframe updated!")
        if target_df is not None:
            self.target_df = target_df
            logger.info(f"[MatchingTask] Target dataframe updated!")

    def get_candidates(self, cache_candidates: bool = True) -> Dict[str, list]:
        if self.source_df is None or self.target_df is None:
            raise ValueError("Source and Target dataframes must be provided.")

        # Check if the candidates are already cached
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

        # Check if the candidates are already cached
        cached_json = self.import_cache_from_json()
        if (
            cached_json
            and cached_json["source_hash"] == source_hash
            and cached_json["target_hash"] == target_hash
        ):
            self.cached_candidates = cached_json
            return cached_json["candidates"]

        elif (
            cache_candidates
            and self.cached_candidates["source_hash"] == source_hash
            and self.cached_candidates["target_hash"] == target_hash
        ):
            return self.cached_candidates["candidates"]

        (
            embedding_candidates,
            source_embeddings,
            target_embeddings,
        ) = self.embeddingMatcher.get_embedding_similarity_candidates(
            source_df=self.source_df, target_df=self.target_df
        )

        source_clusters = self.gen_source_clusters(source_embeddings)

        layered_candidates = {}
        for (source_col, target_col), score in embedding_candidates.items():
            logger.debug(f"{source_col} matched with {target_col} with score {score}")
            # ret_json.append(
            #     {
            #         "sourceColumn": source_col,
            #         "targetColumn": target_col,
            #         "score": score,
            #     }
            # )
            if source_col not in layered_candidates:
                layered_candidates[source_col] = []
            layered_candidates[source_col].append((target_col, score))

        if cache_candidates:
            self.cached_candidates = {
                "source_hash": source_hash,
                "target_hash": target_hash,
                "candidates": layered_candidates,
                "source_clusters": source_clusters,
            }

        # Save it as Json file
        self.export_cache_to_json(self.cached_candidates)

        return layered_candidates

    def gen_source_clusters(self, source_embeddings) -> Dict[str, List[str]]:
        knn = NearestNeighbors(
            n_neighbors=min(10, len(self.source_df.columns)), metric="cosine"
        )
        knn.fit(np.array(source_embeddings))
        clusters_idx = [
            knn.kneighbors([source_embedding], return_distance=False)[0]
            for source_embedding in source_embeddings
        ]

        clusters = {}
        for i, source_column in enumerate(self.source_df.columns):
            cluster_idx = clusters_idx[i]
            cluster = []
            for idx in cluster_idx:
                cluster.append(self.source_df.columns[idx])
            clusters[source_column] = cluster
        return clusters

    # [Cache related functions]

    def get_cached_candidates(self) -> Dict[str, List[Tuple[str, float]]]:
        return (
            self.cached_candidates["candidates"]
            if self.cached_candidates["candidates"] is not None
            else {}
        )

    def get_cached_source_clusters(self) -> Dict[str, List[str]]:
        return (
            self.cached_candidates["source_clusters"]
            if self.cached_candidates["source_clusters"] is not None
            else {}
        )

    def update_cached_candidates(self, candidates: Dict[str, list]) -> None:
        cached_candidates_dict = self.get_cached_candidates()
        for source_col, target_infos in candidates.items():
            if source_col in cached_candidates_dict:
                cached_candidates_dict[source_col] = target_infos

        self.cached_candidates["candidates"] = cached_candidates_dict

    def to_frontend_json(self) -> list:
        ret_json = {
            "candidates": [],
            "sourceClusters": [],
        }

        # Candidates Object
        candidates = self.get_cached_candidates()
        for source_col, target_infos in candidates.items():
            for target_info in target_infos:
                ret_json["candidates"].append(
                    {
                        "sourceColumn": source_col,
                        "targetColumn": target_info[0],
                        "score": target_info[1],
                    }
                )

        # Source Clusters Object
        source_clusters = self.get_cached_source_clusters()
        for source_col, cluster in source_clusters.items():
            ret_json["sourceClusters"].append(
                {
                    "sourceColumn": source_col,
                    "cluster": cluster,
                }
            )

        return ret_json

    def export_cache_to_json(self, json_obj: Dict) -> None:
        output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
        with open(output_path, "w") as f:
            json.dump(json_obj, f, indent=4)

    def import_cache_from_json(self) -> Optional[Dict]:
        output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
        if os.path.exists(output_path):
            with open(output_path, "r") as f:
                return json.load(f)

    # Setter & Getter
    def get_source_df(self) -> pd.DataFrame:
        return self.source_df

    def get_target_df(self) -> pd.DataFrame:
        return self.target_df

    def get_source_unique_values(self, source_col: str) -> List[str]:
        if self.source_df is None or source_col not in self.source_df.columns:
            raise ValueError(
                f"Source column {source_col} not found in the source dataframe."
            )
        uniques = self.source_df[source_col].unique().tolist()
        if len(uniques) > 10:
            return uniques[:10]
        return uniques

    def get_target_unique_values(self, target_col: str) -> List[str]:
        if self.target_df is None or target_col not in self.target_df.columns:
            raise ValueError(
                f"Target column {target_col} not found in the target dataframe."
            )
        uniques = self.target_df[target_col].unique().tolist()
        if len(uniques) > 10:
            return uniques[:10]
        return uniques


MATCHING_TASK = MatchingTask()
