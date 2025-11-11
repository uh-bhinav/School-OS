import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  ts: number;
  streaming?: boolean;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
  archived?: boolean;
}

export interface ContextChip {
  type: "class" | "chart_point" | "kpi" | "entity";
  key?: string;
  value?: string | number;
  dataset?: string;
  x?: string | number;
  y?: number;
}

interface ChatState {
  open: boolean;
  sessions: Session[];
  activeId: string | null;
  contextChips: ContextChip[];
  isLoading: boolean;
  sidebarOpen: boolean;
  inputFocused: boolean;

  createSession(title?: string): string;
  setActive(id: string): void;
  pushMessage(id: string, m: Message): void;
  updateMessage(sessionId: string, messageId: string, content: string): void;
  pushChip(c: ContextChip): void;
  removeChip(idx: number): void;
  clearChips(): void;
  setOpen(b: boolean): void;
  setLoading(b: boolean): void;
  setSidebarOpen(b: boolean): void;
  setInputFocused(b: boolean): void;
  renameSession(id: string, title: string): void;
  deleteSession(id: string): void;
  archiveSession(id: string): void;
  clearAllSessions(): void;
}

const MAX_VISIBLE_CHIPS = 4;

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      open: false,
      sessions: [],
      activeId: null,
      contextChips: [],
      isLoading: false,
      sidebarOpen: false,
      inputFocused: false,

      createSession(title) {
        const id = crypto.randomUUID();
        const newSession: Session = {
          id,
          title: title || "New Chat",
          createdAt: Date.now(),
          messages: [],
        };
        set({ sessions: [newSession, ...get().sessions], activeId: id });
        return id;
      },

      setActive(id) {
        set({ activeId: id });
      },

      pushMessage(id, m) {
        set({
          sessions: get().sessions.map((s) =>
            s.id === id ? { ...s, messages: [...s.messages, m] } : s
          ),
        });
      },

      updateMessage(sessionId, messageId, content) {
        set({
          sessions: get().sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                }
              : s
          ),
        });
      },

      pushChip(c) {
        const chips = get().contextChips;
        if (chips.length >= MAX_VISIBLE_CHIPS) {
          set({ contextChips: [...chips.slice(1), c] });
        } else {
          set({ contextChips: [...chips, c] });
        }
      },

      removeChip(idx) {
        const chips = [...get().contextChips];
        chips.splice(idx, 1);
        set({ contextChips: chips });
      },

      clearChips() {
        set({ contextChips: [] });
      },

      setOpen(b) {
        set({ open: b });
        if (b && get().sessions.length === 0) {
          get().createSession("New Chat");
        }
      },

      setLoading(b) {
        set({ isLoading: b });
      },

      setSidebarOpen(b) {
        set({ sidebarOpen: b });
      },

      setInputFocused(b) {
        set({ inputFocused: b });
        if (!b) {
          set({ contextChips: [] });
        }
      },

      renameSession(id, title) {
        set({
          sessions: get().sessions.map((s) =>
            s.id === id ? { ...s, title } : s
          ),
        });
      },

      deleteSession(id) {
        const sessions = get().sessions.filter((s) => s.id !== id);
        set({ sessions });
        if (get().activeId === id) {
          set({ activeId: sessions.length > 0 ? sessions[0].id : null });
        }
      },

      archiveSession(id) {
        set({
          sessions: get().sessions.map((s) =>
            s.id === id ? { ...s, archived: true } : s
          ),
        });
      },

      clearAllSessions() {
        set({ sessions: [], activeId: null, contextChips: [] });
      },
    }),
    { name: "schoolos-chat", partialize: (s) => ({ sessions: s.sessions }) }
  )
);
