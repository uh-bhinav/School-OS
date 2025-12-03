import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Chip, Avatar } from "@mui/material";
import { Groups, Event, EmojiEvents } from "@mui/icons-material";
import { mockClubProvider } from "@/app/mockDataProviders";
import type { Club, ClubMembership, ClubActivity } from "@/app/services/club.schema";

interface ClubsPanelProps {
  studentId: number;
}

export default function ClubsPanel({ studentId }: ClubsPanelProps) {
  const [clubs, setClubs] = useState<Array<{ club: Club; membership: ClubMembership; activities: ClubActivity[] }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get all clubs
        const allClubs = await mockClubProvider.getClubs(1, true);

        // Get student memberships - mock filter by student ID
        const studentClubs = [];
        for (const club of allClubs) {
          const memberships = await mockClubProvider.getClubMemberships(club.id);
          const studentMembership = memberships.find((m) => m.student_id === studentId);

          if (studentMembership) {
            const activities = await mockClubProvider.getClubActivities(club.id);
            studentClubs.push({
              club,
              membership: studentMembership,
              activities: activities.slice(0, 5), // Latest 5 activities
            });
          }
        }

        setClubs(studentClubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <CircularProgress />;
  if (!clubs || clubs.length === 0) {
    return <Alert severity="info">Not a member of any clubs</Alert>;
  }

  const getAvatarColor = (id: number) => {
    const colors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a"];
    return colors[id % colors.length];
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "president":
        return "error";
      case "vice_president":
        return "warning";
      case "secretary":
      case "treasurer":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Clubs & Activities
      </Typography>

      {/* Summary */}
      <Card sx={{ mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Groups sx={{ fontSize: 50 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {clubs.length}
              </Typography>
              <Typography variant="body1">Club Memberships</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Clubs List */}
      {clubs.map(({ club, membership, activities }) => (
        <Card key={club.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: getAvatarColor(club.id),
                }}
              >
                <Groups />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {club.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {club.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={membership.role.replace(/_/g, " ").toUpperCase()}
                    color={getRoleColor(membership.role) as any}
                    size="small"
                  />
                  <Chip
                    label={membership.status.toUpperCase()}
                    color={membership.status === "active" ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`${membership.attendance_count || 0} events attended`}
                    size="small"
                    variant="outlined"
                  />
                  {membership.contribution_score !== undefined && (
                    <Chip
                      icon={<EmojiEvents />}
                      label={`Score: ${membership.contribution_score}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Club Info */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Meeting Schedule
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {club.meeting_schedule?.day} at {club.meeting_schedule?.time}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Frequency
                </Typography>
                <Typography variant="body2" fontWeight="500" sx={{ textTransform: "capitalize" }}>
                  {club.meeting_frequency}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Members
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {club.current_member_count} / {club.max_members}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Joined On
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {new Date(membership.joined_date).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>

            {/* Recent Activities */}
            {activities.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Recent Activities
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {activities.map((activity) => (
                    <Box
                      key={activity.id}
                      sx={{
                        p: 1.5,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Event sx={{ fontSize: 20, color: "text.secondary" }} />
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {activity.activity_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.scheduled_date).toLocaleDateString()} at {activity.start_time}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={activity.status}
                        size="small"
                        color={
                          activity.status === "completed"
                            ? "success"
                            : activity.status === "ongoing"
                            ? "primary"
                            : "default"
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {membership.notes && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: "info.light", borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold">
                  Notes:
                </Typography>
                <Typography variant="body2">{membership.notes}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
