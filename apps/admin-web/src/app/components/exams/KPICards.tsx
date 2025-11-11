import { Box, Card, CardContent, Typography, Tooltip, Skeleton } from "@mui/material";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";

interface KPICardsProps {
  totalExams: number;
  avgPerformance: number;
  passRate: number;
  pendingResults: number;
  publishedCount: number;
  isLoading?: boolean;
}

interface KPICardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  tooltip: string;
}

export default function KPICards({
  totalExams,
  avgPerformance,
  passRate,
  pendingResults,
  publishedCount,
  isLoading = false,
}: KPICardsProps) {
  const kpis: KPICardData[] = [
    {
      title: "Total Exams",
      value: totalExams,
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: "#0B5F5A",
      tooltip: "Total number of exams scheduled for the selected filters",
    },
    {
      title: "Avg Performance",
      value: `${avgPerformance.toFixed(1)}%`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
      tooltip: "Average student performance across all published exams",
    },
    {
      title: "Pass Rate",
      value: `${passRate.toFixed(1)}%`,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      color: "#2e7d32",
      tooltip: "Overall pass percentage across all published exams",
    },
    {
      title: "Pending Results",
      value: pendingResults,
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      color: "#ed6c02",
      tooltip: "Number of exams with unpublished results",
    },
    {
      title: "Published",
      value: publishedCount,
      icon: <PublishIcon sx={{ fontSize: 40 }} />,
      color: "#9c27b0",
      tooltip: "Number of exams with published results",
    },
  ];

  if (isLoading) {
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
      {kpis.map((kpi, index) => (
        <Tooltip key={index} title={kpi.tooltip} arrow placement="top">
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
                <Box sx={{ color: kpi.color, opacity: 0.9 }}>{kpi.icon}</Box>
              </Box>

              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: kpi.color, mb: 0.5 }}
              >
                {kpi.value}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                {kpi.title}
              </Typography>
            </CardContent>
          </Card>
        </Tooltip>
      ))}
    </Box>
  );
}
