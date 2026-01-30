import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  IconButton,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import type { TimetableEntry, Period, DayOfWeek } from "../../services/timetable.schema";
import type { ProxyAssignment } from "../../stores/useProxyStore";

const DAY_NAMES: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

interface CellDetailsModalProps {
  open: boolean;
  onClose: () => void;
  entry: TimetableEntry | null;
  day: DayOfWeek | null;
  period: Period | null;
  proxyAssignment?: ProxyAssignment;
  hasConflict?: boolean;
  onViewTeacherSchedule?: (teacherId: number) => void;
  onViewRoomSchedule?: (roomId: number) => void;
  onAssignSubstitute?: (entry: TimetableEntry) => void;
}

export default function CellDetailsModal({
  open,
  onClose,
  entry,
  day,
  period,
  proxyAssignment,
  hasConflict = false,
  onViewTeacherSchedule,
  onViewRoomSchedule,
  onAssignSubstitute,
}: CellDetailsModalProps) {
  if (!entry || !day || !period) {
    return null;
  }

  const hasSubstitute = !!proxyAssignment;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Assignment Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {/* Time slot header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
            p: 1.5,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            borderRadius: 1,
          }}
        >
          <AccessTimeIcon sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {DAY_NAMES[day] || day}, Period {period.period_no}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {period.start_time} - {period.end_time}
            </Typography>
          </Box>
        </Box>

        {/* Conflict warning */}
        {hasConflict && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
              p: 1.5,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              borderRadius: 1,
            }}
          >
            <WarningAmberIcon sx={{ color: "error.main" }} />
            <Box>
              <Typography variant="subtitle2" color="error.main" fontWeight={600}>
                Scheduling Conflict Detected
              </Typography>
              <Typography variant="caption" color="error.main">
                This period has a scheduling conflict that needs attention.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Substitute indicator */}
        {hasSubstitute && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
              p: 1.5,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
              border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              borderRadius: 1,
            }}
          >
            <PersonAddIcon sx={{ color: "info.main" }} />
            <Box>
              <Typography variant="subtitle2" color="info.main" fontWeight={600}>
                Substitute Assigned
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {proxyAssignment.substituteTeacherName} is covering this period
              </Typography>
            </Box>
          </Box>
        )}

        {/* Subject Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <MenuBookIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
              Subject
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={500}>
            {entry.subject_name}
          </Typography>
          <Chip
            label={`ID: ${entry.subject_id}`}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5, height: 22, fontSize: "0.7rem" }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Teacher Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <PersonIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
              Teacher
            </Typography>
          </Box>
          <Typography
            variant="h6"
            fontWeight={500}
            sx={hasSubstitute ? { textDecoration: "line-through", color: "text.disabled" } : undefined}
          >
            {entry.teacher_name}
          </Typography>
          {hasSubstitute && (
            <Typography variant="h6" fontWeight={500} color="info.main" sx={{ mt: 0.5 }}>
              → {proxyAssignment.substituteTeacherName}
            </Typography>
          )}
          {onViewTeacherSchedule && (
            <Button
              variant="text"
              size="small"
              onClick={() => onViewTeacherSchedule(entry.teacher_id)}
              sx={{ mt: 1, p: 0, textTransform: "none" }}
            >
              View full schedule →
            </Button>
          )}
        </Box>

        {/* Room Section */}
        {entry.room_name && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <MeetingRoomIcon sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Room
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={500}>
                {entry.room_name}
              </Typography>
              {onViewRoomSchedule && entry.room_id && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onViewRoomSchedule(entry.room_id!)}
                  sx={{ mt: 1, p: 0, textTransform: "none" }}
                >
                  View room schedule →
                </Button>
              )}
            </Box>
          </>
        )}

        {/* Class Info */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
            Class Information
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`Class ${entry.class_id}`}
              size="small"
              sx={{ height: 24 }}
            />
            <Chip
              label={`Section ${entry.section}`}
              size="small"
              variant="outlined"
              sx={{ height: 24 }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {onAssignSubstitute && !hasSubstitute && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<PersonAddIcon />}
            onClick={() => onAssignSubstitute(entry)}
          >
            Assign Substitute
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
