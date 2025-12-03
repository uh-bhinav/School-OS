import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  InputAdornment,
  Skeleton,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Today as TodayIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  EventBusy as EventBusyIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAllDepartments,
  useAllStaff,
  useStaffAttendanceForDate,
  useCreateStaffAttendance,
  useUpdateStaffAttendance,
  useStaffAttendanceStats,
} from "../../../services/hr.hooks";
import type {
  Department,
  Staff,
  StaffAttendance,
  StaffAttendanceStatus,
  StaffAttendanceCreate,
} from "../../../services/hr.schema";

const attendanceStatuses: StaffAttendanceStatus[] = [
  "Present",
  "Absent",
  "Half Day",
  "Late Arrival",
  "Early Departure",
  "On Leave",
];

const getStatusColor = (status: StaffAttendanceStatus): "success" | "error" | "warning" | "info" | "default" => {
  switch (status) {
    case "Present":
      return "success";
    case "Absent":
      return "error";
    case "Half Day":
    case "Late Arrival":
    case "Early Departure":
      return "warning";
    case "On Leave":
      return "info";
    default:
      return "default";
  }
};

const getStatusIcon = (status: StaffAttendanceStatus) => {
  switch (status) {
    case "Present":
      return <CheckCircleIcon fontSize="small" />;
    case "Absent":
      return <CancelIcon fontSize="small" />;
    case "Half Day":
    case "Late Arrival":
    case "Early Departure":
      return <ScheduleIcon fontSize="small" />;
    case "On Leave":
      return <EventBusyIcon fontSize="small" />;
    default:
      return null;
  }
};

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    Teaching: "#2196f3",
    "Non-Teaching": "#9c27b0",
    Administration: "#607d8b",
    Support: "#795548",
    Management: "#f44336",
  };
  return colors[role] || "#757575";
};

export function StaffAttendancePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [attendanceChanges, setAttendanceChanges] = useState<Map<number, { status: StaffAttendanceStatus; remarks: string; checkIn?: string; checkOut?: string }>>(new Map());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: departments = [] } = useAllDepartments();
  const { data: allStaff = [], isLoading: staffLoading } = useAllStaff();
  const { data: attendanceRecords = [], isLoading: attendanceLoading, refetch: refetchAttendance } = useStaffAttendanceForDate(selectedDate);
  const { data: attendanceStats } = useStaffAttendanceStats(selectedDate);
  const createAttendanceMutation = useCreateStaffAttendance();
  const updateAttendanceMutation = useUpdateStaffAttendance();

  // Filter staff based on filters
  const filteredStaff = useMemo(() => {
    let result = [...allStaff].filter((s: Staff) => s.is_active);

    if (selectedDepartment !== "all") {
      result = result.filter((s: Staff) => s.department_id?.toString() === selectedDepartment);
    }

    if (selectedRole !== "all") {
      result = result.filter((s: Staff) => s.role === selectedRole);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s: Staff) =>
        s.full_name.toLowerCase().includes(query) ||
        s.employee_id.toLowerCase().includes(query) ||
        s.designation.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allStaff, selectedDepartment, selectedRole, searchQuery]);

  // Get attendance record for a staff member
  const getAttendanceForStaff = (staffId: number): StaffAttendance | undefined => {
    return attendanceRecords.find((a: StaffAttendance) => a.staff_id === staffId);
  };

  // Get current attendance status (from changes or existing record)
  const getCurrentStatus = (staffId: number): StaffAttendanceStatus => {
    if (attendanceChanges.has(staffId)) {
      return attendanceChanges.get(staffId)!.status;
    }
    const record = getAttendanceForStaff(staffId);
    return record?.status || "Present";
  };

  const getCurrentRemarks = (staffId: number): string => {
    if (attendanceChanges.has(staffId)) {
      return attendanceChanges.get(staffId)!.remarks;
    }
    const record = getAttendanceForStaff(staffId);
    return record?.remarks || "";
  };

  const getCurrentCheckIn = (staffId: number): string => {
    if (attendanceChanges.has(staffId)) {
      return attendanceChanges.get(staffId)!.checkIn || "";
    }
    const record = getAttendanceForStaff(staffId);
    return record?.check_in_time || "";
  };

  const getCurrentCheckOut = (staffId: number): string => {
    if (attendanceChanges.has(staffId)) {
      return attendanceChanges.get(staffId)!.checkOut || "";
    }
    const record = getAttendanceForStaff(staffId);
    return record?.check_out_time || "";
  };

  // Handle attendance change
  const handleAttendanceChange = (staffId: number, status: StaffAttendanceStatus) => {
    const current = attendanceChanges.get(staffId) || {
      status: getCurrentStatus(staffId),
      remarks: getCurrentRemarks(staffId),
      checkIn: getCurrentCheckIn(staffId),
      checkOut: getCurrentCheckOut(staffId),
    };
    setAttendanceChanges(prev => {
      const next = new Map(prev);
      next.set(staffId, { ...current, status });
      return next;
    });
  };

  const handleRemarksChange = (staffId: number, remarks: string) => {
    const current = attendanceChanges.get(staffId) || {
      status: getCurrentStatus(staffId),
      remarks: getCurrentRemarks(staffId),
      checkIn: getCurrentCheckIn(staffId),
      checkOut: getCurrentCheckOut(staffId),
    };
    setAttendanceChanges(prev => {
      const next = new Map(prev);
      next.set(staffId, { ...current, remarks });
      return next;
    });
  };

  const handleCheckInChange = (staffId: number, checkIn: string) => {
    const current = attendanceChanges.get(staffId) || {
      status: getCurrentStatus(staffId),
      remarks: getCurrentRemarks(staffId),
      checkIn: getCurrentCheckIn(staffId),
      checkOut: getCurrentCheckOut(staffId),
    };
    setAttendanceChanges(prev => {
      const next = new Map(prev);
      next.set(staffId, { ...current, checkIn });
      return next;
    });
  };

  const handleCheckOutChange = (staffId: number, checkOut: string) => {
    const current = attendanceChanges.get(staffId) || {
      status: getCurrentStatus(staffId),
      remarks: getCurrentRemarks(staffId),
      checkIn: getCurrentCheckIn(staffId),
      checkOut: getCurrentCheckOut(staffId),
    };
    setAttendanceChanges(prev => {
      const next = new Map(prev);
      next.set(staffId, { ...current, checkOut });
      return next;
    });
  };

  // Save all attendance changes
  const handleSaveAttendance = async () => {
    if (attendanceChanges.size === 0) {
      setSnackbar({ open: true, message: "No changes to save", severity: "info" as "success" });
      return;
    }

    try {
      const promises: Promise<StaffAttendance>[] = [];

      for (const [staffId, { status, remarks }] of attendanceChanges.entries()) {
        const existingRecord = getAttendanceForStaff(staffId);

        if (existingRecord) {
          promises.push(
            updateAttendanceMutation.mutateAsync({
              attendanceId: existingRecord.attendance_id,
              patch: { status, remarks: remarks || undefined },
            })
          );
        } else {
          const data: StaffAttendanceCreate = {
            staff_id: staffId,
            date: selectedDate,
            status,
            remarks: remarks || undefined,
          };
          promises.push(createAttendanceMutation.mutateAsync(data));
        }
      }

      await Promise.all(promises);

      setAttendanceChanges(new Map());
      refetchAttendance();
      setSnackbar({
        open: true,
        message: `Successfully saved attendance for ${attendanceChanges.size} staff members`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to save attendance:", error);
      setSnackbar({
        open: true,
        message: "Failed to save attendance. Please try again.",
        severity: "error",
      });
    }
  };

  // Mark all as present
  const handleMarkAllPresent = () => {
    const changes = new Map<number, { status: StaffAttendanceStatus; remarks: string; checkIn?: string; checkOut?: string }>();
    filteredStaff.forEach((staff: Staff) => {
      changes.set(staff.staff_id, { status: "Present", remarks: "", checkIn: "09:00", checkOut: "" });
    });
    setAttendanceChanges(changes);
  };

  const isLoading = staffLoading || attendanceLoading;
  const hasChanges = attendanceChanges.size > 0;
  const isSaving = createAttendanceMutation.isPending || updateAttendanceMutation.isPending;

  const stats = attendanceStats || {
    total: allStaff.length,
    present: 0,
    absent: 0,
    on_leave: 0,
    late_arrival: 0,
  };

  const onLeaveCount = 'on_leave' in stats ? stats.on_leave : ('onLeave' in stats ? (stats as { onLeave: number }).onLeave : 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Staff Attendance</Typography>
          <Typography variant="body2" color="text.secondary">
            Mark and manage daily staff attendance
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleMarkAllPresent}
            disabled={filteredStaff.length === 0}
          >
            Mark All Present
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleSaveAttendance}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : `Save Changes (${attendanceChanges.size})`}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
              <Typography variant="body2">Total Staff</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: "success.main", color: "success.contrastText" }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold">{stats.present}</Typography>
              <Typography variant="body2">Present</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: "error.main", color: "error.contrastText" }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold">{stats.absent}</Typography>
              <Typography variant="body2">Absent</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: "info.main", color: "info.contrastText" }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold">{onLeaveCount}</Typography>
              <Typography variant="body2">On Leave</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setAttendanceChanges(new Map());
                }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TodayIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map((dept: Department) => (
                    <MenuItem key={dept.department_id} value={dept.department_id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="Teaching">Teaching</MenuItem>
                  <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
                  <MenuItem value="Administration">Administration</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      {isLoading ? (
        <Card>
          <CardContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} height={72} sx={{ mb: 1 }} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, minWidth: 280 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 130 }}>Check In</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 130 }}>Check Out</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff.map((staff: Staff) => {
                  const department = departments.find((d: Department) => d.department_id === staff.department_id);
                  const currentStatus = getCurrentStatus(staff.staff_id);
                  const currentRemarks = getCurrentRemarks(staff.staff_id);
                  const currentCheckIn = getCurrentCheckIn(staff.staff_id);
                  const currentCheckOut = getCurrentCheckOut(staff.staff_id);
                  const hasChange = attendanceChanges.has(staff.staff_id);

                  return (
                    <TableRow
                      key={staff.staff_id}
                      sx={{
                        bgcolor: hasChange ? "action.selected" : undefined,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  bgcolor: staff.employment_status === "Active" ? "success.main" : "warning.main",
                                  border: "2px solid white",
                                }}
                              />
                            }
                          >
                            <Avatar
                              src={staff.profile_photo_url}
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: getRoleColor(staff.role),
                              }}
                            >
                              {staff.first_name[0]}{staff.last_name[0]}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {staff.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {staff.designation}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="caption" color="text.disabled">
                                {staff.employee_id}
                              </Typography>
                              <Chip
                                label={staff.role}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.65rem",
                                  bgcolor: getRoleColor(staff.role),
                                  color: "white",
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {department?.name || "-"}
                          </Typography>
                          {staff.subjects && staff.subjects.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {staff.subjects.slice(0, 2).join(", ")}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <Select
                            value={currentStatus}
                            onChange={(e) => handleAttendanceChange(staff.staff_id, e.target.value as StaffAttendanceStatus)}
                            sx={{
                              "& .MuiSelect-select": {
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              },
                            }}
                          >
                            {attendanceStatuses.map(status => (
                              <MenuItem key={status} value={status}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Chip
                                    size="small"
                                    label={status}
                                    color={getStatusColor(status)}
                                    icon={getStatusIcon(status) as React.ReactElement}
                                    sx={{ "& .MuiChip-label": { px: 0.5 } }}
                                  />
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="time"
                          value={currentCheckIn}
                          onChange={(e) => handleCheckInChange(staff.staff_id, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 130 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="time"
                          value={currentCheckOut}
                          onChange={(e) => handleCheckOutChange(staff.staff_id, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccessTimeIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 130 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Add remarks..."
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(staff.staff_id, e.target.value)}
                          sx={{ width: 170 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Email">
                            <IconButton
                              size="small"
                              onClick={() => window.location.href = `mailto:${staff.email}`}
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Profile">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/hr/staff/${staff.staff_id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredStaff.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                No staff members found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StaffAttendancePage;
