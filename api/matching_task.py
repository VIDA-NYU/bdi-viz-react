import hashlib
import logging
import pandas as pd

from typing import Dict, Optional
from .matcher.embedding_matcher import EmbeddingMatcher

logger = logging.getLogger(__name__)

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
            "candidates": None
        }

    def update_dataframe(self, source_df: Optional[pd.DataFrame], target_df: Optional[pd.DataFrame]):
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
        source_hash = int(hashlib.sha256(pd.util.hash_pandas_object(self.source_df, index=True).values).hexdigest(), 16)
        target_hash = int(hashlib.sha256(pd.util.hash_pandas_object(self.target_df, index=True).values).hexdigest(), 16)
        if cache_candidates and self.cached_candidates["source_hash"] == source_hash and self.cached_candidates["target_hash"] == target_hash:
            return self.cached_candidates["candidates"]

        embedding_candidates = self.embeddingMatcher.get_embedding_similarity_candidates(
            source_df=self.source_df, target_df=self.target_df
        )

        layered_candidates = {}
        for (source_col, target_col), score in embedding_candidates.items():
            logger.critical(f"{source_col} matched with {target_col} with score {score}")
            # ret_json.append(
            #     {
            #         "sourceColumn": source_col,
            #         "targetColumn": target_col,
            #         "score": score,
            #     }
            # )
            if source_col not in layered_candidates:
                layered_candidates[source_col] = []
            layered_candidates[source_col].append(
                (target_col, score)
            )
        
        if cache_candidates:
            self.cached_candidates = {
                "source_hash": source_hash,
                "target_hash": target_hash,
                "candidates": layered_candidates
            }
        return layered_candidates
    
    def get_cached_candidates(self) -> Dict[str, list]:
        return self.cached_candidates["candidates"] if self.cached_candidates["candidates"] is not None else {}
    
    def update_cached_candidates(self, candidates: Dict[str, list]) -> None:
        cached_candidates_dict = self.get_cached_candidates()
        for source_col, target_infos in candidates.items():
            if source_col in cached_candidates_dict:
                cached_candidates_dict[source_col] = target_infos
        
        self.cached_candidates["candidates"] = cached_candidates_dict
            
        
    
    def to_frontend_json(self) -> list:
        ret_json = []
        candidates = self.get_cached_candidates()
        for source_col, target_infos in candidates.items():
            for target_info in target_infos:
                ret_json.append(
                    {
                        "sourceColumn": source_col,
                        "targetColumn": target_info[0],
                        "score": target_info[1]
                    }
                )

        return ret_json
    

    