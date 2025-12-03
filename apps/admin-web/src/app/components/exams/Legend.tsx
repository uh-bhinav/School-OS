import { Box, Paper, Typography, Chip, Divider } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

export default function Legend() {
  const statusItems = [
    { label: "Published", color: "success", description: "Results are visible to students" },
    { label: "Draft", color: "default", description: "Results are hidden" },
  ];

  const gradeItems = [
    { grade: "A+", color: "#2e7d32", range: "90-100%" },
    { grade: "A", color: "#388e3c", range: "80-89%" },
    { grade: "B+", color: "#1976d2", range: "70-79%" },
    { grade: "B", color: "#1e88e5", range: "60-69%" },
    { grade: "C", color: "#ed6c02", range: "50-59%" },
    { grade: "D/F", color: "#d32f2f", range: "Below 50%" },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <InfoIcon sx={{ color: "#0B5F5A", fontSize: 20 }} />
        <Typography variant="subtitle2" fontWeight={600}>
          Legend
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Status Legend */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom>
          Exam Status
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
          {statusItems.map((item) => (
            <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={item.label}
                size="small"
                color={item.color as any}
                sx={{ fontWeight: 600 }}
              />
              <Typography variant="caption" color="text.secondary">
                - {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Grade Legend */}
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} gutterBottom>
          Grade Scale
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
          {gradeItems.map((item) => (
            <Box key={item.grade} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Chip
                label={item.grade}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: item.color,
                  color: "white",
                  minWidth: 40,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {item.range}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
