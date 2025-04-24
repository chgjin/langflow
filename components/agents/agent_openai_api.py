from langchain_core.tools import StructuredTool

from langflow.base.agents.agent import LCToolsAgentComponent
from langflow.base.models.model_input_constants import (
    ALL_PROVIDER_FIELDS,
    MODEL_DYNAMIC_UPDATE_FIELDS,
    MODEL_PROVIDERS_DICT,
)
from langflow.base.models.model_utils import get_model_name
from langflow.components.helpers import CurrentDateComponent
from langflow.components.helpers.memory import MemoryComponent
from langflow.components.langchain_utilities.tool_calling import ToolCallingAgentComponent
from langflow.custom.custom_component.component import _get_component_toolkit
from langflow.custom.utils import update_component_build_config
from langflow.field_typing import Tool
from langflow.inputs import HandleInput
from langflow.io import BoolInput, DropdownInput, MultilineInput, Output
from langflow.logging import logger
from langflow.schema.dotdict import dotdict
from langflow.schema.message import Message


def set_advanced_true(component_input):
    component_input.advanced = True
    return component_input


class MyAgentComponent(ToolCallingAgentComponent):
    display_name: str = "通用智能体"
    description: str = "定义代理的说明，然后使用工具输入要完成的任务。"
    icon = "bot"
    beta = False
    name = "通用智能体"

    memory_inputs = [set_advanced_true(component_input) for component_input in MemoryComponent().inputs]

    inputs = [
        HandleInput(
            name="model",
            display_name="Language Model",
            info="Connect the 'Language Model' output from your LLM component here.",
            input_types=["LanguageModel"],
        ),
        MultilineInput(
            name="system_prompt",
            display_name="Agent Instructions",
            info="System Prompt: Initial instructions and context provided to guide the agent's behavior.",
            value="You are a helpful assistant that can use tools to answer questions and perform tasks.",
            advanced=False,
        ),
        *LCToolsAgentComponent._base_inputs,
        *memory_inputs,
        BoolInput(
            name="add_current_date_tool",
            display_name="Current Date",
            advanced=True,
            info="If true, will add a tool to the agent that returns the current date.",
            value=True,
        ),
    ]
    outputs = [Output(name="response", display_name="Response", method="message_response")]

    async def message_response(self) -> Message:
        try:
            llm_model, display_name = self.get_llm()
            if llm_model is None:
                msg = "未选择语言模型"
                raise ValueError(msg)
            self.model_name = get_model_name(llm_model, display_name=display_name)
        except Exception as e:
            # Log the error for debugging purposes
            logger.error(f"检索语言模型时出错: {e}")
            raise

        try:
            self.chat_history = await self.get_memory_data()
        except Exception as e:
            logger.error(f"Error retrieving chat history: {e}")
            raise

        if self.add_current_date_tool:
            try:
                if not isinstance(self.tools, list):  # type: ignore[has-type]
                    self.tools = []
                # Convert CurrentDateComponent to a StructuredTool
                current_date_tool = (await CurrentDateComponent(**self.get_base_args()).to_toolkit()).pop(0)
                if isinstance(current_date_tool, StructuredTool):
                    self.tools.append(current_date_tool)
                else:
                    msg = "CurrentDateComponent must be converted to a StructuredTool"
                    raise TypeError(msg)
            except Exception as e:
                logger.error(f"Error adding current date tool: {e}")
                raise

        if not self.tools:
            msg = "Tools are required to run the agent."
            logger.error(msg)
            raise ValueError(msg)

        try:
            self.set(
                llm=llm_model,
                tools=self.tools,
                chat_history=self.chat_history,
                input_value=self.input_value,
                system_prompt=self.system_prompt,
            )
            agent = self.create_agent_runnable()
        except Exception as e:
            logger.error(f"Error setting up the agent: {e}")
            raise

        return await self.run_agent(agent)

    async def get_memory_data(self):
        memory_kwargs = {
            component_input.name: getattr(self, f"{component_input.name}") for component_input in self.memory_inputs
        }
        # filter out empty values
        memory_kwargs = {k: v for k, v in memory_kwargs.items() if v}

        return await MemoryComponent(**self.get_base_args()).set(**memory_kwargs).retrieve_messages()

    def get_llm(self):
        return self.model, None

    async def to_toolkit(self) -> list[Tool]:
        component_toolkit = _get_component_toolkit()
        tools_names = self._build_tools_names()
        agent_description = self.get_tool_description()
        # TODO: Agent Description Depreciated Feature to be removed
        description = f"{agent_description}{tools_names}"
        tools = component_toolkit(component=self).get_tools(
            tool_name=self.get_tool_name(), tool_description=description, callbacks=self.get_langchain_callbacks()
        )
        if hasattr(self, "tools_metadata"):
            tools = component_toolkit(component=self, metadata=self.tools_metadata).update_tools_metadata(tools=tools)
        return tools
