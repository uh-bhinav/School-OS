// ============================================================================
// TASK TIMELINE COMPONENT
// ============================================================================
// Displays the timeline/history of a task's status changes
// ============================================================================

import { Box, Typography, Avatar } from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import type { TaskStatusHistory } from "../../mockDataProviders/mockTasks";

interface TaskTimelineProps {
  history: TaskStatusHistory[];
}

const getTimelineIcon = (status: string) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("completed")) {
    return <CheckCircleIcon sx={{ fontSize: 18, color: "white" }} />;
  }
  if (lowerStatus.includes("ongoing") || lowerStatus.includes("viewed")) {
    return <VisibilityIcon sx={{ fontSize: 18, color: "white" }} />;
  }
  if (lowerStatus.includes("assigned")) {
    return <AssignmentIcon sx={{ fontSize: 18, color: "white" }} />;
  }
  return <PendingIcon sx={{ fontSize: 18, color: "white" }} />;
};

const getTimelineColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("completed")) {
    return "success.main";
  }
  if (lowerStatus.includes("ongoing") || lowerStatus.includes("viewed")) {
    return "info.main";
  }
  if (lowerStatus.includes("assigned") || lowerStatus.includes("pending")) {
    return "primary.main";
  }
  return "grey.500";
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function TaskTimeline({ history }: TaskTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No timeline history available
        </Typography>
      </Box>
    );
  }

  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Box sx={{ position: "relative" }}>
      {sortedHistory.map((item, index) => (
        <Box
          key={`${item.timestamp}-${index}`}
          sx={{
            display: "flex",
            gap: 2,
            pb: index === sortedHistory.length - 1 ? 0 : 3,
            position: "relative",
          }}
        >
          {/* Timeline connector line */}
          {index !== sortedHistory.length - 1 && (
            <Box
              sx={{
                position: "absolute",
                left: 16,
                top: 36,
                bottom: 0,
                width: 2,
                bgcolor: "divider",
              }}
            />
          )}

          {/* Icon */}
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: getTimelineColor(item.status),
              zIndex: 1,
            }}
          >
            {getTimelineIcon(item.status)}
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {item.status}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {formatDateTime(item.timestamp)}
              {item.actor && ` • by ${item.actor}`}
            </Typography>
            {item.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  p: 1.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  borderLeft: 3,
                  borderLeftColor: getTimelineColor(item.status),
                }}
              >
                {item.description}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
