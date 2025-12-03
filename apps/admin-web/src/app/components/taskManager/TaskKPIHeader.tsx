// ============================================================================
// TASK KPI HEADER COMPONENT
// ============================================================================
// Displays KPI metrics for Task Manager dashboard
// ============================================================================

import { Paper, Typography, Box, Tooltip, alpha, Skeleton } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TodayIcon from "@mui/icons-material/Today";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { TaskKPIs } from "../../mockDataProviders/mockTasks";

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "warning" | "success" | "error" | "info" | "secondary";
  tooltip: string;
  loading?: boolean;
}

function KPICard({ title, value, icon, color, tooltip, loading }: KPICardProps) {
  const colorMap = {
    primary: {
      bg: "primary.light",
      text: "primary.dark",
      iconBg: "primary.main",
    },
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
    secondary: {
      bg: "secondary.light",
      text: "secondary.dark",
      iconBg: "secondary.main",
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

interface TaskKPIHeaderProps {
  kpis?: TaskKPIs;
  loading?: boolean;
}

export default function TaskKPIHeader({ kpis, loading }: TaskKPIHeaderProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(6, 1fr)",
        },
        gap: 2,
      }}
    >
      <KPICard
        title="Total Tasks"
        value={kpis?.totalTasks ?? 0}
        icon={<AssignmentIcon />}
        color="primary"
        tooltip="Total number of tasks assigned"
        loading={loading}
      />
      <KPICard
        title="Pending"
        value={kpis?.pendingTasks ?? 0}
        icon={<PendingActionsIcon />}
        color="warning"
        tooltip="Tasks awaiting action"
        loading={loading}
      />
      <KPICard
        title="Ongoing"
        value={kpis?.ongoingTasks ?? 0}
        icon={<AutorenewIcon />}
        color="info"
        tooltip="Tasks currently in progress"
        loading={loading}
      />
      <KPICard
        title="Completed"
        value={kpis?.completedTasks ?? 0}
        icon={<CheckCircleOutlineIcon />}
        color="success"
        tooltip="Successfully completed tasks"
        loading={loading}
      />
      <KPICard
        title="Due Today"
        value={kpis?.tasksDueToday ?? 0}
        icon={<TodayIcon />}
        color="secondary"
        tooltip="Tasks with deadline today"
        loading={loading}
      />
      <KPICard
        title="Overdue"
        value={kpis?.overdueTask ?? 0}
        icon={<WarningAmberIcon />}
        color="error"
        tooltip="Tasks past their deadline"
        loading={loading}
      />
    </Box>
  );
}
