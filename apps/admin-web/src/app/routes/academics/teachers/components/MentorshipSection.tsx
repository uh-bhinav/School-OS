import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Chip, Alert } from "@mui/material";
import { Warning, Star, TrendingUp, People } from "@mui/icons-material";
import { getMentoredStudents, getMentorshipKpi, getMentorshipInsights } from "@/app/services/teacher-details.api";
import type { MentoredStudent, MentorshipKpi, MentorshipInsight } from "@/app/mockDataProviders/mockTeacherMentorship";

interface MentorshipSectionProps {
  teacherId: number;
}

export default function MentorshipSection({ teacherId }: MentorshipSectionProps) {
  const [students, setStudents] = useState<MentoredStudent[]>([]);
  const [kpi, setKpi] = useState<MentorshipKpi | null>(null);
  const [insights, setInsights] = useState<MentorshipInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsData, kpiData, insightsData] = await Promise.all([
          getMentoredStudents(teacherId),
          getMentorshipKpi(teacherId),
          getMentorshipInsights(teacherId),
        ]);
        setStudents(studentsData);
        setKpi(kpiData);
        setInsights(insightsData);
      } catch (error) {
        console.error("Error fetching mentorship data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <CircularProgress />;
  if (!kpi) return null;

  if (!kpi.is_class_teacher) {
    return (
      <Alert severity="info">This teacher is not currently assigned as a class teacher.</Alert>
    );
  }

  const getBehaviorColor = (rating: string) => {
    switch (rating) {
      case "Excellent": return "success";
      case "Good": return "primary";
      case "Average": return "warning";
      case "Needs Improvement": return "error";
      default: return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Mentorship - {kpi.assigned_class} {kpi.assigned_section}
      </Typography>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_mentored_students}</Typography>
                <Typography variant="body2">Total Students</Typography>
              </Box>
              <People sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.students_needing_attention}</Typography>
                <Typography variant="body2">Need Attention</Typography>
              </Box>
              <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.top_performers}</Typography>
                <Typography variant="body2">Top Performers</Typography>
              </Box>
              <Star sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.average_attendance.toFixed(1)}%</Typography>
                <Typography variant="body2">Avg Attendance</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Insights */}
      {insights.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Key Insights</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {insights.slice(0, 5).map((insight, idx) => (
                <Alert key={idx} severity={insight.priority === "high" ? "warning" : "info"} icon={insight.category === "top_performer" ? <Star /> : <Warning />}>
                  <strong>{insight.student_name}:</strong> {insight.message}
                </Alert>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Mentored Students</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Roll No</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell align="right"><strong>Attendance</strong></TableCell>
                  <TableCell align="right"><strong>Avg Marks</strong></TableCell>
                  <TableCell><strong>Behavior</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Parent Contact</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student_id} sx={{ bgcolor: student.needs_attention ? "error.lighter" : "inherit" }}>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell align="right">{student.attendance_percentage.toFixed(1)}%</TableCell>
                    <TableCell align="right">{student.average_marks.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Chip label={student.behavior_rating} color={getBehaviorColor(student.behavior_rating)} size="small" />
                    </TableCell>
                    <TableCell>
                      {student.needs_attention && <Chip label="Needs Attention" color="error" size="small" icon={<Warning />} />}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">{student.parent_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{student.parent_phone}</Typography>
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
