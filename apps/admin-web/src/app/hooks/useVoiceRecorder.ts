/**
 * useVoiceRecorder.ts
 *
 * A production-safe voice recording hook that captures audio using the
 * MediaRecorder API. This works in ALL browsers (Chrome, Arc, Brave, Firefox, Safari).
 *
 * Unlike Web Speech API (which depends on Google's servers and is blocked by
 * privacy-focused browsers), this captures raw audio that can be:
 *
 * 1. Sent to YOUR backend for transcription (Whisper, Deepgram, AssemblyAI)
 * 2. Processed client-side with a WASM-based STT (experimental)
 *
 * This hook maintains the SAME interface as useSpeechRecognition for easy swap.
 */

import { useState, useRef, useCallback } from 'react';

export interface UseVoiceRecorderOptions {
  /** Called when recording completes with the audio blob */
  onRecordingComplete?: (audioBlob: Blob) => void;
  /** Called with transcription result (if transcription service is provided) */
  onTranscript?: (text: string) => void;
  /** Max recording duration in seconds (default: 60) */
  maxDuration?: number;
}

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  error: string | null;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

// Check if MediaRecorder is supported
const isMediaRecorderSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && window.MediaRecorder);
};

export function useVoiceRecorder(
  options: UseVoiceRecorderOptions = {}
): UseVoiceRecorderReturn {
  const { onRecordingComplete, maxDuration = 60 } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported = isMediaRecorderSupported();

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

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Voice recording is not supported in this browser.');
      return;
    }

    // Reset state
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Good for speech recognition
        }
      });

      streamRef.current = stream;

      // Determine best supported format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'; // Safari fallback

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setIsRecording(false);
        cleanup();

        console.log('[VoiceRecorder] Recording complete:', {
          size: blob.size,
          type: blob.type,
          duration: 'unknown' // Would need to decode to get actual duration
        });

        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        console.error('[VoiceRecorder] Error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
        cleanup();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      console.log('[VoiceRecorder] Recording started');

      // Auto-stop after max duration
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          console.log('[VoiceRecorder] Max duration reached, stopping...');
          mediaRecorderRef.current.stop();
        }
      }, maxDuration * 1000);

    } catch (err: any) {
      console.error('[VoiceRecorder] Start error:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to start recording. Please try again.');
      }

      cleanup();
    }
  }, [isSupported, maxDuration, onRecordingComplete, cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      console.log('[VoiceRecorder] Stopping...');
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsProcessing(false);
    setError(null);
    setAudioBlob(null);
  }, [cleanup]);

  return {
    isRecording,
    isProcessing,
    isSupported,
    error,
    audioBlob,
    startRecording,
    stopRecording,
    reset,
  };
}

export default useVoiceRecorder;
