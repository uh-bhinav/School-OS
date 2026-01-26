/**
 * useSpeechRecognition.ts
 *
 * Custom React hook for browser-native Web Speech API integration.
 *
 * IMPORTANT: Chrome's Web Speech API requires an internet connection
 * as it sends audio to Google's servers for processing.
 *
 * This hook provides:
 * - Stable recognition instance (created once, not on every render)
 * - Live transcription with interim results
 * - Proper error handling and user feedback
 * - NO auto-submit - user must manually send
 */

import { useState, useRef, useCallback } from 'react';

// TypeScript types for Web Speech API
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Check if browser supports Web Speech API
const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
};

// Get SpeechRecognition constructor
const getSpeechRecognition = (): (new () => ISpeechRecognition) | null => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = 'en-US' } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Refs for stable values across renders
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const isInitializedRef = useRef(false);

  const isSupported = isSpeechRecognitionSupported();

  /**
   * Initialize recognition instance lazily (on first start)
   * This avoids issues with SSR and multiple initializations
   */
  const initRecognition = useCallback(() => {
    // Already initialized
    if (recognitionRef.current) return true;

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return false;
    }

    try {
      const recognition = new SpeechRecognitionClass();

      // Configure for live transcription
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      // Event handlers
      recognition.onstart = () => {
        console.log('[Speech] Recognition started');
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        console.log('[Speech] Recognition ended');
        setIsListening(false);
      };

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.error('[Speech] Error:', event.error);

        let errorMsg = '';
        switch (event.error) {
          case 'not-allowed':
            errorMsg = 'Microphone permission denied. Please allow microphone access in your browser.';
            break;
          case 'no-speech':
            // Not critical - user just didn't speak
            console.log('[Speech] No speech detected');
            break;
          case 'network':
            errorMsg = 'Network error. Speech recognition requires an internet connection.';
            break;
          case 'audio-capture':
            errorMsg = 'No microphone found. Please connect a microphone.';
            break;
          case 'aborted':
            // User stopped - not an error
            break;
          default:
            errorMsg = `Speech error: ${event.error}`;
        }

        if (errorMsg) {
          setError(errorMsg);
        }
        setIsListening(false);
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let interimTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalTranscriptRef.current += text;
            console.log('[Speech] Final:', text);
          } else {
            interimTranscript += text;
          }
        }

        // Update transcript state with final + interim
        const fullText = (finalTranscriptRef.current + interimTranscript).trim();
        setTranscript(fullText);
        console.log('[Speech] Transcript:', fullText);
      };

      recognitionRef.current = recognition;
      isInitializedRef.current = true;
      console.log('[Speech] Initialized successfully');
      return true;
    } catch (err) {
      console.error('[Speech] Init error:', err);
      setError('Failed to initialize speech recognition.');
      return false;
    }
  }, [lang]);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    // Initialize if needed
    if (!initRecognition()) {
      return;
    }

    // Clear previous state
    finalTranscriptRef.current = '';
    setTranscript('');
    setError(null);

    try {
      recognitionRef.current?.start();
      console.log('[Speech] Start requested');
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        // Already running - stop and restart
        console.log('[Speech] Already running, restarting...');
        recognitionRef.current?.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error('[Speech] Restart failed:', e);
          }
        }, 100);
      } else {
        console.error('[Speech] Start error:', err);
        setError('Failed to start recording. Please try again.');
      }
    }
  }, [initRecognition]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('[Speech] Stop requested');
      } catch (err) {
        console.warn('[Speech] Stop error:', err);
      }
    }
    setIsListening(false);
  }, []);

  /**
   * Reset all state
   */
  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useSpeechRecognition;
