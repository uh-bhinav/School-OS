import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  MenuItem,
} from "@mui/material";
import { Mark } from "@/app/services/marks.schema";

interface MarkDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Mark>) => void;
  mark?: Mark | null;
  loading?: boolean;
}

const STUDENTS = [
  { id: 1001, name: "Rahul Verma", roll_no: "08A01" },
  { id: 1002, name: "Priya Singh", roll_no: "08A02" },
  { id: 1003, name: "Amit Kumar", roll_no: "08A03" },
];

const SUBJECTS = [
  { id: 21, name: "Mathematics" },
  { id: 22, name: "Science" },
  { id: 23, name: "English" },
];

const EXAMS = [
  { id: 5, name: "Mid-Term" },
  { id: 6, name: "Final" },
];

export function MarkDialog({ open, onClose, onSubmit, mark, loading }: MarkDialogProps) {
  const isEdit = !!mark;
  const [formData, setFormData] = useState({
    student_id: 0,
    student_name: "",
    roll_no: "",
    class_id: 8,
    section: "A",
    subject_id: 0,
    subject_name: "",
    exam_id: 0,
    exam_name: "",
    marks_obtained: 0,
    total_marks: 100,
    grade: "",
    remarks: "",
    is_published: false,
  });

  useEffect(() => {
    if (mark) {
      setFormData({
        student_id: mark.student_id,
        student_name: mark.student_name,
        roll_no: mark.roll_no || "",
        class_id: mark.class_id,
        section: mark.section,
        subject_id: mark.subject_id,
        subject_name: mark.subject_name,
        exam_id: mark.exam_id,
        exam_name: mark.exam_name,
        marks_obtained: mark.marks_obtained,
        total_marks: mark.total_marks,
        grade: mark.grade || "",
        remarks: mark.remarks || "",
        is_published: mark.is_published,
      });
    } else if (!open) {
      setFormData({
        student_id: 0,
        student_name: "",
        roll_no: "",
        class_id: 8,
        section: "A",
        subject_id: 0,
        subject_name: "",
        exam_id: 0,
        exam_name: "",
        marks_obtained: 0,
        total_marks: 100,
        grade: "",
        remarks: "",
        is_published: false,
      });
    }
  }, [mark, open]);

  useEffect(() => {
    if (formData.total_marks > 0) {
      const percentage = (formData.marks_obtained / formData.total_marks) * 100;
      let grade = "";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C+";
      else if (percentage >= 40) grade = "C";
      else grade = "D";
      setFormData(prev => ({ ...prev, grade }));
    }
  }, [formData.marks_obtained, formData.total_marks]);

  const handleStudentChange = (studentId: number) => {
    const student = STUDENTS.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({ ...prev, student_id: studentId, student_name: student.name, roll_no: student.roll_no }));
    }
  };

  const handleSubjectChange = (subjectId: number) => {
    const subject = SUBJECTS.find(s => s.id === subjectId);
    if (subject) {
      setFormData(prev => ({ ...prev, subject_id: subjectId, subject_name: subject.name }));
    }
  };

  const handleExamChange = (examId: number) => {
    const exam = EXAMS.find(e => e.id === examId);
    if (exam) {
      setFormData(prev => ({ ...prev, exam_id: examId, exam_name: exam.name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.student_id === 0 || formData.subject_id === 0 || formData.exam_id === 0) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(isEdit ? { ...formData, id: mark?.id } : formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? "Edit Marks" : "Add Marks"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField select label="Student *" value={formData.student_id || ""} onChange={(e) => handleStudentChange(Number(e.target.value))} disabled={isEdit}>
              <MenuItem value="">Select Student</MenuItem>
              {STUDENTS.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.roll_no})</MenuItem>)}
            </TextField>
            <TextField select label="Subject *" value={formData.subject_id || ""} onChange={(e) => handleSubjectChange(Number(e.target.value))} disabled={isEdit}>
              <MenuItem value="">Select Subject</MenuItem>
              {SUBJECTS.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField select label="Exam *" value={formData.exam_id || ""} onChange={(e) => handleExamChange(Number(e.target.value))} disabled={isEdit}>
              <MenuItem value="">Select Exam</MenuItem>
              {EXAMS.map((e) => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
            </TextField>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField type="number" label="Marks Obtained *" value={formData.marks_obtained} onChange={(e) => setFormData(prev => ({ ...prev, marks_obtained: Number(e.target.value) }))} />
              <TextField type="number" label="Total Marks *" value={formData.total_marks} onChange={(e) => setFormData(prev => ({ ...prev, total_marks: Number(e.target.value) }))} />
            </Box>
            <TextField label="Grade" value={formData.grade} helperText="Auto-calculated" InputProps={{ readOnly: true }} />
            <TextField label="Remarks" value={formData.remarks} onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))} multiline rows={2} />
            <FormControlLabel control={<Switch checked={formData.is_published} onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))} />} label="Publish marks" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>{loading ? "Saving..." : isEdit ? "Update" : "Add"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
