import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Chip } from "@mui/material";
import { Groups, Event, TrendingUp, EmojiEvents } from "@mui/icons-material";
import { getTeacherClubs, getTeacherClubActivities, getTeacherClubKpi } from "@/app/services/teacher-details.api";
import type { TeacherClub, ClubActivity, TeacherClubKpi } from "@/app/mockDataProviders/mockTeacherClubs";

interface ClubsSectionProps {
  teacherId: number;
}

export default function ClubsSection({ teacherId }: ClubsSectionProps) {
  const [clubs, setClubs] = useState<TeacherClub[]>([]);
  const [activities, setActivities] = useState<ClubActivity[]>([]);
  const [kpi, setKpi] = useState<TeacherClubKpi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [clubsData, activitiesData, kpiData] = await Promise.all([
          getTeacherClubs(teacherId),
          getTeacherClubActivities(teacherId),
          getTeacherClubKpi(teacherId),
        ]);
        setClubs(clubsData);
        setActivities(activitiesData);
        setKpi(kpiData);
      } catch (error) {
        console.error("Error fetching clubs data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <CircularProgress />;
  if (!kpi) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "ongoing": return "primary";
      case "planned": return "warning";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Clubs & Activities Management</Typography>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_clubs}</Typography>
                <Typography variant="body2">Total Clubs</Typography>
              </Box>
              <Groups sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_members_across_clubs}</Typography>
                <Typography variant="body2">Total Members</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.upcoming_events}</Typography>
                <Typography variant="body2">Upcoming Events</Typography>
              </Box>
              <Event sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.student_participation_rate.toFixed(0)}%</Typography>
                <Typography variant="body2">Participation Rate</Typography>
              </Box>
              <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Clubs Managed */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Clubs Managed</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2 }}>
            {clubs.map((club) => (
              <Card key={club.club_id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{club.club_name}</Typography>
                    <Chip label={club.role} color="primary" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{club.description}</Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Chip label={club.club_type} size="small" variant="outlined" />
                    <Chip label={`${club.member_count} members`} size="small" />
                    <Chip label={club.meeting_frequency} size="small" />
                  </Box>
                  {club.next_meeting_date && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Next Meeting: {new Date(club.next_meeting_date).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Recent Activities</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Club</strong></TableCell>
                  <TableCell><strong>Activity</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Venue</strong></TableCell>
                  <TableCell><strong>Participants</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.activity_id}>
                    <TableCell>{activity.club_name}</TableCell>
                    <TableCell>{activity.activity_name}</TableCell>
                    <TableCell><Chip label={activity.activity_type} size="small" variant="outlined" /></TableCell>
                    <TableCell>{new Date(activity.scheduled_date).toLocaleDateString()}</TableCell>
                    <TableCell>{activity.venue}</TableCell>
                    <TableCell align="center">{activity.participant_count || "N/A"}</TableCell>
                    <TableCell><Chip label={activity.status} color={getStatusColor(activity.status)} size="small" /></TableCell>
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
