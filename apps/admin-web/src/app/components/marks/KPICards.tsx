import { Box, Card, CardContent, Skeleton, Tooltip, Typography } from "@mui/material";
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as TrophyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { MarksKpi } from "@/app/services/marks.schema";

interface KPICardsProps {
  data?: MarksKpi;
  loading?: boolean;
}

/**
 * KPICards Component
 *
 * Displays 5 key performance indicator cards for marks overview:
 * 1. Total Students - Number of students in the filtered dataset
 * 2. Average Score - Mean marks obtained across all students
 * 3. Pass Rate - Percentage of students passing (>=40%)
 * 4. Highest Score - Top marks achieved
 * 5. Low Performers - Students scoring below 50%
 *
 * Features:
 * - Icon-based visual hierarchy
 * - Loading skeletons during data fetch
 * - Tooltips for additional context
 * - Responsive grid layout
 * - Color-coded cards (warning for low performers)
 *
 * Integration Note: Data comes from /api/v1/marks/kpi endpoint
 */
export function KPICards({ data, loading }: KPICardsProps) {
  // Calculate derived values from backend schema
  const totalStudents = data?.total_students ?? 0;
  const averageScore = data?.class_average ?? 0;
  const highestScore = data?.highest_score ?? 0;
  const studentsPassed = data?.students_passed ?? 0;

  // Pass rate = (students_passed / total_students) * 100
  const passRate = totalStudents > 0 ? (studentsPassed / totalStudents) * 100 : 0;

  // Low performers = total - students_passed (students who failed)
  const lowPerformers = totalStudents - studentsPassed;

  const kpiItems = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
      tooltip: "Number of students in the selected class/section/exam",
    },
    {
      label: "Average Score",
      value: `${averageScore.toFixed(1)}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#2e7d32",
      tooltip: "Mean marks obtained across all subjects and students",
    },
    {
      label: "Pass Rate",
      value: `${passRate.toFixed(1)}%`,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: "#388e3c",
      tooltip: "Percentage of students scoring ≥40%",
    },
    {
      label: "Highest Score",
      value: highestScore,
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      color: "#f57c00",
      tooltip: "Top marks achieved in the selected filters",
    },
    {
      label: "Low Performers",
      value: lowPerformers,
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: "#d32f2f",
      tooltip: "Students scoring below 40% - need attention",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 2,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} sx={{ minHeight: 140 }}>
            <CardContent>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" sx={{ mt: 2 }} />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 2,
      }}
    >
      {kpiItems.map((item, index) => (
        <Tooltip key={index} title={item.tooltip} arrow placement="top">
          <Card
            sx={{
              minHeight: 140,
              transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box sx={{ color: item.color, opacity: 0.9 }}>{item.icon}</Box>
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: item.color, mb: 0.5 }}
              >
                {item.value}
              </Typography>

              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {item.label}
              </Typography>
            </CardContent>
          </Card>
        </Tooltip>
      ))}
    </Box>
  );
}
