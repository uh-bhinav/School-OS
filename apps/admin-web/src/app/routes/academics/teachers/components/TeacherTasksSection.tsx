// ============================================================================
// TEACHER TASKS SECTION COMPONENT
// ============================================================================
// Displays tasks assigned to a specific teacher in TeacherDetailPage
// ============================================================================

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTeacherTasks, useTeacherTaskStats, useTaskStatusHistory } from "@/app/services/tasks.hooks";
import TaskDetailsModal from "@/app/components/taskManager/TaskDetailsModal";
import type { Task, TaskStatus } from "@/app/mockDataProviders/mockTasks";

interface TeacherTasksSectionProps {
  teacherId: number;
}

const getStatusColor = (status: TaskStatus): "warning" | "info" | "success" => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "ONGOING":
      return "info";
    case "COMPLETED":
      return "success";
    default:
      return "warning";
  }
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isOverdue = (deadline: string, status: TaskStatus): boolean => {
  if (status === "COMPLETED") return false;
  const today = new Date().toISOString().split("T")[0];
  return deadline < today;
};

export default function TeacherTasksSection({ teacherId }: TeacherTasksSectionProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { data: tasks = [], isLoading: isLoadingTasks, error: tasksError } = useTeacherTasks(teacherId);
  const { data: stats, isLoading: isLoadingStats } = useTeacherTaskStats(teacherId);
  const { data: statusHistory = [], isLoading: isLoadingHistory } = useTaskStatusHistory(
    selectedTask?.taskId ?? ""
  );

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedTask(null);
  };

  if (tasksError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load tasks. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ flex: "1 1 calc(25% - 12px)", minWidth: 140 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              {isLoadingStats ? (
                <Skeleton variant="text" width={40} height={40} sx={{ mx: "auto" }} />
              ) : (
                <Typography variant="h4" fontWeight={600} color="primary.main">
                  {stats?.totalAssigned ?? 0}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Total Assigned
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: "1 1 calc(25% - 12px)", minWidth: 140 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              {isLoadingStats ? (
                <Skeleton variant="text" width={40} height={40} sx={{ mx: "auto" }} />
              ) : (
                <Typography variant="h4" fontWeight={600} color="warning.main">
                  {stats?.pending ?? 0}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                <PendingActionsIcon fontSize="small" color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: "1 1 calc(25% - 12px)", minWidth: 140 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              {isLoadingStats ? (
                <Skeleton variant="text" width={40} height={40} sx={{ mx: "auto" }} />
              ) : (
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {stats?.completed ?? 0}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                <CheckCircleIcon fontSize="small" color="success" />
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: "1 1 calc(25% - 12px)", minWidth: 140 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              {isLoadingStats ? (
                <Skeleton variant="text" width={40} height={40} sx={{ mx: "auto" }} />
              ) : (
                <Typography variant="h4" fontWeight={600} color="error.main">
                  {stats?.overdue ?? 0}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                <WarningAmberIcon fontSize="small" color="error" />
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tasks Table */}
      <Paper variant="outlined">
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Assigned Tasks
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingTasks ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width={200} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                  </TableRow>
                ))
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No tasks assigned to this teacher
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => {
                  const overdue = isOverdue(task.deadline, task.status);
                  return (
                    <TableRow
                      key={task.taskId}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleViewTask(task)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: "block" }}>
                            {task.description.substring(0, 60)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={task.target} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Chip
                            label={task.status}
                            color={getStatusColor(task.status)}
                            size="small"
                          />
                          {overdue && (
                            <Tooltip title="Overdue">
                              <WarningAmberIcon color="error" fontSize="small" />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={overdue ? "error.main" : "text.primary"}
                        >
                          {formatDate(task.deadline)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTask(task);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={isDetailsModalOpen}
        onClose={handleCloseDetails}
        task={selectedTask}
        isLoading={isLoadingHistory}
        statusHistory={statusHistory}
      />
    </Box>
  );
}
