import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center fade-in">
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <AutoAwesomeIcon sx={{ fontSize: 40, color: "white" }} />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Welcome to SchoolOS Assistant
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        I'm here to help you manage your school efficiently. Ask me about
        attendance, exams, marks, timetables, or anything else!
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          💡 Try: "Show today's attendance"
        </div>
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          📊 Try: "Class 8A performance"
        </div>
      </div>
    </div>
  );
}
