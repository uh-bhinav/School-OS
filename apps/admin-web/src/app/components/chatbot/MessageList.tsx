import { useChatStore } from "@/app/stores/useChatStore";
import { useEffect, useRef, useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EmailIcon from "@mui/icons-material/Email";
import TableChartIcon from "@mui/icons-material/TableChart";
import EmptyState from "./EmptyState";
import MarkdownRenderer from "./MarkdownRenderer";
import ChatChart from "./ChatChart";
import { downloadExport, approveDraft, rejectDraft } from "@/app/services/chatService";

const API_BASE = "http://localhost:8004";

export default function MessageList() {
  const { sessions, activeId, isLoading, pushMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [approvalStates, setApprovalStates] = useState<Record<string, "approving" | "rejecting" | "approved" | "rejected">>({});

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
                ? "bg-primary text-white max-w-[85%]"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 max-w-[90%]"
            }`}
          >
            {msg.role === "user" ? (
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            ) : (
              <div className="text-sm md:text-base leading-relaxed">
                <MarkdownRenderer content={msg.content} />
                {/* Render inline chart if present */}
                {msg.chart?.base64_image && (
                  <ChatChart chart={msg.chart} />
                )}
                {/* Render download button if a report was generated */}
                {msg.report?.file_name && (
                  <a
                    href={`${API_BASE}/api/reports/download/${msg.report.file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={msg.report.file_name}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    <DownloadIcon sx={{ fontSize: 18 }} />
                    Download {msg.report.report_type?.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Report"} (PDF)
                  </a>
                )}

                {/* Export download button (CSV/Excel) */}
                {msg.export?.file_name && (
                  <button
                    onClick={() => downloadExport(msg.export!.file_name)}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    <TableChartIcon sx={{ fontSize: 18 }} />
                    Download {msg.export.format?.toUpperCase() || "Export"} ({msg.export.file_name})
                  </button>
                )}

                {/* Email draft approval card */}
                {msg.email_draft && msg.awaiting_approval && (
                  <div className="mt-4 border border-amber-300 dark:border-amber-600 rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <EmailIcon sx={{ fontSize: 20 }} className="text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                        Email Draft — Awaiting Your Approval
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-1">
                      <p><strong>To:</strong> {msg.email_draft.recipient_count || "—"} recipient{(msg.email_draft.recipient_count || 0) !== 1 ? "s" : ""}</p>
                      <p><strong>Subject:</strong> {msg.email_draft.subject || "—"}</p>
                    </div>
                    {msg.email_draft.body && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-3 mt-2 mb-3 border border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {msg.email_draft.body.length > 300 ? msg.email_draft.body.slice(0, 300) + "…" : msg.email_draft.body}
                      </div>
                    )}
                    {(() => {
                      const draftId = msg.email_draft?.draft_id || "";
                      const state = approvalStates[draftId];
                      if (state === "approved") {
                        return (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                            <CheckCircleIcon sx={{ fontSize: 18 }} /> Email Sent Successfully
                          </div>
                        );
                      }
                      if (state === "rejected") {
                        return (
                          <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm font-medium">
                            <CancelIcon sx={{ fontSize: 18 }} /> Draft Discarded
                          </div>
                        );
                      }
                      return (
                        <div className="flex gap-2">
                          <button
                            disabled={state === "approving" || state === "rejecting"}
                            onClick={async () => {
                              setApprovalStates(prev => ({ ...prev, [draftId]: "approving" }));
                              try {
                                await approveDraft(draftId);
                                setApprovalStates(prev => ({ ...prev, [draftId]: "approved" }));
                                if (activeId) {
                                  pushMessage(activeId, {
                                    id: crypto.randomUUID(),
                                    role: "assistant",
                                    content: "✅ Email approved and sent successfully!",
                                    ts: Date.now(),
                                  });
                                }
                              } catch {
                                setApprovalStates(prev => { const n = { ...prev }; delete n[draftId]; return n; });
                              }
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                            {state === "approving" ? "Sending…" : "Approve & Send"}
                          </button>
                          <button
                            disabled={state === "approving" || state === "rejecting"}
                            onClick={async () => {
                              setApprovalStates(prev => ({ ...prev, [draftId]: "rejecting" }));
                              try {
                                await rejectDraft(draftId);
                                setApprovalStates(prev => ({ ...prev, [draftId]: "rejected" }));
                              } catch {
                                setApprovalStates(prev => { const n = { ...prev }; delete n[draftId]; return n; });
                              }
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CancelIcon sx={{ fontSize: 16 }} />
                            {state === "rejecting" ? "Discarding…" : "Reject"}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
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
