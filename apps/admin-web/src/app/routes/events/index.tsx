// ============================================================================
// FILE: src/app/routes/events/index.tsx
// PURPOSE: Events list page with filtering, search, and create functionality
// PATTERN: Following Finance, Clubs page patterns
// ============================================================================

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon,
  PhotoLibrary as PhotoIcon,
  CheckCircle as CompletedIcon,
} from "@mui/icons-material";

import { EventCard, CreateEventDialog } from "../../components/events";
import { useEvents, useEventKpi, useDeleteEvent } from "../../services/events.hooks";
import { EventTheme, type Event } from "../../services/events.schema";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type TimeFilter = "all" | "upcoming" | "past" | "today";

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${color}.50`,
        color: `${color}.main`,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      {loading ? (
        <Skeleton width={60} height={32} />
      ) : (
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
      )}
    </Box>
  </Paper>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const EventsPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState<EventTheme | "all">("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Queries
  const { data: eventsData, isLoading, error } = useEvents();
  const { data: kpi, isLoading: kpiLoading } = useEventKpi();
  const deleteEventMutation = useDeleteEvent();

  // Extract events array from paginated response
  const events = useMemo(() => {
    if (!eventsData) return [];
    if (Array.isArray(eventsData)) return eventsData;
    return eventsData.items || [];
  }, [eventsData]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.teacherInChargeName?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Theme filter
      if (themeFilter !== "all" && event.theme !== themeFilter) {
        return false;
      }

      // Time filter
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (timeFilter) {
        case "upcoming":
          if (eventDate < today) return false;
          break;
        case "past":
          if (eventDate >= today) return false;
          break;
        case "today":
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          if (eventDate < today || eventDate > todayEnd) return false;
          break;
      }

      return true;
    });
  }, [events, searchQuery, themeFilter, timeFilter]);

  // deleteEventMutation available for future use (e.g., bulk delete)
  void deleteEventMutation;

  // Theme options
  const themeOptions = [
    { value: "all", label: "All Themes" },
    { value: EventTheme.Cultural, label: "Cultural" },
    { value: EventTheme.Sports, label: "Sports" },
    { value: EventTheme.Celebration, label: "Celebration" },
    { value: EventTheme.Academic, label: "Academic" },
    { value: EventTheme.Festival, label: "Festival" },
  ];

  const timeOptions = [
    { value: "all", label: "All Events" },
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past Events" },
    { value: "today", label: "Today" },
  ];

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load events. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage school events, cultural activities, and celebrations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Event
        </Button>
      </Box>

      {/* KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <KpiCard
          title="Total Events"
          value={kpi?.totalEvents ?? 0}
          icon={<EventIcon />}
          color="primary"
          loading={kpiLoading}
        />
        <KpiCard
          title="Upcoming Events"
          value={kpi?.upcomingEvents ?? 0}
          icon={<CalendarIcon />}
          color="success"
          loading={kpiLoading}
        />
        <KpiCard
          title="Total Photos"
          value={kpi?.totalPhotos ?? 0}
          icon={<PhotoIcon />}
          color="info"
          loading={kpiLoading}
        />
        <KpiCard
          title="Completed Events"
          value={kpi?.completedEvents ?? 0}
          icon={<CompletedIcon />}
          color="warning"
          loading={kpiLoading}
        />
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          {/* Theme Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Theme</InputLabel>
            <Select
              value={themeFilter}
              label="Theme"
              onChange={(e) => setThemeFilter(e.target.value as EventTheme | "all")}
            >
              {themeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Time Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time</InputLabel>
            <Select
              value={timeFilter}
              label="Time"
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            >
              {timeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Active Filters */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {themeFilter !== "all" && (
              <Chip
                label={themeFilter}
                size="small"
                onDelete={() => setThemeFilter("all")}
              />
            )}
            {timeFilter !== "all" && (
              <Chip
                label={timeOptions.find((t) => t.value === timeFilter)?.label}
                size="small"
                onDelete={() => setTimeFilter("all")}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Events Grid */}
      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={280}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : filteredEvents.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <EventIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            {searchQuery || themeFilter !== "all" || timeFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first event to get started"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Event
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {filteredEvents.map((event: Event) => (
            <EventCard
              key={event.eventId}
              event={event}
            />
          ))}
        </Box>
      )}

      {/* Results count */}
      {!isLoading && filteredEvents.length > 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center" }}
        >
          Showing {filteredEvents.length} of {events.length} events
        </Typography>
      )}

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Loading overlay for delete */}
      {deleteEventMutation.isPending && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default EventsPage;
