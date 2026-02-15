// ============================================================================
// HOOKS INDEX - Export all custom hooks
// ============================================================================

// Authentication hooks
export { useAuth, useUserRole, useSchoolId, useIsAuthenticated } from './useAuth';
export type { AuthState } from './useAuth';

// Speech and voice hooks
export { useSpeechRecognition } from './useSpeechRecognition';
export type { UseSpeechRecognitionOptions, UseSpeechRecognitionReturn } from './useSpeechRecognition';

export { useVoiceRecorder } from './useVoiceRecorder';
export type { UseVoiceRecorderOptions, UseVoiceRecorderReturn } from './useVoiceRecorder';

export { useVoiceInput } from './useVoiceInput';
export type { UseVoiceInputOptions, UseVoiceInputReturn } from './useVoiceInput';

// Recommended: Local Whisper-based transcription (no API key, works everywhere)
export { useWhisperTranscription } from './useWhisperTranscription';
export type { UseWhisperTranscriptionOptions, UseWhisperTranscriptionReturn } from './useWhisperTranscription';
