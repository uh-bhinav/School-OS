import { Box, Card, CardContent, Typography } from "@mui/material";

interface SummaryCardsProps {
  totalMarks?: number;
  publishedCount?: number;
  draftCount?: number;
}

/**
 * SummaryCards Component
 *
 * Displays summary statistics at the bottom of marks page.
 *
 * Features:
 * - Total marks entered
 * - Published vs Draft count
 * - Quick stats overview
 */
export function SummaryCards({ totalMarks = 0, publishedCount = 0, draftCount = 0 }: SummaryCardsProps) {
  const stats = [
    { label: "Total Marks Entered", value: totalMarks, color: "#1976d2" },
    { label: "Published", value: publishedCount, color: "#2e7d32" },
    { label: "Draft", value: draftCount, color: "#ed6c02" },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: 2,
      }}
    >
      {stats.map((stat, index) => (
        <Card key={index} sx={{ bgcolor: "grey.50" }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {stat.label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
              {stat.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
