"""
Speech-to-Text Transcription Endpoint using Faster-Whisper (Local)

This module provides a FastAPI endpoint for transcribing audio files using
the Faster-Whisper library, which is a high-performance implementation of
OpenAI's Whisper model using CTranslate2.

KEY BENEFITS:
- NO OpenAI API key required - runs entirely locally
- NO internet required after initial model download
- NO paid services - completely free
- 4x faster than original Whisper implementation
- Lower memory usage

Supported models (in order of speed/accuracy tradeoff):
- tiny:  ~39 MB, fastest, lowest accuracy
- base:  ~74 MB, fast, decent accuracy (DEFAULT)
- small: ~244 MB, slower, good accuracy
- medium: ~769 MB, slow, better accuracy
- large-v3: ~1.5 GB, slowest, best accuracy

For CPU-only systems, stick with 'tiny' or 'base'.
"""

from __future__ import annotations

import logging
import os
import tempfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Global model instance (loaded once at startup)
_whisper_model = None
_model_name = "base"  # Default model


class TranscriptionResponse(BaseModel):
    """Response schema for transcription endpoint"""

    transcript: str
    language: str | None = None
    model_used: str
    duration_seconds: float | None = None


class TranscriptionError(BaseModel):
    """Error response schema"""

    error: str
    detail: str | None = None


def get_whisper_model():
    """
    Lazy-load the Faster-Whisper model (singleton pattern).

    The model is loaded on first request, not at import time.
    This prevents slow startup and allows the endpoint to be
    registered even if faster-whisper isn't installed yet.
    """
    global _whisper_model, _model_name

    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel

            # Check for custom model from environment
            model_name = os.getenv("WHISPER_MODEL", _model_name)

            logger.info(f"Loading Faster-Whisper model: {model_name}")
            logger.info(
                "This may take a moment on first run (downloading model weights)..."
            )

            # Use CPU with int8 quantization for best balance of speed/accuracy on CPU
            # For GPU, use device="cuda" and compute_type="float16"
            _whisper_model = WhisperModel(
                model_name,
                device="cpu",
                compute_type="int8",  # Faster on CPU
            )
            _model_name = model_name

            logger.info(f"Faster-Whisper model '{model_name}' loaded successfully!")

        except ImportError:
            raise HTTPException(
                status_code=503,
                detail="Faster-Whisper is not installed. Run: pip install faster-whisper",
            )
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise HTTPException(
                status_code=503,
                detail=f"Failed to load Whisper model: {str(e)}",
            )

    return _whisper_model


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    responses={
        400: {"model": TranscriptionError, "description": "Invalid audio file"},
        503: {"model": TranscriptionError, "description": "Whisper model unavailable"},
    },
    summary="Transcribe audio to text",
    description="""
    Transcribe an audio file to text using local Faster-Whisper model.

    Supported formats: WAV, WebM, MP3, M4A, FLAC, OGG

    This runs entirely locally - no API keys, no internet required after model download.
    """,
)
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file to transcribe"),
    language: str
    | None = Form(
        None,
        description="Language code (e.g., 'en', 'hi'). Auto-detected if not provided.",
    ),
):
    """
    Transcribe uploaded audio file to text.

    The audio is processed locally using Faster-Whisper. No data is sent to external services.

    Args:
        audio: Audio file (WAV, WebM, MP3, etc.)
        language: Optional language hint for better accuracy

    Returns:
        TranscriptionResponse with transcript text
    """
    # Validate file
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")

    # Check file size (max 25MB)
    contents = await audio.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    if len(contents) > 25 * 1024 * 1024:  # 25MB
        raise HTTPException(status_code=400, detail="Audio file too large (max 25MB)")

    # Get file extension
    ext = os.path.splitext(audio.filename)[1].lower()
    if not ext:
        ext = ".webm"  # Default for browser recordings

    # Supported formats
    supported_formats = {".wav", ".webm", ".mp3", ".m4a", ".flac", ".ogg", ".mp4"}
    if ext not in supported_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {ext}. Supported: {', '.join(supported_formats)}",
        )

    # Save to temp file (Whisper needs a file path)
    temp_file = None
    try:
        # Create temp file with correct extension
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
        temp_file.write(contents)
        temp_file.close()

        logger.info(f"Transcribing audio: {audio.filename} ({len(contents)} bytes)")

        # Load model (lazy)
        model = get_whisper_model()

        # Transcribe with Faster-Whisper
        # Returns generator of segments
        segments, info = model.transcribe(
            temp_file.name,
            language=language,
            beam_size=5,
            vad_filter=True,  # Filter out silence
        )

        # Combine all segments into full transcript
        transcript_parts = []
        for segment in segments:
            transcript_parts.append(segment.text)

        transcript = " ".join(transcript_parts).strip()
        detected_language = info.language

        logger.info(
            f"Transcription complete: {len(transcript)} chars, language={detected_language}"
        )

        return TranscriptionResponse(
            transcript=transcript,
            language=detected_language,
            model_used=_model_name,
            duration_seconds=info.duration,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}",
        )
    finally:
        # Cleanup temp file
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except Exception:
                pass


@router.get(
    "/health",
    summary="Check transcription service health",
    description="Check if the Whisper model is loaded and ready",
)
async def health_check():
    """Health check endpoint for the transcription service."""
    global _whisper_model, _model_name

    return {
        "status": "ok",
        "model_loaded": _whisper_model is not None,
        "model_name": _model_name if _whisper_model else None,
        "service": "faster-whisper-local",
    }


@router.post(
    "/load-model",
    summary="Pre-load Whisper model",
    description="Explicitly load the Whisper model (useful for warming up)",
)
async def load_model(model_name: str = Form("base")):
    """
    Pre-load a specific Whisper model.

    Call this at startup to avoid cold-start latency on first transcription.
    """
    global _whisper_model, _model_name

    valid_models = {"tiny", "base", "small", "medium", "large-v3"}
    if model_name not in valid_models:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model: {model_name}. Valid: {', '.join(valid_models)}",
        )

    try:
        from faster_whisper import WhisperModel

        logger.info(f"Loading Faster-Whisper model: {model_name}")
        _whisper_model = WhisperModel(
            model_name,
            device="cpu",
            compute_type="int8",
        )
        _model_name = model_name

        return {
            "status": "ok",
            "message": f"Model '{model_name}' loaded successfully",
            "model_name": model_name,
        }
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Faster-Whisper is not installed. Run: pip install faster-whisper",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load model: {str(e)}",
        )
