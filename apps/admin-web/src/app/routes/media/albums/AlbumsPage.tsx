// ============================================================================
// FILE: src/app/routes/media/albums/AlbumsPage.tsx
// PURPOSE: Albums list page with filtering, search, and create functionality
// ============================================================================

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Paper,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  PhotoLibrary as AlbumIcon,
  Collections as PhotosIcon,
  Event as EventIcon,
  CalendarMonth as DateIcon,
} from "@mui/icons-material";

import { AlbumCard, CreateAlbumDialog } from "../../../components/albums";
import { useAlbums, useAlbumKpi } from "../../../services/albums.hooks";
import type { Album } from "../../../services/albums.schema";

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, loading }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${color}.50`,
        color: `${color}.main`,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      {loading ? (
        <Skeleton width={60} height={32} />
      ) : (
        <Typography variant="h5" fontWeight={600}>
          {value}
        </Typography>
      )}
    </Box>
  </Paper>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AlbumsPage() {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<"all" | "event" | "standalone">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Queries
  const { data: albumsData, isLoading, error } = useAlbums();
  const { data: kpi, isLoading: kpiLoading } = useAlbumKpi();

  // Extract albums array from paginated response
  const albums = useMemo(() => {
    if (!albumsData) return [];
    if (Array.isArray(albumsData)) return albumsData;
    return albumsData.items || [];
  }, [albumsData]);

  // Filter albums
  const filteredAlbums = useMemo(() => {
    return albums.filter((album: Album) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          album.name.toLowerCase().includes(query) ||
          album.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Event filter
      if (eventFilter === "event" && !album.eventId) {
        return false;
      }
      if (eventFilter === "standalone" && album.eventId) {
        return false;
      }

      return true;
    });
  }, [albums, searchQuery, eventFilter]);

  // AlbumCard handles navigation internally
  void navigate;

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load albums. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AlbumIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Albums
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage photo albums and event galleries
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Album
        </Button>
      </Box>

      {/* KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <KpiCard
          title="Total Albums"
          value={kpi?.totalAlbums ?? 0}
          icon={<AlbumIcon />}
          color="primary"
          loading={kpiLoading}
        />
        <KpiCard
          title="Total Photos"
          value={kpi?.totalImages ?? 0}
          icon={<PhotosIcon />}
          color="success"
          loading={kpiLoading}
        />
        <KpiCard
          title="Event Albums"
          value={kpi?.eventAlbums ?? 0}
          icon={<EventIcon />}
          color="info"
          loading={kpiLoading}
        />
        <KpiCard
          title="Recent Uploads"
          value={kpi?.recentUploads ?? 0}
          icon={<DateIcon />}
          color="warning"
          loading={kpiLoading}
        />
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          {/* Type Filter Chips */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label="All"
              variant={eventFilter === "all" ? "filled" : "outlined"}
              color={eventFilter === "all" ? "primary" : "default"}
              onClick={() => setEventFilter("all")}
            />
            <Chip
              label="Event Albums"
              variant={eventFilter === "event" ? "filled" : "outlined"}
              color={eventFilter === "event" ? "primary" : "default"}
              onClick={() => setEventFilter("event")}
            />
            <Chip
              label="Standalone"
              variant={eventFilter === "standalone" ? "filled" : "outlined"}
              color={eventFilter === "standalone" ? "primary" : "default"}
              onClick={() => setEventFilter("standalone")}
            />
          </Box>
        </Box>
      </Paper>

      {/* Albums Grid */}
      {isLoading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={260}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : filteredAlbums.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <AlbumIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No albums found
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            {searchQuery || eventFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first album to get started"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Album
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {filteredAlbums.map((album: Album) => (
            <AlbumCard
              key={album.albumId}
              album={album}
            />
          ))}
        </Box>
      )}

      {/* Results count */}
      {!isLoading && filteredAlbums.length > 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center" }}
        >
          Showing {filteredAlbums.length} of {albums.length} albums
        </Typography>
      )}

      {/* Create Album Dialog */}
      <CreateAlbumDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
}
