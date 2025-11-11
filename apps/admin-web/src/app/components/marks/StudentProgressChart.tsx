import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StudentProgress } from "@/app/services/marks.schema";

interface StudentProgressChartProps {
  data?: StudentProgress;
  loading?: boolean;
}

/**
 * StudentProgressChart Component
 *
 * Line chart showing student performance trends over time.
 *
 * Features:
 * - Time-series visualization
 * - Interactive tooltips
 * - Responsive design
 * - Loading state
 *
 * Integration Note: Data from /api/v1/marks/progression/student/{id}/subject/{id}
 */
export function StudentProgressChart({ data, loading }: StudentProgressChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={200} height={30} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.marks.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Student Progress
          </Typography>
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No progression data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = data.dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    marks: data.marks[index],
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {data.subject_name} - Performance Trend
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="marks"
              stroke="#2e7d32"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name="Marks"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
