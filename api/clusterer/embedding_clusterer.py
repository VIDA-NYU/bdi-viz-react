import os
from typing import List, Tuple

import numpy as np
import pandas as pd
import torch
from sentence_transformers import SentenceTransformer
from transformers import AutoModel, AutoTokenizer

from .column_encoder import ColumnEncoder

DEFAULT_MODELS = [
    "sentence-transformers/all-mpnet-base-v2",
    "Snowflake/snowflake-arctic-embed-m",
]


class EmbeddingClusterer:
    def __init__(self, params):
        self.params = params
        self.topk = params["topk"]
        self.embedding_threshold = params["embedding_threshold"]

        # Dynamically set device to GPU if available, else fallback to CPU
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.model_name = params["embedding_model"]

        if self.model_name in DEFAULT_MODELS:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            # Load the model onto the selected device
            self.model = AutoModel.from_pretrained(self.model_name).to(self.device)
            print(f"Loaded ZeroShot Model on {self.device}")
        else:
            # Base model
            base_model = "sentence-transformers/all-mpnet-base-v2"
            self.model = SentenceTransformer(base_model)
            self.tokenizer = AutoTokenizer.from_pretrained(base_model)

            print(f"Loaded SentenceTransformer Model on {self.device}")

            # path to the trained model weights
            model_path = self.model_name
            if os.path.exists(model_path):
                print(f"Loading trained model from {model_path}")
                # Load state dict for the SentenceTransformer model
                state_dict = torch.load(
                    model_path, map_location=self.device, weights_only=True
                )
                # Assuming the state_dict contains the proper model weights and is compatible with SentenceTransformer
                self.model.load_state_dict(state_dict)
                self.model.eval()
                self.model.to(self.device)
            else:
                print(
                    f"Trained model not found at {model_path}, loading default model."
                )

    def _get_embeddings(self, texts, batch_size=32):
        if self.model_name in DEFAULT_MODELS:
            return self._get_embeddings_zs(texts, batch_size)
        else:
            return self._get_embeddings_ft(texts, batch_size)

    def _get_embeddings_zs(self, texts: List[str], batch_size=32):
        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i : i + batch_size]
            inputs = self.tokenizer(
                batch_texts,
                padding=True,
                # Move inputs to device
                truncation=True,
                return_tensors="pt",
            ).to(self.device)
            with torch.no_grad():
                outputs = self.model(**inputs)
            embeddings.append(outputs.last_hidden_state.mean(dim=1))
        return torch.cat(embeddings)

    def _get_embeddings_ft(self, texts, batch_size=32):
        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i : i + batch_size]
            with torch.no_grad():
                batch_embeddings = self.model.encode(
                    batch_texts, show_progress_bar=False, device=self.device
                )
            embeddings.append(torch.tensor(batch_embeddings))
        return torch.cat(embeddings)

    def get_embeddings(self, source_df: pd.DataFrame, target_df: pd.DataFrame) -> np.ndarray:
        encoder = ColumnEncoder(
            self.tokenizer,
            encoding_mode=self.params["encoding_mode"],
            sampling_mode=self.params["sampling_mode"],
            n_samples=self.params["sampling_size"],
        )

        input_col_repr_dict = {
            encoder.encode(source_df, col): col for col in source_df.columns
        }
        target_col_repr_dict = {
            encoder.encode(target_df, col): col for col in target_df.columns
        }

        cleaned_input_col_repr = list(input_col_repr_dict.keys())
        cleaned_target_col_repr = list(target_col_repr_dict.keys())

        embeddings_input = np.array(self._get_embeddings(cleaned_input_col_repr))
        embeddings_target = np.array(self._get_embeddings(cleaned_target_col_repr))

        return embeddings_input, embeddings_target
