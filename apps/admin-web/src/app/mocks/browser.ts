import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { agentHandlers } from "./agent.handlers";

// ✅ Merge existing handlers with chatbot agent handlers
export const worker = setupWorker(...handlers, ...agentHandlers);
