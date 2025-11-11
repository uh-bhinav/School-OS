import { useChatStore } from "@/app/stores/useChatStore";
import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function SessionSidebar() {
  const {
    sessions,
    activeId,
    sidebarOpen,
    setSidebarOpen,
    createSession,
    setActive,
    deleteSession,
    archiveSession,
    renameSession,
    clearAllSessions,
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const activeSessions = sessions.filter((s) => !s.archived);
  const archivedSessions = sessions.filter((s) => s.archived);

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      renameSession(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-5 left-4 z-20 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        aria-label="Toggle sidebar"
      >
        <MenuIcon sx={{ fontSize: 20 }} className="text-gray-600 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-10 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                Chat History
              </h3>
              <button
                onClick={() => {
                  createSession();
                  setSidebarOpen(false);
                }}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                aria-label="New chat"
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
              {activeSessions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                    ACTIVE SESSIONS
                  </h4>
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group rounded-lg p-3 mb-2 cursor-pointer transition ${
                        session.id === activeId
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => {
                        setActive(session.id);
                        setSidebarOpen(false);
                      }}
                    >
                      {editingId === session.id ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleRename(session.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(session.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <ChatIcon
                              sx={{ fontSize: 16 }}
                              className="text-gray-400"
                            />
                            <span className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">
                              {session.title}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(session.id);
                                setEditTitle(session.title);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              aria-label="Rename"
                            >
                              <EditIcon sx={{ fontSize: 14 }} className="text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveSession(session.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              aria-label="Archive"
                            >
                              <ArchiveIcon sx={{ fontSize: 14 }} className="text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                              }}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              aria-label="Delete"
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-6">
                        {session.messages.length} messages
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {archivedSessions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                    ARCHIVED
                  </h4>
                  {archivedSessions.map((session) => (
                    <div
                      key={session.id}
                      className="group rounded-lg p-3 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition opacity-60"
                      onClick={() => {
                        setActive(session.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <ArchiveIcon
                            sx={{ fontSize: 16 }}
                            className="text-gray-400"
                          />
                          <span className="text-sm truncate text-gray-600 dark:text-gray-400">
                            {session.title}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          aria-label="Delete"
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (window.confirm("Clear all chat sessions?")) {
                    clearAllSessions();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm font-medium"
              >
                <DeleteSweepIcon sx={{ fontSize: 18 }} />
                Clear All Sessions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
