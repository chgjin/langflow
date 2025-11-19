from langchain_openai import OpenAIEmbeddings

from langflow.base.embeddings.model import LCEmbeddingsModel
from langflow.base.models.openai_constants import OPENAI_EMBEDDING_MODEL_NAMES
from langflow.field_typing import Embeddings
from langflow.io import BoolInput, DictInput, DropdownInput, FloatInput, IntInput, MessageTextInput, SecretStrInput


class OpenAICompatibleEmbeddingsComponent(LCEmbeddingsModel):
    display_name = "OpenAI兼容 Embeddings"
    description = "使用 OpenAI兼容接口 模型生成嵌入。"
    icon = "OpenAI"
    name = "OpenAI兼容Embeddings"

    inputs = [
        DictInput(
            name="default_headers",
            display_name="默认标头",
            advanced=True,
            info="用于 API 请求的默认标头。",
        ),
        DictInput(
            name="default_query",
            display_name="默认查询",
            advanced=True,
            info="用于 API 请求的默认查询参数。",
        ),
        IntInput(name="chunk_size", display_name="Chunk Size", advanced=True, value=1000),
        MessageTextInput(name="client", display_name="Client", advanced=True),
        MessageTextInput(name="deployment", display_name="Deployment", advanced=True),
        IntInput(name="embedding_ctx_length", display_name="Embedding Context Length", advanced=True, value=1536),
        IntInput(name="max_retries", display_name="Max Retries", value=3, advanced=True),
        SecretStrInput(
            name="model",
            display_name="Model",
            advanced=False,
            info = "用于生成嵌入的模型。 ",
        ),
        DictInput(name="model_kwargs", display_name="Model Kwargs", advanced=True,info="传入模型的其他参数。"),
        SecretStrInput(name="openai_api_key", display_name="OpenAI API Key", value="OPENAI_API_KEY", required=False),
        MessageTextInput(name="openai_api_base", display_name="OpenAI API 地址", advanced=False),
        MessageTextInput(name="openai_api_type", display_name="OpenAI API 类型", advanced=True),
        MessageTextInput(name="openai_api_version", display_name="OpenAI API 版本", advanced=True,info="OpenAI API 版本，一般是v1"),
        MessageTextInput(name="openai_proxy", display_name="OpenAI Proxy", advanced=True),
        FloatInput(name="request_timeout", display_name="Request Timeout", advanced=True),
        BoolInput(name="show_progress_bar", display_name="显示进度条", advanced=True),
        BoolInput(name="skip_empty", display_name="跳过空字符", advanced=True),
        MessageTextInput(
            name="tiktoken_model_name",
            display_name="TikToken Model Name",
            advanced=True,
        ),
        BoolInput(
            name="tiktoken_enable",
            display_name="TikToken Enable",
            advanced=True,
            value=True,
            info="如果为 False，则必须安装transformers。",
        ),
        IntInput(
            name="dimensions",
            display_name="维数",
            info="生成的输出嵌入应具有的维度数。仅受某些模型支持。",
            advanced=True,
        ),
    ]

    def build_embeddings(self) -> Embeddings:
        return OpenAIEmbeddings(
            client=self.client or None,
            model=self.model,
            dimensions=self.dimensions or None,
            deployment=self.deployment or None,
            api_version=self.openai_api_version or None,
            base_url=self.openai_api_base or None,
            openai_api_type=self.openai_api_type or None,
            openai_proxy=self.openai_proxy or None,
            embedding_ctx_length=self.embedding_ctx_length,
            api_key=self.openai_api_key or None,
            allowed_special="all",
            disallowed_special="all",
            chunk_size=self.chunk_size,
            max_retries=self.max_retries,
            timeout=self.request_timeout or None,
            tiktoken_enabled=self.tiktoken_enable,
            tiktoken_model_name=self.tiktoken_model_name or None,
            show_progress_bar=self.show_progress_bar,
            model_kwargs=self.model_kwargs,
            skip_empty=self.skip_empty,
            default_headers=self.default_headers or None,
            default_query=self.default_query or None,
        )
