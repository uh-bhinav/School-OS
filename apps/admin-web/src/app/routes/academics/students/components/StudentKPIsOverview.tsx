import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import {
  School,
  TrendingUp,
  EmojiEvents,
  Assignment,
  AttachMoney,
  Groups,
  CheckCircle,
  Leaderboard,
} from "@mui/icons-material";
import { getStudentKpi } from "@/app/services/student-details.api";
import type { StudentKpi } from "@/app/mockDataProviders/mockStudentDetails";

interface StudentKPIsOverviewProps {
  studentId: number;
}

export default function StudentKPIsOverview({ studentId }: StudentKPIsOverviewProps) {
  const [kpi, setKpi] = useState<StudentKpi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getStudentKpi(studentId);
        setKpi(data);
      } catch (error) {
        console.error("Error fetching student KPI:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <CircularProgress />;
  if (!kpi) return null;

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Academic Performance Overview
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {kpi.attendance_percentage}%
                </Typography>
                <Typography variant="body2">Attendance</Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {kpi.average_marks_percentage}%
                </Typography>
                <Typography variant="body2">Average Marks</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {kpi.subjects_enrolled}
                </Typography>
                <Typography variant="body2">Subjects Enrolled</Typography>
              </Box>
              <School sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {kpi.exams_appeared}
                </Typography>
                <Typography variant="body2">Exams Appeared</Typography>
              </Box>
              <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {kpi.achievements_earned}
                </Typography>
                <Typography variant="body2">Achievements</Typography>
              </Box>
              <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            background:
              kpi.fees_pending > 0
                ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
                : "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  ₹{kpi.fees_pending}
                </Typography>
                <Typography variant="body2">Fees Pending</Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {kpi.clubs_participated}
                </Typography>
                <Typography variant="body2">Clubs Joined</Typography>
              </Box>
              <Groups sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        {kpi.rank_in_class && (
          <Card sx={{ background: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {kpi.rank_in_class}/{kpi.total_students_in_class}
                  </Typography>
                  <Typography variant="body2">Class Rank</Typography>
                </Box>
                <Leaderboard sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
