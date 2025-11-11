import { useState, useEffect } from "react";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import { Exam } from "../../services/exams.schema";
import { useCreateExam, useUpdateExam, useExamTypes } from "../../services/exams.hooks";

interface AddEditExamDialogProps {
  open: boolean;
  onClose: () => void;
  exam?: Exam | null;
  filters: {
    academic_year_id: number;
    class_id: number;
    section: string;
  };
  onSuccess?: () => void;
}

export default function AddEditExamDialog({
  open,
  onClose,
  exam,
  filters,
  onSuccess,
}: AddEditExamDialogProps) {
  const isEdit = Boolean(exam);
  const [formData, setFormData] = useState({
    title: "",
    exam_type_id: 1,
    date: new Date().toISOString().split("T")[0],
    total_marks: 100,
  });
  const [error, setError] = useState("");

  const { data: examTypes = [], isLoading: loadingTypes } = useExamTypes(1); // school_id = 1
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title,
        exam_type_id: exam.exam_type_id,
        date: exam.date,
        total_marks: exam.total_marks,
      });
    } else {
      setFormData({
        title: "",
        exam_type_id: 1,
        date: new Date().toISOString().split("T")[0],
        total_marks: 100,
      });
    }
    setError("");
  }, [exam, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validate = () => {
    if (!formData.title.trim()) {
      setError("Exam title is required");
      return false;
    }
    if (formData.total_marks <= 0) {
      setError("Total marks must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        school_id: 1,
        academic_year_id: filters.academic_year_id,
        class_id: filters.class_id,
        section: filters.section,
      };

      if (isEdit && exam) {
        await updateMutation.mutateAsync({
          id: exam.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Failed to save exam. Please try again.");
      console.error(err);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Exam" : "Add New Exam"}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Exam Title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g., Mathematics Mid-Term Exam"
            required
          />

          <FormControl fullWidth required>
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={formData.exam_type_id}
              label="Exam Type"
              onChange={(e) => handleChange("exam_type_id", Number(e.target.value))}
              disabled={loadingTypes}
            >
              {examTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Exam Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            fullWidth
            label="Total Marks"
            type="number"
            value={formData.total_marks}
            onChange={(e) => handleChange("total_marks", Number(e.target.value))}
            inputProps={{ min: 1 }}
            required
          />

          {/* Display current filters */}
          <Box
            sx={{
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "grid", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Academic Year:</strong> {filters.academic_year_id}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Class:</strong> {filters.class_id}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Section:</strong> {filters.section}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving}
          sx={{
            bgcolor: "#0B5F5A",
            "&:hover": { bgcolor: "#094a46" },
          }}
        >
          {isSaving ? (
            <CircularProgress size={24} color="inherit" />
          ) : isEdit ? (
            "Update Exam"
          ) : (
            "Create Exam"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
