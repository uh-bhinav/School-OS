import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { mockMarksProvider } from "@/app/mockDataProviders";
import type { StudentProgress } from "@/app/services/marks.schema";

interface MarksPanelProps {
  studentId: number;
}

export default function MarksPanel({ studentId }: MarksPanelProps) {
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await mockMarksProvider.getStudentProgress(studentId);
        setProgress(data);
      } catch (error) {
        console.error("Error fetching marks progress:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <CircularProgress />;
  if (!progress || progress.length === 0) {
    return <Alert severity="info">No marks data available</Alert>;
  }

  // Calculate overall statistics
  let totalMarks = 0;
  let totalMax = 0;
  let highestScore = 0;
  let lowestScore = 100;

  progress.forEach((subject) => {
    subject.exams.forEach((exam) => {
      totalMarks += exam.marks_obtained;
      totalMax += exam.max_marks;
      if (exam.percentage > highestScore) highestScore = exam.percentage;
      if (exam.percentage < lowestScore) lowestScore = exam.percentage;
    });
  });

  const overallAverage = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

  // Prepare subject-wise average data for radar chart
  const radarData = progress.map((subject) => {
    const avgPercentage =
      subject.exams.reduce((sum, exam) => sum + exam.percentage, 0) / subject.exams.length;
    return {
      subject: subject.subject_name,
      percentage: avgPercentage.toFixed(1),
    };
  });

  // Prepare latest exam data
  const latestExamData = progress.map((subject) => {
    const latestExam = subject.exams[subject.exams.length - 1];
    return {
      subject: subject.subject_name,
      percentage: latestExam.percentage,
      grade: latestExam.percentage >= 90 ? "A+" : latestExam.percentage >= 80 ? "A" : latestExam.percentage >= 70 ? "B+" : latestExam.percentage >= 60 ? "B" : latestExam.percentage >= 50 ? "C" : "D",
    };
  });

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Marks & Performance
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ bgcolor: "#e3f2fd" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {overallAverage.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Average
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#e8f5e9" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {highestScore.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Highest Score
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#fff3e0" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {lowestScore.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lowest Score
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#f3e5f5" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="secondary">
              {progress.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subjects
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Subject-wise Performance Radar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Subject-wise Performance
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Average %" dataKey="percentage" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latest Exam Results */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Latest Exam Results
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={latestExamData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#82ca9d" name="Percentage" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progress Trend per Subject */}
      {progress.map((subject) => (
        <Card key={subject.subject_name} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              {subject.subject_name} - Progress Trend
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={subject.exams}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam_name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}

      {/* Detailed Marks Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Detailed Marks
          </Typography>
          <Paper sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Exam</TableCell>
                  <TableCell align="right">Marks Obtained</TableCell>
                  <TableCell align="right">Max Marks</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {progress.map((subject) =>
                  subject.exams.map((exam, index) => (
                    <TableRow key={`${subject.subject_name}-${index}`}>
                      <TableCell>{subject.subject_name}</TableCell>
                      <TableCell>{exam.exam_name}</TableCell>
                      <TableCell align="right">{exam.marks_obtained}</TableCell>
                      <TableCell align="right">{exam.max_marks}</TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight="bold"
                          color={
                            exam.percentage >= 90
                              ? "success.main"
                              : exam.percentage >= 60
                              ? "primary"
                              : "error"
                          }
                        >
                          {exam.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}
