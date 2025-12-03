import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Avatar, Chip } from "@mui/material";
import { Mail, Announcement, Chat } from "@mui/icons-material";
import { mockCommunicationsProvider, mockAnnouncementsProvider } from "@/app/mockDataProviders";

interface CommunicationPanelProps {
  studentId: number;
}

export default function CommunicationPanel({ studentId }: CommunicationPanelProps) {
  const [communications, setCommunications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get communications (messages to/from student/parents)
        const comms = await mockCommunicationsProvider.getCommunications();
        // Filter for this student (mock - in real app would be filtered by student_id)
        const studentComms = comms.slice(0, 10);

        // Get recent announcements
        const announcs = await mockAnnouncementsProvider.getAnnouncements();
        const recentAnnouncements = announcs.slice(0, 5);

        setCommunications(studentComms);
        setAnnouncements(recentAnnouncements);
      } catch (error) {
        console.error("Error fetching communications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <CircularProgress />;

  const getAvatarColor = (id: number) => {
    const colors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a"];
    return colors[id % colors.length];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Communications
      </Typography>

      {/* Announcements Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Announcement sx={{ color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Recent Announcements
            </Typography>
          </Box>

          {announcements.length === 0 ? (
            <Alert severity="info">No announcements</Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {announcements.map((announcement, index) => (
                <Box
                  key={announcement.id || index}
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    borderLeft: 4,
                    borderColor: getPriorityColor(announcement.priority) + ".main",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {announcement.title}
                    </Typography>
                    {announcement.priority && (
                      <Chip label={announcement.priority} color={getPriorityColor(announcement.priority) as any} size="small" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {announcement.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : "Recent"}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Messages/Communications Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Chat sx={{ color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Messages & Communications
            </Typography>
          </Box>

          {communications.length === 0 ? (
            <Alert severity="info">No messages</Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {communications.map((comm, index) => (
                <Box
                  key={comm.id || index}
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    display: "flex",
                    gap: 2,
                  }}
                >
                  <Avatar sx={{ bgcolor: getAvatarColor(index) }}>
                    <Mail />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {comm.subject || "Message"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          From: {comm.sender_name || "Teacher"}
                        </Typography>
                      </Box>
                      {comm.status && (
                        <Chip
                          label={comm.status}
                          color={comm.status === "sent" ? "success" : "default"}
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {comm.message || comm.content || "Communication content"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {comm.created_at ? new Date(comm.created_at).toLocaleDateString() : "Recent"}
                      </Typography>
                      {comm.recipient_type && (
                        <Chip label={comm.recipient_type} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Teacher Notes (Mock Section) */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Teacher Notes
          </Typography>
          <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No teacher notes available for this student.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
