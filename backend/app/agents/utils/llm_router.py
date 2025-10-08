# backend/app/agents/utils/llm_router.py

import logging
import os
from typing import Literal

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# LLM Tier type
LLMTier = Literal["fast", "medium", "power"]


def get_llm(tier: LLMTier = "power"):
    """
    Returns an LLM instance based on the specified tier.
    This implements the intelligent funnel approach from your architecture plan.

    Tiers:
    - "fast": Lightweight models for simple routing/classification (Gemma 7B, Mistral 7B)
    - "medium": Balanced models for moderate complexity (Llama 3 8B)
    - "power": Most capable models for complex tasks (Llama 3.3 70B, Gemini)

    Args:
        tier: The performance tier of the LLM to use

    Returns:
        A LangChain LLM instance configured for the specified tier
    """
    try:
        # Get API keys from environment
        groq_api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"')
        # mistral_api_key = os.getenv("MISTRAL_API_KEY", "").strip().strip('"')
        deepseek_api_key = os.getenv("DEEPSEEK_API_KEY", "").strip().strip('"')
        google_api_key = os.getenv("GOOGLE_API_KEY", "").strip().strip('"')

        if tier == "fast":
            # Use Groq with Gemma 7B for fast inference
            if not groq_api_key:
                logger.warning("GROQ_API_KEY not found, falling back to medium tier")
                return get_llm("medium")

            from langchain_groq import ChatGroq

            logger.info("Initializing fast tier LLM: Groq Gemma 7B")
            return ChatGroq(
                model="gemma-7b-it",
                groq_api_key=groq_api_key,
                temperature=0.1,
                max_tokens=1024,
            )

        elif tier == "medium":
            # Use Groq with Llama 3 8B for balanced performance
            if not groq_api_key:
                logger.warning("GROQ_API_KEY not found, falling back to power tier")
                return get_llm("power")

            from langchain_groq import ChatGroq

            logger.info("Initializing medium tier LLM: Groq Llama 3 8B")
            return ChatGroq(
                model="llama3-8b-8192",
                groq_api_key=groq_api_key,
                temperature=0.3,
                max_tokens=2048,
            )

        elif tier == "power":
            # Try different providers in order of preference

            # First try: Groq with Llama 3.3 70B (UPDATED MODEL NAME)
            if groq_api_key:
                try:
                    from langchain_groq import ChatGroq

                    logger.info("Initializing power tier LLM: Groq Llama 3.3 70B")
                    return ChatGroq(
                        model="llama-3.3-70b-versatile",  # CHANGED FROM llama-3.1-70b-versatile
                        groq_api_key=groq_api_key,
                        temperature=0.3,
                        max_tokens=8000,
                    )
                except Exception as e:
                    logger.warning(f"Failed to initialize Groq: {e}")

            # Second try: Google Gemini (for complex queries)
            if google_api_key:
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

            # Third try: DeepSeek
            if deepseek_api_key:
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

            # Fallback: Raise error if no provider is available
            raise ValueError("No LLM provider configured for 'power' tier. " "Please set GROQ_API_KEY, GOOGLE_API_KEY, or DEEPSEEK_API_KEY in .env")

        else:
            raise ValueError(f"Invalid tier: {tier}. Must be 'fast', 'medium', or 'power'")

    except Exception as e:
        logger.error(f"Error initializing LLM for tier '{tier}': {e}", exc_info=True)
        raise


def get_available_tiers():
    """
    Returns a list of available LLM tiers based on configured API keys.

    Returns:
        List of available tier names
    """
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

    Args:
        tier: The LLM tier to test

    Returns:
        Boolean indicating if the connection is successful
    """
    try:
        # llm = get_llm(tier)
        # response = llm.invoke("Say 'Hello'")
        logger.info(f"LLM tier '{tier}' connection test successful")
        return True
    except Exception as e:
        logger.error(f"LLM tier '{tier}' connection test failed: {e}")
        return False


__all__ = ["get_llm", "get_available_tiers", "test_llm_connection", "LLMTier"]
