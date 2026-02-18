import { useState, useRef, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import CloseIcon from "@mui/icons-material/Close";
import { useChatStore } from "@/app/stores/useChatStore";
import { sendMessageToBackend, getChatRoleFromPath } from "@/app/services/chatService";
import { useWhisperTranscription } from "@/app/hooks";
import AudioWaveform from "./AudioWaveform";

// Principal quick replies
const principalQuickReplies = [
  "Show today's attendance",
  "Upcoming exams",
  "Class 8A marks",
  "Generate timetable",
];

// Super Admin quick replies
const superAdminQuickReplies = [
  "Group financial summary",
  "Schools needing attention",
  "Compliance status",
  "Regional performance",
];

const MAX_CHARS = 2000;

/**
 * Format seconds into mm:ss display
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function InputBar() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    activeId,
    pushMessage,
    setLoading,
    sessions,
    isLoading,
    setInputFocused,
  } = useChatStore();

  // Get the correct quick replies based on role
  const quickReplies = isSuperAdmin ? superAdminQuickReplies : principalQuickReplies;

  // Check role on mount and when path changes
  useEffect(() => {
    const checkRole = () => {
      const role = getChatRoleFromPath();
      setIsSuperAdmin(role === "super_admin");
    };
    checkRole();
    window.addEventListener("popstate", checkRole);
    return () => window.removeEventListener("popstate", checkRole);
  }, []);

  /**
   * Speech-to-text using LOCAL Whisper backend.
   *
   * This hook:
   * - Records audio using MediaRecorder (works in ALL browsers)
   * - Sends audio to backend /api/v1/speech/transcribe
   * - Whisper runs locally (no API keys, no cloud, no cost)
   * - Returns plain text to populate the input field
   *
   * User flow: Click mic → Speak → Click stop → Processing → Text appears → Review → Send
   */
  const {
    isRecording: isListening,
    isProcessing,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startRecording: startListening,
    stopRecording: stopListening,
    reset: resetTranscript,
  } = useWhisperTranscription({
    endpoint: '/api/v1/speech/transcribe',
    language: 'en', // English - change to 'hi' for Hindi, etc.
    maxDuration: 60, // Max 60 seconds per recording
  });

  /**
   * Sync live transcript to input field.
   * This provides real-time visual feedback as the user speaks,
   * showing the transcription in the existing text input field.
   *
   * CRITICAL: This effect runs whenever transcript changes,
   * updating the input field with the latest transcription.
   */
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  /**
   * Recording duration timer
   * Starts counting when recording begins, resets when it stops
   */
  useEffect(() => {
    if (isListening) {
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingDuration(0);
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isListening]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  useEffect(() => {
    const session = sessions.find((s) => s.id === activeId);
    setShowSuggestions(input === "" && session?.messages.length === 0 && !isListening);
  }, [input, activeId, sessions, isListening]);

  /**
   * Internal send handler used by both typed input and voice input.
   * This is the core function that sends messages to the ADK backend.
   * Voice input calls this directly with the transcript, making it
   * behave identically to typed text.
   */
  const handleSendInternal = async (messageToSend: string) => {
    console.log("🚀 handleSendInternal called!", { messageToSend, activeId, isLoading });

    if (!messageToSend.trim() || !activeId || isLoading) {
      console.log("❌ handleSendInternal blocked:", {
        hasMessage: !!messageToSend.trim(),
        hasActiveId: !!activeId,
        isLoading
      });
      return;
    }

    console.log("✅ Proceeding with send...");

    // Grab context chips before clearing
    const chips = useChatStore.getState().contextChips;
    const chipPayload = chips.length > 0 ? chips.map(c => ({ ...c }) as Record<string, unknown>) : undefined;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: messageToSend,
      ts: Date.now(),
    };

    pushMessage(activeId, userMsg);
    setInput("");
    // Clear context chips after attaching to the message
    useChatStore.getState().clearChips();
    // Reset speech transcript after sending
    resetTranscript();
    setLoading(true);

    try {
      console.log("📞 Calling sendMessageToBackend...");
      // Call ADK backend with context chips
      const response = await sendMessageToBackend(activeId, messageToSend, undefined, chipPayload);

      // Add assistant message (with optional chart, report, export, email draft)
      pushMessage(activeId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.message,
        ts: new Date(response.timestamp).getTime(),
        // Include chart if present in response
        ...(response.chart?.base64_image && { chart: response.chart }),
        // Include report metadata if present in response
        ...(response.report && { report: response.report }),
        // Include export file info if present
        ...(response.export && { export: response.export }),
        // Include email draft for approval workflow
        ...(response.email_draft && { email_draft: response.email_draft }),
        // Flag if awaiting user approval
        ...(response.awaiting_approval && { awaiting_approval: true }),
      });
    } catch (error) {
      console.error("Error sending message to ADK backend:", error);

      // Add error message
      pushMessage(activeId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Sorry, I encountered an error connecting to the backend. Please make sure the ADK server is running on http://localhost:8004",
        ts: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Public send handler - wrapper for backward compatibility.
   * Used by quick replies, keyboard shortcuts, and the send button.
   * Accepts optional message parameter; if not provided, uses current input value.
   */
  const handleSend = async (message?: string) => {
    const messageToSend = message || input;
    await handleSendInternal(messageToSend);
  };

  /**
   * Handle mic button click (ChatGPT-style).
   *
   * STATE 1 (Idle): Click to start listening
   * STATE 2 (Listening): Click to stop recording (does NOT send)
   *
   * After stopping, user can review/edit text, then manually send.
   */
  const handleMicClick = () => {
    if (!isSpeechSupported) {
      console.warn('[InputBar] Speech recognition not supported in this browser');
      return;
    }

    if (isLoading) {
      // Don't start listening while a message is being processed
      return;
    }

    if (isListening) {
      // STATE 2 → Stop recording, let user review
      stopListening();
    } else {
      // STATE 1 → Start recording, clear previous input
      setInput('');
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't allow keyboard send while listening (read-only mode)
    if (isListening) {
      e.preventDefault();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setInput("");
    resetTranscript();
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative">
      {/* Speech recognition error banner */}
      {speechError && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{speechError}</span>
            <button
              onClick={() => resetTranscript()}
              className="ml-auto text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
            >
              Dismiss
            </button>
          </p>
        </div>
      )}

      {/* Voice input mode indicator - Professional design */}
      {(isListening || isProcessing) && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Transcribing audio...
                </span>
              </>
            ) : (
              <>
                {/* Small pulsing red dot */}
                <div className="recording-dot" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Recording
                </span>
                {/* Duration timer */}
                <span className="recording-timer ml-1">
                  {formatDuration(recordingDuration)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  Click stop when done
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {showSuggestions && !isListening && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition disabled:opacity-50"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              // Only allow editing when not listening (read-only during recording)
              if (!isListening) {
                setInput(e.target.value.slice(0, MAX_CHARS));
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 200)}
            placeholder={
              isProcessing
                ? "⏳ Transcribing with Whisper..."
                : isListening
                  ? "🎤 Recording... Click stop when done"
                  : "Ask me anything... (Shift+Enter for new line)"
            }
            rows={1}
            disabled={isLoading}
            readOnly={isListening}
            className={`w-full rounded-2xl border px-4 py-3 pr-20 resize-none focus:outline-none focus:ring-2 transition text-gray-800 dark:text-gray-100 ${
              isListening
                ? 'border-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-300 focus:border-red-400'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-primary/30 focus:border-primary'
            } ${isLoading ? 'opacity-50' : ''}`}
            style={{ maxHeight: "120px" }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {/* Show waveform animation while listening */}
            {isListening && (
              <AudioWaveform isActive={isListening} barColor="bg-red-500" />
            )}
            {/* Show clear button and char count when not listening and has input */}
            {!isListening && input.length > 0 && (
              <>
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                  aria-label="Clear input"
                >
                  <CloseIcon sx={{ fontSize: 16 }} className="text-gray-400" />
                </button>
                <span className="text-xs text-gray-400">
                  {input.length}/{MAX_CHARS}
                </span>
              </>
            )}
          </div>
        </div>

        {/*
          Voice Input Button - Professional UX

          STATE 1 (Idle): Gray mic icon - "Click to speak"
          STATE 2 (Listening): Subtle red stop button - "Click to stop"
          STATE 3 (Review): After stop, text stays in input for user to review/edit
          STATE 4 (Send): User manually clicks Send button

          Professional look: No large pulsing animations, clean transitions.
        */}
        <button
          onClick={handleMicClick}
          disabled={!isSpeechSupported || isLoading}
          className={`p-3 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          } ${!isSpeechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
          title={
            !isSpeechSupported
              ? 'Voice input not supported in this browser. Try Chrome or Edge.'
              : isListening
                ? 'Click to stop recording'
                : speechError
                  ? speechError
                  : 'Click to speak'
          }
          aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? (
            // Stop button (square inside circle) - Professional style
            <StopIcon sx={{ fontSize: 20 }} />
          ) : (
            // Mic icon when idle
            <MicIcon sx={{ fontSize: 20 }} />
          )}
        </button>

        <button
          onClick={() => {
            console.log("🖱️ Send button clicked!");
            handleSend();
          }}
          disabled={!input.trim() || isLoading || isListening}
          className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition hover:scale-105 active:scale-95"
          aria-label="Send message"
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
}
