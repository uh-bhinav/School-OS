// ============================================================================
// FILE: src/app/routes/announcements/index.tsx
// PURPOSE: Announcements management page
// ============================================================================

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import {
  useAnnouncementsList,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
} from "../../services/announcements.hooks";
import type { AnnouncementCreate, Announcement } from "../../services/announcements.api";

// ============================================================================
// PRIORITY CONFIGURATION
// ============================================================================

const priorityConfig = {
  low: { color: "default" as const, label: "Low" },
  medium: { color: "info" as const, label: "Medium" },
  high: { color: "warning" as const, label: "High" },
  urgent: { color: "error" as const, label: "Urgent" },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AnnouncementsPage() {
  const [page] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementCreate>({
    title: "",
    content: "",
    priority: "medium",
    target_role: "all",
  });

  // Queries and mutations
  const { data, isLoading, error } = useAnnouncementsList({ page, page_size: 20 });
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const publishMutation = usePublishAnnouncement();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);

      // ✅ CRITICAL: Convert ISO strings to datetime-local format for input
      const formatForInput = (isoString?: string | null) => {
        if (!isoString) return undefined;
        const date = new Date(isoString);
        // Format: YYYY-MM-DDTHH:mm (datetime-local input format)
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        target_role: announcement.target_role || "all",
        target_class_id: announcement.target_class_id || undefined,
        scheduled_for: formatForInput(announcement.scheduled_for),
        expires_at: formatForInput(announcement.expires_at),
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        content: "",
        priority: "medium",
        target_role: "all",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = async () => {
    try {
      // ✅ CRITICAL: Ensure ISO date strings for backend
      const payload: AnnouncementCreate = {
        ...formData,
        // Convert datetime-local to ISO string if present
        scheduled_for: formData.scheduled_for
          ? new Date(formData.scheduled_for).toISOString()
          : undefined,
        expires_at: formData.expires_at
          ? new Date(formData.expires_at).toISOString()
          : undefined,
      };

      if (editingAnnouncement) {
        await updateMutation.mutateAsync({
          announcementId: editingAnnouncement.announcement_id,
          patch: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save announcement:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handlePublish = async (id: number) => {
    await publishMutation.mutateAsync(id);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (error) {
    return (
      <Box>
        <Alert severity="error">Failed to load announcements. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Announcements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage school-wide announcements and notifications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          New Announcement
        </Button>
      </Box>

      {/* Announcements List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : !data?.items || data.items.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <Typography variant="body1" color="text.secondary">
            No announcements found. Click "New Announcement" to create one.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {data.items.map((announcement) => (
            <Card key={announcement.announcement_id}>
              <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight={600}>
                          {announcement.title}
                        </Typography>
                        <Chip
                          label={priorityConfig[announcement.priority].label}
                          color={priorityConfig[announcement.priority].color}
                          size="small"
                        />
                        {announcement.scheduled_for && !announcement.published_at && (
                          <Chip
                            icon={<ScheduleIcon fontSize="small" />}
                            label="Scheduled"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {announcement.published_at && (
                          <Chip
                            icon={<NotificationsIcon fontSize="small" />}
                            label="Published"
                            color="success"
                            size="small"
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {announcement.content}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption" color="text.secondary">
                          Target: {announcement.target_role || "All"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(announcement.created_at).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {announcement.scheduled_for && !announcement.published_at && (
                        <Tooltip title="Publish Now">
                          <IconButton
                            size="small"
                            onClick={() => handlePublish(announcement.announcement_id)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(announcement)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(announcement.announcement_id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
          ))}
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as AnnouncementCreate["priority"],
                  })
                }
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={formData.target_role || "all"}
                label="Target Audience"
                onChange={(e) =>
                  setFormData({ ...formData, target_role: e.target.value as any })
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="admin">Admins Only</MenuItem>
                <MenuItem value="teacher">Teachers Only</MenuItem>
                <MenuItem value="student">Students Only</MenuItem>
                <MenuItem value="parent">Parents Only</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Schedule For (Optional)"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.scheduled_for || ""}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_for: e.target.value || undefined })
              }
            />
            <TextField
              label="Expires At (Optional)"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.expires_at || ""}
              onChange={(e) =>
                setFormData({ ...formData, expires_at: e.target.value || undefined })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingAnnouncement ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
