import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Chip, Button } from "@mui/material";
import { EmojiEvents, Star, TrendingUp, Verified, Description } from "@mui/icons-material";
import { getTeacherAchievements, getTeacherAchievementKpi, getAchievementBadges } from "@/app/services/teacher-details.api";
import type { TeacherAchievement, TeacherAchievementKpi, AchievementBadge } from "@/app/mockDataProviders/mockTeacherAchievements";

interface AchievementSectionProps {
  teacherId: number;
}

export default function AchievementSection({ teacherId }: AchievementSectionProps) {
  const [achievements, setAchievements] = useState<TeacherAchievement[]>([]);
  const [kpi, setKpi] = useState<TeacherAchievementKpi | null>(null);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [achievementsData, kpiData, badgesData] = await Promise.all([
          getTeacherAchievements(teacherId),
          getTeacherAchievementKpi(teacherId),
          getAchievementBadges(teacherId),
        ]);
        setAchievements(achievementsData);
        setKpi(kpiData);
        setBadges(badgesData);
      } catch (error) {
        console.error("Error fetching achievements data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <CircularProgress />;
  if (!kpi) return null;

  const getCategoryColor = (category: string): "default" | "primary" | "secondary" | "success" | "warning" | "info" | "error" => {
    switch (category) {
      case "award": return "error";
      case "certification": return "primary";
      case "publication": return "secondary";
      case "recognition": return "success";
      case "training": return "info";
      default: return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "award": return "🏆";
      case "certification": return "📜";
      case "publication": return "📚";
      case "recognition": return "⭐";
      case "training": return "🎓";
      default: return "📌";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Professional Achievements & Recognition</Typography>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_achievements}</Typography>
                <Typography variant="body2">Total Achievements</Typography>
              </Box>
              <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_awards}</Typography>
                <Typography variant="body2">Awards Received</Typography>
              </Box>
              <Star sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_certifications}</Typography>
                <Typography variant="body2">Certifications</Typography>
              </Box>
              <Verified sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.years_of_excellence}</Typography>
                <Typography variant="body2">Years of Excellence</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Category Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Achievements by Category</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            {kpi.category_breakdown.map((item) => (
              <Card key={item.category} variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">{item.count}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                        {getCategoryIcon(item.category)} {item.category}
                      </Typography>
                    </Box>
                    <Chip label={item.category} color={getCategoryColor(item.category)} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Honor Badges */}
      {badges.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Honor Badges & Special Recognition</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
              {badges.map((badge) => (
                <Card key={badge.badge_id} variant="outlined" sx={{
                  border: "2px solid",
                  borderColor: "primary.main",
                  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                      <Typography variant="h2">🏅</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">{badge.badge_name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {badge.badge_description}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            Issued by: {badge.issuing_body}
                          </Typography>
                          <Chip
                            label={new Date(badge.awarded_date).getFullYear()}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Achievements Timeline */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Achievements Timeline</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Achievement</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Issuing Authority</strong></TableCell>
                  <TableCell><strong>Validity</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {achievements.map((achievement) => (
                  <TableRow key={achievement.achievement_id} hover>
                    <TableCell>
                      {new Date(achievement.achievement_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {getCategoryIcon(achievement.category)} {achievement.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={achievement.category}
                        color={getCategoryColor(achievement.category)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{achievement.issuing_authority}</Typography>
                    </TableCell>
                    <TableCell>
                      {achievement.validity_period ? (
                        <Chip label={achievement.validity_period} size="small" color="success" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        {achievement.certificate_url && (
                          <Button size="small" variant="outlined" startIcon={<Description />}>
                            Certificate
                          </Button>
                        )}
                        {achievement.verification_url && (
                          <Button size="small" variant="outlined" color="success" startIcon={<Verified />}>
                            Verify
                          </Button>
                        )}
                      </Box>
                    </TableCell>
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
