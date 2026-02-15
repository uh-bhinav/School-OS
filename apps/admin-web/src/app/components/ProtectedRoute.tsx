// ============================================================================
// PROTECTED ROUTE - Route guard component for authenticated routes
// ============================================================================
// This component wraps routes that require authentication.
// It handles:
// - Redirect to login if not authenticated
// - Role-based access control
// - Loading states during auth verification
//
// USAGE:
//   <Route path="/dashboard" element={
//     <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
//       <Dashboard />
//     </ProtectedRoute>
//   } />
// ============================================================================

import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuthStore } from "../stores/useAuthStore";

type Role = "super_admin" | "admin" | "teacher" | "student" | "parent";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to access this route. If empty, any authenticated user can access. */
  allowedRoles?: Role[];
  /** Custom redirect path when unauthorized. Defaults to /auth/login */
  redirectTo?: string;
  /** Custom redirect for role mismatch. Defaults to / for non-super_admin, /group-overview for super_admin */
  roleRedirect?: string;
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * @example
 * // Allow only admin and super_admin
 * <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Allow any authenticated user
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/auth/login",
  roleRedirect,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth state from Zustand store
  const { role, schoolId, userId } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    // ========================================================================
    // AUTH CHECK - Redirect to login if not authenticated
    // ========================================================================
    if (!isAuthenticated || !role || !schoolId || !userId) {
      console.log("[PROTECTED ROUTE] ❌ Not authenticated - redirecting to:", redirectTo);
      navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname } // Save intended destination
      });
      return;
    }

    // ========================================================================
    // ROLE CHECK - Verify user has required role
    // ========================================================================
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      console.log("[PROTECTED ROUTE] ⚠️ Role mismatch:", {
        userRole: role,
        allowedRoles,
      });

      // Determine redirect based on role
      const targetRedirect = roleRedirect || (role === "super_admin" ? "/group-overview" : "/");

      console.log("[PROTECTED ROUTE] 🔄 Redirecting to:", targetRedirect);
      navigate(targetRedirect, { replace: true });
      return;
    }

    console.log("[PROTECTED ROUTE] ✅ Access granted:", {
      role,
      schoolId,
      path: location.pathname,
    });
  }, [isAuthenticated, role, schoolId, userId, allowedRoles, navigate, location, redirectTo, roleRedirect]);

  // ========================================================================
  // LOADING STATE - Show spinner while checking auth
  // ========================================================================
  if (!isAuthenticated || !role || !schoolId || !userId) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // ========================================================================
  // ROLE MISMATCH - Show access denied briefly before redirect
  // ========================================================================
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="error">
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You don't have permission to access this page. Redirecting...
        </Typography>
      </Box>
    );
  }

  // ========================================================================
  // AUTHORIZED - Render children
  // ========================================================================
  return <>{children}</>;
}

/**
 * AdminRoute - Shorthand for routes requiring admin role
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * SuperAdminRoute - Shorthand for routes requiring super_admin role
 */
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["super_admin"]} roleRedirect="/">
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
