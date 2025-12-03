// ============================================================================
// FILE: src/app/components/albums/CreateAlbumDialog.tsx
// PURPOSE: Dialog for creating a new album
// ============================================================================

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";
import { useCreateAlbum } from "../../services/albums.hooks";
import { AlbumVisibility, AlbumType } from "../../services/albums.schema";
import type { AlbumCreate } from "../../services/albums.schema";

interface CreateAlbumDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultEventId?: string;
}

export default function CreateAlbumDialog({
  open,
  onClose,
  onSuccess,
  defaultEventId,
}: CreateAlbumDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlbumCreate>({
    name: "",
    description: "",
    visibility: AlbumVisibility.Public,
    albumType: defaultEventId ? AlbumType.Event : AlbumType.General,
    eventId: defaultEventId,
  });

  const createAlbumMutation = useCreateAlbum();

  const handleInputChange = (field: keyof AlbumCreate, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError("Please enter an album name");
      return;
    }

    try {
      setError(null);
      await createAlbumMutation.mutateAsync(formData);

      // Reset form
      setFormData({
        name: "",
        description: "",
        visibility: AlbumVisibility.Public,
        albumType: AlbumType.General,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Failed to create album");
      console.error(err);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Create New Album</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Album Name"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Annual Day 2025 Photos"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe the album..."
          />

          <FormControl fullWidth>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={formData.visibility}
              label="Visibility"
              onChange={(e) => handleInputChange("visibility", e.target.value)}
            >
              <MenuItem value={AlbumVisibility.Public}>Public - Visible to all</MenuItem>
              <MenuItem value={AlbumVisibility.Private}>Private - Admin only</MenuItem>
              <MenuItem value={AlbumVisibility.ClassOnly}>Class Only - Specific classes</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Album Type</InputLabel>
            <Select
              value={formData.albumType}
              label="Album Type"
              onChange={(e) => handleInputChange("albumType", e.target.value)}
            >
              <MenuItem value={AlbumType.General}>General</MenuItem>
              <MenuItem value={AlbumType.Event}>Event</MenuItem>
              <MenuItem value={AlbumType.ClassPhotos}>Class Photos</MenuItem>
              <MenuItem value={AlbumType.Sports}>Sports</MenuItem>
              <MenuItem value={AlbumType.Cultural}>Cultural</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={createAlbumMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createAlbumMutation.isPending}
        >
          {createAlbumMutation.isPending ? "Creating..." : "Create Album"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
