// ============================================================================
// LEAVE MANAGEMENT KPI CARDS COMPONENT
// ============================================================================
// Displays KPI metrics for Leave Management dashboard
// ============================================================================

import { Paper, Typography, Box, Tooltip, alpha, Skeleton } from "@mui/material";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import type { LeaveManagementKPIs } from "../../services/leaveManagement.schema";

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "warning" | "success" | "error" | "info";
  tooltip: string;
  loading?: boolean;
}

function KPICard({ title, value, icon, color, tooltip, loading }: KPICardProps) {
  const colorMap = {
    warning: {
      bg: "warning.light",
      text: "warning.dark",
      iconBg: "warning.main",
    },
    success: {
      bg: "success.light",
      text: "success.dark",
      iconBg: "success.main",
    },
    error: {
      bg: "error.light",
      text: "error.dark",
      iconBg: "error.main",
    },
    info: {
      bg: "info.light",
      text: "info.dark",
      iconBg: "info.main",
    },
  };

  const colors = colorMap[color];

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={36} />
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          transition: "all 0.3s ease",
          cursor: "default",
          "&:hover": {
            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
            transform: "translateY(-2px)",
            borderColor: `${color}.main`,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
              color: colors.iconBg,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={colors.text}>
              {value}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Tooltip>
  );
}

interface LeaveManagementKPIProps {
  kpis?: LeaveManagementKPIs;
  loading?: boolean;
}

export default function LeaveManagementKPI({ kpis, loading }: LeaveManagementKPIProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 2,
      }}
    >
      <KPICard
        title="Pending Requests"
        value={kpis?.pendingRequests ?? 0}
        icon={<PendingActionsIcon />}
        color="warning"
        tooltip="Number of leave requests awaiting approval"
        loading={loading}
      />
      <KPICard
        title="Approved Leaves Today"
        value={kpis?.approvedLeavesToday ?? 0}
        icon={<CheckCircleOutlineIcon />}
        color="success"
        tooltip="Leave requests approved for today"
        loading={loading}
      />
      <KPICard
        title="Teachers Absent Today"
        value={kpis?.teachersAbsentToday ?? 0}
        icon={<PersonOffIcon />}
        color="error"
        tooltip="Number of teachers on approved leave today"
        loading={loading}
      />
      <KPICard
        title="Proxy Assignments Pending"
        value={kpis?.proxyAssignmentsPending ?? 0}
        icon={<AssignmentIndIcon />}
        color="info"
        tooltip="Approved leaves that need substitute teacher assignment"
        loading={loading}
      />
    </Box>
  );
}
