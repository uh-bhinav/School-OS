# backend /app/agents/base_agent.py
import asyncio
import logging
from collections.abc import Sequence
from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage, ToolMessage
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolExecutor, ToolInvocation

from app.agents.utils.llm_router import get_llm

# Set up logging
logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """Represents the state of our agent."""

    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]


class BaseAgent:
    """
    A base class for creating tool-using LangGraph agents.
    This class encapsulates the core logic for the agent's workflow graph,
    allowing leaf agents to be created by simply providing their specific tools and model.
    """

    def __init__(self, tools: list, llm_tier: str = "power"):
        """
        Initializes the BaseAgent.

        Args:
            tools (list): A list of tools for the agent to use.
            llm_tier (str): The tier of the LLM to use ('fast', 'medium', 'power').
        """
        self.tools = tools
        self.llm_tier = llm_tier
        self.tool_executor = ToolExecutor(tools) if tools else None
        self.model = get_llm(llm_tier).bind_tools(tools) if tools else get_llm(llm_tier)
        self.graph = self._build_graph()

    def _should_continue(self, state: AgentState) -> str:
        """Determines if the agent should continue with tool calls or end."""
        last_message = state["messages"][-1]
        # Check if the message has tool_calls attribute and if it's not empty
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "continue"
        return "end"

    def _call_model(self, state: AgentState) -> dict:
        """Calls the LLM with the current messages."""
        messages = state["messages"]
        try:
            response = self.model.invoke(messages)
            logger.debug(f"LLM response: {response}")
            return {"messages": [response]}
        except Exception as e:
            logger.error(f"LLM invocation failed: {e}", exc_info=True)
            # Return an error message that doesn't trigger tool calls
            from langchain_core.messages import AIMessage

            error_response = AIMessage(content=f"I encountered an error: {str(e)}")
            return {"messages": [error_response]}

    def _call_tool(self, state: AgentState) -> dict:
        """Executes tool calls from the last message."""
        last_message = state["messages"][-1]
        tool_messages = []

        # Safety check
        if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
            logger.warning("_call_tool invoked but no tool_calls found")
            return {"messages": []}

        for tool_call in last_message.tool_calls:
            tool_name = tool_call.get("name")
            tool_args = tool_call.get("args", {})
            tool_id = tool_call.get("id")

            logger.info(f"Executing tool: {tool_name} with args: {tool_args}")

            try:
                action = ToolInvocation(tool=tool_name, tool_input=tool_args)
                result = self._run_coroutine(self.tool_executor.ainvoke(action))

                # Create a ToolMessage with the result
                tool_message = ToolMessage(content=str(result), tool_call_id=tool_id, name=tool_name)
                tool_messages.append(tool_message)
                logger.info(f"Tool {tool_name} executed successfully")

            except Exception as e:
                logger.error(f"Tool execution failed for {tool_name}: {e}", exc_info=True)
                error_message = ToolMessage(
                    content=f"Error executing {tool_name}: {str(e)}",
                    tool_call_id=tool_id,
                    name=tool_name,
                )
                tool_messages.append(error_message)

        return {"messages": tool_messages}

    @staticmethod
    def _run_coroutine(coro):
        """Utility to execute a coroutine from synchronous context."""
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            # We are inside an existing running loop; schedule safely.
            future = asyncio.run_coroutine_threadsafe(coro, loop)
            return future.result()

        return asyncio.run(coro)

    def _build_graph(self) -> StateGraph:
        """Builds and compiles the agent's workflow graph."""
        workflow = StateGraph(AgentState)
        workflow.add_node("agent", self._call_model)
        workflow.add_node("action", self._call_tool)
        workflow.set_entry_point("agent")
        workflow.add_conditional_edges("agent", self._should_continue, {"continue": "action", "end": END})
        workflow.add_edge("action", "agent")
        return workflow.compile()

    def invoke(self, messages: list) -> dict:
        """
        Invokes the agent's graph with a list of messages.

        Args:
            messages (list): List of messages to process

        Returns:
            dict: The final state containing all messages
        """
        try:
            logger.info(f"Invoking agent with {len(messages)} messages")
            result = self.graph.invoke({"messages": messages})
            logger.info("Agent invocation completed successfully")
            return result
        except Exception as e:
            logger.error(f"Agent invocation failed: {e}", exc_info=True)
            raise
