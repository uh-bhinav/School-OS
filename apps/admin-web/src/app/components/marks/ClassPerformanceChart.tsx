import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ClassPerformance } from "@/app/services/marks.schema";

interface ClassPerformanceChartProps {
  data?: ClassPerformance[];
  loading?: boolean;
}

/**
 * ClassPerformanceChart Component
 *
 * Bar chart showing class average performance by subject.
 *
 * Features:
 * - Subject-wise comparison
 * - Average score and pass rate bars
 * - Color-coded performance
 * - Responsive layout
 *
 * Integration Note: Data from /api/v1/marks/performance/class/{id}/exam/{id}
 */
export function ClassPerformanceChart({ data, loading }: ClassPerformanceChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width={250} height={30} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Class Performance by Subject
          </Typography>
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No performance data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Class Performance by Subject
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject_name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="average_score" fill="#1976d2" name="Average Score (%)" />
            <Bar dataKey="pass_rate" fill="#2e7d32" name="Pass Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
