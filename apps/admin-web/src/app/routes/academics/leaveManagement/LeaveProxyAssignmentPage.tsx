// ============================================================================
// LEAVE PROXY ASSIGNMENT PAGE
// ============================================================================
// Page for assigning substitute teachers for an approved leave request
// Route: /academics/leave-management/:leaveId/assign-proxy
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ProxyAssignmentStrip from "../../../components/leaveManagement/ProxyAssignmentStrip";
import SubstituteTeacherList from "../../../components/leaveManagement/SubstituteTeacherList";
import ProxyAssignmentSuccessModal from "../../../components/leaveManagement/ProxyAssignmentSuccessModal";
import {
  useLeaveRequest,
  useTeacherTimetableForLeave,
  useAvailableSubstitutes,
  useAssignLeaveProxy,
  useMarkLeaveProxyComplete,
} from "../../../services/leaveManagement.hooks";
import { useLeaveManagementStore } from "../../../stores/useLeaveManagementStore";
import type {
  LeaveProxyPeriod,
  AvailableSubstituteTeacher,
  LeaveProxyAssignment,
} from "../../../services/leaveManagement.schema";

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Format date for display
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Get all dates between from and to (excluding weekends)
const getWorkingDates = (fromDate: string, toDate: string): string[] => {
  const dates: string[] = [];
  const from = new Date(fromDate);
  const to = new Date(toDate);

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    // Exclude Saturday (6) and Sunday (0)
    if (day !== 0 && day !== 6) {
      dates.push(d.toISOString().split("T")[0]);
    }
  }

  return dates;
};

export default function LeaveProxyAssignmentPage() {
  const { leaveId } = useParams<{ leaveId: string }>();
  const navigate = useNavigate();

  // Local state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<LeaveProxyPeriod | null>(null);
  const [assigningTeacherId, setAssigningTeacherId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastAssignment, setLastAssignment] = useState<LeaveProxyAssignment | null>(null);

  // Zustand store
  const {
    proxyWorkflow,
    startProxyWorkflow,
    updatePeriodStatus,
    clearProxyWorkflow,
  } = useLeaveManagementStore();

  // React Query hooks
  const {
    data: leaveRequest,
    isLoading: isLoadingLeave,
    isError: isLeaveError,
  } = useLeaveRequest(leaveId || "", { enabled: !!leaveId });

  const {
    data: timetable = [],
    isLoading: isLoadingTimetable,
    refetch: refetchTimetable,
  } = useTeacherTimetableForLeave(
    leaveRequest?.teacherId || 0,
    selectedDate,
    { enabled: !!leaveRequest && !!selectedDate }
  );

  const {
    data: availableTeachers = [],
    isLoading: isLoadingTeachers,
    isError: isTeachersError,
    refetch: refetchTeachers,
  } = useAvailableSubstitutes(
    selectedPeriod?.periodNo || 0,
    selectedDate,
    leaveRequest?.teacherId || 0,
    { enabled: !!selectedPeriod && !!selectedDate && !!leaveRequest }
  );

  const assignMutation = useAssignLeaveProxy();
  const markCompleteMutation = useMarkLeaveProxyComplete();

  // Get working dates for this leave
  const workingDates = useMemo(() => {
    if (!leaveRequest) return [];
    return getWorkingDates(leaveRequest.fromDate, leaveRequest.toDate);
  }, [leaveRequest]);

  // Initialize selected date
  useEffect(() => {
    if (workingDates.length > 0 && !selectedDate) {
      setSelectedDate(workingDates[0]);
    }
  }, [workingDates, selectedDate]);

  // Initialize proxy workflow when leave request loads
  useEffect(() => {
    if (leaveRequest && timetable.length > 0 && !proxyWorkflow) {
      startProxyWorkflow(leaveRequest, timetable);
    }
  }, [leaveRequest, timetable, proxyWorkflow, startProxyWorkflow]);

  // Update timetable in workflow when date changes
  useEffect(() => {
    if (timetable.length > 0) {
      setSelectedPeriod(null);
    }
  }, [timetable]);

  // Calculate pending periods
  const pendingPeriods = useMemo(() => {
    return timetable.filter((p) => p.status === "NEEDS_PROXY").length;
  }, [timetable]);

  const allPeriodsAssigned = pendingPeriods === 0 && timetable.some((p) => p.status === "ASSIGNED");

  // Handle select period
  const handleSelectPeriod = useCallback((period: LeaveProxyPeriod) => {
    if (period.status !== "FREE") {
      setSelectedPeriod(period);
    }
  }, []);

  // Handle assign substitute
  const handleAssignSubstitute = useCallback(
    async (teacher: AvailableSubstituteTeacher) => {
      if (!leaveRequest || !selectedPeriod) return;

      setAssigningTeacherId(teacher.teacherId);

      try {
        const result = await assignMutation.mutateAsync({
          leaveId: leaveRequest.leaveId,
          date: selectedDate,
          periodNo: selectedPeriod.periodNo,
          substituteTeacherId: teacher.teacherId,
          substituteTeacherName: teacher.teacherName,
        });

        // Update local timetable state
        updatePeriodStatus(
          selectedPeriod.periodNo,
          teacher.teacherId,
          teacher.teacherName
        );

        // Get period time
        const periodTime = `${selectedPeriod.startTime}–${selectedPeriod.endTime}`;

        // Create assignment record for success modal
        const assignment: LeaveProxyAssignment = {
          assignmentId: result.assignmentId,
          leaveId: leaveRequest.leaveId,
          teacherId: leaveRequest.teacherId,
          teacherName: leaveRequest.teacherName,
          date: selectedDate,
          day: new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase() as any,
          periodNo: selectedPeriod.periodNo,
          periodTime,
          classId: selectedPeriod.classId,
          section: selectedPeriod.section,
          subject: selectedPeriod.subject,
          subjectId: selectedPeriod.subjectId,
          substituteTeacherId: teacher.teacherId,
          substituteTeacherName: teacher.teacherName,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };

        setLastAssignment(assignment);
        setShowSuccessModal(true);

        // Refetch timetable to get updated status
        refetchTimetable();
      } catch (error) {
        console.error("Failed to assign substitute:", error);
      } finally {
        setAssigningTeacherId(null);
        setSelectedPeriod(null);
      }
    },
    [
      leaveRequest,
      selectedPeriod,
      selectedDate,
      assignMutation,
      updatePeriodStatus,
      refetchTimetable,
    ]
  );

  // Handle continue assigning
  const handleContinueAssigning = useCallback(() => {
    setShowSuccessModal(false);
    setLastAssignment(null);
  }, []);

  // Handle finish and return
  const handleFinish = useCallback(async () => {
    if (leaveRequest && allPeriodsAssigned) {
      try {
        await markCompleteMutation.mutateAsync(leaveRequest.leaveId);
      } catch (error) {
        console.error("Failed to mark proxy complete:", error);
      }
    }

    clearProxyWorkflow();
    navigate("/academics/leave-management");
  }, [leaveRequest, allPeriodsAssigned, markCompleteMutation, clearProxyWorkflow, navigate]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    clearProxyWorkflow();
    navigate("/academics/leave-management");
  }, [clearProxyWorkflow, navigate]);

  // Loading state
  if (isLoadingLeave) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (isLeaveError || !leaveRequest) {
    return (
      <Box sx={{ display: "grid", gap: 3 }}>
        <Alert severity="error">
          Leave request not found or failed to load. Please try again.
        </Alert>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Back to Leave Management
        </Button>
      </Box>
    );
  }

  // Check if leave is approved
  if (leaveRequest.status !== "APPROVED") {
    return (
      <Box sx={{ display: "grid", gap: 3 }}>
        <Alert severity="warning">
          This leave request has not been approved yet. Only approved leaves can have substitute
          teachers assigned.
        </Alert>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Back to Leave Management
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 3, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Tooltip title="Back to Leave Management">
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Assign Substitute Teachers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign substitutes for all periods during the leave period
          </Typography>
        </Box>
      </Box>

      {/* Teacher Overview Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          {/* Avatar */}
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: "primary.main",
              fontSize: "1.75rem",
              fontWeight: 700,
            }}
          >
            {getInitials(leaveRequest.teacherName)}
          </Avatar>

          {/* Teacher Info */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h6" fontWeight={600}>
              {leaveRequest.teacherName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {leaveRequest.subject} Teacher
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BadgeIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {leaveRequest.employeeCode}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EmailIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {leaveRequest.teacherEmail}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {leaveRequest.teacherPhone}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Leave Period */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
              border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <CalendarTodayIcon sx={{ color: "warning.main", fontSize: 18 }} />
              <Typography variant="subtitle2" color="warning.dark">
                Leave Period
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={500}>
              {formatDate(leaveRequest.fromDate)}
              {leaveRequest.fromDate !== leaveRequest.toDate && (
                <>
                  <br />
                  to {formatDate(leaveRequest.toDate)}
                </>
              )}
            </Typography>
            <Chip
              size="small"
              label={`${leaveRequest.totalDays} day${leaveRequest.totalDays !== 1 ? "s" : ""}`}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Date Selector (for multi-day leaves) */}
      {workingDates.length > 1 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Select Date:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Date</InputLabel>
              <Select
                value={selectedDate}
                label="Date"
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedPeriod(null);
                }}
              >
                {workingDates.map((date) => (
                  <MenuItem key={date} value={date}>
                    {new Date(date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              {workingDates.length} working day{workingDates.length !== 1 ? "s" : ""} in leave
              period
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Status Banner */}
      {allPeriodsAssigned ? (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          action={
            <Button color="success" variant="contained" size="small" onClick={handleFinish}>
              Return to Leave Management
            </Button>
          }
        >
          <Typography variant="subtitle2" fontWeight={600}>
            All proxy assignments completed for {leaveRequest.teacherName}!
          </Typography>
          <Typography variant="body2">
            All periods for this leave date have substitute teachers assigned.
          </Typography>
        </Alert>
      ) : pendingPeriods > 0 ? (
        <Alert severity="warning" icon={<WarningIcon />}>
          <Typography variant="subtitle2" fontWeight={600}>
            {pendingPeriods} period{pendingPeriods !== 1 ? "s" : ""} need substitute teachers
          </Typography>
          <Typography variant="body2">
            Click on a period below to view available substitutes and assign one.
          </Typography>
        </Alert>
      ) : null}

      {/* Timetable Strip */}
      {isLoadingTimetable ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Paper>
      ) : (
        <ProxyAssignmentStrip
          periods={timetable}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handleSelectPeriod}
        />
      )}

      {/* Available Substitutes List */}
      <SubstituteTeacherList
        teachers={availableTeachers}
        loading={isLoadingTeachers}
        error={isTeachersError}
        selectedPeriod={selectedPeriod?.periodNo || null}
        onAssign={handleAssignSubstitute}
        isAssigning={assignMutation.isPending}
        assigningTeacherId={assigningTeacherId}
        onRetry={refetchTeachers}
      />

      {/* Success Modal */}
      <ProxyAssignmentSuccessModal
        open={showSuccessModal}
        onClose={handleContinueAssigning}
        assignment={lastAssignment}
        onContinue={handleContinueAssigning}
        onFinish={handleFinish}
        remainingPeriods={pendingPeriods}
        allComplete={allPeriodsAssigned}
      />
    </Box>
  );
}
