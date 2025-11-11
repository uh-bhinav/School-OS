import { Navigate } from "react-router-dom";
import ExamsPage from "./ExamsPage";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useConfigStore } from "../../../stores/useConfigStore";

export default function ExamsRoute() {
  const role = useAuthStore(s => s.role);
  const cfg = useConfigStore(s => s.config);
  const enabled = cfg?.modules.subscribed.includes("academics.exams");

  if (!enabled || (role !== "admin" && role !== "teacher")) {
    return <Navigate to="/" replace />;
  }

  return <ExamsPage />;
}
