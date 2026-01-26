// ============================================================================
// SCHOOLS MAP VIEW - MapLibre Map Display for All Schools
// ============================================================================
// Read-only map using MapLibre with OpenFreeMap tiles:
// - Markers colored by status (green/yellow/red)
// - Hover tooltips with school name, region, status
// - Click opens side panel (no route change)
// - Centered on India with appropriate zoom
// ============================================================================

import { useState, useCallback, useRef, useEffect } from "react";
import { Box, alpha } from "@mui/material";
import { Map, Marker, NavigationControl, type MapRef } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useThemeMode } from "../../providers/ThemeProvider";
import type { School } from "../../mockDataProviders/mockSuperAdmin";
import SchoolMarker from "./SchoolMarker";
import SchoolSidePanel from "./SchoolSidePanel";

interface SchoolsMapViewProps {
  schools: School[];
}

// OpenFreeMap style URL (no API key required)
const MAP_STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
const MAP_STYLE_DARK = "https://tiles.openfreemap.org/styles/dark";

// Initial view centered on India
const INITIAL_VIEW_STATE = {
  longitude: 78.9629, // Center of India
  latitude: 22.5937,
  zoom: 4.5, // Shows regional clustering
};

export default function SchoolsMapView({ schools }: SchoolsMapViewProps) {
  const { mode } = useThemeMode();
  const mapRef = useRef<MapRef>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [hoveredSchoolId, setHoveredSchoolId] = useState<number | null>(null);

  // Get the appropriate map style based on theme
  const mapStyle = mode === "dark" ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;

  // Handle marker click - opens side panel
  const handleMarkerClick = useCallback((school: School) => {
    setSelectedSchool(school);
  }, []);

  // Handle closing side panel
  const handleClosePanel = useCallback(() => {
    setSelectedSchool(null);
  }, []);

  // Handle marker hover
  const handleMarkerHover = useCallback((schoolId: number | null) => {
    setHoveredSchoolId(schoolId);
  }, []);

  // Close panel when clicking on map (outside markers)
  const handleMapClick = useCallback(() => {
    // Only close if clicking on map background (not on a marker)
    // This is handled by the marker's stopPropagation
  }, []);

  // Prevent map style flickering on theme change
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      if (map) {
        map.setStyle(mapStyle);
      }
    }
  }, [mapStyle]);

  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
        "& .maplibregl-map": {
          borderRadius: 2,
        },
        // Style the attribution
        "& .maplibregl-ctrl-attrib": {
          backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.8) : alpha("#fff", 0.8),
          borderRadius: "4px 0 0 0",
          fontSize: "10px",
        },
      }}
    >
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" showCompass={false} />

        {/* School markers */}
        {schools.map((school) => (
          <Marker
            key={school.id}
            longitude={school.longitude}
            latitude={school.latitude}
            anchor="center"
          >
            <SchoolMarker
              school={school}
              isHovered={hoveredSchoolId === school.id}
              isSelected={selectedSchool?.id === school.id}
              onClick={handleMarkerClick}
              onHover={handleMarkerHover}
            />
          </Marker>
        ))}
      </Map>

      {/* Side Panel - Slides in from right on marker click */}
      <SchoolSidePanel school={selectedSchool} onClose={handleClosePanel} />
    </Box>
  );
}
