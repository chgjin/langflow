# from langchain_openai import ChatOpenAI
# from pydantic.v1 import SecretStr
# import langchain_bailian.bailian_llm as  bailian_llm
# from langflow.base.models.model import LCModelComponent
# from langflow.base.models.openai_constants import OPENAI_MODEL_NAMES
# from langflow.field_typing import LanguageModel
# from langflow.field_typing.range_spec import RangeSpec
# from langflow.inputs import BoolInput, DictInput, DropdownInput, IntInput, SecretStrInput, SliderInput, StrInput
#
#
# class OpenAICompatibleModelComponent(LCModelComponent):
#     display_name = "阿里云-百炼"
#     description = "使用OpenAI接口兼容的LLMs生成文本."
#     icon = "OpenAI"
#     name = "阿里云-百炼平台模型"
#     inputs = [
#         *LCModelComponent._base_inputs,
#         IntInput(
#             name="max_tokens",
#             display_name="最大token",
#             advanced=True,
#             info="要生成的最大Tokens。设置为 0 表示令牌数量不受限制。",
#             range_spec=RangeSpec(min=0, max=128000),
#         ),
#         DictInput(
#             name="model_kwargs",
#             display_name="Model Kwargs",
#             advanced=True,
#             info="传递给模型的其他关键字参数。",
#         ),
#         BoolInput(
#             name="json_mode",
#             display_name="JSON Mode",
#             advanced=True,
#             info="如果为 True，则无论是否传递架构，它都将输出 JSON。",
#         ),
#         StrInput(
#             name="model_name",
#             display_name="模型名称",
#             advanced=False,
#             info="要使用的模型的名称。",
#         ),
#         # StrInput(
#         #     name="openai_api_base",
#         #     display_name="OpenAI API Base",
#         #     advanced=False,
#         #     info="OpenAI API 的基本 URL。 "
#         #     "默认为 https://api.openai.com/v1。 "
#         #     "您可以更改此值以使用其他 API，如 JinaChat、LocalAI 和 Prem。",
#         # ),
#         SecretStrInput(
#             name="api_key",
#             display_name="API Key",
#             info="阿里云-百炼平台的 API 密钥。",
#             advanced=False,
#             value="OPENAI_API_KEY",
#             required=True,
#         ),
#         SliderInput(
#             name="temperature",
#             display_name="Temperature",
#             value=0.1,
#             range_spec=RangeSpec(min=0, max=2, step=0.01),
#             info="温度参数控制生成文本的创造性。较低的温度会导致更可预测的文本，而较高的温度会导致更多的创造性。",
#         ),
#         IntInput(
#             name="seed",
#             display_name="Seed",
#             info="随机数种子控制作业的可重复性。",
#             advanced=True,
#             value=1,
#         ),
#     ]
#
#     def build_model(self) -> LanguageModel:  # type: ignore[type-var]
#         openai_api_key = self.api_key
#         temperature = self.temperature
#         model_name: str = self.model_name
#         max_tokens = self.max_tokens
#         model_kwargs = self.model_kwargs or {}
#         openai_api_base = "https://api.openai.com/v1"
#         json_mode = self.json_mode
#         seed = self.seed
#
#         api_key = SecretStr(openai_api_key).get_secret_value() if openai_api_key else None
#         output = ChatOpenAI(
#             max_tokens=max_tokens or None,
#             model_kwargs=model_kwargs,
#             model=model_name,
#             base_url=openai_api_base,
#             api_key=api_key,
#             temperature=temperature if temperature is not None else 0.1,
#             seed=seed,
#         )
#         if json_mode:
#             output = output.bind(response_format={"type": "json_object"})
#         return output
#
#     def _get_exception_message(self, e: Exception):
#         """Get a message from an OpenAI exception.
#
#         Args:
#             e (Exception): The exception to get the message from.
#
#         Returns:
#             str: The message from the exception.
#         """
#         try:
#             from openai import BadRequestError
#         except ImportError:
#             return None
#         if isinstance(e, BadRequestError):
#             message = e.body.get("message")
#             if message:
#                 return message
#         return None
