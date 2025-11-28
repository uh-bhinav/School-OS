// ============================================================================
// LEAVE REQUEST TABLE COMPONENT
// ============================================================================
// Displays a table of leave requests with filtering and actions
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
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Skeleton,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import type { LeaveRequest, LeaveStatus, LeaveType } from "../../services/leaveManagement.schema";

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  loading?: boolean;
  onViewRequest: (request: LeaveRequest) => void;
}

// Status chip colors
const getStatusColor = (status: LeaveStatus): "warning" | "success" | "error" => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "warning";
  }
};

// Leave type display names
const getLeaveTypeLabel = (type: LeaveType): string => {
  const labels: Record<LeaveType, string> = {
    CASUAL: "Casual Leave",
    SICK: "Sick Leave",
    EMERGENCY: "Emergency",
    MATERNITY: "Maternity",
    PATERNITY: "Paternity",
    NATIONAL_DUTY: "National Duty",
    SCHOOL_EVENT: "School Event",
    PERSONAL: "Personal",
    STUDY: "Study Leave",
    BEREAVEMENT: "Bereavement",
  };
  return labels[type] || type;
};

// Format date for display
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function LeaveRequestTable({
  requests,
  loading,
  onViewRequest,
}: LeaveRequestTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL");
  const [orderBy, setOrderBy] = useState<keyof LeaveRequest>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.teacherName.toLowerCase().includes(query) ||
          r.subject.toLowerCase().includes(query) ||
          r.reasonSummary.toLowerCase().includes(query) ||
          r.employeeCode.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((r) => r.status === statusFilter);
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
  }, [requests, searchQuery, statusFilter, orderBy, order]);

  const handleSort = (property: keyof LeaveRequest) => {
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
      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name, subject, or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 280, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | "ALL")}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
          {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "teacherName"}
                  direction={orderBy === "teacherName" ? order : "asc"}
                  onClick={() => handleSort("teacherName")}
                >
                  Teacher
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "fromDate"}
                  direction={orderBy === "fromDate" ? order : "asc"}
                  onClick={() => handleSort("fromDate")}
                >
                  Leave Dates
                </TableSortLabel>
              </TableCell>
              <TableCell>Reason</TableCell>
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
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <FilterListIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                    <Typography variant="h6" color="text.secondary">
                      No leave requests found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Try adjusting your search or filter criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((request) => (
                  <TableRow
                    key={request.leaveId}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                    onClick={() => onViewRequest(request)}
                  >
                    {/* Teacher Column */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "primary.main",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(request.teacherName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {request.teacherName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.subject} • {request.employeeCode}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Leave Dates Column */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(request.fromDate)}
                          {request.fromDate !== request.toDate && (
                            <> → {formatDate(request.toDate)}</>
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.totalDays} day{request.totalDays !== 1 ? "s" : ""} •{" "}
                          {getLeaveTypeLabel(request.leaveType)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Reason Column */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 250,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {request.reasonSummary}
                      </Typography>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={request.status}
                          size="small"
                          color={getStatusColor(request.status)}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                        {request.status === "APPROVED" && request.proxyAssigned && (
                          <Tooltip title="Proxy teachers assigned">
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: "success.main" }}
                            />
                          </Tooltip>
                        )}
                        {request.status === "APPROVED" && !request.proxyAssigned && (
                          <Tooltip title="Proxy assignment pending">
                            <PersonSearchIcon
                              sx={{ fontSize: 18, color: "warning.main" }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewRequest(request);
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
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredRequests.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}
