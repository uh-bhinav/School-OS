import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useConfigStore } from "../../../stores/useConfigStore";

export default function MarksRoute() {
  const { role } = useAuthStore();
  const cfg = useConfigStore(s => s.config);
  const enabled = cfg?.modules.subscribed.includes("marks");

  if (!role || !["admin", "teacher"].includes(role) || !enabled) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
