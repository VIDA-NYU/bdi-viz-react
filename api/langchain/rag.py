import json
import logging
import os
from typing import Any, Dict, List, TypedDict
from langchain import hub
from langchain_community.document_loaders import JSONLoader
from langchain_core.documents import Document
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
JSON_SCHEMA_DIR = os.path.join(os.path.dirname(__file__), "../resources")
JSON_SCHEMA_FILES = [
    {
        "name": "Genomic Data Commons(GDC)",
        "filename": "better_gdc_schema.json",
        "jq_schema": ".",
    },
]
# Define state for application
# class State(TypedDict):
#     question: str
#     context: List[Document]
#     answer: str
class Rag:
    def __init__(
        self, embeddings_model: str = "sentence-transformers/all-mpnet-base-v2"
    ) -> None:
        self.schemas = self.load_json_schemas()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200
        )
        embeddings = HuggingFaceEmbeddings(model_name=embeddings_model)
        self.vector_store = InMemoryVectorStore(embeddings)
        # Define prompt for question-answering
        self.prompt = hub.pull("rlm/rag-prompt")
        self.init_rag()
    def load_json_schemas(self) -> List[Document]:
        schemas = []
        for schema in JSON_SCHEMA_FILES:
            schema_path = os.path.join(JSON_SCHEMA_DIR, schema["filename"])
            loader = JSONLoader(
                file_path=schema_path,
                jq_schema=schema["jq_schema"],
                text_content=False,
            )
            schema_data = loader.load()
            schemas.extend(schema_data)
        return schemas
    def init_rag(self):
        if self.schemas is None or len(self.schemas) == 0:
            raise ValueError("No schema data found.")
        all_splits = self.text_splitter.split_documents(self.schemas)
        # Index chucks
        _ = self.vector_store.add_documents(all_splits)
    def retrieve(self, question: str, top_k: int = 3) -> List[Document]:
        retrieved_docs = self.vector_store.similarity_search(question, k=top_k)
        # docs_content = "\n\n".join(doc.page_content for doc in retrieved_docs)
        return retrieved_docs
RAG = Rag()