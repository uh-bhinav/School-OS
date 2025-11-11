// routes/academics/attendance/AttendanceRoute.tsx
import { Navigate } from "react-router-dom";
import AttendancePage from "./AttendancePage";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useConfigStore } from "../../../stores/useConfigStore";

export default function AttendanceRoute() {
  const role = useAuthStore(s=>s.role);
  const cfg = useConfigStore(s=>s.config);
  const hasModule = cfg?.modules.subscribed.includes("academics.attendance");
  if (role !== "admin" || !hasModule) return <Navigate to="/" replace />;
  return <AttendancePage />;
}
