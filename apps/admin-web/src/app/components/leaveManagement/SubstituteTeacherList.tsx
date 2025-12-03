// ============================================================================
// SUBSTITUTE TEACHER LIST COMPONENT
// ============================================================================
// Displays list of available substitute teachers for proxy assignment
// ============================================================================

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Skeleton,
  alpha,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import type { AvailableSubstituteTeacher } from "../../services/leaveManagement.schema";

interface SubstituteTeacherListProps {
  teachers: AvailableSubstituteTeacher[];
  loading?: boolean;
  error?: boolean;
  selectedPeriod: number | null;
  onAssign: (teacher: AvailableSubstituteTeacher) => void;
  isAssigning?: boolean;
  assigningTeacherId?: number | null;
  onRetry?: () => void;
}

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Get avatar color based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    "#1976d2", "#388e3c", "#d32f2f", "#7b1fa2",
    "#c2185b", "#0288d1", "#00796b", "#f57c00",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function SubstituteTeacherList({
  teachers,
  loading,
  error,
  selectedPeriod,
  onAssign,
  isAssigning,
  assigningTeacherId,
  onRetry,
}: SubstituteTeacherListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter teachers based on search
  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;

    const query = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.teacherName.toLowerCase().includes(query) ||
        t.primarySubject.toLowerCase().includes(query) ||
        t.qualification.toLowerCase().includes(query)
    );
  }, [teachers, searchQuery]);

  // Separate free and busy teachers
  const freeTeachers = filteredTeachers.filter((t) => t.isFreeThisPeriod);
  const busyTeachers = filteredTeachers.filter((t) => !t.isFreeThisPeriod);

  // Loading skeleton
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width={200} height={28} />
        </Box>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Alert
          severity="error"
          action={
            onRetry && (
              <Button size="small" onClick={onRetry}>
                Retry
              </Button>
            )
          }
        >
          Failed to load available teachers. Please try again.
        </Alert>
      </Paper>
    );
  }

  // No period selected
  if (!selectedPeriod) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          textAlign: "center",
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Select a Period
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Click on a period above that needs a substitute teacher
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Available Substitutes for Period {selectedPeriod}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${freeTeachers.length} free, ${teachers.length} total`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, subject, or qualification..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* Free Teachers Section */}
      {freeTeachers.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            color="success.main"
            fontWeight={600}
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}
          >
            <CheckCircleIcon sx={{ fontSize: 14 }} />
            FREE THIS PERIOD ({freeTeachers.length})
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {freeTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.teacherId}
                teacher={teacher}
                onAssign={onAssign}
                isAssigning={isAssigning && assigningTeacherId === teacher.teacherId}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Busy Teachers Section */}
      {busyTeachers.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}
          >
            <AccessTimeIcon sx={{ fontSize: 14 }} />
            HAS CLASS THIS PERIOD ({busyTeachers.length})
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {busyTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.teacherId}
                teacher={teacher}
                onAssign={onAssign}
                isAssigning={isAssigning && assigningTeacherId === teacher.teacherId}
                disabled
              />
            ))}
          </Box>
        </Box>
      )}

      {/* No Results */}
      {filteredTeachers.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <PersonIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No teachers found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {searchQuery
              ? "Try adjusting your search query"
              : "No substitute teachers available for this period"}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

// ============================================================================
// TEACHER CARD SUB-COMPONENT
// ============================================================================

interface TeacherCardProps {
  teacher: AvailableSubstituteTeacher;
  onAssign: (teacher: AvailableSubstituteTeacher) => void;
  isAssigning?: boolean;
  disabled?: boolean;
}

function TeacherCard({ teacher, onAssign, isAssigning, disabled }: TeacherCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) =>
          disabled
            ? alpha(theme.palette.grey[500], 0.04)
            : alpha(theme.palette.success.main, 0.02),
        opacity: disabled ? 0.7 : 1,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: disabled ? "divider" : "success.main",
          boxShadow: disabled ? "none" : 1,
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Avatar */}
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: getAvatarColor(teacher.teacherName),
            fontWeight: 600,
          }}
        >
          {getInitials(teacher.teacherName)}
        </Avatar>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {teacher.teacherName}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={teacher.primarySubject}
              sx={{
                height: 20,
                fontSize: "0.7rem",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            />
            {teacher.isFreeThisPeriod && (
              <Chip
                size="small"
                icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                label="Free"
                color="success"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Tooltip title="Qualification">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {teacher.qualification}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Experience">
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <WorkIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {teacher.experienceYears} yrs
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Assign Button */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant={disabled ? "outlined" : "contained"}
            size="small"
            color="success"
            disabled={disabled || isAssigning}
            onClick={() => onAssign(teacher)}
            startIcon={
              isAssigning ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAddIcon fontSize="small" />
              )
            }
            sx={{
              minWidth: 100,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
