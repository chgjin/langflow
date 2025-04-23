from langflow.components.crewai.crewai import CrewAIAgentComponent
from langflow.components.crewai.hierarchical_crew import HierarchicalCrewComponent
from langflow.components.crewai.hierarchical_task import HierarchicalTaskComponent
from langflow.components.inputs import ChatInput
from langflow.components.models import OpenAIModelComponent
from langflow.components.outputs import ChatOutput
from langflow.components.prompts import PromptComponent
from langflow.components.tools import SearchAPIComponent, YfinanceToolComponent
from langflow.graph import Graph


def complex_agent_graph():
    llm = OpenAIModelComponent(model_name="gpt-4o-mini")
    manager_llm = OpenAIModelComponent(model_name="gpt-4o")
    search_api_tool = SearchAPIComponent()
    yahoo_search_tool = YfinanceToolComponent()
    dynamic_agent = CrewAIAgentComponent()
    chat_input = ChatInput()
    role_prompt = PromptComponent(_display_name="Role Prompt")
    role_prompt.set(
        template="""定义一个可以执行或很好地回答用户查询的 Role。

User's query: {query}

Role 应最多两个单词。类似于“研究人员”或“软件开发人员”".
"""
    )

    goal_prompt = PromptComponent(_display_name="Goal Prompt")
    goal_prompt.set(
        template="""定义此角色的目标，给定用户的查询。
User's query: {query}

Role: {role}

目标应该简洁具体。
Goal:
""",
        query=chat_input.message_response,
        role=role_prompt.build_prompt,
    )
    backstory_prompt = PromptComponent(_display_name="Backstory Prompt")
    backstory_prompt.set(
        template="""根据用户的查询，定义此 Role 和 Goal 的背景故事。
User's query: {query}

Role: {role}
Goal: {goal}

背景故事应该是具体的，并且与其他信息保持一致。
Backstory:""",
        query=chat_input.message_response,
        role=role_prompt.build_prompt,
        goal=goal_prompt.build_prompt,
    )
    dynamic_agent.set(
        tools=[search_api_tool.build_tool, yahoo_search_tool.build_tool],
        llm=llm.build_model,
        role=role_prompt.build_prompt,
        goal=goal_prompt.build_prompt,
        backstory=backstory_prompt.build_prompt,
    )

    response_prompt = PromptComponent()
    response_prompt.set(
        template="""User's query:
{query}

尽可能多地回复用户有关该主题的信息。如果需要，请删除。
如果只是一个一般的查询（例如问候），你可以直接回复它们。""",
        query=chat_input.message_response,
    )
    manager_agent = CrewAIAgentComponent()
    manager_agent.set(
        llm=manager_llm.build_model,
        role="Manager",
        goal="You can answer general questions from the User and may call others for help if needed.",
        backstory="You are polite and helpful. You've always been a beacon of politeness.",
    )
    task = HierarchicalTaskComponent()
    task.set(
        task_description=response_prompt.build_prompt,
        expected_output="Succinct response that answers the User's query.",
    )
    crew_component = HierarchicalCrewComponent()
    crew_component.set(
        tasks=task.build_task, agents=[dynamic_agent.build_output], manager_agent=manager_agent.build_output
    )
    chat_output = ChatOutput()
    chat_output.set(input_value=crew_component.build_output)

    return Graph(
        start=chat_input,
        end=chat_output,
        flow_name="Sequential Tasks Agent",
        description="This Agent runs tasks in a predefined sequence.",
    )
