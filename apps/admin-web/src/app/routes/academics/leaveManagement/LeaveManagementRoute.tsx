// ============================================================================
// LEAVE MANAGEMENT ROUTE
// ============================================================================
// Route guard for Leave Management page
// ============================================================================

import { Navigate } from "react-router-dom";
import LeaveManagementPage from "./LeaveManagementPage";
import { useAuthStore } from "../../../stores/useAuthStore";

export default function LeaveManagementRoute() {
  const role = useAuthStore((s) => s.role);

  // Only allow admins
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <LeaveManagementPage />;
}
