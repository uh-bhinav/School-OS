// ============================================================================
// FILE: src/app/routes/events/EventDetailPage.tsx
// PURPOSE: Event detail page with photo upload functionality
// ============================================================================

import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  Avatar,
  Divider,
  Skeleton,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Event as EventIcon,
  Person,
  Groups,
  CalendarMonth,
  LocationOn,
  AccessTime,
  AttachMoney,
  Collections,
  Close,
} from "@mui/icons-material";

import { EditEventDialog, EventPhotoUploader } from "../../components/events";
import {
  useEventById,
  useDeleteEvent,
  useEventImages,
  useDeleteEventImage,
} from "../../services/events.hooks";
import { EventStatus, getThemeColor, getThemeLabel } from "../../services/events.schema";

// ─────────────────────────────────────────────────────────────────────────────
// TAB PANEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTBOX COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface LightboxProps {
  open: boolean;
  images: Array<{ imageId: string; url: string; caption?: string }>;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  open,
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">
          {currentImage?.caption || `Photo ${currentIndex + 1} of ${images.length}`}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <img
            src={currentImage?.url}
            alt={currentImage?.caption || "Event photo"}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={onPrev} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary">
          {currentIndex + 1} / {images.length}
        </Typography>
        <Button onClick={onNext} disabled={currentIndex === images.length - 1}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(searchParams.get("edit") === "true");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Queries
  const { data: event, isLoading, error } = useEventById(eventId!);
  const { data: images = [], isLoading: imagesLoading } = useEventImages(eventId!);
  const deleteEventMutation = useDeleteEvent();
  const deleteImageMutation = useDeleteEventImage();

  // Handlers
  const handleDelete = async () => {
    if (!eventId) return;
    await deleteEventMutation.mutateAsync(eventId);
    navigate("/events");
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!eventId) return;
    if (window.confirm("Are you sure you want to delete this image?")) {
      await deleteImageMutation.mutateAsync({ eventId, imageId });
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Format helpers
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

  // Status config
  const statusConfig = {
    [EventStatus.Upcoming]: { color: "info" as const, label: "Upcoming" },
    [EventStatus.Ongoing]: { color: "success" as const, label: "Ongoing" },
    [EventStatus.Completed]: { color: "default" as const, label: "Completed" },
    [EventStatus.Cancelled]: { color: "error" as const, label: "Cancelled" },
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
      </Box>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Event not found or failed to load.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/events")}>
          Back to Events
        </Button>
      </Box>
    );
  }

  const status = statusConfig[event.status] || statusConfig[EventStatus.Upcoming];
  const themeColor = getThemeColor(event.theme);

  return (
    <Box sx={{ p: 3 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/events")}
        sx={{ mb: 2 }}
      >
        Back to Events
      </Button>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          borderTop: `4px solid ${themeColor}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: themeColor, width: 64, height: 64 }}>
              <EventIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={600}>
                {event.title}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Chip
                  label={getThemeLabel(event.theme)}
                  size="small"
                  sx={{
                    bgcolor: themeColor,
                    color: "white",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  label={status.label}
                  color={status.color}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditDialogOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          {event.description}
        </Typography>
      </Paper>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label="Details" />
          <Tab label={`Photos (${images.length})`} />
          <Tab label="Budget" />
        </Tabs>

        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Date & Time */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CalendarMonth color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(event.date)}
                    {event.endDate && event.endDate !== event.date && (
                      <> to {formatDate(event.endDate)}</>
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Time */}
              {(event.startTime || event.endTime) && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AccessTime color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(event.startTime)}
                      {event.endTime && ` - ${formatTime(event.endTime)}`}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Venue */}
              {event.venue && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <LocationOn color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Venue
                    </Typography>
                    <Typography variant="body1">{event.venue}</Typography>
                  </Box>
                </Box>
              )}

              <Divider />

              {/* Teacher In Charge */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Person color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Teacher In Charge
                  </Typography>
                  <Typography variant="body1">
                    {event.teacherInChargeName || `Teacher ID: ${event.teacherInChargeId}`}
                  </Typography>
                </Box>
              </Box>

              {/* Host Classes */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Groups color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Host Classes
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                    {event.hostClassNames && event.hostClassNames.length > 0 ? (
                      event.hostClassNames.map((className, idx) => (
                        <Chip key={idx} label={className} size="small" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body1">
                        {event.hostClasses.length} Classes
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* Photos Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {/* Upload Section */}
            <EventPhotoUploader eventId={event.eventId} />

            <Divider sx={{ my: 3 }} />

            {/* Photos Grid */}
            <Typography variant="h6" gutterBottom>
              Event Photos
            </Typography>

            {imagesLoading ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 2,
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={150}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
            ) : images.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Collections sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography color="text.secondary">
                  No photos uploaded yet. Upload some photos above!
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 2,
                }}
              >
                {images.map((image, index) => (
                  <Box
                    key={image.imageId}
                    sx={{
                      position: "relative",
                      paddingTop: "100%",
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover .overlay": {
                        opacity: 1,
                      },
                    }}
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || "Event photo"}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.imageId);
                        }}
                        sx={{ color: "white" }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Budget Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: "warning.light" }}>
                <AttachMoney />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Estimated Budget
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {event.estimatedBudget
                    ? `₹${event.estimatedBudget.toLocaleString()}`
                    : "Not specified"}
                </Typography>
              </Box>
            </Box>

            {event.budgetNote && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Budget Notes
                </Typography>
                <Typography variant="body1">{event.budgetNote}</Typography>
              </Paper>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              Budget integration with Finance module coming soon. For now, use the
              estimated budget and notes as a placeholder.
            </Alert>
          </Box>
        </TabPanel>
      </Paper>

      {/* Edit Dialog */}
      <EditEventDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        event={event}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{event.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteEventMutation.isPending}
          >
            {deleteEventMutation.isPending ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        images={images}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setLightboxIndex((prev) => Math.min(images.length - 1, prev + 1))}
      />
    </Box>
  );
};

export default EventDetailPage;
