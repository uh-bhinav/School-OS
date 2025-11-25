import json
import logging
from collections.abc import Sequence
from typing import Annotated, Optional, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from langchain_core.tools import BaseTool
from langgraph.graph import END, StateGraph

from app.agents.utils.llm_router import get_llm, get_llm_with_fallback

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """Represents the state of our agent."""

    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]


class BaseAgent:
    """Base class for tool-using LangGraph agents (fully async)."""

    def __init__(self, tools: list, llm_tier: str = "fast", use_fallback: bool = True):
        """
        Initializes the BaseAgent with cost-efficient LLM strategy.

        Args:
            tools: List of tools available to the agent
            llm_tier: Starting LLM tier ("fast", "medium", "power")
            use_fallback: If True, automatically try cheaper models first
        """
        processed_tools = []
        self.tools_by_name = {}

        for tool in tools:
            if isinstance(tool, BaseTool):
                tool_name = tool.name
                tool_description = tool.description or f"Tool for {tool_name}"

                if hasattr(tool, "args_schema") and tool.args_schema:
                    try:
                        schema = tool.args_schema.model_json_schema()
                    except (AttributeError, TypeError):
                        schema = {"type": "object", "properties": {}}
                else:
                    schema = {"type": "object", "properties": {}}

                tool_def = {
                    "type": "function",
                    "function": {
                        "name": tool_name,
                        "description": tool_description,
                        "parameters": {
                            "type": "object",
                            "properties": schema.get("properties", {}),
                            "required": schema.get("required", []),
                        },
                    },
                }
                processed_tools.append(tool_def)
                self.tools_by_name[tool_name] = tool
                logger.debug(f"Converted BaseTool '{tool_name}' to OpenAI tool schema")
            else:
                processed_tools.append(tool)

        self.tools = processed_tools
        self.llm_tier = llm_tier
        self.use_fallback = use_fallback

        # Get LLM with intelligent fallback strategy
        self.model = self._get_llm_with_strategy()

        self.graph = self._build_graph()
        logger.info(f"BaseAgent initialized with {len(processed_tools)} tools, " f"tier={llm_tier}, fallback={'✅ enabled' if use_fallback else '❌ disabled'}")

    def _get_llm_with_strategy(self):
        """
        Get LLM with intelligent fallback strategy.
        Tries cheaper models first before expensive ones.
        """
        if not self.use_fallback:
            # No fallback, just use the specified tier
            logger.info(f"📌 Using tier '{self.llm_tier}' (no fallback)")
            return get_llm(self.llm_tier)

        # Use fallback strategy: fast → medium → power
        logger.info(f"🔄 Fallback strategy ENABLED (starting at '{self.llm_tier}')")
        return get_llm_with_fallback(self.llm_tier)

    def _should_continue(self, state: AgentState) -> str:
        """Determines if agent should continue or end."""
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "continue"
        return "end"

    async def _call_model(self, state: AgentState) -> dict:
        """Calls the LLM asynchronously."""
        messages = state["messages"]
        try:
            if self.tools:
                response = await self.model.ainvoke(messages, tools=self.tools)
            else:
                response = await self.model.ainvoke(messages)
            logger.debug("LLM response received")
            # CRITICAL: Always return a list of messages, not a dict
            return {"messages": [response]}
        except Exception as e:
            logger.error(f"LLM invocation failed: {e}", exc_info=True)
            error_response = AIMessage(content=f"I encountered an error: {str(e)}")
            return {"messages": [error_response]}

    async def _call_tool(self, state: AgentState) -> dict:
        """Executes tool calls asynchronously."""
        last_message = state["messages"][-1]
        tool_messages = []

        if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
            logger.warning("_call_tool invoked but no tool_calls found")
            return {"messages": []}

        for tool_call in last_message.tool_calls:
            tool_name = tool_call.get("name")
            tool_args = tool_call.get("args", {})
            tool_id = tool_call.get("id")

            logger.info(f"Executing tool: {tool_name} with args: {tool_args}")

            try:
                tool = self.tools_by_name.get(tool_name)
                if not tool:
                    raise ValueError(f"Tool '{tool_name}' not found")

                # Await the async tool invocation
                result = await tool.ainvoke(tool_args)

                result_str = ""

                # Convert result to a string that preserves the data
                if isinstance(result, dict):
                    # If it's a dict with 'response' key, use that (from nested agents)
                    if "response" in result:
                        result_str = str(result["response"])
                    elif "messages" in result:
                        # Extract text from messages list
                        messages = result["messages"]
                        if isinstance(messages, list) and messages:
                            last_msg = messages[-1]
                            if hasattr(last_msg, "content"):
                                result_str = str(last_msg.content)
                            else:
                                result_str = str(last_msg)
                        else:
                            result_str = str(result)
                    else:
                        # For dicts without 'response' or 'messages', preserve the actual data
                        # Format it nicely so the LLM can read it
                        try:
                            result_str = json.dumps(result, indent=2, default=str)
                        except (TypeError, ValueError):
                            result_str = str(result)
                else:
                    result_str = str(result)

                # Ensure we have content
                if not result_str:
                    result_str = "Tool executed successfully but returned no data."

                logger.info(f"Tool {tool_name} result: {result_str[:150]}...")

                tool_message = ToolMessage(content=result_str, tool_call_id=tool_id, name=tool_name)
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

        # CRITICAL: Always return a list of messages, not a dict or string
        return {"messages": tool_messages}

    def _build_graph(self) -> StateGraph:
        """Builds and compiles the async agent workflow graph."""
        workflow = StateGraph(AgentState)
        workflow.add_node("agent", self._call_model)
        workflow.add_node("action", self._call_tool)
        workflow.set_entry_point("agent")
        workflow.add_conditional_edges("agent", self._should_continue, {"continue": "action", "end": END})
        workflow.add_edge("action", "agent")
        return workflow.compile()

    async def ainvoke(self, messages: list, conversation_history: Optional[list] = None) -> dict[str]:
        """Invokes the agent's graph asynchronously."""
        try:
            logger.info(f"Invoking agent with {len(messages)} messages")

            result = await self.graph.ainvoke({"messages": messages}, config={"recursion_limit": 100})

            logger.info("Agent invocation completed successfully")
            return result
        except Exception as e:
            logger.error(f"Agent invocation failed: {e}", exc_info=True)
            raise
