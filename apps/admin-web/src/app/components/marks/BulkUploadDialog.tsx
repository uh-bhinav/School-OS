import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  loading?: boolean;
}

/**
 * BulkUploadDialog Component
 *
 * CSV file upload dialog for bulk marks entry.
 *
 * Features:
 * - Drag-and-drop file upload
 * - CSV file validation
 * - Upload progress indicator
 * - File preview (name, size)
 *
 * Integration Note: Connect onUpload to useBulkUploadMarks mutation.
 * Expected CSV format: student_id,subject_id,exam_id,marks_obtained,max_marks,remarks
 *
 * Example CSV:
 * student_id,subject_id,exam_id,marks_obtained,max_marks,remarks
 * 1,5,3,85,100,Excellent work
 * 2,5,3,72,100,Good effort
 */
export function BulkUploadDialog({ open, onClose, onUpload, loading }: BulkUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Upload Marks</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Instructions */}
          <Alert severity="info">
            <Typography variant="body2" fontWeight={600} gutterBottom>
              CSV Format Requirements:
            </Typography>
            <Typography variant="body2" component="div">
              Required columns: student_id, subject_id, exam_id, marks_obtained
              <br />
              Optional columns: max_marks (default: 100), remarks
            </Typography>
          </Alert>

          {/* Drag & Drop Zone */}
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: dragActive ? "primary.main" : "grey.300",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              bgcolor: dragActive ? "action.hover" : "background.paper",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              style={{ display: "none" }}
              id="csv-upload-input"
            />

            <label htmlFor="csv-upload-input" style={{ cursor: "pointer" }}>
              <UploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop your CSV file here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
            </label>
          </Box>

          {/* Selected File Preview */}
          {selectedFile && (
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 2,
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Selected File:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </Typography>
            </Box>
          )}

          {/* Upload Progress */}
          {loading && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Uploading marks...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          startIcon={<UploadIcon />}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
