// ============================================================================
// PROXY ASSIGNMENT STRIP COMPONENT
// ============================================================================
// Horizontal strip showing the absent teacher's daily timetable with period chips
// ============================================================================

import {
  Box,
  Typography,
  Chip,
  Paper,
  Tooltip,
  alpha,
  Badge,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import type { LeaveProxyPeriod } from "../../services/leaveManagement.schema";

interface ProxyAssignmentStripProps {
  periods: LeaveProxyPeriod[];
  selectedPeriod: LeaveProxyPeriod | null;
  onSelectPeriod: (period: LeaveProxyPeriod) => void;
}

// Get color for period status
const getStatusColor = (status: LeaveProxyPeriod["status"]) => {
  switch (status) {
    case "NEEDS_PROXY":
      return "warning";
    case "ASSIGNED":
      return "success";
    case "FREE":
      return "default";
    default:
      return "default";
  }
};

// Get icon for period status
const getStatusIcon = (status: LeaveProxyPeriod["status"]) => {
  switch (status) {
    case "NEEDS_PROXY":
      return <PersonSearchIcon sx={{ fontSize: 16 }} />;
    case "ASSIGNED":
      return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    case "FREE":
      return <FreeBreakfastIcon sx={{ fontSize: 16 }} />;
    default:
      return null;
  }
};

export default function ProxyAssignmentStrip({
  periods,
  selectedPeriod,
  onSelectPeriod,
}: ProxyAssignmentStripProps) {
  const needsProxyCount = periods.filter((p) => p.status === "NEEDS_PROXY").length;
  const assignedCount = periods.filter((p) => p.status === "ASSIGNED").length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Daily Timetable
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            size="small"
            icon={<PersonSearchIcon sx={{ fontSize: 14 }} />}
            label={`${needsProxyCount} Needs Proxy`}
            color="warning"
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
            label={`${assignedCount} Assigned`}
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Period Strips */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 1,
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "grey.100",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "grey.300",
            borderRadius: 3,
            "&:hover": {
              bgcolor: "grey.400",
            },
          },
        }}
      >
        {periods.map((period) => {
          const isSelected = selectedPeriod?.periodNo === period.periodNo;
          const isFree = period.status === "FREE";
          const isAssigned = period.status === "ASSIGNED";
          const needsProxy = period.status === "NEEDS_PROXY";

          return (
            <Tooltip
              key={period.periodNo}
              title={
                isFree
                  ? "Free Period - No proxy needed"
                  : isAssigned
                  ? `Assigned to: ${period.substituteTeacherName}`
                  : "Click to assign substitute teacher"
              }
              arrow
            >
              <Box
                onClick={() => {
                  if (!isFree) {
                    onSelectPeriod(period);
                  }
                }}
                sx={{
                  minWidth: 140,
                  p: 1.5,
                  borderRadius: 2,
                  border: (theme) =>
                    `2px solid ${
                      isSelected
                        ? theme.palette.primary.main
                        : isFree
                        ? theme.palette.grey[300]
                        : isAssigned
                        ? theme.palette.success.main
                        : theme.palette.warning.main
                    }`,
                  bgcolor: (theme) =>
                    isSelected
                      ? alpha(theme.palette.primary.main, 0.08)
                      : isFree
                      ? alpha(theme.palette.grey[500], 0.04)
                      : isAssigned
                      ? alpha(theme.palette.success.main, 0.04)
                      : alpha(theme.palette.warning.main, 0.04),
                  cursor: isFree ? "default" : "pointer",
                  opacity: isFree ? 0.6 : 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: isFree ? "none" : "translateY(-2px)",
                    boxShadow: isFree ? "none" : 2,
                  },
                }}
              >
                {/* Period Number */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Period {period.periodNo}
                  </Typography>
                  {getStatusIcon(period.status)}
                </Box>

                {/* Time */}
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {period.startTime}–{period.endTime}
                </Typography>

                {/* Class Info */}
                {!isFree ? (
                  <>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Class {period.classId}
                      {period.section}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isAssigned ? "success.main" : "warning.main",
                        fontWeight: 600,
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {isAssigned ? "✓ Assigned" : "• Needs Proxy"}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    No class scheduled
                  </Typography>
                )}

                {/* Substitute Name (if assigned) */}
                {isAssigned && period.substituteTeacherName && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      color: "success.dark",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    → {period.substituteTeacherName}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          pt: 1.5,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "warning.main",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Needs Proxy
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "success.main",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Substitute Assigned
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "grey.400",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Free Period
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
