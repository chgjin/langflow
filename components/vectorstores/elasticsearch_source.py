from typing import Any
from typing import List, Dict, Any
import httpx
from langchain.schema import Document
from elasticsearch import Elasticsearch
from langflow.custom import Component
from langflow.inputs import MessageTextInput

from langflow.io import (
    DropdownInput,
    FloatInput,
    HandleInput,
    IntInput,
    SecretStrInput,
    StrInput,
)
from langflow.schema import Data, DataFrame
from langflow.template import Output


class ElasticsearchVectorStoreComponent(Component):
    """Elasticsearch 文档向量检索。 具有高级、可自定义的搜索功能。"""

    display_name: str = "Elasticsearch 文档向量检索"
    description: str = "Elasticsearch 文档向量检索。 具有高级、可自定义的搜索功能。"
    name = "Elasticsearch"
    icon = "ElasticsearchStore"

    inputs = [
        MessageTextInput(
            name="search_query",
            display_name="搜索的内容",
            value="",
            info="搜索查询以在向量存储中查找类似文档. ",
            tool_mode=True,
        ),

        StrInput(
            name="elasticsearch_url",
            display_name="Elasticsearch URL",
            value="http://localhost:9200",
            info="自行管理的 Elasticsearch 部署的 URL（例如 http://localhost:9200）。",
        ),

        StrInput(
            name="index_name",
            display_name="Index Name",
            value="langflow",
            info="向量将存储在 Elasticsearch 集群中的索引名称。",
        ),
        SecretStrInput(
            name="api_key",
            display_name="Elastic API 密钥",
            value="",
            advanced=False,
            info="用于 Elastic 身份验证的 API 密钥。",
        ),
        HandleInput(
            name="embedding",
            display_name="Embedding",
            input_types=["Embeddings"],
        ),
        DropdownInput(
            name="search_type",
            display_name="Search Type",
            options=["similarity", "mmr"],
            value="similarity",
            advanced=True,
        ),
        IntInput(
            name="knn_k",
            display_name="向量检索 K 值",
            info="向量检索中要返回的 K 个最相似文档的数量。",
            advanced=True,
            value=4,
        ),
        IntInput(
            name="full_text_search_k",
            display_name="全文检索 K 值",
            info="全文检索中要返回的 K 个最相关文档的数量。",
            advanced=True,
            value=4,
        ),
        IntInput(
            name="number_of_results",
            display_name="结果数",
            info="要返回的结果数。",
            advanced=True,
            value=4,
        ),
        FloatInput(
            name="search_score_threshold",
            display_name="搜索分数阈值",
            info="搜索结果的最低相似度分数阈值。",
            value=0.0,
            advanced=True,
        ),

    ]

    outputs = [
        Output(
            display_name="RAG 搜索结果",
            name="text",
            method="search_documents_rag",
            info="基于搜索查询的搜索结果。转换成文本格式。",
            tool_mode=True,
        ),
        Output(
            display_name="Search Results",
            name="search_results",
            method="search_documents",
            info="基于搜索查询的搜索结果。",
            tool_mode=True,
        ),
        Output(display_name="DataFrame", name="dataframe", method="as_dataframe", tool_mode=False, ),
    ]

    def build_vector_store(self) -> Elasticsearch:
        """构建 Elasticsearch  对象。"""

        es_params = {
            "hosts": self.elasticsearch_url,
            "api_key": self.api_key,
        }
        elasticsearch = Elasticsearch(**es_params)
        elasticsearch.info()
        return elasticsearch

    def _deRepeat(self, results: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """去重搜索结果。"""
        seen = set()
        unique_results = []
        for result in results:
            content = result["text"]
            if content not in seen:
                seen.add(content)
                unique_results.append(result)
        return unique_results

    def _get_reranker(self, query: str, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """使用 BGE Reranker API 对搜索结果进行重新排序。"""
        if not results:
            return []
        reranker_results = self._get_reranker_score(query,
                                                    [result["text"] for result in results if "text" in result])
        reranked_results = sorted(
            reranker_results,
            key=lambda x: x["relevance_score"],
            reverse=True
        )
        reranked_indices = [result["index"] for result in reranked_results]
        reranked_documents = [results[i] for i in reranked_indices]
        return reranked_documents

    def _get_reranker_score(self, query: str, results: list[str]) -> list[dict[str, Any]]:
        """根据查询对搜索结果进行重新排序。"""
        if not results:
            return []

        url = "https://api.siliconflow.cn/v1/rerank"

        payload = {
            "model": "BAAI/bge-reranker-v2-m3",
            "query": query,
            "documents": results,
            "top_n": self.number_of_results,
            "return_documents": False,
            "max_chunks_per_doc": 1024,
            "overlap_tokens": 0
        }
        headers = {
            "Authorization": "Bearer sk-tdoduwuxncgqmxizilnekhfdwthlzwhbcdvwhilwkjiylsua",
            "Content-Type": "application/json"
        }

        response_reranker = httpx.post(url, json=payload, headers=headers)

        # print(response_reranker.json())
        # {'id': '019719f3442679e3a92793918ae4658f', 'results': [{'index': 1, 'relevance_score': 0.6750153}, {'index': 0, 'relevance_score': 0.6305712}, {'index': 7, 'relevance_score': 0.45217305}, {'index': 5, 'relevance_score': 0.4451677}], 'meta': {'billed_units': {'input_tokens': 3690, 'output_tokens': 0, 'search_units': 0, 'classifications': 0}, 'tokens': {'input_tokens': 3690, 'output_tokens': 0}}}
        return response_reranker.json()["results"]

    def fulltxt_search(self, query: str | None = None) -> list[dict[str, Any]]:
        """Perform a full-text search in the vector store."""
        vector_store = self.build_vector_store()

        if not query:
            return []

        search_type = self.search_type.lower()
        if search_type not in {"similarity", "mmr"}:
            msg = f"无效的搜索类型: {self.search_type}"
            self.log(msg)
            raise ValueError(msg)

        search_kwargs = {
            "index": self.index_name,
            "body": {
                "query": {
                    "match": {
                        "summary": query
                    }
                },
                "size": self.number_of_results + 10,  # +10 是为了 reranker 重新排序
            }
        }

        try:
            results = vector_store.search(**search_kwargs)
        except Exception as e:
            msg = (
                "查询 Elasticsearch VectorStore 时出错，VectorStore 中没有数据。"
            )
            self.log(msg)
            raise ValueError(msg) from e

        return [
            {
                "content": hit["_source"]["summary"],
                "metadata": hit["_source"].get("metadata", {}),
                "score": hit["_score"]
            }
            for hit in results['hits']['hits']
        ]

    def knn_search(self, query: str | None = None) -> list[dict[str, Any]]:
        """Search for similar documents in the vector store or retrieve all documents if no query is provided."""
        vector_store = self.build_vector_store()

        if not query:
            return []

        search_type = self.search_type.lower()
        if search_type not in {"similarity", "mmr"}:
            msg = f"无效的搜索类型: {self.search_type}"
            self.log(msg)
            raise ValueError(msg)
        vector = self.embedding.embed_query(query)
        search_kwargs = {
            "index": self.index_name,
            "size": 100,
            "knn": {
                "field": "vector_field",
                "query_vector": vector,
                "k": self.number_of_results + 10,  # +10 是为了 reranker 重新排序
                "num_candidates": self.number_of_results + 20,
            }
        }
        try:
            results = vector_store.search(**search_kwargs)
        except Exception as e:
            msg = (
                "查询 Elasticsearch VectorStore 时出错，VectorStore 中没有数据。"
            )
            self.log(msg)
            raise ValueError(msg) from e
        return [
            {
                "content": hit["_source"]["summary"],
                "metadata": hit["_source"].get("metadata", {}),
                "score": hit["_score"]
            }
            for hit in results['hits']['hits']
        ]

    def search_documents(self) -> list[Data]:
        """根据搜索输入在矢量存储中搜索文档。
        """
        results_knn = self.knn_search(self.search_query)
        results_full_text = self.fulltxt_search(self.search_query)

        results_all = results_knn + results_full_text

        retrieved_data = [
            {
                "index": i + 1,
                "text": result["content"],
                "metadata": result["metadata"],
            }
            for result, i in zip(results_all, range(len(results_all)))
        ]

        retrieved_data = self._deRepeat(retrieved_data)

        retrieved_data = self._get_reranker(
            query=self.search_query,
            results=retrieved_data
        )

        retrieved_data = [
            Data(**result)
            for result, i in zip(retrieved_data, range(len(retrieved_data)))
        ]
        self.status = retrieved_data
        return retrieved_data

    def as_dataframe(self) -> "DataFrame":
        """将搜索结果转换为 DataFrame。"""
        return DataFrame(self.search_documents())

    def search_documents_rag(self) -> List[Document]:
        """根据搜索输入在矢量存储中搜索文档。拼成一个文本"""
        results = self.search_documents()
        if not results:
            return []
        doc = "\n".join([result.text for result in results])
        # Convert Data to Document
        self.status = doc
        return doc
