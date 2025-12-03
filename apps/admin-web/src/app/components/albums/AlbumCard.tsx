// ============================================================================
// FILE: src/app/components/albums/AlbumCard.tsx
// PURPOSE: Card component for displaying album summary
// ============================================================================

import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import {
  PhotoLibrary,
  Event,
  Public,
  Lock,
  School,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { Album } from "../../services/albums.schema";
import {
  AlbumVisibility,
  getVisibilityLabel,
  getVisibilityColor,
  getAlbumTypeLabel,
} from "../../services/albums.schema";

interface AlbumCardProps {
  album: Album;
}

const visibilityIcons = {
  [AlbumVisibility.Public]: <Public fontSize="small" />,
  [AlbumVisibility.Private]: <Lock fontSize="small" />,
  [AlbumVisibility.ClassOnly]: <School fontSize="small" />,
};

export default function AlbumCard({ album }: AlbumCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const visibilityColor = getVisibilityColor(album.visibility);
  const VisibilityIcon = visibilityIcons[album.visibility] || <Visibility fontSize="small" />;

  // Use local event images as fallback
  const coverImageUrl = album.coverImage || "/event_1.jpeg";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      {/* Cover Image */}
      <CardMedia
        component="div"
        sx={{
          height: 180,
          backgroundImage: `url(${coverImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Image Count Badge */}
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            bgcolor: "rgba(0,0,0,0.7)",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <PhotoLibrary fontSize="small" />
          <Typography variant="body2" fontWeight={500}>
            {album.imageCount}
          </Typography>
        </Box>

        {/* Event Badge (if linked to event) */}
        {album.eventId && (
          <Chip
            icon={<Event />}
            label="Event Album"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "rgba(0,0,0,0.7)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        )}
      </CardMedia>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Title */}
        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
          {album.name}
        </Typography>

        {/* Description */}
        {album.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {album.description}
          </Typography>
        )}

        {/* Meta Info */}
        <Stack spacing={1}>
          <Box display="flex" alignItems="center" gap={1}>
            {VisibilityIcon}
            <Chip
              label={getVisibilityLabel(album.visibility)}
              size="small"
              sx={{
                bgcolor: visibilityColor,
                color: "white",
                fontWeight: 500,
                fontSize: "0.7rem",
                height: 20,
              }}
            />
            <Chip
              label={getAlbumTypeLabel(album.albumType)}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          </Box>

          {album.eventName && (
            <Typography variant="caption" color="text.secondary">
              Event: {album.eventName}
            </Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(album.createdAt)}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          size="small"
          fullWidth
          onClick={() => navigate(`/albums/${album.albumId}`)}
          sx={{ textTransform: "none" }}
        >
          View Album
        </Button>
      </CardActions>
    </Card>
  );
}
