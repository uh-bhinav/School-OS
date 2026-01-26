// ============================================================================
// SCHOOLS PAGE - Super Admin All Schools View
// ============================================================================
// Displays all schools in a List View (default) or Map View (toggleable).
// Answers the question: "Are issues across my schools regional or isolated?"
// Read-only surface for decision-making, not analytics.
// ============================================================================

import { useState } from "react";
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography, alpha } from "@mui/material";
import { ViewList as ListIcon, Map as MapIcon } from "@mui/icons-material";
import { useThemeMode } from "../../providers/ThemeProvider";
import { mockSchools } from "../../mockDataProviders/mockSuperAdmin";
import SchoolsListView from "./SchoolsListView";
import SchoolsMapView from "./SchoolsMapView";

type ViewMode = "list" | "map";

export default function SchoolsPage() {
  const { mode } = useThemeMode();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "calc(100vh - 64px)", // Account for app bar
        p: 3,
        gap: 2,
      }}
    >
      {/* Top Utility Bar */}
      <Paper
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          borderRadius: 2,
          backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.8) : alpha("#fff", 0.9),
          boxShadow: mode === "dark" ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            All Schools
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mockSchools.length} schools across {new Set(mockSchools.map((s) => s.region)).size} regions
          </Typography>
        </Box>

        {/* View Toggle - Right Aligned */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              px: 2,
              py: 0.75,
              textTransform: "none",
              fontWeight: 500,
              borderColor: mode === "dark" ? alpha("#fff", 0.15) : alpha("#000", 0.12),
              "&.Mui-selected": {
                backgroundColor: mode === "dark" ? alpha("#1976d2", 0.3) : alpha("#1976d2", 0.12),
                color: mode === "dark" ? "#90caf9" : "#1565c0",
                "&:hover": {
                  backgroundColor: mode === "dark" ? alpha("#1976d2", 0.4) : alpha("#1976d2", 0.18),
                },
              },
            },
          }}
        >
          <ToggleButton value="list">
            <ListIcon sx={{ mr: 0.75, fontSize: 18 }} />
            List View
          </ToggleButton>
          <ToggleButton value="map">
            <MapIcon sx={{ mr: 0.75, fontSize: 18 }} />
            Map View
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // Important for flex child to shrink
          display: "flex",
          flexDirection: "column",
        }}
      >
        {viewMode === "list" ? (
          <SchoolsListView schools={mockSchools} />
        ) : (
          <SchoolsMapView schools={mockSchools} />
        )}
      </Box>
    </Box>
  );
}
