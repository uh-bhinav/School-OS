import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

interface GenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  filters: {
    academic_year_id: number;
    class_id: number;
    section: string;
  };
}

/**
 * Confirmation dialog for AI-assisted timetable generation
 */
export default function GenerateDialog({
  open,
  onClose,
  onConfirm,
  filters,
}: GenerateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");

  const handleGenerate = async () => {
    setLoading(true);
    setStatus("generating");
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      await onConfirm();
      clearInterval(interval);
      setProgress(100);
      setStatus("success");

      // Auto-close after success
      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setStatus("error");
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStatus("idle");
    setProgress(0);
    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetState();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        AI Timetable Generation
      </DialogTitle>
      <DialogContent>
        {status === "idle" && (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will replace the current timetable for Class {filters.class_id}
              {" (Section: "}{filters.section}) with an AI-generated schedule.
            </Alert>

            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              What the AI will do:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Optimize teacher availability" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Prevent room conflicts" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Balance subject distribution" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Minimize teacher idle time" />
              </ListItem>
            </List>

            <Alert severity="info" icon={<WarningIcon />} sx={{ mt: 2 }}>
              Tip: You can manually edit the generated timetable afterwards.
            </Alert>
          </>
        )}

        {status === "generating" && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom align="center">
              Generating optimized timetable...
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
            <Typography variant="caption" color="text.secondary" align="center" display="block" mt={1}>
              {progress}% complete
            </Typography>
          </Box>
        )}

        {status === "success" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✨ Timetable generated successfully! Refreshing...
          </Alert>
        )}

        {status === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Generation failed. Please try again or contact support.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {status === "error" ? "Close" : "Cancel"}
        </Button>
        {status !== "success" && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            startIcon={<AutoAwesomeIcon />}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
