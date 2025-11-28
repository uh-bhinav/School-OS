// ============================================================================
// FILE: src/app/components/events/EventPhotoUploader.tsx
// PURPOSE: Photo uploader component for events with drag-and-drop support
// ============================================================================

import { useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  LinearProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  CloudUpload,
  Close,
  PhotoLibrary,
  Delete,
} from "@mui/icons-material";
import { useUploadEventImages } from "../../services/events.hooks";

interface EventPhotoUploaderProps {
  eventId: string;
  albumId?: string;
  onUploadComplete?: () => void;
}

interface PreviewFile {
  file: File;
  preview: string;
  id: string;
}

export default function EventPhotoUploader({
  eventId,
  albumId,
  onUploadComplete,
}: EventPhotoUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadEventImages();

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== fileArray.length) {
      setError("Only image files are allowed");
    } else {
      setError(null);
    }

    const newPreviews: PreviewFile[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: generateId(),
    }));

    setSelectedFiles((prev) => [...prev, ...newPreviews]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback((id: string) => {
    setSelectedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
    setError(null);
  }, [selectedFiles]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setError(null);
      const files = selectedFiles.map((f) => f.file);

      await uploadMutation.mutateAsync({
        eventId,
        files,
        albumId,
      });

      // Cleanup previews
      selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
      setSelectedFiles([]);
      onUploadComplete?.();
    } catch (err) {
      setError("Failed to upload images. Please try again.");
      console.error(err);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PhotoLibrary color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Upload Photos
            </Typography>
          </Box>
          {selectedFiles.length > 0 && (
            <Button
              size="small"
              color="error"
              startIcon={<Delete />}
              onClick={clearAll}
            >
              Clear All
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Drop Zone */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "grey.300",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: isDragging ? "primary.50" : "grey.50",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "primary.50",
            },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            multiple
            style={{ display: "none" }}
          />
          <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag & Drop Images Here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to browse files
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Supports: JPG, PNG, GIF, WEBP (Max 10MB each)
          </Typography>
        </Box>

        {/* Preview Grid */}
        {selectedFiles.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Images ({selectedFiles.length})
            </Typography>
            <Grid container spacing={2}>
              {selectedFiles.map((file) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={file.id}>
                  <Box
                    sx={{
                      position: "relative",
                      paddingTop: "100%",
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: "grey.100",
                    }}
                  >
                    <Box
                      component="img"
                      src={file.preview}
                      alt={file.file.name}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.8)",
                        },
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "white",
                        p: 0.5,
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.file.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <Box mt={3}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              Uploading images...
            </Typography>
          </Box>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && !uploadMutation.isPending && (
          <Stack direction="row" justifyContent="flex-end" mt={3}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
            >
              Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? "s" : ""}
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
