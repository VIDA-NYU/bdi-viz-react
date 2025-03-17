import json
import logging
import os
import re
from io import StringIO
from typing import Any, Dict, List, Optional, Tuple

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


GDC_ONTOLOGY_FLAT_PATH = os.path.join(
    os.path.dirname(__file__), "./resources/gdc_ontology_flat.json"
)

PDC_ONTOLOGY_FLAT_PATH = os.path.join(
    os.path.dirname(__file__), "./resources/pdc_ontology_flat.json"
)


def load_gdc_ontology(candidates: List[Dict[str, Any]]) -> List[Dict]:
    with open(GDC_ONTOLOGY_FLAT_PATH, "r") as f:
        gdc_ontology_flat = json.load(f)

    hiarchies = {}
    target_columns = set()
    for candidate in candidates:
        target_columns.add(candidate["targetColumn"])

    for target_column in list(target_columns):
        if target_column not in gdc_ontology_flat:
            continue
        ontology = gdc_ontology_flat[target_column]
        category = ontology["category"]
        node = ontology["node"]
        if category not in hiarchies:
            hiarchies[category] = {"level": 0, "children": {}}
        if node not in hiarchies[category]["children"]:
            hiarchies[category]["children"][node] = {"level": 1, "children": {}}
        hiarchies[category]["children"][node]["children"][target_column] = {
            "level": 2,
            "children": [],
        }

    ret = []
    for category, category_info in hiarchies.items():
        for node, node_info in category_info["children"].items():
            for target_column in node_info["children"].keys():
                target_column_obj = {
                    "name": target_column,
                    "parent": node,
                    "grandparent": category,
                }
                ret.append(target_column_obj)
    return ret


def load_pdc_ontology(candidates: List[Dict[str, Any]]) -> List[Dict]:
    with open(PDC_ONTOLOGY_FLAT_PATH, "r") as f:
        pdc_ontology_flat = json.load(f)

    hiarchies = {}
    target_columns = set()
    for candidate in candidates:
        target_columns.add(candidate["targetColumn"])

    for target_column in list(target_columns):
        if target_column not in pdc_ontology_flat:
            continue
        ontology = pdc_ontology_flat[target_column]
        category = ontology["category"]
        node = ontology["node"]
        if category not in hiarchies:
            hiarchies[category] = {"level": 0, "children": {}}
        if node not in hiarchies[category]["children"]:
            hiarchies[category]["children"][node] = {"level": 1, "children": {}}
        hiarchies[category]["children"][node]["children"][target_column] = {
            "level": 2,
            "children": [],
        }

    ret = []
    for category, category_info in hiarchies.items():
        for node, node_info in category_info["children"].items():
            for target_column in node_info["children"].keys():
                target_column_obj = {
                    "name": target_column,
                    "parent": node,
                    "grandparent": category,
                }
                ret.append(target_column_obj)
    return ret


def load_gdc_property(target_column: str) -> Optional[Dict[str, Any]]:
    with open(GDC_ONTOLOGY_FLAT_PATH, "r") as f:
        gdc_ontology_flat = json.load(f)

    property = None
    if target_column in gdc_ontology_flat:
        property = gdc_ontology_flat[target_column]

    return property


def load_pdc_property(target_column: str) -> Optional[Dict[str, Any]]:
    with open(PDC_ONTOLOGY_FLAT_PATH, "r") as f:
        pdc_ontology_flat = json.load(f)

    property = None
    if target_column in pdc_ontology_flat:
        property = pdc_ontology_flat[target_column]

    return property
