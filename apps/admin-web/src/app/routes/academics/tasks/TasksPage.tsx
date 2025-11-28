// ============================================================================
// TASKS PAGE
// ============================================================================
// Main page for Task Manager module - displays KPIs, filters, and task list
// Route: /academics/tasks
// ============================================================================

import { useState, useCallback } from "react";
import { Box, Typography, Button, Paper, Snackbar, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";

import TaskKPIHeader from "../../../components/taskManager/TaskKPIHeader";
import TaskListTable from "../../../components/taskManager/TaskListTable";
import CreateTaskModal from "../../../components/taskManager/CreateTaskModal";
import TaskDetailsModal from "../../../components/taskManager/TaskDetailsModal";

import {
  useTasks,
  useTaskKPIs,
  useCreateTask,
  useTaskStatusHistory,
} from "../../../services/tasks.hooks";
import { useTaskStore } from "../../../stores/useTaskStore";
import { MOCK_TEACHERS } from "../../../mockDataProviders/mockTeachers";
import type { Task } from "../../../mockDataProviders/mockTasks";

export default function TasksPage() {
  // Store state
  const {
    filters,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    isDetailsModalOpen,
    currentTask,
    openDetailsModal,
    closeDetailsModal,
  } = useTaskStore();

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Queries
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks(filters);
  const { data: kpis, isLoading: isLoadingKPIs } = useTaskKPIs();
  const { data: statusHistory = [], isLoading: isLoadingHistory } = useTaskStatusHistory(
    currentTask?.taskId ?? ""
  );

  // Mutations
  const createTaskMutation = useCreateTask();

  // Handlers
  const handleTaskClick = useCallback(
    (task: Task) => {
      openDetailsModal(task);
    },
    [openDetailsModal]
  );

  const handleCreateTask = async (data: Parameters<typeof createTaskMutation.mutateAsync>[0]) => {
    try {
      await createTaskMutation.mutateAsync(data);
      setSnackbar({
        open: true,
        message: "Task created successfully!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to create task. Please try again.",
        severity: "error",
      });
      throw new Error("Create task failed");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Get teacher names for current task
  const getTeacherNames = (teacherIds: number[]): string[] => {
    return teacherIds
      .map((id) => {
        const teacher = MOCK_TEACHERS.find((t) => t.teacher_id === id);
        return teacher ? `${teacher.first_name} ${teacher.last_name}` : null;
      })
      .filter((name): name is string => name !== null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AssignmentIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Task Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage tasks for teachers
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
          sx={{ textTransform: "none" }}
        >
          Create Task
        </Button>
      </Box>

      {/* KPI Cards */}
      <TaskKPIHeader kpis={kpis} loading={isLoadingKPIs} />

      {/* Tasks Table (includes its own filters) */}
      <Paper sx={{ mt: 3, overflow: "hidden" }}>
        <TaskListTable
          tasks={tasks}
          loading={isLoadingTasks}
          onViewTask={handleTaskClick}
        />
      </Paper>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateTask}
        isSubmitting={createTaskMutation.isPending}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={isDetailsModalOpen}
        onClose={closeDetailsModal}
        task={currentTask}
        isLoading={isLoadingHistory}
        teacherNames={currentTask ? getTeacherNames(currentTask.assignedTeacherIds) : []}
        statusHistory={statusHistory}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
