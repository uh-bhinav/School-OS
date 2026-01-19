import { useChatStore } from "@/app/stores/useChatStore";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import { AnimatePresence, motion } from "framer-motion";

export default function ContextChips() {
  const { contextChips, removeChip, inputFocused } = useChatStore();

  if (contextChips.length === 0 || !inputFocused) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "class":
        return <SchoolIcon sx={{ fontSize: 16 }} />;
      case "chart_point":
        return <ShowChartIcon sx={{ fontSize: 16 }} />;
      case "kpi":
        return <AssessmentIcon sx={{ fontSize: 16 }} />;
      case "entity":
        return <PersonIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 px-4 z-10">
      <div className="context-chips-container rounded-2xl shadow-2xl p-3 max-h-32 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          <div className="flex flex-wrap gap-2">
            {contextChips.map((chip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-primary/30 rounded-full px-3 py-1.5 shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="text-primary">{getIcon(chip.type)}</div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {chip.key || chip.dataset}
                  {chip.value && `: ${chip.value}`}
                  {chip.x && chip.y && ` (${chip.x}, ${chip.y})`}
                </span>
                <button
                  onClick={() => removeChip(idx)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  aria-label="Remove context"
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
