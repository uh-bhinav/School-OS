import { memo } from "react";
import { Box, Typography, Paper, Chip, IconButton, Tooltip, alpha } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import type { TimetableEntry } from "../../services/timetable.schema";
import type { ProxyAssignment } from "../../stores/useProxyStore";
import type { ViewType } from "../../stores/useTimetableViewStore";

interface TimetableCellProps {
  entry?: TimetableEntry;
  viewType: ViewType;
  hasConflict: boolean;
  proxyAssignment?: ProxyAssignment;
  highlightFreePeriods: boolean;
  showRoomNumbers: boolean;
  onCellClick: (entry: TimetableEntry) => void;
  subjectColor?: string;
}

// Color palette for subjects
const SUBJECT_COLORS = [
  { bg: "#EBF5FF", border: "#BFDBFE", text: "#1E40AF" },
  { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46" },
  { bg: "#F5F3FF", border: "#DDD6FE", text: "#5B21B6" },
  { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412" },
  { bg: "#FDF2F8", border: "#FBCFE8", text: "#9D174D" },
  { bg: "#F0FDFA", border: "#99F6E4", text: "#115E59" },
  { bg: "#EEF2FF", border: "#C7D2FE", text: "#3730A3" },
  { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  { bg: "#ECFEFF", border: "#A5F3FC", text: "#155E75" },
  { bg: "#FFF1F2", border: "#FECDD3", text: "#9F1239" },
];

function TimetableCellComponent({
  entry,
  viewType,
  hasConflict,
  proxyAssignment,
  highlightFreePeriods,
  showRoomNumbers,
  onCellClick,
  subjectColor,
}: TimetableCellProps) {
  const hasSubstitute = !!proxyAssignment;

  // Empty cell (free period)
  if (!entry) {
    return (
      <Box
        sx={{
          borderRight: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
          p: 1.5,
          minHeight: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: highlightFreePeriods
            ? (theme) => alpha(theme.palette.grey[500], 0.08)
            : "transparent",
          transition: "all 0.2s ease",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.disabled",
            fontWeight: 500,
            opacity: highlightFreePeriods ? 1 : 0.5,
          }}
        >
          Free
        </Typography>
      </Box>
    );
  }

  // Get color for the subject
  const colorIndex = entry.subject_id
    ? Math.abs(entry.subject_id.toString().split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
      SUBJECT_COLORS.length
    : 0;
  const colors = subjectColor
    ? JSON.parse(subjectColor)
    : SUBJECT_COLORS[colorIndex];

  return (
    <Box
      sx={{
        borderRight: "1px solid",
        borderBottom: "1px solid",
        borderColor: hasConflict ? "error.main" : "divider",
        p: 0.75,
        minHeight: 100,
        position: "relative",
        bgcolor: hasConflict
          ? (theme) => alpha(theme.palette.error.main, 0.08)
          : hasSubstitute
          ? (theme) => alpha(theme.palette.info.main, 0.08)
          : "transparent",
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          bgcolor: hasConflict
            ? (theme) => alpha(theme.palette.error.main, 0.12)
            : (theme) => alpha(theme.palette.primary.main, 0.08),
          "& .cell-actions": {
            opacity: 1,
          },
        },
        ...(hasConflict && {
          outline: (theme) => `2px solid ${theme.palette.error.main}`,
          outlineOffset: -2,
        }),
        ...(hasSubstitute && {
          outline: (theme) => `2px solid ${theme.palette.info.main}`,
          outlineOffset: -2,
        }),
      }}
      onClick={() => onCellClick(entry)}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          height: "100%",
          borderRadius: 1,
          bgcolor: colors.bg,
          border: `1px solid ${colors.border}`,
          position: "relative",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
          },
        }}
      >
        {/* Conflict indicator */}
        {hasConflict && !hasSubstitute && (
          <Tooltip title="Scheduling conflict detected">
            <WarningAmberIcon
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: 16,
                color: "error.main",
              }}
            />
          </Tooltip>
        )}

        {/* Substitute badge */}
        {hasSubstitute && (
          <Chip
            icon={<PersonAddIcon sx={{ fontSize: 12 }} />}
            label={`Sub: ${proxyAssignment.substituteTeacherName?.split(" ")[0]}`}
            color="info"
            size="small"
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 600,
              "& .MuiChip-icon": { marginLeft: "4px" },
            }}
          />
        )}

        {/* Subject name */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: "0.8rem",
              lineHeight: 1.3,
              color: colors.text,
              pr: hasConflict || hasSubstitute ? 3 : 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {entry.subject_name || "Unknown Subject"}
          </Typography>

          {/* Subject ID as code */}
          {entry.subject_id && (
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "text.secondary",
              }}
            >
              ID: {entry.subject_id}
            </Typography>
          )}

          {/* Teacher info (hide in teacher view) */}
          {viewType !== "teacher" && entry.teacher_name && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <PersonIcon sx={{ fontSize: 14, color: "text.disabled" }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  color: hasSubstitute ? "text.disabled" : "text.secondary",
                  textDecoration: hasSubstitute ? "line-through" : "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.teacher_name}
              </Typography>
            </Box>
          )}

          {/* Substitute teacher name */}
          {hasSubstitute && viewType !== "teacher" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 14, color: "info.main" }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  color: "info.main",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                → {proxyAssignment.substituteTeacherName}
              </Typography>
            </Box>
          )}

          {/* Class info (show in teacher view) */}
          {viewType === "teacher" && (entry.class_id || entry.section) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Class {entry.class_id}-{entry.section}
              </Typography>
            </Box>
          )}

          {/* Room info (hide in resource view) */}
          {viewType !== "resource" && showRoomNumbers && entry.room_name && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <MeetingRoomIcon sx={{ fontSize: 14, color: "text.disabled" }} />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  color: "text.disabled",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.room_name}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Hover action button */}
        <Box
          className="cell-actions"
          sx={{
            position: "absolute",
            bottom: 4,
            right: 4,
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <Tooltip title="View details">
            <IconButton
              size="small"
              sx={{
                bgcolor: "background.paper",
                boxShadow: 1,
                "&:hover": {
                  bgcolor: "background.paper",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onCellClick(entry);
              }}
            >
              <InfoIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
}

export const TimetableCell = memo(TimetableCellComponent);
TimetableCell.displayName = "TimetableCell";
