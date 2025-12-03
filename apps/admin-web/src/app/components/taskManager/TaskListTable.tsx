// ============================================================================
// TASK LIST TABLE COMPONENT
// ============================================================================
// Displays a table of tasks with filtering and actions
// ============================================================================

import { useState, useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  alpha,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TaskFilters from "./TaskFilters";
import type { Task, TaskStatus } from "../../mockDataProviders/mockTasks";

interface TaskListTableProps {
  tasks: Task[];
  loading?: boolean;
  onViewTask: (task: Task) => void;
}

// Status chip colors
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

// Format date for display
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Check if task is overdue
const isOverdue = (deadline: string, status: TaskStatus): boolean => {
  if (status === "COMPLETED") return false;
  const today = new Date().toISOString().split("T")[0];
  return deadline < today;
};

// Check if task is due today
const isDueToday = (deadline: string): boolean => {
  const today = new Date().toISOString().split("T")[0];
  return deadline === today;
};

export default function TaskListTable({
  tasks,
  loading,
  onViewTask,
}: TaskListTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [targetFilter, setTargetFilter] = useState<string>("ALL");
  const [orderBy, setOrderBy] = useState<keyof Task>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Apply target filter
    if (targetFilter !== "ALL") {
      filtered = filtered.filter((t) => t.target === targetFilter || t.target === "General");
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, targetFilter, orderBy, order]);

  const handleSort = (property: keyof Task) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTargetFilter("ALL");
    setPage(0);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableCell key={i}>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
      }}
    >
      {/* Filters Bar */}
      <TaskFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        targetFilter={targetFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onTargetChange={setTargetFilter}
        onClearFilters={handleClearFilters}
        resultCount={filteredTasks.length}
      />

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "title"}
                  direction={orderBy === "title" ? order : "asc"}
                  onClick={() => handleSort("title")}
                >
                  Task Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "assignedDate"}
                  direction={orderBy === "assignedDate" ? order : "asc"}
                  onClick={() => handleSort("assignedDate")}
                >
                  Assigned Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "deadline"}
                  direction={orderBy === "deadline" ? order : "asc"}
                  onClick={() => handleSort("deadline")}
                >
                  Deadline
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "target"}
                  direction={orderBy === "target" ? order : "asc"}
                  onClick={() => handleSort("target")}
                >
                  Target
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <FilterListIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                    <Typography variant="h6" color="text.secondary">
                      No tasks found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Try adjusting your search or filter criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((task) => {
                  const overdue = isOverdue(task.deadline, task.status);
                  const dueToday = isDueToday(task.deadline);

                  return (
                    <TableRow
                      key={task.taskId}
                      hover
                      sx={{
                        cursor: "pointer",
                        bgcolor: overdue ? (theme) => alpha(theme.palette.error.main, 0.04) : undefined,
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                      onClick={() => onViewTask(task)}
                    >
                      {/* Task Title */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                            }}
                          >
                            <AssignmentIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                maxWidth: 300,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.taskId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Assigned Date */}
                      <TableCell>
                        <Typography variant="body2">{formatDate(task.assignedDate)}</Typography>
                      </TableCell>

                      {/* Deadline */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Typography
                            variant="body2"
                            fontWeight={overdue || dueToday ? 600 : 400}
                            color={overdue ? "error.main" : dueToday ? "warning.main" : "text.primary"}
                          >
                            {formatDate(task.deadline)}
                          </Typography>
                          {overdue && (
                            <Tooltip title="Overdue">
                              <WarningAmberIcon sx={{ fontSize: 16, color: "error.main" }} />
                            </Tooltip>
                          )}
                          {dueToday && !overdue && (
                            <Chip
                              label="Today"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      {/* Target */}
                      <TableCell>
                        <Chip
                          label={task.target}
                          size="small"
                          variant="outlined"
                          color={task.target === "General" ? "primary" : "default"}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={task.status}
                          size="small"
                          color={getStatusColor(task.status)}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewTask(task);
                            }}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              },
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

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredTasks.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}
