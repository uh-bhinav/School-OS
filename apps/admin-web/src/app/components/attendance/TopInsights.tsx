// components/attendance/TopInsights.tsx
import { useMemo } from "react";
import { Paper, Typography, Box, Chip, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AttendanceListResponse, WeeklySummary } from "../../services/attendance.schema";

interface InsightData {
  type: "success" | "warning" | "info" | "error";
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function TopInsights({
  currentData,
  weeklySummary,
}: {
  currentData?: AttendanceListResponse;
  weeklySummary?: WeeklySummary;
}) {
  const insights = useMemo(() => {
    const results: InsightData[] = [];

    if (!currentData && !weeklySummary) {
      return results;
    }

    // Insight 1: Overall class performance
    if (weeklySummary && weeklySummary.buckets && weeklySummary.buckets.length > 0) {
      const avgPresent = weeklySummary.buckets.reduce((sum, b) => sum + b.present_pct, 0) / weeklySummary.buckets.length;

      if (avgPresent >= 95) {
        results.push({
          type: "success",
          icon: <CheckCircleIcon />,
          title: "Excellent Attendance",
          description: `Weekly average attendance is ${avgPresent.toFixed(1)}% — exceeding target.`,
        });
      } else if (avgPresent >= 85) {
        results.push({
          type: "info",
          icon: <TrendingUpIcon />,
          title: "Good Attendance",
          description: `Weekly average is ${avgPresent.toFixed(1)}%. Continue monitoring students below 80%.`,
        });
      } else {
        results.push({
          type: "warning",
          icon: <TrendingDownIcon />,
          title: "Below Target",
          description: `Weekly average attendance is ${avgPresent.toFixed(1)}%. Intervention recommended.`,
        });
      }

      // Insight 2: Lowest performing grade
      const lowest = [...weeklySummary.buckets].sort((a, b) => a.present_pct - b.present_pct)[0];
      if (lowest && lowest.present_pct < 85) {
        results.push({
          type: "warning",
          icon: <WarningAmberIcon />,
          title: "Low Consistency Detected",
          description: `${lowest.grade_label} shows ${lowest.present_pct.toFixed(1)}% attendance — needs attention.`,
        });
      }
    }

    // Insight 3: Current day status
    if (currentData && currentData.items && currentData.items.length > 0) {
      const late = currentData.items.filter((i) => i.status === "LATE").length;
      const total = currentData.items.length;
      const unmarked = Math.max(0, currentData.total - total);

      if (unmarked > 5) {
        results.push({
          type: "info",
          icon: <WarningAmberIcon />,
          title: `${unmarked} Students Unmarked`,
          description: `Complete attendance marking for accurate tracking today.`,
        });
      }

      if (late > total * 0.15) {
        results.push({
          type: "warning",
          icon: <TrendingDownIcon />,
          title: "High Tardiness",
          description: `${late} students marked late today (${((late / total) * 100).toFixed(1)}%). Consider investigating patterns.`,
        });
      }
    }

    return results.slice(0, 3); // Top 3 insights
  }, [currentData, weeklySummary]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        background: "linear-gradient(135deg, rgba(11, 95, 90, 0.03) 0%, rgba(11, 95, 90, 0.08) 100%)",
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        📊 Top Insights
      </Typography>
      <Stack spacing={2}>
        {insights.map((insight, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateX(4px)",
                boxShadow: 2,
              },
            }}
          >
            <Chip
              icon={insight.icon as React.ReactElement}
              label=""
              color={insight.type}
              size="small"
              sx={{ minWidth: 40, "& .MuiChip-icon": { ml: 1 } }}
            />
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {insight.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {insight.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
