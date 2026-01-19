// ============================================================================
// FILE: src/app/routes/communications/index.tsx
// PURPOSE: Communications/Messaging management page
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
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  useCommunicationsList,
  useSendCommunication,
  useMarkAsRead,
  useDeleteCommunication,
} from "../../services/communications.hooks";
import type { CommunicationCreate } from "../../services/communications.api";

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const statusConfig = {
  pending: { color: "default" as const, label: "Pending" },
  sent: { color: "info" as const, label: "Sent" },
  delivered: { color: "success" as const, label: "Delivered" },
  failed: { color: "error" as const, label: "Failed" },
};

const messageTypeIcons = {
  email: <EmailIcon fontSize="small" />,
  sms: <SmsIcon fontSize="small" />,
  push: <NotificationsIcon fontSize="small" />,
  "in-app": <NotificationsIcon fontSize="small" />,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommunicationsPage() {
  const [page] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CommunicationCreate>({
    subject: "",
    message: "",
    message_type: "in-app",
    recipient_role: null,
  });

  // Queries and mutations
  const { data, isLoading, error } = useCommunicationsList({ page, page_size: 20 });
  const sendMutation = useSendCommunication();
  const markReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteCommunication();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleOpenDialog = () => {
    setFormData({
      subject: "",
      message: "",
      message_type: "in-app",
      recipient_role: null,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await sendMutation.mutateAsync(formData);
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to send communication:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleMarkRead = async (id: number) => {
    await markReadMutation.mutateAsync(id);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (error) {
    return (
      <Box>
        <Alert severity="error">Failed to load communications. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Communications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Send messages to students, parents, and staff
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          New Message
        </Button>
      </Box>

      {/* Communications List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : !data?.items || data.items.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <Typography variant="body1" color="text.secondary">
            No messages found. Click "New Message" to send one.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {data.items.map((communication) => (
            <Card key={communication.communication_id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2} spacing={2}>
                  <Box flex={1} minWidth={0}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
                      <Typography variant="h6" fontWeight={600}>
                        {communication.subject}
                      </Typography>
                      <Chip
                        label={statusConfig[communication.status].label}
                        color={statusConfig[communication.status].color}
                        size="small"
                      />
                      {communication.read_at && (
                        <Chip
                          icon={<CheckCircleIcon fontSize="small" />}
                          label="Read"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Box display="inline-flex" ml={1}>
                        {messageTypeIcons[communication.message_type]}
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {communication.message}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        To: {communication.recipient_role || communication.recipient_user_id || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sent: {communication.sent_at ? new Date(communication.sent_at).toLocaleString() : "Not sent"}
                      </Typography>
                      {communication.sender_name && (
                        <Typography variant="caption" color="text.secondary">
                          From: {communication.sender_name}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} flexShrink={0}>
                    {!communication.read_at && communication.status === "delivered" && (
                      <Tooltip title="Mark as Read">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkRead(communication.communication_id)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(communication.communication_id)}
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

      {/* Send Message Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Send New Message</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Subject"
              fullWidth
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Message Type</InputLabel>
              <Select
                value={formData.message_type}
                label="Message Type"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message_type: e.target.value as CommunicationCreate["message_type"],
                  })
                }
              >
                <MenuItem value="in-app">In-App Notification</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Recipients</InputLabel>
              <Select
                value={formData.recipient_role || "all"}
                label="Recipients"
                onChange={(e) =>
                  setFormData({ ...formData, recipient_role: e.target.value as any })
                }
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="admin">Admins Only</MenuItem>
                <MenuItem value="teacher">Teachers Only</MenuItem>
                <MenuItem value="student">Students Only</MenuItem>
                <MenuItem value="parent">Parents Only</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={sendMutation.isPending}
            startIcon={<EmailIcon />}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
