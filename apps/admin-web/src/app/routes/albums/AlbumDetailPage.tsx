// ============================================================================
// FILE: src/app/routes/albums/AlbumDetailPage.tsx
// PURPOSE: Album detail page with image grid and upload functionality
// ============================================================================

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  Avatar,
  Skeleton,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  PhotoLibrary,
  Event,
  Public,
  Lock,
  School,
  CalendarMonth,
  Person,
  Collections,
  Close,
  NavigateBefore,
  NavigateNext,
  Save,
  Cancel,
} from "@mui/icons-material";

import { AlbumPhotoUploader } from "../../components/albums";
import {
  useAlbumById,
  useUpdateAlbum,
  useDeleteAlbum,
  useAlbumImages,
  useDeleteAlbumImage,
} from "../../services/albums.hooks";
import {
  AlbumVisibility,
  getVisibilityLabel,
  getVisibilityColor,
  getAlbumTypeLabel,
} from "../../services/albums.schema";

// ─────────────────────────────────────────────────────────────────────────────
// VISIBILITY ICONS
// ─────────────────────────────────────────────────────────────────────────────
const visibilityIcons = {
  [AlbumVisibility.Public]: <Public fontSize="small" />,
  [AlbumVisibility.Private]: <Lock fontSize="small" />,
  [AlbumVisibility.ClassOnly]: <School fontSize="small" />,
};

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTBOX COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface LightboxProps {
  open: boolean;
  images: Array<{ imageId: string; url: string; caption?: string; fileName?: string }>;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  open,
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" noWrap sx={{ maxWidth: "80%" }}>
          {currentImage?.caption || currentImage?.fileName || `Photo ${currentIndex + 1}`}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
            bgcolor: "black",
            position: "relative",
          }}
        >
          <img
            src={currentImage?.url}
            alt={currentImage?.caption || "Album photo"}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <IconButton
              onClick={onPrev}
              sx={{
                position: "absolute",
                left: 8,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <NavigateBefore />
            </IconButton>
          )}
          {currentIndex < images.length - 1 && (
            <IconButton
              onClick={onNext}
              sx={{
                position: "absolute",
                right: 8,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <NavigateNext />
            </IconButton>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {currentIndex + 1} / {images.length}
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AlbumDetailPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Queries
  const { data: album, isLoading, error } = useAlbumById(albumId!);
  const { data: images = [], isLoading: imagesLoading } = useAlbumImages(albumId!);
  const updateAlbumMutation = useUpdateAlbum();
  const deleteAlbumMutation = useDeleteAlbum();
  const deleteImageMutation = useDeleteAlbumImage();

  // Start editing
  const startEditing = () => {
    if (album) {
      setEditName(album.name);
      setEditDescription(album.description || "");
      setIsEditing(true);
    }
  };

  // Save edits
  const saveEdits = async () => {
    if (!albumId) return;
    await updateAlbumMutation.mutateAsync({
      albumId,
      data: {
        name: editName,
        description: editDescription,
      },
    });
    setIsEditing(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditName("");
    setEditDescription("");
  };

  // Delete album
  const handleDelete = async () => {
    if (!albumId) return;
    await deleteAlbumMutation.mutateAsync(albumId);
    navigate("/media/albums");
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    if (!albumId) return;
    if (window.confirm("Are you sure you want to delete this image?")) {
      await deleteImageMutation.mutateAsync({ albumId, imageId });
    }
  };

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Format helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" />
      </Box>
    );
  }

  // Error state
  if (error || !album) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Album not found or failed to load.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/media/albums")}>
          Back to Albums
        </Button>
      </Box>
    );
  }

  const visibilityColor = getVisibilityColor(album.visibility);
  const VisibilityIcon = visibilityIcons[album.visibility] || <Public fontSize="small" />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/media/albums")}
        sx={{ mb: 2 }}
      >
        Back to Albums
      </Button>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
              <PhotoLibrary sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              {isEditing ? (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Album Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    size="small"
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Save />}
                      onClick={saveEdits}
                      disabled={updateAlbumMutation.isPending}
                    >
                      {updateAlbumMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={cancelEditing}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <>
                  <Typography variant="h4" fontWeight={600}>
                    {album.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={VisibilityIcon}
                      label={getVisibilityLabel(album.visibility)}
                      size="small"
                      sx={{
                        bgcolor: visibilityColor,
                        color: "white",
                        fontWeight: 500,
                        "& .MuiChip-icon": { color: "white" },
                      }}
                    />
                    <Chip
                      label={getAlbumTypeLabel(album.albumType)}
                      size="small"
                      variant="outlined"
                    />
                    {album.eventId && (
                      <Chip
                        icon={<Event />}
                        label="Event Album"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {album.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                      {album.description}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Box>

          {!isEditing && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={startEditing}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>

        {/* Meta info */}
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={4} flexWrap="wrap">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Collections color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {album.imageCount} Photos
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonth color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Created {formatDate(album.createdAt)}
            </Typography>
          </Box>
          {album.createdByName && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                By {album.createdByName}
              </Typography>
            </Box>
          )}
          {album.eventName && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Event color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {album.eventName}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Upload Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Upload Photos
        </Typography>
        <AlbumPhotoUploader albumId={album.albumId} />
      </Paper>

      {/* Photos Grid */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Photos ({images.length})
        </Typography>

        {imagesLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 2,
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={150}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        ) : images.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Collections sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No photos yet
            </Typography>
            <Typography color="text.disabled">
              Upload some photos above to get started!
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 2,
            }}
          >
            {images.map((image, index) => (
              <Box
                key={image.imageId}
                sx={{
                  position: "relative",
                  paddingTop: "75%", // 4:3 aspect ratio
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  bgcolor: "grey.100",
                  "&:hover .overlay": {
                    opacity: 1,
                  },
                }}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  alt={image.caption || image.fileName || "Album photo"}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" color="white" noWrap sx={{ maxWidth: "90%" }}>
                    {image.caption || image.fileName}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.imageId);
                    }}
                    sx={{
                      color: "white",
                      bgcolor: "error.main",
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Album</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{album.name}"? This will also delete all
            {album.imageCount} photos in this album. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteAlbumMutation.isPending}
          >
            {deleteAlbumMutation.isPending ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        images={images}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => Math.max(0, prev - 1))}
        onNext={() => setLightboxIndex((prev) => Math.min(images.length - 1, prev + 1))}
      />
    </Box>
  );
};

export default AlbumDetailPage;
