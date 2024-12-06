import os
import pandas as pd
import logging
from threading import Thread

from flask import Flask
from flask import request

from .matcher.embedding_matcher import EmbeddingMatcher
from .utils import extract_data_from_request
import json

logger = logging.getLogger(__name__)

GDC_DATA_PATH = os.path.join(os.path.dirname(__file__), "./resources/gdc_table.csv")
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

app = Flask(__name__)

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/matching", methods=["POST"])
def matcher():
    
    target = pd.read_csv(GDC_DATA_PATH)

    source, _ = extract_data_from_request(request)

    logger.info("Matching task started!")

    embeddingMatcher = EmbeddingMatcher(params=DEFAULT_PARAMS)

    logger.info(f"Matching Embedder loaded: {embeddingMatcher}")

    output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
    if os.path.exists(output_path):
        return {"message": "success"}

    embedding_candidates = embeddingMatcher.get_embedding_similarity_candidates(
        source_df=source, target_df=target
    )

    ret_json = []
    for (source_col, target_col), score in embedding_candidates.items():
        logger.critical(f"{source_col} matched with {target_col} with score {score}")
        ret_json.append(
            {
                "sourceColumn": source_col,
                "targetColumn": target_col,
                "score": score,
            }
        )
    
    output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
    with open(output_path, "w") as f:
        json.dump(ret_json, f, indent=4)

    return {"message": "success"}

@app.route("/api/results", methods=["GET"])
def get_results():
    output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
    with open(output_path, "r") as f:
        results = json.load(f)
    return {"message": "success", "results": results}