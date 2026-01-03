// ============================================================================
// SCHOOL SIDE PANEL - Details Panel for Map View
// ============================================================================
// Slides in from right on marker click:
// - School Name, Region
// - Attendance %, Fee Collection %
// - Health Status badge
// - One CTA: "View School" → navigates to /schools/{school-id}
// Read-only inspection surface.
// ============================================================================

import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  alpha,
  Slide,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  People as StudentsIcon,
  CalendarToday as AttendanceIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useThemeMode } from "../../providers/ThemeProvider";
import type { School } from "../../mockDataProviders/mockSuperAdmin";

interface SchoolSidePanelProps {
  school: School | null;
  onClose: () => void;
}

// Status chip configuration
const statusConfig: Record<School["status"], { color: "success" | "warning" | "error"; label: string }> = {
  healthy: { color: "success", label: "Healthy" },
  attention: { color: "warning", label: "Watchlist" },
  critical: { color: "error", label: "Needs Attention" },
};

export default function SchoolSidePanel({ school, onClose }: SchoolSidePanelProps) {
  const { mode } = useThemeMode();
  const navigate = useNavigate();

  const handleViewSchool = () => {
    if (school) {
      navigate(`/group-overview/schools/${school.id}`);
    }
  };

  // Close panel when clicking outside (on the overlay)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!school) return null;

  const { color, label } = statusConfig[school.status];

  return (
    <>
      {/* Semi-transparent overlay - clicking closes panel */}
      <Box
        onClick={handleOverlayClick}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "transparent",
          zIndex: 10,
          pointerEvents: school ? "auto" : "none",
        }}
      />

      {/* Sliding panel */}
      <Slide direction="left" in={!!school} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bottom: 16,
            width: 340,
            maxWidth: "calc(100% - 32px)",
            zIndex: 20,
            borderRadius: 2,
            backgroundColor: mode === "dark" ? "#1e1e3f" : "#fff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: mode === "dark"
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              borderBottom: `1px solid ${mode === "dark" ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
            }}
          >
            <Box sx={{ flex: 1, pr: 1 }}>
              <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.3, mb: 0.5 }}>
                {school.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {school.city}, {school.region} Region
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: mode === "dark" ? alpha("#fff", 0.1) : alpha("#000", 0.06),
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Health Status Badge */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Chip
                label={label}
                color={color}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 2,
                  py: 2.5,
                }}
              />
            </Box>

            <Divider sx={{ borderColor: mode === "dark" ? alpha("#fff", 0.08) : alpha("#000", 0.06) }} />

            {/* Metrics */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Students */}
              <MetricRow
                icon={<StudentsIcon />}
                label="Total Students"
                value={school.totalStudents.toLocaleString()}
                mode={mode}
              />

              {/* Attendance */}
              <MetricRow
                icon={<AttendanceIcon />}
                label="Attendance"
                value={`${school.avgAttendance.toFixed(1)}%`}
                valueColor={
                  school.avgAttendance >= 90
                    ? "#4caf50"
                    : school.avgAttendance >= 80
                      ? "#ff9800"
                      : "#f44336"
                }
                mode={mode}
              />

              {/* Fee Collection */}
              <MetricRow
                icon={<MoneyIcon />}
                label="Fee Collection"
                value={`${school.feeCollectionRate}%`}
                valueColor={
                  school.feeCollectionRate >= 85
                    ? "#4caf50"
                    : school.feeCollectionRate >= 70
                      ? "#ff9800"
                      : "#f44336"
                }
                mode={mode}
              />
            </Box>
          </Box>

          {/* Footer - CTA Button */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${mode === "dark" ? alpha("#fff", 0.1) : alpha("#000", 0.08)}`,
            }}
          >
            <Button
              variant="contained"
              fullWidth
              endIcon={<ArrowIcon />}
              onClick={handleViewSchool}
              sx={{
                py: 1.25,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 1.5,
              }}
            >
              View School
            </Button>
          </Box>
        </Paper>
      </Slide>
    </>
  );
}

// Helper component for metric rows
interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  mode: "light" | "dark";
}

function MetricRow({ icon, label, value, valueColor, mode }: MetricRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.25,
        borderRadius: 1.5,
        backgroundColor: mode === "dark" ? alpha("#fff", 0.05) : alpha("#000", 0.03),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        fontWeight={600}
        sx={{ color: valueColor || "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );
}
