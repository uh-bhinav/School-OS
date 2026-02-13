// ============================================================================
// FILE: src/app/routes/announcements/voice-announcements.tsx
// PURPOSE: Voice Announcements management page
// ============================================================================

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import {
  Campaign as CampaignIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { VoiceAnnouncementCreator } from "../../components/announcements";
import {
  useMyAnnouncements,
  useAnnouncementDeliveries,
} from "../../services/voiceAnnouncements.hooks";
import type { VoiceAnnouncement } from "../../services/voiceAnnouncements.schema";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VoiceAnnouncementsPage: React.FC = () => {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);

  // Fetch announcements
  const { data: announcements, isLoading, isError } = useMyAnnouncements();

  // Fetch deliveries for selected announcement
  const { data: deliveries } = useAnnouncementDeliveries(selectedAnnouncementId);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOpenCreator = () => {
    setIsCreatorOpen(true);
  };

  const handleCloseCreator = () => {
    setIsCreatorOpen(false);
  };

  const handleAnnouncementClick = (id: string) => {
    setSelectedAnnouncementId(id === selectedAnnouncementId ? null : id);
  };

  // ============================================================================
  // PRIORITY COLOR MAPPING
  // ============================================================================

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
      default:
        return "default";
    }
  };

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading voice announcements...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load voice announcements</Alert>
      </Box>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Voice Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send voice call announcements to teachers' phones
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreator}
          size="large"
        >
          New Voice Announcement
        </Button>
      </Stack>

      {/* Empty State */}
      {!announcements || announcements.length === 0 ? (
        <Card sx={{ textAlign: "center", py: 6 }}>
          <CampaignIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No voice announcements yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first voice announcement to notify teachers via phone calls
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreator}
          >
            Create Voice Announcement
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {announcements.map((announcement: VoiceAnnouncement) => (
            <Card
              key={announcement.id}
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 3 },
              }}
              onClick={() => handleAnnouncementClick(announcement.id)}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {announcement.title}
                    </Typography>
                    {announcement.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {announcement.description}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={announcement.priority}
                        color={getPriorityColor(announcement.priority) as any}
                        size="small"
                      />
                      {announcement.sent_at && (
                        <Typography variant="caption" color="text.secondary">
                          Sent {new Date(announcement.sent_at).toLocaleString()}
                        </Typography>
                      )}
                      {!announcement.sent_at && (
                        <Chip label="Not Sent" size="small" variant="outlined" />
                      )}
                    </Stack>
                  </Box>
                </Stack>

                {/* Delivery Status (expanded view) */}
                {selectedAnnouncementId === announcement.id && deliveries && (
                  <Box mt={3} pt={2} borderTop="1px solid" borderColor="divider">
                    <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                      Delivery Status
                    </Typography>
                    <Stack spacing={1}>
                      {deliveries.map((delivery) => (
                        <Box
                          key={delivery.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          p={1}
                          bgcolor="background.default"
                          borderRadius={1}
                        >
                          <Typography variant="body2">
                            {delivery.teacher_name || "Unknown Teacher"}
                          </Typography>
                          <Chip
                            label={delivery.status}
                            size="small"
                            color={
                              delivery.status === "completed"
                                ? "success"
                                : delivery.status === "played"
                                ? "info"
                                : delivery.status === "opened"
                                ? "warning"
                                : "default"
                            }
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Voice Announcement Creator Dialog */}
      <VoiceAnnouncementCreator open={isCreatorOpen} onClose={handleCloseCreator} />
    </Box>
  );
};

export default VoiceAnnouncementsPage;
