import { useState, useRef, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import { useChatStore } from "@/app/stores/useChatStore";
import { useAgentQuery } from "@/app/services/agent.hooks";

const quickReplies = [
  "Show today's attendance",
  "Upcoming exams",
  "Class 8A marks",
  "Generate timetable",
];

const MAX_CHARS = 2000;

export default function InputBar() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    activeId,
    pushMessage,
    contextChips,
    setLoading,
    sessions,
    isLoading,
    setInputFocused,
  } = useChatStore();
  const { mutate } = useAgentQuery();

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
    setShowSuggestions(input === "" && session?.messages.length === 0);
  }, [input, activeId, sessions]);

  const handleSend = (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim() || !activeId || isLoading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: messageToSend,
      ts: Date.now(),
    };

    pushMessage(activeId, userMsg);
    setInput("");
    setLoading(true);

    mutate(
      {
        body: {
          session_id: activeId,
          message: messageToSend,
          context: { chips: contextChips },
          routing: { auto: true },
        },
        auth: { jwt: "demo-jwt", school_id: 101 },
      },
      {
        onSuccess: (res: any) => {
          pushMessage(activeId, {
            id: res.message_id,
            role: "assistant",
            content: res.content,
            ts: Date.now(),
          });
          setLoading(false);
        },
        onError: () => {
          pushMessage(activeId, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            ts: Date.now(),
          });
          setLoading(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setInput("");
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative">
      {showSuggestions && (
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
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setTimeout(() => setInputFocused(false), 200)}
            placeholder="Ask me anything... (Shift+Enter for new line)"
            rows={1}
            disabled={isLoading}
            className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-50 text-gray-800 dark:text-gray-100"
            style={{ maxHeight: "120px" }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {input.length > 0 && (
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

        <button
          className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Voice input (coming soon)"
          disabled
        >
          <MicIcon sx={{ fontSize: 20 }} />
        </button>

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition hover:scale-105 active:scale-95"
          aria-label="Send message"
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
}
