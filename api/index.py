import json
import logging
import os

import pandas as pd
from flask import Flask, request

from .langchain.agent import AGENT

# langchain
from .langchain.pydantic import AgentResponse
from .matching_task import MATCHING_TASK
from .tools.candidate_butler import candidate_butler_tools
from .utils import (
    extract_data_from_request,
    read_candidate_explanation_json,
    write_candidate_explanation_json,
)

GDC_DATA_PATH = os.path.join(os.path.dirname(__file__), "./resources/gdc_table.csv")

app = Flask("bdiviz_flask")
app.config["MAX_CONTENT_LENGTH"] = 1024 * 1024 * 1024
app.logger.setLevel(logging.DEBUG)


@app.route("/api/matching", methods=["POST"])
def matcher():
    target = pd.read_csv(GDC_DATA_PATH)

    source, _ = extract_data_from_request(request)
    source.to_csv(".source.csv", index=False)

    app.logger.info("Matching task started!")

    MATCHING_TASK.update_dataframe(source_df=source, target_df=target)

    _ = MATCHING_TASK.get_candidates()

    return {"message": "success"}


@app.route("/api/results", methods=["GET"])
def get_results():
    if MATCHING_TASK.source_df is None or MATCHING_TASK.target_df is None:
        if os.path.exists(".source.csv"):
            source = pd.read_csv(".source.csv")
            MATCHING_TASK.update_dataframe(
                source_df=source, target_df=pd.read_csv(GDC_DATA_PATH)
            )
        _ = MATCHING_TASK.get_candidates()
    results = MATCHING_TASK.to_frontend_json()

    if not AGENT.is_initialized:
        AGENT.initialize(results["candidates"])

    return {"message": "success", "results": results}


@app.route("/api/value-bins", methods=["GET"])
def get_unique_values():
    if MATCHING_TASK.source_df is None or MATCHING_TASK.target_df is None:
        if os.path.exists(".source.csv"):
            source = pd.read_csv(".source.csv")
            MATCHING_TASK.update_dataframe(
                source_df=source, target_df=pd.read_csv(GDC_DATA_PATH)
            )
        _ = MATCHING_TASK.get_candidates()
    results = MATCHING_TASK.unique_values_to_frontend_json()

    return {"message": "success", "results": results}


@app.route("/api/value-matches", methods=["GET"])
def get_value_matches():
    if MATCHING_TASK.source_df is None or MATCHING_TASK.target_df is None:
        if os.path.exists(".source.csv"):
            source = pd.read_csv(".source.csv")
            MATCHING_TASK.update_dataframe(
                source_df=source, target_df=pd.read_csv(GDC_DATA_PATH)
            )
        _ = MATCHING_TASK.get_candidates()
    results = MATCHING_TASK.value_matches_to_frontend_json()

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


@app.route("/api/agent/explain", methods=["POST"])
def agent_explanation():
    data = request.json

    source_col = data["sourceColumn"]
    target_col = data["targetColumn"]
    source_values = MATCHING_TASK.get_source_unique_values(source_col)
    target_values = MATCHING_TASK.get_target_unique_values(target_col)

    cached_explanation = read_candidate_explanation_json(source_col, target_col)
    if cached_explanation:
        app.logger.info(
            f"Returning cached explanation for {source_col} and {target_col}"
        )
        return cached_explanation

    response = AGENT.explain(
        {
            "sourceColumn": source_col,
            "targetColumn": target_col,
            "sourceValues": source_values,
            "targetValues": target_values,
        }
    )
    response = response.model_dump()
    app.logger.info(f"Response: {response}")
    write_candidate_explanation_json(source_col, target_col, response)
    return response


@app.route("/api/agent/suggest", methods=["POST"])
def agent_suggest():
    data = request.json

    explanations = data["explanations"]
    diagnosis_dict = {e["content"]: e["confidence"] for e in explanations}

    user_operation = data["userOperation"]
    operation = user_operation["operation"]
    candidate = user_operation["candidate"]
    references = user_operation["references"]

    # Extract false positives and false negatives from user operation and agent explanations
    source_col = candidate["sourceColumn"]
    target_col = candidate["targetColumn"]
    cached_explanation = read_candidate_explanation_json(source_col, target_col)
    if cached_explanation:
        agent_thinks_is_match = cached_explanation["is_match"]
        source_values = MATCHING_TASK.get_source_unique_values(source_col)
        target_values = MATCHING_TASK.get_target_unique_values(target_col)
        if agent_thinks_is_match and operation == "reject":
            AGENT.remember_fp(
                {
                    "sourceColumn": source_col,
                    "targetColumn": target_col,
                    "sourceValues": source_values,
                    "targetValues": target_values,
                }
            )
        elif not agent_thinks_is_match and operation == "accept":
            AGENT.remember_fn(
                {
                    "sourceColumn": source_col,
                    "targetColumn": target_col,
                    "sourceValues": source_values,
                    "targetValues": target_values,
                }
            )

    MATCHING_TASK.apply_operation(operation, candidate, references)

    response = AGENT.make_suggestion(user_operation, diagnosis_dict)
    response = response.model_dump()

    return response


@app.route("/api/agent/apply", methods=["POST"])
def agent_apply():
    reaction = request.json
    actions = reaction["actions"]
    previous_operation = reaction["previousOperation"]

    app.logger.info(f"User Reaction: {reaction}")

    responses = []
    for action in actions:
        response = AGENT.apply(action, previous_operation)
        if response:
            response_obj = response.model_dump()
            if response_obj["action"] == "undo":
                user_operation = previous_operation["operation"]
                candidate = previous_operation["candidate"]
                references = previous_operation["references"]
                MATCHING_TASK.undo_operation(user_operation, candidate, references)
            responses.append(response_obj)

    return responses


@app.route("/api/user-operation/apply", methods=["POST"])
def user_operation():
    operation_objs = request.json["userOperations"]

    for operation_obj in operation_objs:
        operation = operation_obj["operation"]
        candidate = operation_obj["candidate"]
        references = operation_obj["references"]

        MATCHING_TASK.apply_operation(operation, candidate, references)

    return {"message": "success"}


@app.route("/api/user-operation/undo", methods=["POST"])
def undo_operation():
    operation_objs = request.json["userOperations"]

    for operation_obj in operation_objs:
        operation = operation_obj["operation"]
        candidate = operation_obj["candidate"]
        references = operation_obj["references"]

        MATCHING_TASK.undo_operation(operation, candidate, references)

    return {"message": "success"}
