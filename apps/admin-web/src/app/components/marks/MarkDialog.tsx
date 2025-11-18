import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import { Mark, calculateGrade, calculatePercentage } from "@/app/services/marks.schema";
import { useClasses, useStudents, useSubjects, useExams } from "@/app/services/marks.hooks";
import { useAuthStore } from "@/app/stores/useAuthStore";

interface MarkDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    student_id: number;
    subject_id: number;
    exam_id: number;
    marks_obtained: number;
    max_marks: number;
    remarks?: string;
  }) => void;
  mark?: Mark | null;
  loading?: boolean;
}

/**
 * MarkDialog Component
 *
 * Dialog for creating/editing marks.
 *
 * Features:
 * - Create new mark entry
 * - Edit existing mark (marks_obtained & remarks only)
 * - Real-time grade preview
 * - Validation (marks_obtained <= max_marks)
 * - Auto-calculation of percentage and grade
 *
 * Integration Note:
 * - In EDIT mode: Only marks_obtained and remarks editable
 * - school_id auto-added by useCreateMark hook
 * - Student/Subject/Exam dropdowns should be populated from API
 */
export function MarkDialog({ open, onClose, onSubmit, mark, loading }: MarkDialogProps) {
  const isEdit = !!mark;
  const currentAcademicYearId = useAuthStore((state) => state.currentAcademicYearId);

  const [formData, setFormData] = useState({
    student_id: 0,
    subject_id: 0,
    exam_id: 0,
    marks_obtained: 0,
    max_marks: 100,
    remarks: "",
  });

  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ FIX: Fetch real dropdown data from backend
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: students = [], isLoading: studentsLoading } = useStudents(selectedClassId);
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects(selectedClassId);
  const { data: exams = [], isLoading: examsLoading } = useExams(currentAcademicYearId, selectedClassId);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (mark) {
        setFormData({
          student_id: mark.student_id,
          subject_id: mark.subject_id,
          exam_id: mark.exam_id,
          marks_obtained: mark.marks_obtained,
          max_marks: mark.max_marks,
          remarks: mark.remarks || "",
        });
      } else {
        setFormData({
          student_id: 0,
          subject_id: 0,
          exam_id: 0,
          marks_obtained: 0,
          max_marks: 100,
          remarks: "",
        });
      }
      setErrors({});
    }
  }, [open, mark]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!isEdit) {
      if (!formData.student_id || formData.student_id <= 0) {
        newErrors.student_id = "Please select a student";
      }
      if (!formData.subject_id || formData.subject_id <= 0) {
        newErrors.subject_id = "Please select a subject";
      }
      if (!formData.exam_id || formData.exam_id <= 0) {
        newErrors.exam_id = "Please select an exam";
      }
    }

    if (formData.marks_obtained < 0) {
      newErrors.marks_obtained = "Marks cannot be negative";
    }

    if (formData.marks_obtained > formData.max_marks) {
      newErrors.marks_obtained = `Marks cannot exceed ${formData.max_marks}`;
    }

    if (!isEdit && formData.max_marks <= 0) {
      newErrors.max_marks = "Maximum marks must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      student_id: formData.student_id,
      subject_id: formData.subject_id,
      exam_id: formData.exam_id,
      marks_obtained: formData.marks_obtained,
      max_marks: formData.max_marks,
      remarks: formData.remarks || undefined,
    });
  };

  // Calculate percentage and grade for preview
  const percentage = calculatePercentage(formData.marks_obtained, formData.max_marks);
  const grade = calculateGrade(percentage);

  const getGradeColor = (grade: string): "success" | "info" | "warning" | "error" => {
    if (grade.startsWith("A")) return "success";
    if (grade.startsWith("B")) return "info";
    if (grade.startsWith("C")) return "warning";
    return "error";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEdit ? "Edit Mark" : "Add New Mark"}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            {/* Display info in edit mode */}
            {isEdit && mark && (
              <Alert severity="info" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Student:</strong> {mark.student_name || `ID: ${mark.student_id}`}
                  <br />
                  <strong>Subject:</strong> {mark.subject_name || `ID: ${mark.subject_id}`}
                  <br />
                  <strong>Exam:</strong> {mark.exam_name || `ID: ${mark.exam_id}`}
                </Typography>
              </Alert>
            )}

            {/* Student/Subject/Exam Selection (create mode only) */}
            {!isEdit && (
              <>
                {/* Class Selection (Helper - not saved) */}
                <TextField
                  select
                  label="Select Class First"
                  value={selectedClassId || ""}
                  onChange={(e) => setSelectedClassId(Number(e.target.value) || undefined)}
                  disabled={loading || classesLoading}
                  helperText="Filter students, subjects, and exams by class"
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls: any) => (
                    <MenuItem key={cls.class_id} value={cls.class_id}>
                      Class {cls.grade_level} {cls.section}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Student *"
                  value={formData.student_id || ""}
                  onChange={(e) => handleChange("student_id", Number(e.target.value))}
                  error={!!errors.student_id}
                  helperText={errors.student_id || "Select a class first to see students"}
                  disabled={loading || studentsLoading || !selectedClassId}
                  required
                >
                  <MenuItem value="">Select Student</MenuItem>
                  {students.map((s: any) => (
                    <MenuItem key={s.student_id} value={s.student_id}>
                      {s.profile?.first_name} {s.profile?.last_name} ({s.roll_number})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Subject *"
                  value={formData.subject_id || ""}
                  onChange={(e) => handleChange("subject_id", Number(e.target.value))}
                  error={!!errors.subject_id}
                  helperText={errors.subject_id}
                  disabled={loading || subjectsLoading}
                  required
                >
                  <MenuItem value="">Select Subject</MenuItem>
                  {subjects.map((s: any) => (
                    <MenuItem key={s.subject_id} value={s.subject_id}>
                      {s.subject_name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Exam *"
                  value={formData.exam_id || ""}
                  onChange={(e) => handleChange("exam_id", Number(e.target.value))}
                  error={!!errors.exam_id}
                  helperText={errors.exam_id}
                  disabled={loading || examsLoading}
                  required
                >
                  <MenuItem value="">Select Exam</MenuItem>
                  {exams.map((e: any) => (
                    <MenuItem key={e.exam_id} value={e.exam_id}>
                      {e.exam_name}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {/* Marks Input */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                type="number"
                label="Marks Obtained *"
                value={formData.marks_obtained}
                onChange={(e) => handleChange("marks_obtained", parseFloat(e.target.value) || 0)}
                error={!!errors.marks_obtained}
                helperText={errors.marks_obtained}
                disabled={loading}
                required
                inputProps={{ min: 0, max: formData.max_marks, step: 0.5 }}
              />

              <TextField
                type="number"
                label="Maximum Marks *"
                value={formData.max_marks}
                onChange={(e) => handleChange("max_marks", parseFloat(e.target.value) || 100)}
                error={!!errors.max_marks}
                helperText={errors.max_marks}
                disabled={loading || isEdit}
                required
                inputProps={{ min: 1, step: 1 }}
              />
            </Box>

            {/* Grade Preview */}
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Performance
                </Typography>
                <Typography variant="h6">
                  {percentage.toFixed(2)}%
                </Typography>
              </Box>
              <Chip
                label={`Grade: ${grade}`}
                color={getGradeColor(grade)}
                size="medium"
                sx={{ fontWeight: 600, fontSize: "0.95rem" }}
              />
            </Box>

            {/* Remarks */}
            <TextField
              label="Remarks (Optional)"
              multiline
              rows={3}
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              placeholder="Add any comments or notes..."
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update" : "Add Mark"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
