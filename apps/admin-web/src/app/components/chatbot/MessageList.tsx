import { useChatStore } from "@/app/stores/useChatStore";
import { useEffect, useRef } from "react";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import EmptyState from "./EmptyState";

export default function MessageList() {
  const { sessions, activeId, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isLoading]);

  if (!activeSession || activeSession.messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 overflow-y-auto scrollbar-thin h-full">
      {activeSession.messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 slide-up ${
            msg.role === "user" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === "user"
                ? "bg-gradient-to-br from-primary to-primary/80"
                : "bg-gradient-to-br from-gray-500 to-gray-600"
            }`}
          >
            {msg.role === "user" ? (
              <PersonIcon sx={{ fontSize: 18, color: "white" }} />
            ) : (
              <SmartToyIcon sx={{ fontSize: 18, color: "white" }} />
            )}
          </div>

          <div
            className={`message-bubble rounded-2xl px-4 py-3 ${
              msg.role === "user"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
            }`}
          >
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
            <span
              className={`text-xs mt-2 block ${
                msg.role === "user"
                  ? "text-white/70"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {new Date(msg.ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 slide-up">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600">
            <SmartToyIcon sx={{ fontSize: 18, color: "white" }} />
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
