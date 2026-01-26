// ============================================================================
// GROUP OVERVIEW - SUPERADMIN LANDING PAGE
// ============================================================================
// Minimal static landing page for superadmin confirmation.
// Displays user's full name, school name, and role.
// This is a demo-level page - no actual data integrations.
// ============================================================================

import { Box, Paper, Typography, Button, Chip, Divider, alpha } from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { useConfigStore } from "../../stores/useConfigStore";
import { supabase } from "../../services/supabase";

export default function GroupOverview() {
  const navigate = useNavigate();
  const { cachedProfile, role, logout } = useAuthStore();
  const config = useConfigStore((s) => s.config);

  // Extract user info from cached profile
  const firstName = cachedProfile?.first_name ?? "Unknown";
  const lastName = cachedProfile?.last_name ?? "User";
  const fullName = `${firstName} ${lastName}`.trim();
  const schoolName = config?.identity?.display_name ?? "School OS";
  const userId = cachedProfile?.user_id ?? "N/A";

  // Log for debugging
  console.log("[GROUP OVERVIEW] 📋 Displaying superadmin landing page:", {
    fullName,
    schoolName,
    role,
    userId,
  });

  const handleLogout = async () => {
    console.log("[GROUP OVERVIEW] 🚪 Logging out superadmin...");
    try {
      await supabase.auth.signOut();
      logout();
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("[GROUP OVERVIEW] ❌ Logout failed:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 500,
          width: "100%",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        {/* Success Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
              color: "success.main",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome, Super Admin!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You have successfully logged in to the Group Overview portal.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* User Information */}
        <Box sx={{ textAlign: "left", mb: 4 }}>
          {/* Full Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <PersonIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {fullName}
              </Typography>
            </Box>
          </Box>

          {/* School Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <SchoolIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                School / Organization
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {schoolName}
              </Typography>
            </Box>
          </Box>

          {/* Role */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AdminIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={role?.replace("_", " ").toUpperCase() ?? "UNKNOWN"}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Info Message */}
        <Box
          sx={{
            p: 2,
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            This is the Group Overview landing page for super administrators.
            Full dashboard features will be available in future releases.
          </Typography>
        </Box>

        {/* Logout Button */}
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
          sx={{
            py: 1.5,
            borderColor: "divider",
            "&:hover": {
              borderColor: "error.main",
              color: "error.main",
            },
          }}
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
}
