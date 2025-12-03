// ============================================================================
// TASK DETAILS MODAL COMPONENT
// ============================================================================
// Modal for viewing task details, remarks, and timeline
// ============================================================================

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Paper,
  Avatar,
  Skeleton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import TaskTimeline from "./TaskTimeline";
import type { Task, TaskStatus } from "../../mockDataProviders/mockTasks";

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  // Core task object from list fetch. Note: mock Task does NOT include teacherName or statusHistory.
  task: Task | null;
  isLoading: boolean;
  // Additional data supplied by page/hooks
  teacherNames?: string[]; // list of teacher display names for assignedTeacherIds
  statusHistory?: import("../../mockDataProviders/mockTasks").TaskStatusHistory[];
}

const getStatusColor = (status: TaskStatus): "default" | "warning" | "info" | "success" => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "ONGOING":
      return "info";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isOverdue = (task: Task) => {
  if (task.status === "COMPLETED") return false;
  return new Date(task.deadline) < new Date();
};

export default function TaskDetailsModal({
  open,
  onClose,
  task,
  isLoading,
  teacherNames = [],
  statusHistory = [],
}: TaskDetailsModalProps) {
  const renderLoading = () => (
    <Box sx={{ py: 2 }}>
      <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" />
    </Box>
  );

  const renderContent = () => {
    if (!task) {
      return (
        <Alert severity="error">Task not found</Alert>
      );
    }

    const overdue = isOverdue(task);
    // Map teacher names for display: prefer provided teacherNames, otherwise show count
    const assignedTeachersLabel =
      task.assignedTeacherIds.length === 0
        ? "Unassigned"
        : teacherNames.length > 0
        ? teacherNames.join(", ")
        : `${task.assignedTeacherIds.length} teacher(s)`;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Task Header */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {task.title}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={task.status}
                  color={getStatusColor(task.status)}
                  size="small"
                />
                {overdue && (
                  <Chip
                    label="OVERDUE"
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  icon={<GroupIcon />}
                  label={task.target}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {/* Task Meta Info */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {assignedTeachersLabel}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Deadline
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color={overdue ? "error.main" : "text.primary"}
                  >
                    {formatDate(task.deadline)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Assigned On
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(task.assignedDate)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Description */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
            {task.description}
          </Typography>
        </Box>

        <Divider />

        {/* Admin Remarks */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: "primary.main", fontSize: 12 }}>A</Avatar>
            Admin Remarks
          </Typography>
          {task.adminRemarks ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "primary.50",
                borderColor: "primary.200",
              }}
            >
              <Typography variant="body2">{task.adminRemarks}</Typography>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              No admin remarks provided
            </Typography>
          )}
        </Box>

        {/* Teacher Remarks */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: "secondary.main", fontSize: 12 }}>T</Avatar>
            Teacher Remarks
          </Typography>
          {task.teacherRemarks ? (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: "secondary.50",
                borderColor: "secondary.200",
              }}
            >
              <Typography variant="body2">{task.teacherRemarks}</Typography>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              No teacher remarks yet
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Timeline */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Task Timeline
          </Typography>
          {/* Prefer statusHistory prop; fallback to fetching nothing if absent */}
          <TaskTimeline history={statusHistory ?? []} />
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Task Details
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {isLoading ? renderLoading() : renderContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
