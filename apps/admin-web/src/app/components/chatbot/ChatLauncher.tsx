import { useChatStore } from "@/app/stores/useChatStore";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";

export default function ChatLauncher() {
  const { setOpen } = useChatStore();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[9997] flex justify-center pointer-events-none px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-neutral-900 shadow-lg border border-gray-200/50 dark:border-gray-700/50 rounded-full overflow-hidden w-full max-w-[600px] md:max-w-[60%] pointer-events-auto backdrop-blur-xl"
        onClick={() => setOpen(true)}
      >
        <button
          className="w-full hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors duration-200 flex items-center gap-3 px-6 py-4 group"
          aria-label="Open SchoolOS Assistant"
        >
          <SearchIcon
            className="text-gray-400 group-hover:text-primary transition-colors"
            sx={{ fontSize: 24 }}
          />
          <span className="text-gray-500 dark:text-gray-400 text-base select-none flex-1 text-left font-normal">
            Ask SchoolOS anything... (Shift+Enter for new line)
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">AI</span>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
