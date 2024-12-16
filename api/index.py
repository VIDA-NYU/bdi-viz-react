import json
import logging
import os
from threading import Thread

import pandas as pd
from flask import Flask, request

from .langchain.agent import AGENT, Agent

# langchain
from .langchain.pydantic import AgentResponse
from .matcher.embedding_matcher import EmbeddingMatcher
from .matching_task import MATCHING_TASK
from .tools.candidate_butler import candidate_butler_tools
from .utils import extract_data_from_request

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
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024 * 1024
app.logger.setLevel(logging.DEBUG)


@app.route("/api/matching", methods=["POST"])
def matcher():
    target = pd.read_csv(GDC_DATA_PATH)

    source, _ = extract_data_from_request(request)

    app.logger.info("Matching task started!")

    MATCHING_TASK.update_dataframe(source_df=source, target_df=target)

    _ = MATCHING_TASK.get_candidates()

    return {"message": "success"}


@app.route("/api/results", methods=["GET"])
def get_results():
    results = MATCHING_TASK.to_frontend_json()
    return {"message": "success", "results": results}


@app.route("/api/agent", methods=["POST"])
def ask_agent():
    data = request.json
    prompt = data["prompt"]
    app.logger.info(f"Prompt: {prompt}")
    response = AGENT.invoke(prompt, candidate_butler_tools, AgentResponse)
    app.logger.info(f"{response}")

    response = response.model_dump()
    app.logger.info(f"Response: {response}")
    return response


@app.route("/api/agent/diagnose", methods=["POST"])
def agent_diagnose():
    data = request.json

    app.logger.info(data)

    operation = data["operation"]
    candidate = data["candidate"]
    references = data["references"]

    source_col = candidate["sourceColumn"]
    source_unique_values = MATCHING_TASK.get_source_unique_values(source_col)
    unique_values = {
        "sourceColumn": source_unique_values,
        "targetColumns": [
            {
                "targetColumn": candidate["targetColumn"],
                "uniqueValues": MATCHING_TASK.get_target_unique_values(
                    candidate["targetColumn"]
                ),
            }
        ],
    }
    for ref in references:
        unique_values["targetColumns"].append(
            {
                "targetColumn": ref["targetColumn"],
                "uniqueValues": MATCHING_TASK.get_target_unique_values(
                    ref["targetColumn"]
                ),
            }
        )

    response = AGENT.diagnose(
        {
            "operation": operation,
            "candidate": candidate,
            "references": references,
            "uniqueValues": unique_values,
        }
    )

    response = response.model_dump()
    app.logger.info(f"Response: {response}")
    return response
