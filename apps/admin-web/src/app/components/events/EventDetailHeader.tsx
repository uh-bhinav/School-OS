// ============================================================================
// FILE: src/app/components/events/EventDetailHeader.tsx
// PURPOSE: Header component for event detail page
// ============================================================================

import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Delete,
  CalendarMonth,
  LocationOn,
  AccessTime,
  Person,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../services/events.schema";
import { EventStatus, getThemeColor, getThemeLabel } from "../../services/events.schema";

interface EventDetailHeaderProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
}

const statusConfig = {
  [EventStatus.Upcoming]: { color: "info" as const, label: "Upcoming" },
  [EventStatus.Ongoing]: { color: "success" as const, label: "Ongoing" },
  [EventStatus.Completed]: { color: "default" as const, label: "Completed" },
  [EventStatus.Cancelled]: { color: "error" as const, label: "Cancelled" },
};

export default function EventDetailHeader({
  event,
  onEdit,
  onDelete,
}: EventDetailHeaderProps) {
  const navigate = useNavigate();
  const themeColor = getThemeColor(event.theme);
  const status = statusConfig[event.status] || statusConfig[EventStatus.Upcoming];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <Card
      sx={{
        mb: 3,
        borderTop: `4px solid ${themeColor}`,
      }}
    >
      <CardContent>
        {/* Back button and actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/events")}
            sx={{ textTransform: "none" }}
          >
            Back to Events
          </Button>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit Event">
              <IconButton onClick={onEdit} color="primary">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Event">
              <IconButton onClick={onDelete} color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Title and Status */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h4" fontWeight={700}>
                {event.title}
              </Typography>
              <Chip
                label={status.label}
                color={status.color}
                size="medium"
              />
            </Box>
            <Chip
              label={getThemeLabel(event.theme)}
              sx={{
                bgcolor: themeColor,
                color: "white",
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>

        {/* Event Meta Info */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mt={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarMonth color="action" />
            <Typography variant="body1">
              {formatDate(event.date)}
            </Typography>
          </Box>

          {event.startTime && (
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime color="action" />
              <Typography variant="body1">
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </Typography>
            </Box>
          )}

          {event.venue && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn color="action" />
              <Typography variant="body1">{event.venue}</Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            <Person color="action" />
            <Typography variant="body1">
              {event.teacherInChargeName || `Teacher ID: ${event.teacherInChargeId}`}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
