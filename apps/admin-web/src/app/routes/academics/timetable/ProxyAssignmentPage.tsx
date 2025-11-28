import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  alpha,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import SubjectIcon from "@mui/icons-material/Subject";
import SubstituteTeacherCard from "../../../components/timetable/SubstituteTeacherCard";
import ProxySuccessModal from "../../../components/timetable/ProxySuccessModal";
import { useAvailableTeachers, useAssignProxy } from "../../../services/proxy.hooks";
import { useProxyStore } from "../../../stores/useProxyStore";
import type { AvailableTeacher } from "../../../services/proxy.api";
import type { DayOfWeek } from "../../../services/timetable.schema";

/**
 * Proxy Assignment Page
 * Displays list of available teachers to substitute for an absent teacher
 * Route: /academics/timetable/proxy
 */
export default function ProxyAssignmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get parameters from URL
  const classIdParam = searchParams.get("classId") || "8A";
  const periodNo = parseInt(searchParams.get("period") || "3", 10);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const day = (searchParams.get("day") || "MON") as DayOfWeek;
  const excludeTeacherId = parseInt(searchParams.get("teacherId") || "0", 10);

  // Parse classId to get class number and section
  const classId = parseInt(classIdParam.replace(/[A-Z]/g, ""), 10) || 8;
  const section = classIdParam.replace(/[0-9]/g, "") || "A";

  // Zustand store
  const {
    currentAbsence,
    assignProxyTeacher,
    openSuccessModal,
    closeSuccessModal,
    isSuccessModalOpen,
    lastAssignment,
  } = useProxyStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFreeOnly, setFilterFreeOnly] = useState(true);
  const [assigningTeacherId, setAssigningTeacherId] = useState<number | null>(null);

  // Fetch available teachers
  const {
    data: teachers = [],
    isLoading,
    isError,
    refetch,
  } = useAvailableTeachers({
    periodNo,
    date,
    day,
    classId,
    section,
    excludeTeacherId: excludeTeacherId || undefined,
  });

  // Assign proxy mutation
  const assignMutation = useAssignProxy();

  // Filter and search teachers
  const filteredTeachers = useMemo(() => {
    let result = teachers;

    // Filter by free status
    if (filterFreeOnly) {
      result = result.filter((t) => t.isFreeThisPeriod);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.teacherName.toLowerCase().includes(query) ||
          t.primarySubject.toLowerCase().includes(query) ||
          t.qualification.toLowerCase().includes(query)
      );
    }

    return result;
  }, [teachers, filterFreeOnly, searchQuery]);

  // Handle assign teacher
  const handleAssign = async (teacher: AvailableTeacher) => {
    if (!currentAbsence) {
      console.error("No absence information found");
      return;
    }

    setAssigningTeacherId(teacher.teacherId);

    try {
      // Call API
      await assignMutation.mutateAsync({
        absentTeacherId: currentAbsence.teacherId,
        substituteTeacherId: teacher.teacherId,
        classId: currentAbsence.classId,
        section: currentAbsence.section,
        date: currentAbsence.date,
        day: currentAbsence.day,
        periodNo: currentAbsence.periodNo,
        entryId: currentAbsence.entryId,
        reason: currentAbsence.reason,
      });

      // Update Zustand store
      assignProxyTeacher(teacher.teacherId, teacher.teacherName);

      // Show success modal
      openSuccessModal();
    } catch (error) {
      console.error("Failed to assign substitute:", error);
    } finally {
      setAssigningTeacherId(null);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/academics/timetable");
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get period time from period number
  const getPeriodTime = (pNo: number) => {
    const times: Record<number, string> = {
      1: "08:00–08:45",
      2: "08:50–09:35",
      3: "09:40–10:25",
      4: "10:45–11:30",
      5: "11:35–12:20",
      6: "12:25–13:10",
      7: "14:00–14:45",
      8: "14:50–15:35",
    };
    return times[pNo] || "";
  };

  // Stats
  const freeTeachersCount = teachers.filter((t) => t.isFreeThisPeriod).length;
  const totalTeachersCount = teachers.length;

  return (
    <Box sx={{ display: "grid", gap: 3, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Tooltip title="Back to Timetable">
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Assign Substitute Teacher
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a teacher to cover the absent period
          </Typography>
        </Box>
      </Box>

      {/* Absence Details Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Absent Class & Period Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          {/* Class */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            >
              <SchoolIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Class
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {classId}
                {section}
              </Typography>
            </Box>
          </Box>

          {/* Period */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                color: "secondary.main",
              }}
            >
              <AccessTimeIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Period {periodNo}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {getPeriodTime(periodNo)}
              </Typography>
            </Box>
          </Box>

          {/* Subject */}
          {currentAbsence && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                  color: "info.main",
                }}
              >
                <SubjectIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Subject
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {currentAbsence.subject}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Absent Teacher */}
          {currentAbsence && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  color: "warning.main",
                }}
              >
                <PersonOffIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Teacher Absent
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {currentAbsence.teacherName}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Date chip */}
        <Box sx={{ mt: 2 }}>
          <Chip
            label={formatDate(date)}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Paper>

      {/* Available Teachers Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Section Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Available Teachers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {freeTeachersCount} free, {totalTeachersCount} total
            </Typography>
          </Box>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />

            {/* Filter Toggle */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>
                <FilterListIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Filter
              </InputLabel>
              <Select
                value={filterFreeOnly ? "free" : "all"}
                label="Filter"
                onChange={(e) => setFilterFreeOnly(e.target.value === "free")}
              >
                <MenuItem value="free">Free Only</MenuItem>
                <MenuItem value="all">Show All</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Error State */}
        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load available teachers.{" "}
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Teachers Grid */}
        {!isLoading && filteredTeachers.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {filteredTeachers.map((teacher) => (
              <SubstituteTeacherCard
                key={teacher.teacherId}
                teacher={teacher}
                onAssign={handleAssign}
                isAssigning={assigningTeacherId === teacher.teacherId}
              />
            ))}
          </Box>
        )}

        {/* Empty State */}
        {!isLoading && filteredTeachers.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No teachers found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterFreeOnly
                ? "No teachers are free during this period. Try showing all teachers."
                : "Try adjusting your search query."}
            </Typography>
            {filterFreeOnly && (
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setFilterFreeOnly(false)}
              >
                Show All Teachers
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Success Modal */}
      <ProxySuccessModal
        open={isSuccessModalOpen}
        onClose={closeSuccessModal}
        assignment={lastAssignment}
      />
    </Box>
  );
}
