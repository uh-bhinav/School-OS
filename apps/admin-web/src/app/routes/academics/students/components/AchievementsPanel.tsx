import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { EmojiEvents, Star } from "@mui/icons-material";
import { mockAchievementProvider } from "@/app/mockDataProviders";
import type { StudentAchievement } from "@/app/services/achievement.schema";

interface AchievementsPanelProps {
  studentId: number;
}

export default function AchievementsPanel({ studentId }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await mockAchievementProvider.getStudentAchievements(studentId, false);
        setAchievements(data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <CircularProgress />;
  if (!achievements || achievements.length === 0) {
    return <Alert severity="info">No achievements recorded yet</Alert>;
  }

  const totalPoints = achievements.filter((a) => a.is_verified).reduce((sum, a) => sum + a.points_awarded, 0);
  const verifiedCount = achievements.filter((a) => a.is_verified).length;
  const pendingCount = achievements.filter((a) => !a.is_verified).length;

  // Group by type
  const byType: Record<string, StudentAchievement[]> = {};
  achievements.forEach((achievement) => {
    if (!byType[achievement.achievement_type]) {
      byType[achievement.achievement_type] = [];
    }
    byType[achievement.achievement_type].push(achievement);
  });

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Achievements & Awards
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalPoints}
                </Typography>
                <Typography variant="body2">Total Points</Typography>
              </Box>
              <Star sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {verifiedCount}
                </Typography>
                <Typography variant="body2">Verified Achievements</Typography>
              </Box>
              <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {pendingCount}
                </Typography>
                <Typography variant="body2">Pending Verification</Typography>
              </Box>
              <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Achievements by Type */}
      {Object.entries(byType).map(([type, typeAchievements]) => (
        <Card key={type} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textTransform: "capitalize" }}>
              {type.replace(/_/g, " ")}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Points</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {typeAchievements.map((achievement) => (
                  <TableRow key={achievement.id}>
                    <TableCell>{achievement.title}</TableCell>
                    <TableCell>{achievement.description}</TableCell>
                    <TableCell>{new Date(achievement.date_awarded).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        {achievement.points_awarded}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={achievement.is_verified ? "Verified" : "Pending"}
                        color={achievement.is_verified ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
