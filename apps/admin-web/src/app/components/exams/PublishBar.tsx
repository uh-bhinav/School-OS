import { Box, Paper, Typography, Switch, FormControlLabel, Chip } from "@mui/material";
import { Publish as PublishIcon } from "@mui/icons-material";

interface PublishBarProps {
  isPublished: boolean;
  onToggle: (published: boolean) => void;
  disabled?: boolean;
  examTitle?: string;
}

export default function PublishBar({
  isPublished,
  onToggle,
  disabled = false,
  examTitle,
}: PublishBarProps) {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: isPublished ? "#d4edda" : "#fff3cd",
        borderLeft: `4px solid ${isPublished ? "#2e7d32" : "#ed6c02"}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <PublishIcon
          sx={{
            color: isPublished ? "success.main" : "warning.main",
            fontSize: 28,
          }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {examTitle || "Exam Results"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isPublished
              ? "Results are visible to students and parents"
              : "Results are hidden from students and parents"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          label={isPublished ? "Published" : "Draft"}
          color={isPublished ? "success" : "default"}
          size="small"
          sx={{ fontWeight: 600 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isPublished}
              onChange={(e) => onToggle(e.target.checked)}
              disabled={disabled}
              color="success"
            />
          }
          label={isPublished ? "Published" : "Publish"}
        />
      </Box>
    </Paper>
  );
}
