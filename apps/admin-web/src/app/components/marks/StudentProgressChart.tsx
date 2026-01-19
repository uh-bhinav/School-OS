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
 * Integration Note: Data from /marks/student/{id}/subject/{id}/progression
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

  if (!data || data.exams.length === 0) {
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

  // Transform backend data for recharts
  const chartData = data.exams.map((exam) => ({
    exam: exam.exam_name,
    date: new Date(exam.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }),
    percentage: exam.percentage,
    marks: exam.marks_obtained,
    maxMarks: exam.max_marks,
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
            <XAxis
              dataKey="exam"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 100]} label={{ value: "Percentage", angle: -90, position: "insideLeft" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        p: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{data.exam}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.date}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Marks: {data.marks}/{data.maxMarks}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        Percentage: {data.percentage}%
                      </Typography>
                    </Box>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#2e7d32"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              name="Percentage"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
