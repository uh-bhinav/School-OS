import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert } from "@mui/material";
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
} from "recharts";
import { mockAttendanceProvider } from "@/app/mockDataProviders";
import type { StudentHistory } from "@/app/services/attendance.schema";

interface AttendanceOverviewProps {
  studentId: number;
}

export default function AttendanceOverview({ studentId }: AttendanceOverviewProps) {
  const [history, setHistory] = useState<StudentHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await mockAttendanceProvider.getStudentHistory(studentId);
        setHistory(data);
      } catch (error) {
        console.error("Error fetching attendance history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <CircularProgress />;
  if (!history || history.records.length === 0) {
    return <Alert severity="info">No attendance data available</Alert>;
  }

  // Calculate summary
  const totalRecords = history.records.length;
  const presentCount = history.records.filter((r) => r.status === "PRESENT").length;
  const absentCount = history.records.filter((r) => r.status === "ABSENT").length;
  const lateCount = history.records.filter((r) => r.status === "LATE").length;

  const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  // Prepare chart data - last 15 days
  const chartData = history.records
    .slice(0, 15)
    .reverse()
    .map((record) => ({
      date: new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Present: record.status === "PRESENT" ? 1 : 0,
      Absent: record.status === "ABSENT" ? 1 : 0,
      Late: record.status === "LATE" ? 1 : 0,
      Excused: record.status === "EXCUSED" ? 1 : 0,
    }));

  // Monthly trend
  const monthlyData: Record<string, { present: number; absent: number; total: number }> = {};
  history.records.forEach((record) => {
    const month = new Date(record.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthlyData[month]) {
      monthlyData[month] = { present: 0, absent: 0, total: 0 };
    }
    monthlyData[month].total++;
    if (record.status === "PRESENT") monthlyData[month].present++;
    if (record.status === "ABSENT") monthlyData[month].absent++;
  });

  const monthlyChartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    percentage: ((data.present / data.total) * 100).toFixed(1),
    present: data.present,
    absent: data.absent,
  }));

  // Recent absences
  const recentAbsences = history.records.filter((r) => r.status === "ABSENT").slice(0, 10);

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Attendance Overview
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ bgcolor: "#e8f5e9" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {attendancePercentage.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Attendance
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#f3e5f5" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {presentCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Present Days
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#ffebee" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="error">
              {absentCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Absent Days
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: "#fff3e0" }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {lateCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Late Marks
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Monthly Trend */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Monthly Attendance Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="percentage" stroke="#4caf50" strokeWidth={2} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Attendance (Last 15 Days) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Daily Attendance (Last 15 Days)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" fill="#4caf50" stackId="a" />
              <Bar dataKey="Late" fill="#ff9800" stackId="a" />
              <Bar dataKey="Absent" fill="#f44336" stackId="a" />
              <Bar dataKey="Excused" fill="#2196f3" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Absences */}
      {recentAbsences.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Recent Absences
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {recentAbsences.map((record, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2">
                    {new Date(record.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                  {record.remarks && (
                    <Typography variant="body2" color="text.secondary">
                      {record.remarks}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
