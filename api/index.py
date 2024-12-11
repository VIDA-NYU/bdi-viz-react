import os
import pandas as pd
import logging
from threading import Thread

from flask import Flask
from flask import request

from .matcher.embedding_matcher import EmbeddingMatcher
from .utils import extract_data_from_request
from .matching_task import MATCHING_TASK
import json

# langchain
from .langchain.pydantic import AgentResponse
from .langchain.agent import Agent, AGENT

from .tools.candidate_butler import candidate_butler_tools


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

app = Flask("bdiviz_flask")
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024
app.logger.setLevel(logging.DEBUG)


@app.route("/api/matching", methods=["POST"])
def matcher():
    
    target = pd.read_csv(GDC_DATA_PATH)

    source, _ = extract_data_from_request(request)

    app.logger.info("Matching task started!")

    MATCHING_TASK.update_dataframe(source_df=source, target_df=target)

    ret_json = MATCHING_TASK.get_candidates()
    
    # output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
    # with open(output_path, "w") as f:
    #     json.dump(ret_json, f, indent=4)

    return {"message": "success"}

@app.route("/api/results", methods=["GET"])
def get_results():
    # output_path = os.path.join(os.path.dirname(__file__), "matching_results.json")
    # with open(output_path, "r") as f:
    #     results = json.load(f)

    results = MATCHING_TASK.to_frontend_json()
    return {"message": "success", "results": results}


@app.route("/api/agent", methods=["POST"])
def ask_agent():
    data = request.json
    prompt = data["prompt"]
    app.logger.info(f"Prompt: {prompt}")
    response = AGENT.invoke(prompt, candidate_butler_tools, AgentResponse).model_dump()
    app.logger.info(f"Response: {response}")
    return response