import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { getChatRoleFromPath } from "@/app/services/chatService";
import { useEffect, useState } from "react";

export default function EmptyState() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const role = getChatRoleFromPath();
    setIsSuperAdmin(role === "super_admin");
  }, []);

  if (isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <AutoAwesomeIcon sx={{ fontSize: 40, color: "white" }} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Welcome, Super Admin
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          I provide group-level insights across all your schools. Ask me about
          financial health, attendance trends, compliance, or school performance.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-700 dark:text-purple-300">
            💼 Try: "Show group financial health"
          </div>
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-700 dark:text-purple-300">
            📊 Try: "Which schools need attention?"
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-700 dark:text-purple-300">
            ⚠️ Try: "Compliance status overview"
          </div>
          <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-700 dark:text-purple-300">
            📈 Try: "Compare regional performance"
          </div>
        </div>
      </div>
    );
  }

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
