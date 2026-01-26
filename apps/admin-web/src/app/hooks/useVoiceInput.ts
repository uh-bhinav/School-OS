/**
 * useVoiceInput.ts
 *
 * PRODUCTION-SAFE voice input hook with automatic fallback strategy:
 *
 * 1. First tries Web Speech API (instant transcription in Chrome)
 * 2. If Web Speech fails with "network" error, falls back to MediaRecorder
 * 3. MediaRecorder captures audio for backend transcription (Whisper, etc.)
 *
 * This provides the SAME UX regardless of browser:
 * - Chrome: Instant live transcription via Web Speech API
 * - Arc/Brave/Firefox: Record audio → Send to backend → Get transcript
 *
 * The fallback is seamless - user just sees "processing..." briefly.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// TypeScript types for Web Speech API (not all browsers have these)
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((ev: ISpeechRecognitionResultEvent) => void) | null;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognitionResultEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface UseVoiceInputOptions {
  lang?: string;
  /**
   * Backend endpoint for transcription (used when Web Speech API fails)
   * Should accept POST with FormData containing 'audio' file
   * Returns JSON: { transcript: string }
   */
  transcriptionEndpoint?: string;
  /** Max recording duration in seconds for fallback mode */
  maxDuration?: number;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  /** Which mode is active: 'webspeech' | 'recorder' | null */
  activeMode: 'webspeech' | 'recorder' | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Check Web Speech API support
const getWebSpeechRecognition = (): (new () => ISpeechRecognition) | null => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

// Check MediaRecorder support
const isMediaRecorderSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && window.MediaRecorder);
};

export function useVoiceInput(
  options: UseVoiceInputOptions = {}
): UseVoiceInputReturn {
  const {
    lang = 'en-US',
    transcriptionEndpoint,
    maxDuration = 60
  } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'webspeech' | 'recorder' | null>(null);

  // Refs
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef('');
  const webSpeechFailedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasWebSpeech = !!getWebSpeechRecognition();
  const hasMediaRecorder = isMediaRecorderSupported();
  const isSupported = hasWebSpeech || hasMediaRecorder;

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear recorder
    mediaRecorderRef.current = null;
    chunksRef.current = [];

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  /**
   * Start with MediaRecorder fallback (for Arc/Brave/Firefox)
   */
  const startWithRecorder = useCallback(async () => {
    if (!hasMediaRecorder) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setIsListening(false);

        // If we have a transcription endpoint, use it
        if (transcriptionEndpoint && blob.size > 0) {
          setIsProcessing(true);
          setInterimTranscript('Processing audio...');

          try {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');

            const response = await fetch(transcriptionEndpoint, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Transcription failed');
            }

            const data = await response.json();
            const text = data.transcript || data.text || '';
            setTranscript(text);
            finalTranscriptRef.current = text;
          } catch (err) {
            console.error('[VoiceInput] Transcription error:', err);
            setError('Failed to transcribe audio. Please try again.');
          } finally {
            setIsProcessing(false);
            setInterimTranscript('');
          }
        } else {
          // No endpoint - just notify that we have audio but can't transcribe
          setError('Voice recording captured but no transcription service configured.');
        }

        cleanup();
      };

      recorder.onerror = () => {
        setError('Recording failed. Please try again.');
        setIsListening(false);
        cleanup();
      };

      recorder.start(100);
      setIsListening(true);
      setActiveMode('recorder');
      setInterimTranscript('Recording... Click stop when done.');
      console.log('[VoiceInput] Started in recorder mode');

      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, maxDuration * 1000);

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access.');
      } else {
        setError('Failed to start recording.');
      }
      cleanup();
    }
  }, [hasMediaRecorder, transcriptionEndpoint, maxDuration, cleanup]);

  /**
   * Start with Web Speech API (Chrome only)
   */
  const startWithWebSpeech = useCallback(() => {
    const SpeechRecognition = getWebSpeechRecognition();
    if (!SpeechRecognition) {
      // Fall back to recorder
      startWithRecorder();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        console.log('[VoiceInput] Web Speech started');
        setIsListening(true);
        setActiveMode('webspeech');
        setError(null);
      };

      recognition.onend = () => {
        console.log('[VoiceInput] Web Speech ended');
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.error('[VoiceInput] Web Speech error:', event.error);

        if (event.error === 'network') {
          // Web Speech API blocked - fall back to recorder
          console.log('[VoiceInput] Network error - falling back to recorder mode');
          webSpeechFailedRef.current = true;
          recognition.abort();
          setError(null); // Clear error, we're falling back
          startWithRecorder();
          return;
        }

        if (event.error === 'not-allowed') {
          setError('Microphone permission denied.');
        } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
          setError(`Speech error: ${event.error}`);
        }

        setIsListening(false);
      };

      recognition.onresult = (event: ISpeechRecognitionResultEvent) => {
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        setTranscript(finalTranscriptRef.current.trim());
        setInterimTranscript(interim);
      };

      recognitionRef.current = recognition;
      recognition.start();
      console.log('[VoiceInput] Attempting Web Speech...');

    } catch (err) {
      console.error('[VoiceInput] Web Speech init failed:', err);
      startWithRecorder();
    }
  }, [lang, startWithRecorder]);

  /**
   * Main entry point - automatically picks best method
   */
  const startListening = useCallback(() => {
    // Reset state
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';

    // If Web Speech previously failed, go straight to recorder
    if (webSpeechFailedRef.current || !hasWebSpeech) {
      startWithRecorder();
    } else {
      startWithWebSpeech();
    }
  }, [hasWebSpeech, startWithWebSpeech, startWithRecorder]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      setIsListening(false);
      cleanup();
    }

    setActiveMode(null);
  }, [cleanup]);

  /**
   * Reset all state
   */
  const resetTranscript = useCallback(() => {
    cleanup();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setIsListening(false);
    setIsProcessing(false);
    setActiveMode(null);
    finalTranscriptRef.current = '';
  }, [cleanup]);

  return {
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    isSupported,
    error,
    activeMode,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useVoiceInput;
