import { useState } from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { AnimatePresence, motion } from "framer-motion";

export default function TooltipHelp() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
        aria-label="Help"
      >
        <HelpOutlineIcon sx={{ fontSize: 18 }} className="text-gray-500 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 z-50"
          >
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Quick Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Hold <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Shift</kbd> + Click on KPI cards or charts to add context</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Shift+Enter</kbd> for new line</li>
              <li>• Use quick replies for common queries</li>
              <li>• Manage chat sessions from the sidebar</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
