// ============================================================================
// FILE: src/app/components/albums/AlbumImageGrid.tsx
// PURPOSE: Grid component for displaying album images with lightbox
// ============================================================================

import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Close,
  Delete,
  NavigateBefore,
  NavigateNext,
  Download,
  ZoomIn,
} from "@mui/icons-material";
import type { AlbumImage } from "../../services/albums.schema";

interface AlbumImageGridProps {
  images: AlbumImage[];
  onDeleteImage?: (imageId: string) => void;
  canDelete?: boolean;
}

export default function AlbumImageGrid({
  images,
  onDeleteImage,
  canDelete = true,
}: AlbumImageGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "Escape") closeLightbox();
  };

  const currentImage = images[currentIndex];

  if (images.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "grey.50",
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary">
          No images in this album yet.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Image Grid */}
      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={image.imageId}>
            <Box
              sx={{
                position: "relative",
                paddingTop: "100%",
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "grey.100",
                cursor: "pointer",
                "&:hover .overlay": {
                  opacity: 1,
                },
              }}
              onClick={() => openLightbox(index)}
            >
              <Box
                component="img"
                src={image.thumbnailUrl || image.url}
                alt={image.caption || `Image ${index + 1}`}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Hover Overlay */}
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
              >
                <ZoomIn sx={{ color: "white", fontSize: 40 }} />
              </Box>
              {/* Delete Button */}
              {canDelete && onDeleteImage && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(image.imageId);
                  }}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    bgcolor: "rgba(244,67,54,0.9)",
                    color: "white",
                    opacity: 0,
                    ".overlay:hover + &, &:hover": {
                      opacity: 1,
                    },
                    "&:hover": {
                      bgcolor: "error.main",
                      opacity: 1,
                    },
                  }}
                  className="delete-btn"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="xl"
        fullWidth
        onKeyDown={handleKeyDown}
        PaperProps={{
          sx: {
            bgcolor: "black",
            maxHeight: "95vh",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative", display: "flex", alignItems: "center" }}>
          {/* Close Button */}
          <IconButton
            onClick={closeLightbox}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              zIndex: 10,
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <Close />
          </IconButton>

          {/* Navigation - Previous */}
          {images.length > 1 && (
            <IconButton
              onClick={goPrev}
              sx={{
                position: "absolute",
                left: 8,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                zIndex: 10,
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <NavigateBefore fontSize="large" />
            </IconButton>
          )}

          {/* Image */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: "70vh",
            }}
          >
            <Box
              component="img"
              src={currentImage?.url}
              alt={currentImage?.caption || ""}
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
            {/* Caption and Info */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: 2, color: "white" }}
            >
              <Typography variant="body2">
                {currentIndex + 1} / {images.length}
              </Typography>
              {currentImage?.caption && (
                <Typography variant="body1">{currentImage.caption}</Typography>
              )}
              {currentImage?.fileName && (
                <Chip
                  label={currentImage.fileName}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                />
              )}
              <Tooltip title="Download">
                <IconButton
                  component="a"
                  href={currentImage?.url}
                  download={currentImage?.fileName || "image"}
                  sx={{ color: "white" }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Navigation - Next */}
          {images.length > 1 && (
            <IconButton
              onClick={goNext}
              sx={{
                position: "absolute",
                right: 8,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                zIndex: 10,
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <NavigateNext fontSize="large" />
            </IconButton>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
