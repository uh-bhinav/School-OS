// components/attendance/BulkUploadDialog.tsx
import { useState, useCallback } from "react";
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface ParsedRow {
  student_id: number;
  class_id: number;
  date: string;
  status: string;
  remarks?: string;
  valid: boolean;
  errors: string[];
}

const validateRow = (row: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!row.student_id || isNaN(Number(row.student_id))) errors.push("Invalid student_id");
  if (!row.class_id || isNaN(Number(row.class_id))) errors.push("Invalid class_id");
  if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) errors.push("Invalid date format (YYYY-MM-DD)");
  if (!["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(row.status)) errors.push("Invalid status");
  return { valid: errors.length === 0, errors };
};

const parseCSV = (text: string): ParsedRow[] => {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: any = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });

    const { valid, errors } = validateRow(row);
    return {
      student_id: Number(row.student_id),
      class_id: Number(row.class_id),
      date: row.date,
      status: row.status,
      remarks: row.remarks || undefined,
      valid,
      errors,
    };
  });
};

export default function BulkUploadDialog({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (rows: Array<{ student_id: number; class_id: number; date: string; status: string; remarks?: string }>) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setParsed(rows);
    };
    reader.readAsText(file);
  }, []);

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

  const handleSubmit = async () => {
    const validRows = parsed.filter((r) => r.valid);
    if (validRows.length === 0) {
      alert("No valid rows to upload");
      return;
    }

    setUploading(true);
    try {
      await onUpload(validRows);
      onClose();
      setFile(null);
      setParsed([]);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const validCount = parsed.filter((r) => r.valid).length;
  const invalidCount = parsed.length - validCount;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Upload Attendance</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Upload a CSV file with columns: <strong>student_id, class_id, date, status, remarks</strong>.
            <br />
            <a href="/templates/attendance-upload.csv" download style={{ color: "inherit" }}>
              Download sample template
            </a>
          </Alert>

          {!file ? (
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: "2px dashed",
                borderColor: dragActive ? "primary.main" : "divider",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                bgcolor: dragActive ? "action.hover" : "background.paper",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Drag & drop CSV file here, or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports .csv files only
              </Typography>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />
            </Box>
          ) : (
            <>
              <Alert severity="success" icon={<CheckCircleIcon />}>
                File loaded: <strong>{file.name}</strong> ({parsed.length} rows)
              </Alert>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Chip label={`${validCount} Valid`} color="success" />
                {invalidCount > 0 && <Chip label={`${invalidCount} Invalid`} color="error" />}
              </Box>

              <Box sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Class ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Validation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsed.slice(0, 20).map((row, i) => (
                      <TableRow key={i} sx={{ bgcolor: row.valid ? "inherit" : "error.light" }}>
                        <TableCell>{row.student_id}</TableCell>
                        <TableCell>{row.class_id}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>
                          {row.valid ? (
                            <Chip label="Valid" color="success" size="small" />
                          ) : (
                            <Chip label={row.errors[0]} color="error" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              {parsed.length > 20 && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Showing first 20 of {parsed.length} rows
                </Typography>
              )}
            </>
          )}

          {uploading && <LinearProgress />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!file || validCount === 0 || uploading}>
          Upload {validCount > 0 && `(${validCount} rows)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
