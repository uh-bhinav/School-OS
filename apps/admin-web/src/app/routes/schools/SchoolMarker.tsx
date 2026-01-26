// ============================================================================
// SCHOOL MARKER - Map Marker Component with Tooltip
// ============================================================================
// Simple dot marker with:
// - Color based on status (green/yellow/red)
// - Hover tooltip with school name, region, status
// - Click handler to open side panel
// No bouncing, no animations, calm and professional.
// ============================================================================

import { useState, useCallback } from "react";
import { Box, Tooltip, Typography, alpha } from "@mui/material";
import { useThemeMode } from "../../providers/ThemeProvider";
import type { School } from "../../mockDataProviders/mockSuperAdmin";

interface SchoolMarkerProps {
  school: School;
  isHovered: boolean;
  isSelected: boolean;
  onClick: (school: School) => void;
  onHover: (schoolId: number | null) => void;
}

// Status to color mapping
const statusColors: Record<School["status"], { main: string; border: string }> = {
  healthy: { main: "#4caf50", border: "#2e7d32" },
  attention: { main: "#ff9800", border: "#f57c00" },
  critical: { main: "#f44336", border: "#c62828" },
};

// Status labels for tooltip
const statusLabels: Record<School["status"], string> = {
  healthy: "Healthy",
  attention: "Watchlist",
  critical: "Needs Attention",
};

export default function SchoolMarker({
  school,
  isHovered,
  isSelected,
  onClick,
  onHover,
}: SchoolMarkerProps) {
  const { mode } = useThemeMode();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const colors = statusColors[school.status];

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent map click from closing panel
      onClick(school);
    },
    [onClick, school]
  );

  const handleMouseEnter = useCallback(() => {
    onHover(school.id);
    setTooltipOpen(true);
  }, [onHover, school.id]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
    setTooltipOpen(false);
  }, [onHover]);

  // Marker size based on state
  const baseSize = 12;
  const size = isSelected ? baseSize + 4 : isHovered ? baseSize + 2 : baseSize;

  // Tooltip content
  const tooltipContent = (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.25 }}>
        {school.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {school.region} Region
      </Typography>
      <Box
        sx={{
          mt: 0.5,
          display: "inline-block",
          px: 1,
          py: 0.25,
          borderRadius: 1,
          fontSize: "0.7rem",
          fontWeight: 500,
          backgroundColor: alpha(colors.main, 0.2),
          color: colors.main,
        }}
      >
        {statusLabels[school.status]}
      </Box>
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      open={tooltipOpen && !isSelected} // Hide tooltip when panel is open
      placement="top"
      arrow
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: mode === "dark" ? "#2a2a4a" : "#fff",
            color: mode === "dark" ? "#fff" : "#333",
            boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: 1.5,
            p: 1,
            maxWidth: 200,
            "& .MuiTooltip-arrow": {
              color: mode === "dark" ? "#2a2a4a" : "#fff",
            },
          },
        },
      }}
    >
      <Box
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: colors.main,
          border: `2px solid ${colors.border}`,
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: isSelected
            ? `0 0 0 3px ${alpha(colors.main, 0.3)}, 0 2px 8px rgba(0,0,0,0.3)`
            : isHovered
              ? `0 0 0 2px ${alpha(colors.main, 0.2)}, 0 2px 6px rgba(0,0,0,0.2)`
              : "0 1px 3px rgba(0,0,0,0.2)",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      />
    </Tooltip>
  );
}
