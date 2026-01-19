import { Box, Chip, Typography, Paper } from "@mui/material";

/**
 * Legend component explaining cell color meanings
 */
export default function Legend() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.primary">
          Legend:
        </Typography>
        <Chip
          label="Free"
          variant="outlined"
          size="small"
          sx={{ borderStyle: "dashed", borderWidth: 2 }}
        />
        <Chip label="Scheduled" color="primary" variant="outlined" size="small" />
        <Chip label="Conflict" color="error" variant="filled" size="small" />
        <Chip label="Published" color="success" variant="filled" size="small" />
      </Box>
    </Paper>
  );
}
