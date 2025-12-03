import { Box, Typography, Button, Paper, alpha, Chip, IconButton } from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { AbsentTeacher } from "../../services/proxy.api";
import { useProxyStore } from "../../stores/useProxyStore";

interface TeacherAbsenceBannerProps {
  absentTeachers: AbsentTeacher[];
  onAssignSubstitute: (absence: AbsentTeacher) => void;
  onDismiss?: () => void;
}

/**
 * Sticky banner component to display teacher absence notifications
 * Shows at the top of the timetable page when a teacher is absent
 */
export default function TeacherAbsenceBanner({
  absentTeachers,
  onAssignSubstitute,
  onDismiss,
}: TeacherAbsenceBannerProps) {
  const { assignments } = useProxyStore();

  // Filter out teachers who already have substitutes assigned
  const unassignedAbsences = absentTeachers.filter((absence) => {
    const hasSubstitute = assignments.some(
      (a) => a.entryId === absence.entryId && a.date === absence.date
    );
    return !hasSubstitute;
  });

  // Don't show banner if all absences have substitutes
  if (unassignedAbsences.length === 0) {
    return null;
  }

  // Show first unassigned absence prominently
  const primaryAbsence = unassignedAbsences[0];
  const remainingCount = unassignedAbsences.length - 1;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
        border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
        position: "relative",
      }}
    >
      {/* Close button */}
      {onDismiss && (
        <IconButton
          size="small"
          onClick={onDismiss}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "text.secondary",
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, pr: 4 }}>
        {/* Icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
            color: "warning.main",
            flexShrink: 0,
          }}
        >
          <PersonOffIcon sx={{ fontSize: 28 }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <WarningAmberIcon sx={{ fontSize: 18, color: "warning.main" }} />
            <Typography variant="subtitle1" fontWeight={600} color="warning.dark">
              Teacher Absent Notification
            </Typography>
            {remainingCount > 0 && (
              <Chip
                label={`+${remainingCount} more`}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 22 }}
              />
            )}
          </Box>

          {/* Absence details */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            <Box component="span" fontWeight={600} color="text.primary">
              {primaryAbsence.teacherName}
            </Box>{" "}
            ({primaryAbsence.subject}) is absent today.
            <br />
            Period affected:{" "}
            <Box component="span" fontWeight={500}>
              Period {primaryAbsence.periodNo}
            </Box>{" "}
            — {primaryAbsence.periodTime}
            {primaryAbsence.reason && (
              <>
                <br />
                <Box component="span" color="text.disabled">
                  Reason: {primaryAbsence.reason}
                </Box>
              </>
            )}
          </Typography>

          {/* Action button */}
          <Button
            variant="contained"
            color="warning"
            startIcon={<PersonAddIcon />}
            onClick={() => onAssignSubstitute(primaryAbsence)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            Assign Substitute
          </Button>
        </Box>
      </Box>

      {/* Additional absences list (if more than one) */}
      {remainingCount > 0 && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: (theme) => `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Other absences today:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {unassignedAbsences.slice(1).map((absence) => (
              <Chip
                key={`${absence.entryId}-${absence.periodNo}`}
                label={`${absence.teacherName} - P${absence.periodNo}`}
                size="small"
                variant="outlined"
                onClick={() => onAssignSubstitute(absence)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
