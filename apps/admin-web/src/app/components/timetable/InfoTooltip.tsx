import { Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface InfoTooltipProps {
  title: string;
  size?: "small" | "medium";
}

/**
 * Reusable info tooltip component for displaying helpful hints
 * @param title - The tooltip text to display
 * @param size - Icon button size
 */
export default function InfoTooltip({ title, size = "small" }: InfoTooltipProps) {
  return (
    <Tooltip title={title} arrow placement="top">
      <IconButton size={size} sx={{ ml: 0.5, color: "text.secondary" }}>
        <InfoOutlinedIcon fontSize={size === "small" ? "inherit" : "small"} />
      </IconButton>
    </Tooltip>
  );
}
