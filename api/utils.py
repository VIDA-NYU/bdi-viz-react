from io import StringIO
import logging

import pandas as pd


logger = logging.getLogger(__name__)

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



