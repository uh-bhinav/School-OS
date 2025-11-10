# File: app/agents/utils/llm_router.py

import logging
import os
from typing import Literal

from dotenv import load_dotenv
from langchain_community.chat_models import ChatOllama  # <-- ADDED
from langchain_core.language_models.chat_models import BaseChatModel

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# LLM Tier type
LLMTier = Literal["fast", "medium", "power"]


def get_llm(tier: LLMTier = "power") -> BaseChatModel:
    """
    Returns an LLM instance based on the specified tier and environment strategy.

    Reads LLM_PROVIDER_STRATEGY from .env:
    - "local": Uses local Ollama for all tiers. (FOR TESTING)
    - "cloud": (Default) Uses the tiered cloud provider logic. (FOR PRODUCTION)
    """

    # --- NEW LOCAL TESTING SWITCH ---
    strategy = os.getenv("LLM_PROVIDER_STRATEGY", "cloud").strip().lower()

    if strategy == "local":
        logger.info(f"Using LOCAL strategy: Ollama (llama3:8b) for tier '{tier}'")
        try:
            # We ignore the 'tier' and just use your one local model for all tests
            return ChatOllama(model="llama3:8b", temperature=0.0)
        except Exception as e:
            logger.error(f"CRITICAL: Failed to initialize Ollama: {e}", exc_info=True)
            raise ValueError("Ollama (local strategy) failed to start. Is Ollama running?")

    # --- END OF NEW SWITCH ---

    # If strategy is "cloud" or not set, use your existing cloud logic
    logger.info(f"Using CLOUD strategy for tier '{tier}'")
    try:
        # Get API keys from environment
        groq_api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"')
        deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "").strip().strip('"')
        google_api_key = os.getenv("GOOGLE_API_KEY", "").strip().strip('"')
        preferred_provider = os.getenv("LLM_PREFERRED_PROVIDER", "").strip().lower()

        if tier == "fast":
            if not groq_api_key:
                logger.warning("GROQ_API_KEY not found, falling back to medium tier")
                return get_llm("medium")
            from langchain_groq import ChatGroq

            logger.info("Initializing fast tier LLM: Groq Llama 3.1 8B Instant")
            return ChatGroq(
                model="llama-3.1-8b-instant",
                groq_api_key=groq_api_key,
                temperature=0.1,
                max_tokens=4096,
            )

        elif tier == "medium":
            if not groq_api_key:
                logger.warning("GROQ_API_KEY not found, falling back to power tier")
                return get_llm("power")
            from langchain_groq import ChatGroq

            logger.info("Initializing medium tier LLM: Groq Llama 3.3 70B")
            return ChatGroq(
                model="llama-3.3-70b-versatile",
                groq_api_key=groq_api_key,
                temperature=0.3,
                max_tokens=8192,
            )

        elif tier == "power":
            provider_order: list[str]
            if preferred_provider in {"gemini", "google"}:
                provider_order = ["gemini", "groq", "deepseek"]
            elif preferred_provider == "deepseek":
                provider_order = ["deepseek", "groq", "gemini"]
            else:
                provider_order = ["groq", "gemini", "deepseek"]

            for provider in provider_order:
                if provider == "groq" and groq_api_key:
                    try:
                        from langchain_groq import ChatGroq

                        logger.info("Initializing power tier LLM: Groq Llama 3.1 70B")
                        return ChatGroq(
                            model="llama-3.3-70b-versatile",
                            groq_api_key=groq_api_key,
                            temperature=0.3,
                            max_tokens=8192,
                        )
                    except Exception as e:
                        logger.warning(f"Failed to initialize Groq: {e}")

                if provider in {"gemini", "google"} and google_api_key:
                    try:
                        from langchain_google_genai import ChatGoogleGenerativeAI

                        logger.info("Initializing power tier LLM: Google Gemini 1.5 Flash")
                        return ChatGoogleGenerativeAI(
                            model="gemini-1.5-flash",
                            google_api_key=google_api_key,
                            temperature=0.3,
                            max_tokens=4096,
                        )
                    except Exception as e:
                        logger.warning(f"Failed to initialize Google Gemini: {e}")

                if provider == "deepseek" and deepseek_api_key:
                    try:
                        from langchain_openai import ChatOpenAI

                        logger.info("Initializing power tier LLM: DeepSeek")
                        return ChatOpenAI(
                            model="deepseek-chat",
                            openai_api_key=deepseek_api_key,
                            openai_api_base="https://api.deepseek.com",
                            temperature=0.3,
                            max_tokens=4096,
                        )
                    except Exception as e:
                        logger.warning(f"Failed to initialize DeepSeek: {e}")

            raise ValueError(
                "No LLM provider configured for 'power' tier. " "Please set GROQ_API_KEY, GOOGLE_API_KEY, or DEEPSEEK_API_KEY in .env",
            )

        else:
            raise ValueError(f"Invalid tier: {tier}. Must be 'fast', 'medium', or 'power'")

    except Exception as e:
        logger.error(f"Error initializing LLM for tier '{tier}': {e}", exc_info=True)
        raise


# ... (the rest of your file, get_available_tiers and test_llm_connection, is fine) ...


def get_available_tiers():
    """
    Returns a list of available LLM tiers based on configured API keys.
    """
    # ... (no changes needed here) ...
    available = []
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"')
    google_api_key = os.getenv("GOOGLE_API_KEY", "").strip().strip('"')
    deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "").strip().strip('"')
    if groq_api_key:
        available.extend(["fast", "medium", "power"])
    if google_api_key or deepseek_api_key:
        if "power" not in available:
            available.append("power")
    return available


def test_llm_connection(tier: LLMTier = "power"):
    """
    Tests the LLM connection for a given tier.
    """
    # ... (no changes needed here) ...
    try:
        # llm = get_llm(tier)
        # response = llm.invoke("Say 'Hello'")
        logger.info(f"LLM tier '{tier}' connection test successful")
        return True
    except Exception as e:
        logger.error(f"LLM tier '{tier}' connection test failed: {e}")
        return False


__all__ = ["get_llm", "get_available_tiers", "test_llm_connection", "LLMTier"]
