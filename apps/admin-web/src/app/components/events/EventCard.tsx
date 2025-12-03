// ============================================================================
// FILE: src/app/components/events/EventCard.tsx
// PURPOSE: Card component for displaying event summary
// ============================================================================

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
  Avatar,
} from "@mui/material";
import {
  Event as EventIcon,
  Person,
  Groups,
  PhotoCamera,
  CalendarMonth,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { Event } from "../../services/events.schema";
import { EventStatus, getThemeColor, getThemeLabel } from "../../services/events.schema";

interface EventCardProps {
  event: Event;
}

const statusConfig = {
  [EventStatus.Upcoming]: { color: "info" as const, label: "Upcoming" },
  [EventStatus.Ongoing]: { color: "success" as const, label: "Ongoing" },
  [EventStatus.Completed]: { color: "default" as const, label: "Completed" },
  [EventStatus.Cancelled]: { color: "error" as const, label: "Cancelled" },
};

export default function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
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

  const status = statusConfig[event.status] || statusConfig[EventStatus.Upcoming];
  const themeColor = getThemeColor(event.theme);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        borderTop: `4px solid ${themeColor}`,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ bgcolor: themeColor, width: 40, height: 40 }}>
              <EventIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {event.title}
              </Typography>
              <Chip
                label={getThemeLabel(event.theme)}
                size="small"
                sx={{
                  bgcolor: themeColor,
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.7rem",
                  height: 20,
                  mt: 0.5,
                }}
              />
            </Box>
          </Box>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.description}
        </Typography>

        {/* Event Details */}
        <Stack spacing={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarMonth fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {formatDate(event.date)}
              {event.startTime && (
                <Box component="span" sx={{ ml: 1 }}>
                  <AccessTime sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
                  {formatTime(event.startTime)}
                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                </Box>
              )}
            </Typography>
          </Box>

          {event.venue && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {event.venue}
              </Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            <Person fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {event.teacherInChargeName || `Teacher ID: ${event.teacherInChargeId}`}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Groups fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {event.hostClasses.length} Classes
            </Typography>
            {event.hostClassNames && event.hostClassNames.length > 0 && (
              <Box display="flex" gap={0.5} flexWrap="wrap">
                {event.hostClassNames.slice(0, 3).map((className, idx) => (
                  <Chip
                    key={idx}
                    label={className}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", height: 18 }}
                  />
                ))}
                {event.hostClassNames.length > 3 && (
                  <Chip
                    label={`+${event.hostClassNames.length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", height: 18 }}
                  />
                )}
              </Box>
            )}
          </Box>

          {event.images.length > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <PhotoCamera fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {event.images.length} Photos
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={() => navigate(`/events/${event.eventId}`)}
          sx={{ textTransform: "none" }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}
