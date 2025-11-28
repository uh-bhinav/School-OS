// ============================================================================
// CREATE TASK MODAL COMPONENT
// ============================================================================
// Modal for creating new tasks
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
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddTaskIcon from "@mui/icons-material/AddTask";
import { AVAILABLE_TARGETS } from "../../mockDataProviders/mockTasks";
import type { CreateTaskRequest } from "../../mockDataProviders/mockTasks";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateTaskModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("General");
  const [deadline, setDeadline] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get today's date for minimum deadline
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!description.trim()) {
      setError("Task description is required");
      return;
    }
    if (!deadline) {
      setError("Deadline is required");
      return;
    }
    if (deadline < today) {
      setError("Deadline cannot be in the past");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        target,
        deadline,
        adminRemarks: adminRemarks.trim() || undefined,
      });

      // Reset form on success
      handleReset();
      onClose();
    } catch (err) {
      setError("Failed to create task. Please try again.");
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setTarget("General");
    setDeadline("");
    setAdminRemarks("");
    setError(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AddTaskIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Create New Task
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Task Title */}
          <TextField
            label="Task Title"
            placeholder="Enter a clear and concise task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            disabled={isSubmitting}
            inputProps={{ maxLength: 150 }}
            helperText={`${title.length}/150 characters`}
          />

          {/* Description */}
          <TextField
            label="Description"
            placeholder="Provide detailed instructions for the task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            disabled={isSubmitting}
            inputProps={{ maxLength: 1000 }}
            helperText={`${description.length}/1000 characters`}
          />

          {/* Target Group */}
          <FormControl fullWidth required>
            <InputLabel>Target Group</InputLabel>
            <Select
              value={target}
              label="Target Group"
              onChange={(e) => setTarget(e.target.value)}
              disabled={isSubmitting}
            >
              {AVAILABLE_TARGETS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Deadline */}
          <TextField
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            fullWidth
            required
            disabled={isSubmitting}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
          />

          {/* Admin Remarks (Optional) */}
          <TextField
            label="Admin Remarks (Optional)"
            placeholder="Add any special instructions or notes for teachers..."
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            fullWidth
            multiline
            rows={2}
            disabled={isSubmitting}
            inputProps={{ maxLength: 500 }}
            helperText={`${adminRemarks.length}/500 characters`}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddTaskIcon />}
        >
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
