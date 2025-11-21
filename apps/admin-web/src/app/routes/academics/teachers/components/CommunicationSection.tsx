import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Chip, List, ListItem, ListItemText } from "@mui/material";
import { Mail, Forum, Campaign, TrendingUp } from "@mui/icons-material";
import { getTeacherCommunications, getConversationThreads, getAnnouncementsCreated, getTeacherCommunicationKpi } from "@/app/services/teacher-details.api";
import type { TeacherCommunication, ConversationThread, AnnouncementCreated, TeacherCommunicationKpi } from "@/app/mockDataProviders/mockTeacherCommunications";

interface CommunicationSectionProps {
  teacherId: number;
}

export default function CommunicationSection({ teacherId }: CommunicationSectionProps) {
  const [communications, setCommunications] = useState<TeacherCommunication[]>([]);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementCreated[]>([]);
  const [kpi, setKpi] = useState<TeacherCommunicationKpi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [commsData, threadsData, announcementsData, kpiData] = await Promise.all([
          getTeacherCommunications(teacherId),
          getConversationThreads(teacherId),
          getAnnouncementsCreated(teacherId),
          getTeacherCommunicationKpi(teacherId),
        ]);
        setCommunications(commsData);
        setThreads(threadsData);
        setAnnouncements(announcementsData);
        setKpi(kpiData);
      } catch (error) {
        console.error("Error fetching communication data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <CircularProgress />;
  if (!kpi) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "error";
      case "high": return "warning";
      case "medium": return "primary";
      case "low": return "default";
      default: return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Communications Overview</Typography>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_messages_sent}</Typography>
                <Typography variant="body2">Messages Sent</Typography>
              </Box>
              <Mail sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.active_conversations}</Typography>
                <Typography variant="body2">Active Conversations</Typography>
              </Box>
              <Forum sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_announcements_created}</Typography>
                <Typography variant="body2">Announcements</Typography>
              </Box>
              <Campaign sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.response_rate_percentage}%</Typography>
                <Typography variant="body2">Response Rate</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Messages */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Recent Messages</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Recipients</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {communications.slice(0, 10).map((comm) => (
                  <TableRow key={comm.communication_id}>
                    <TableCell>{comm.title}</TableCell>
                    <TableCell><Chip label={comm.type} size="small" variant="outlined" /></TableCell>
                    <TableCell>{comm.recipient_type}</TableCell>
                    <TableCell><Chip label={comm.priority} color={getPriorityColor(comm.priority)} size="small" /></TableCell>
                    <TableCell>{new Date(comm.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Chip label={comm.is_read ? "Read" : "Unread"} color={comm.is_read ? "success" : "default"} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Conversation Threads */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Active Conversations</Typography>
          <List>
            {threads.slice(0, 5).map((thread) => (
              <ListItem key={thread.thread_id} divider>
                <ListItemText
                  primary={<Typography fontWeight="bold">{thread.subject}</Typography>}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {thread.message_count} messages · Last: {thread.last_message.substring(0, 50)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(thread.last_message_at).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <Chip label={thread.is_active ? "Active" : "Closed"} color={thread.is_active ? "success" : "default"} size="small" />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Announcements Created */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Announcements Created</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Audience</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Published</strong></TableCell>
                  <TableCell align="right"><strong>Views</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {announcements.map((ann) => (
                  <TableRow key={ann.announcement_id}>
                    <TableCell>{ann.title}</TableCell>
                    <TableCell><Chip label={ann.target_audience} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={ann.priority} color={getPriorityColor(ann.priority)} size="small" /></TableCell>
                    <TableCell>{new Date(ann.published_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">{ann.views_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
