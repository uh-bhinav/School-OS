import logging
import os
from typing import Literal

from dotenv import load_dotenv
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI

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
            return ChatOllama(model="llama3:8b", temperature=0.0)
        except Exception as e:
            logger.error(f"CRITICAL: Failed to initialize Ollama: {e}", exc_info=True)
            raise ValueError("Ollama (local strategy) failed to start. Is Ollama running?")

    # If strategy is "cloud" or not set, use your existing cloud logic
    logger.info(f"Using CLOUD strategy (OpenRouter) for tier '{tier}'")

    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_api_key:
        raise ValueError("LLM_PROVIDER_STRATEGY='cloud' but OPENROUTER_API_KEY is not set in .env")

    model_map = {
        "fast": "openai/gpt-4o-mini",
        "medium": "openai/gpt-4o",
        "power": "anthropic/claude-3.5-sonnet",
    }

    model_name = model_map.get(tier, model_map["power"])

    try:
        logger.info(f"Initializing model: {model_name} via OpenRouter")
        return ChatOpenAI(
            model_name=model_name,
            openai_api_key=openrouter_api_key,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.0,
            max_tokens=2048,
        )
    except Exception as e:
        logger.error(
            f"CRITICAL: Failed to initialize OpenRouter model {model_name}: {e}",
            exc_info=True,
        )
        raise


# ===== NEW FALLBACK FUNCTION =====
def get_llm_with_fallback(preferred_tier: LLMTier = "fast") -> BaseChatModel:
    """
    Get LLM with intelligent fallback strategy.
    Tries cheaper models first before expensive ones.

    Strategy:
    1. Try fast (GPT-4o-mini) - cheapest
    2. If fails, try medium (GPT-4o) - medium cost
    3. If fails, use power (Claude 3.5 Sonnet) - most expensive

    Args:
        preferred_tier: Starting tier ("fast", "medium", "power")

    Returns:
        BaseChatModel: Successfully initialized LLM instance
    """
    tiers = ["fast", "medium", "power"]

    # Find starting index
    start_idx = tiers.index(preferred_tier) if preferred_tier in tiers else 0
    tiers_to_try = tiers[start_idx:]

    logger.info(f"🚀 Fallback strategy enabled: trying tiers {tiers_to_try} in order")

    for tier in tiers_to_try:
        try:
            logger.info(f"⏳ Attempting LLM tier: {tier}")
            llm = get_llm(tier)
            logger.info(f"✅ Successfully initialized {tier} tier LLM")
            return llm
        except Exception as e:
            logger.warning(f"❌ Tier '{tier}' failed: {str(e)[:100]}")
            if tier == tiers_to_try[-1]:  # Last tier
                logger.error("🔴 All LLM tiers failed! No fallback available.")
                raise
            # Try next tier
            continue

    # Should not reach here, but as safety net
    logger.warning("⚠️ Fallback: Using power tier as last resort")
    return get_llm("power")


def get_available_tiers():
    """
    Returns a list of available LLM tiers based on configured API keys.
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
    """
    try:
        logger.info(f"LLM tier '{tier}' connection test successful")
        return True
    except Exception as e:
        logger.error(f"LLM tier '{tier}' connection test failed: {e}")
        return False


__all__ = [
    "get_llm",
    "get_llm_with_fallback",
    "get_available_tiers",
    "test_llm_connection",
    "LLMTier",
]
