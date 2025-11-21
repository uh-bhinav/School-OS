"""
ADK Router - Wrapper for multi-agent system with session management.
Handles conversation context and delegates to root ADK agent.
"""

import os
import sys
import uuid
from pathlib import Path
from contextlib import contextmanager


# CRITICAL: Mock telemetry module BEFORE any ADK imports
class MockSpan:
    """Mock span object for tracing"""

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


class MockTracer:
    """Mock tracer object"""

    @contextmanager
    def start_as_current_span(self, name):
        yield MockSpan()


class MockTelemetry:
    """Mock telemetry module that does nothing"""

    @staticmethod
    def trace_call_llm(*args, **kwargs):
        pass

    @staticmethod
    def trace_tool_call(*args, **kwargs):
        pass

    @staticmethod
    def trace_tool_response(*args, **kwargs):
        pass

    @staticmethod
    def trace_agent_transfer(*args, **kwargs):
        pass

    @staticmethod
    def get_tracer(*args, **kwargs):
        return MockTracer()

    def __getattr__(self, name):
        if name == "tracer":
            return MockTracer()
        return lambda *args, **kwargs: None


# Replace telemetry BEFORE importing ADK
sys.modules["google.adk.telemetry"] = MockTelemetry()

# Now safe to import ADK and other modules
from dotenv import load_dotenv  # noqa: E402
from google.adk import Runner  # noqa: E402
from google.adk.sessions import InMemorySessionService  # noqa: E402
from google.genai.types import Content, Part  # noqa: E402
from sessions import get_session_history, sessions  # noqa: E402
from manager.agent import school_management_agent  # noqa: E402


# Load environment variables from manager/.env
env_path = Path(__file__).parent / "manager" / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"Loaded environment variables from {env_path}")
else:
    print(f"Warning: .env file not found at {env_path}")

# Verify API key is loaded
if not os.getenv("GOOGLE_API_KEY"):
    print("ERROR: GOOGLE_API_KEY not found in environment variables!")
    print("Please ensure manager/.env contains GOOGLE_API_KEY")
else:
    print("✓ GOOGLE_API_KEY is loaded")


# Create runner with in-memory session service
session_service = InMemorySessionService()
runner = Runner(
    app_name="school_management_chatbot",
    agent=school_management_agent,
    session_service=session_service,
)


def create_session() -> str:
    """
    Create a new session with a unique ID.

    Creates the session in both the local sessions dict and the ADK session service.

    Returns:
        UUID string for the new session
    """
    session_id = str(uuid.uuid4())
    user_id = "default_user"

    # Create session in local tracking
    sessions[session_id] = []

    # Create session in ADK session service
    session_service.create_session(
        app_name="school_management_chatbot", user_id=user_id, session_id=session_id
    )

    return session_id


def process_message(session_id: str, user_message: str) -> str:
    """
    Process a user message using Google ADK Runner.

    This function:
    1. Creates a Content object from the user message
    2. Runs the agent using the Runner with conversation history
    3. Collects the response from events
    4. Stores conversation history
    5. Returns the response

    Args:
        session_id: Unique session identifier
        user_message: The user's message content

    Returns:
        The assistant's response string
    """
    # Get or create session history
    history = get_session_history(session_id)

    # Append user message to history
    history.append({"role": "user", "content": user_message})

    # Build conversation context - include recent history for context
    # Include last 3 exchanges (6 messages) to give agent context
    recent_history = history[-7:-1] if len(history) > 1 else []

    # Format history as context in the message
    context_text = ""
    if recent_history:
        context_text = "\n\n**Previous conversation context:**\n"
        for msg in recent_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            context_text += f"{role}: {msg['content']}\n"
        context_text += "\n**Current request:**\n"

    # Create Content object with context
    message_with_context = context_text + user_message
    new_message = Content(role="user", parts=[Part(text=message_with_context)])

    # Run the agent using the Runner
    response_text = ""
    tool_results = []
    last_event = None

    try:
        for event in runner.run(
            user_id="default_user",
            session_id=session_id,
            new_message=new_message,
        ):
            last_event = event
            # Extract text from response events
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if hasattr(part, "text") and part.text:
                        response_text += part.text
                    # Capture tool results
                    elif hasattr(part, "function_response") and part.function_response:
                        if hasattr(part.function_response, "response"):
                            tool_results.append(str(part.function_response.response))

        # If no text response but tool was called, provide confirmation
        if not response_text.strip():
            if tool_results:
                # Check if email was sent
                if any("Email successfully sent" in result for result in tool_results):
                    response_text = "✅ Email sent successfully to all students!"
                else:
                    response_text = "✅ Action completed successfully."
            else:
                # No response and no tool calls - something went wrong
                print(f"Warning: Empty response. Last event: {last_event}")
                response_text = (
                    "I'm processing your request. Could you please try again?"
                )

    except Exception as e:
        print(f"Error running agent: {e}")
        import traceback

        traceback.print_exc()
        response_text = (
            "I encountered an issue processing your request. Please try again."
        )

    # Append assistant response to history
    history.append({"role": "assistant", "content": response_text})

    return response_text
