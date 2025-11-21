import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from "@mui/material";
import { TrendingUp, Assessment, School } from "@mui/icons-material";
import { getTeacherPerformanceKpi, getClassWisePerformance, getSubjectWisePerformance } from "@/app/services/teacher-details.api";
import type { TeacherPerformanceKpi, ClassWisePerformance, SubjectWisePerformance } from "@/app/mockDataProviders/mockTeacherPerformance";

interface PerformanceSectionProps {
  teacherId: number;
}

export default function PerformanceSection({ teacherId }: PerformanceSectionProps) {
  const [kpi, setKpi] = useState<TeacherPerformanceKpi | null>(null);
  const [classPerf, setClassPerf] = useState<ClassWisePerformance[]>([]);
  const [subjectPerf, setSubjectPerf] = useState<SubjectWisePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpiData, classData, subjectData] = await Promise.all([
          getTeacherPerformanceKpi(teacherId),
          getClassWisePerformance(teacherId),
          getSubjectWisePerformance(teacherId),
        ]);
        setKpi(kpiData);
        setClassPerf(classData);
        setSubjectPerf(subjectData);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <CircularProgress />;
  if (!kpi) return null;

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Academic Performance Overview</Typography>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.average_student_score.toFixed(1)}%</Typography>
                <Typography variant="body2">Avg Student Score</Typography>
              </Box>
              <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.pass_rate}%</Typography>
                <Typography variant="body2">Pass Rate</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.total_students_taught}</Typography>
                <Typography variant="body2">Students Taught</Typography>
              </Box>
              <School sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.highest_score}</Typography>
                <Typography variant="body2">Highest Score</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Class-wise Performance */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Class-wise Performance</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell align="right"><strong>Students</strong></TableCell>
                  <TableCell align="right"><strong>Avg Score</strong></TableCell>
                  <TableCell align="right"><strong>Pass Rate</strong></TableCell>
                  <TableCell align="right"><strong>Highest</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classPerf.map((cls, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{cls.class_name} {cls.section}</TableCell>
                    <TableCell>{cls.subject}</TableCell>
                    <TableCell align="right">{cls.total_students}</TableCell>
                    <TableCell align="right">{cls.average_score.toFixed(1)}%</TableCell>
                    <TableCell align="right">{cls.pass_rate}%</TableCell>
                    <TableCell align="right">{cls.highest_score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Subject-wise Performance</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell align="right"><strong>Classes</strong></TableCell>
                  <TableCell align="right"><strong>Students</strong></TableCell>
                  <TableCell align="right"><strong>Avg Score</strong></TableCell>
                  <TableCell align="right"><strong>Pass Rate</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjectPerf.map((subj, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{subj.subject_name}</TableCell>
                    <TableCell align="right">{subj.total_classes}</TableCell>
                    <TableCell align="right">{subj.total_students}</TableCell>
                    <TableCell align="right">{subj.average_score.toFixed(1)}%</TableCell>
                    <TableCell align="right">{subj.pass_rate}%</TableCell>
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
