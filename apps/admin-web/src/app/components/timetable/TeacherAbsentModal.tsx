import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Avatar,
  alpha,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SubjectIcon from "@mui/icons-material/Subject";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import type { AbsentTeacher } from "../../services/proxy.api";
import { useProxyStore } from "../../stores/useProxyStore";

interface TeacherAbsentModalProps {
  open: boolean;
  onClose: () => void;
  absence: AbsentTeacher | null;
}

/**
 * Modal showing details of absent teacher and option to select substitute
 */
export default function TeacherAbsentModal({
  open,
  onClose,
  absence,
}: TeacherAbsentModalProps) {
  const navigate = useNavigate();
  const { setAbsenceInformation } = useProxyStore();
  const [reason, setReason] = useState(absence?.reason || "");

  if (!absence) return null;

  const handleSelectSubstitute = () => {
    // Store absence information in Zustand
    setAbsenceInformation({
      teacherId: absence.teacherId,
      teacherName: absence.teacherName,
      subject: absence.subject,
      classId: absence.classId,
      section: absence.section,
      date: absence.date,
      day: absence.day,
      periodNo: absence.periodNo,
      periodTime: absence.periodTime,
      reason: reason || absence.reason,
      entryId: absence.entryId,
    });

    onClose();

    // Navigate to proxy assignment page
    const params = new URLSearchParams({
      classId: `${absence.classId}${absence.section}`,
      period: absence.periodNo.toString(),
      date: absence.date,
      day: absence.day,
      teacherId: absence.teacherId.toString(),
      entryId: absence.entryId.toString(),
    });
    navigate(`/academics/timetable/proxy?${params.toString()}`);
  };

  // Get initials from teacher name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 480,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PersonOffIcon color="warning" />
          <Typography variant="h6" fontWeight={600}>
            Teacher Absent
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Teacher Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "warning.main",
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            {getInitials(absence.teacherName)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {absence.teacherName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {absence.subject} Teacher
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Details Grid */}
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Subject */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              <SubjectIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Subject
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {absence.subject}
              </Typography>
            </Box>
          </Box>

          {/* Class */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                color: "success.main",
              }}
            >
              <SchoolIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Class
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                Class {absence.classId}
                {absence.section}
              </Typography>
            </Box>
          </Box>

          {/* Date & Day */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              <CalendarTodayIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(absence.date)}
              </Typography>
            </Box>
          </Box>

          {/* Period & Time */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                Period & Time
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                Period {absence.periodNo} — {absence.periodTime}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Reason Input */}
        <TextField
          label="Reason for Absence (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          rows={2}
          fullWidth
          placeholder="e.g., Medical leave, Personal emergency..."
          variant="outlined"
          size="small"
        />
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSelectSubstitute}
          variant="contained"
          color="primary"
          startIcon={<PersonSearchIcon />}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Select Substitute
        </Button>
      </DialogActions>
    </Dialog>
  );
}
