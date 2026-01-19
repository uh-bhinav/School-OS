import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { Exam } from "../../services/exams.schema";
import { useDeleteExam } from "../../services/exams.hooks";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  exam: Exam;
  onSuccess?: () => void;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  exam,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const deleteMutation = useDeleteExam();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(exam.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete exam:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WarningIcon sx={{ color: "error.main", fontSize: 32 }} />
          <Typography variant="h6" fontWeight={700}>
            Confirm Delete
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Alert severity="error">
            This action cannot be undone. All exam data will be permanently deleted.
          </Alert>

          <Box>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete the following exam?
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {exam.title}
              </Typography>
              <Box sx={{ display: "grid", gap: 0.5, mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Type: {exam.exam_type_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(exam.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Class: {exam.class_id} - Section {exam.section}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {exam.is_published ? "Published" : "Draft"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {exam.is_published && (
            <Alert severity="warning">
              This exam has been published. Deleting it may affect student records and reports.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : null}
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete Exam"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
