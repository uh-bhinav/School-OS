/**
 * useWhisperTranscription.ts
 *
 * Speech-to-text hook using LOCAL Whisper backend.
 *
 * This hook:
 * 1. Records audio using MediaRecorder (browser API)
 * 2. Sends audio to your backend's /api/v1/speech/transcribe endpoint
 * 3. Backend runs Whisper locally (no API keys, no cloud)
 * 4. Returns plain text to populate the chat input
 *
 * NO Web Speech API - works in ALL browsers (Chrome, Arc, Brave, Firefox, Safari)
 * NO OpenAI API key required
 * NO paid services
 *
 * User flow: Click mic → Speak → Click stop → Processing → Text in input → Review → Send
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseWhisperTranscriptionOptions {
  /** Backend transcription endpoint (default: /api/v1/speech/transcribe) */
  endpoint?: string;
  /** Language hint for Whisper (e.g., 'en', 'hi'). Auto-detected if not set. */
  language?: string;
  /** Max recording duration in seconds (default: 60) */
  maxDuration?: number;
}

export interface UseWhisperTranscriptionReturn {
  /** Currently recording audio */
  isRecording: boolean;
  /** Processing audio (sending to backend) */
  isProcessing: boolean;
  /** Final transcript text */
  transcript: string;
  /** Error message (human-readable) */
  error: string | null;
  /** Browser supports MediaRecorder */
  isSupported: boolean;
  /** Start recording */
  startRecording: () => Promise<void>;
  /** Stop recording and transcribe */
  stopRecording: () => void;
  /** Clear transcript and error */
  reset: () => void;
}

// Check MediaRecorder support
const isMediaRecorderSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    window.MediaRecorder
  );
};

export function useWhisperTranscription(
  options: UseWhisperTranscriptionOptions = {}
): UseWhisperTranscriptionReturn {
  const {
    endpoint = '/api/v1/speech/transcribe',
    language,
    maxDuration = 60,
  } = options;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported = isMediaRecorderSupported();

  /**
   * Cleanup all resources
   */
  const cleanup = useCallback(() => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  /**
   * Send audio to backend for transcription
   */
  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    if (language) {
      formData.append('language', language);
    }

    // Determine the full URL
    // If endpoint starts with /, prepend the backend URL
    let fullUrl = endpoint;
    if (endpoint.startsWith('/')) {
      // Use the same host as the page, or fallback to localhost:8000
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      fullUrl = `${backendUrl}${endpoint}`;
    }

    console.log('[Whisper] Sending audio to:', fullUrl);
    console.log('[Whisper] Audio size:', audioBlob.size, 'bytes');

    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Whisper] Response:', data);

    return data.transcript || '';
  }, [endpoint, language]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Voice recording is not supported in this browser.');
      return;
    }

    // Reset state
    setError(null);
    setTranscript('');
    chunksRef.current = [];

    try {
      console.log('[Whisper] Requesting microphone access...');

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Good for speech
        },
      });

      streamRef.current = stream;
      console.log('[Whisper] Microphone access granted');

      // Determine best format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'; // Safari fallback

      console.log('[Whisper] Using format:', mimeType);

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      // Collect chunks
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle stop
      recorder.onstop = async () => {
        console.log('[Whisper] Recording stopped, chunks:', chunksRef.current.length);

        // Create audio blob
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        console.log('[Whisper] Audio blob size:', audioBlob.size);

        setIsRecording(false);

        // Only transcribe if we have audio
        if (audioBlob.size > 0) {
          setIsProcessing(true);

          try {
            const text = await transcribeAudio(audioBlob);
            setTranscript(text);
            console.log('[Whisper] Transcription:', text);
          } catch (err: any) {
            console.error('[Whisper] Transcription error:', err);
            setError(err.message || 'Transcription failed. Is the backend running?');
          } finally {
            setIsProcessing(false);
          }
        } else {
          setError('No audio recorded. Please try again.');
        }

        cleanup();
      };

      // Handle errors
      recorder.onerror = (event: Event) => {
        console.error('[Whisper] Recorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        cleanup();
      };

      // Start recording (collect data every 250ms)
      recorder.start(250);
      setIsRecording(true);
      console.log('[Whisper] Recording started');

      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => {
        console.log('[Whisper] Max duration reached, stopping...');
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, maxDuration * 1000);

    } catch (err: any) {
      console.error('[Whisper] Start error:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Failed to start recording: ${err.message}`);
      }

      cleanup();
    }
  }, [isSupported, maxDuration, transcribeAudio, cleanup]);

  /**
   * Stop recording (triggers transcription)
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('[Whisper] Stop requested');
      mediaRecorderRef.current.stop();
    }
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsProcessing(false);
    setTranscript('');
    setError(null);
  }, [cleanup]);

  return {
    isRecording,
    isProcessing,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    reset,
  };
}

export default useWhisperTranscription;
