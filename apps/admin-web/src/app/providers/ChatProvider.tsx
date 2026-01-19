import { useChatStore } from "@/app/stores/useChatStore";
import ChatDock from "@/app/components/chatbot/ChatDock";
import ChatLauncher from "@/app/components/chatbot/ChatLauncher";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import "@/app/components/chatbot/styles.css";

export default function ChatProvider() {
  const { open, pushChip, setOpen, setInputFocused } = useChatStore();
  const [shiftHeld, setShiftHeld] = useState(false);

  useEffect(() => {
    // Esc key to close chat
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    const handleShiftDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true);
    };

    const handleShiftUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(false);
    };

    const handleShiftClick = (e: MouseEvent) => {
      if (!e.shiftKey || !(e.target instanceof HTMLElement)) return;

      const target = e.target;
      const dataset = target.dataset;

      if (dataset.kpi) {
        pushChip({ type: "kpi", key: dataset.kpi, value: dataset.value });
        setOpen(true);
        setTimeout(() => setInputFocused(true), 300);
      }

      if (dataset.chart) {
        pushChip({
          type: "chart_point",
          dataset: dataset.chart,
          x: dataset.x,
          y: Number(dataset.y),
        });
        setOpen(true);
        setTimeout(() => setInputFocused(true), 300);
      }

      if (dataset.entity) {
        pushChip({
          type: "entity",
          key: dataset.entity,
          value: dataset.value,
        });
        setOpen(true);
        setTimeout(() => setInputFocused(true), 300);
      }

      if (dataset.class) {
        pushChip({
          type: "class",
          key: dataset.class,
          value: dataset.value,
        });
        setOpen(true);
        setTimeout(() => setInputFocused(true), 300);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!shiftHeld) return;

      const target = e.target as HTMLElement;
      if (target.dataset.kpi || target.dataset.chart || target.dataset.entity || target.dataset.class) {
        target.classList.add("shift-indicator");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove("shift-indicator");
    };

    document.addEventListener("keydown", handleEsc);
    document.addEventListener("keydown", handleShiftDown);
    document.addEventListener("keyup", handleShiftUp);
    document.addEventListener("mousedown", handleShiftClick);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("keydown", handleShiftDown);
      document.removeEventListener("keyup", handleShiftUp);
      document.removeEventListener("mousedown", handleShiftClick);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [pushChip, setOpen, setInputFocused, shiftHeld, open]);

  const getChatRoot = () => {
    let chatRoot = document.getElementById("chat-root");
    if (!chatRoot) {
      chatRoot = document.createElement("div");
      chatRoot.id = "chat-root";
      document.body.appendChild(chatRoot);
    }
    return chatRoot;
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? <ChatDock key="chat-dock" /> : <ChatLauncher key="chat-launcher" />}
    </AnimatePresence>,
    getChatRoot()
  );
}
