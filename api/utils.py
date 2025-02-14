import json
import logging
import os
import re
from io import StringIO
from typing import Any, Dict, Optional, Tuple

import pandas as pd
import requests
from tqdm.autonotebook import tqdm

logger = logging.getLogger("bdiviz_flask.sub")

CACHE_DIR = ".cache"
EXPLANATION_DIR = os.path.join(CACHE_DIR, "explanations")


def check_cache_dir(func):
    def wrapper(*args, **kwargs):
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR)
        return func(*args, **kwargs)

    return wrapper


def extract_session_name(request) -> str:
    if request.json is None:
        return "default"

    data = request.json
    session_name = data.get("session_name", "default")

    return session_name


def extract_data_from_request(request):
    source_df = None
    target_df = None

    logger.info(request)

    if request.form is None:
        return None

    form = request.form

    type = form["type"]
    if type == "csv_input":
        source_csv = form["source_csv"]
        source_csv_string_io = StringIO(source_csv)
        source_df = pd.read_csv(source_csv_string_io, sep=",")
        logger.critical(f"Source read: {source_df.columns}")

    return source_df, target_df


@check_cache_dir
def sanitize_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", name)


def write_candidate_explanation_json(
    source_col: str, target_col: str, candidate_explanation: Dict[str, Any]
) -> None:
    if not os.path.exists(EXPLANATION_DIR):
        os.makedirs(EXPLANATION_DIR)

    sanitized_source_col = sanitize_filename(source_col)
    sanitized_target_col = sanitize_filename(target_col)
    output_path = os.path.join(
        EXPLANATION_DIR, f"{sanitized_source_col}_{sanitized_target_col}.json"
    )
    with open(output_path, "w") as f:
        json.dump(candidate_explanation, f, indent=4)


def read_candidate_explanation_json(
    source_col: str, target_col: str
) -> Optional[Dict[str, Any]]:
    sanitized_source_col = sanitize_filename(source_col)
    sanitized_target_col = sanitize_filename(target_col)
    output_path = os.path.join(
        EXPLANATION_DIR, f"{sanitized_source_col}_{sanitized_target_col}.json"
    )
    if os.path.exists(output_path):
        with open(output_path, "r") as f:
            return json.load(f)

    return


@check_cache_dir
def download_model_pt(url: str, model_name: str) -> str:
    model_path = os.path.join(CACHE_DIR, model_name)
    if os.path.exists(model_path):
        logger.info(f"Model already exists at {model_path}")
        return model_path

    try:
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get("content-length", 0))
        block_size = 1024

        with open(model_path, "wb") as f:
            for data in tqdm(
                response.iter_content(block_size),
                total=total_size // block_size,
                unit="KB",
                unit_scale=True,
            ):
                f.write(data)
    except Exception as e:
        logger.error(f"Failed to download model from {url}: {e}")
        raise

    return model_path
