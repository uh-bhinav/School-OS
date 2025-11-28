// ============================================================================
// LEAVE ATTACHMENT VIEWER COMPONENT
// ============================================================================
// Modal for viewing and downloading leave attachments (medical certificates etc.)
// ============================================================================

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import DescriptionIcon from "@mui/icons-material/Description";

interface LeaveAttachmentViewerProps {
  open: boolean;
  onClose: () => void;
  attachmentUrl?: string;
  attachmentName?: string;
}

export default function LeaveAttachmentViewer({
  open,
  onClose,
  attachmentUrl,
  attachmentName,
}: LeaveAttachmentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleDownload = () => {
    if (!attachmentUrl) return;

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = attachmentUrl;
    link.download = attachmentName || "attachment";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  // Reset state when dialog opens
  const handleEnter = () => {
    setZoom(1);
    setLoading(true);
    setError(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          py: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <DescriptionIcon color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Attachment Preview
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {attachmentName || "Document"}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.04),
          overflow: "auto",
        }}
      >
        {/* Zoom Controls */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 1,
            py: 1,
            px: 2,
            bgcolor: "background.paper",
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            zIndex: 1,
          }}
        >
          <IconButton onClick={handleZoomOut} size="small" disabled={zoom <= 0.5}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetZoom}
            sx={{ minWidth: 80, fontSize: "0.75rem" }}
          >
            {Math.round(zoom * 100)}%
          </Button>
          <IconButton onClick={handleZoomIn} size="small" disabled={zoom >= 3}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={handleResetZoom} size="small">
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Image Preview */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            overflow: "auto",
            width: "100%",
          }}
        >
          {loading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading attachment...
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="body1" color="text.secondary">
                Unable to load preview
              </Typography>
              <Typography variant="caption" color="text.disabled">
                The attachment may be unavailable or in an unsupported format
              </Typography>
            </Box>
          )}

          {attachmentUrl && (
            <Box
              component="img"
              src={attachmentUrl}
              alt={attachmentName || "Attachment"}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sx={{
                maxWidth: "100%",
                height: "auto",
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
                borderRadius: 1,
                boxShadow: 3,
                display: loading || error ? "none" : "block",
              }}
            />
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={!attachmentUrl}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
