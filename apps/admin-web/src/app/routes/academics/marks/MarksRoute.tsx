import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";

export default function MarksRoute() {
  const { role } = useAuthStore();
  if (!role || !["admin", "teacher"].includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
