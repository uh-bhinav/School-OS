import { useChatStore } from "@/app/stores/useChatStore";
import MessageList from "./MessageList";
import InputBar from "./InputBar";
import ContextChips from "./ContextChips";
import SessionSidebar from "./SessionSidebar";
import TooltipHelp from "./TooltipHelp";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function ChatDock() {
  const { setOpen, sidebarOpen, setInputFocused } = useChatStore();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Auto-focus input after animation
    const timer = setTimeout(() => {
      setInputFocused(true);
      const textarea = document.querySelector('textarea[placeholder*="Ask me anything"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 200);

    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, [setInputFocused]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={() => setOpen(false)}
        style={{ pointerEvents: "auto" }}
      />

      {/* Chat Container with Shared Layout */}
      <div className="fixed bottom-0 md:bottom-6 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-0 md:px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="w-full md:w-[85%] lg:w-[75%] xl:w-[65%] 2xl:w-[60%] h-[92vh] md:h-[85vh] lg:h-[82vh] max-w-5xl max-h-[950px] pointer-events-auto"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-700/50">
            <SessionSidebar />

            {/* Header */}
            <div
              className="flex justify-between items-center p-4 md:p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-gray-50/50 dark:from-neutral-900 dark:to-neutral-800/50 relative z-10 transition-all duration-300"
              style={{ paddingLeft: sidebarOpen ? "280px" : "3rem" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="font-semibold text-lg md:text-xl text-gray-800 dark:text-gray-100">
                  SchoolOS Assistant
                </h2>
                <TooltipHelp />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Minimize chat"
                >
                  <MinimizeIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close chat"
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto relative bg-gradient-to-b from-gray-50/30 to-white dark:from-neutral-800/30 dark:to-neutral-900"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(11, 95, 90, 0.03) 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            >
              <MessageList />
            </div>

            {/* Input Area */}
            <div className="relative">
              <ContextChips />
              <InputBar />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
