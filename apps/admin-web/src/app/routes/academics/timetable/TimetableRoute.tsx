import { Navigate } from "react-router-dom";
import TimetablePage from "./TimetablePage";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useConfigStore } from "../../../stores/useConfigStore";

export default function TimetableRoute() {
  const role = useAuthStore(s => s.role);
  const cfg  = useConfigStore(s => s.config);
  const enabled = cfg?.modules.subscribed.includes("timetable");
  if (role !== "admin" || !enabled) return <Navigate to="/" replace />;
  return <TimetablePage />;
}
