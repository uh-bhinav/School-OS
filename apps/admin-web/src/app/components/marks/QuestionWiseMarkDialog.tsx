import { useEffect, useState, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { calculateGrade, calculatePercentage } from "@/app/services/marks.schema";
import { useClasses, useStudents, useSubjects, useExams } from "@/app/services/marks.hooks";
import { useAuthStore } from "@/app/stores/useAuthStore";

// ── Types ──

interface QuestionCO {
  question_no: number;
  max_marks: number;
  marks_obtained: number;
  co_code: string;
  bloom_level: string;
}

interface COAttainmentResult {
  co_code: string;
  max: number;
  obtained: number;
  attainment_pct: number;
  achieved: boolean;
}

interface QuestionWiseMarkDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    student_id: number;
    subject_id: number;
    exam_id: number;
    marks_obtained: number;
    max_marks: number;
    remarks?: string;
    questions?: QuestionCO[];
  }) => void;
  loading?: boolean;
}

// ── Mock question blueprint per subject ──
// In production this comes from Subject → Exam → Question Paper configuration

const QUESTION_BLUEPRINTS: Record<number, QuestionCO[]> = {
  // Mathematics (subject_id: 21) — Mid-Term
  21: [
    { question_no: 1, max_marks: 10, marks_obtained: 0, co_code: "CO1", bloom_level: "Remember" },
    { question_no: 2, max_marks: 15, marks_obtained: 0, co_code: "CO1", bloom_level: "Understand" },
    { question_no: 3, max_marks: 10, marks_obtained: 0, co_code: "CO2", bloom_level: "Apply" },
    { question_no: 4, max_marks: 20, marks_obtained: 0, co_code: "CO2", bloom_level: "Analyze" },
    { question_no: 5, max_marks: 15, marks_obtained: 0, co_code: "CO3", bloom_level: "Apply" },
    { question_no: 6, max_marks: 10, marks_obtained: 0, co_code: "CO3", bloom_level: "Evaluate" },
    { question_no: 7, max_marks: 20, marks_obtained: 0, co_code: "CO4", bloom_level: "Create" },
  ],
  // Science (subject_id: 22)
  22: [
    { question_no: 1, max_marks: 10, marks_obtained: 0, co_code: "CO1", bloom_level: "Remember" },
    { question_no: 2, max_marks: 10, marks_obtained: 0, co_code: "CO1", bloom_level: "Understand" },
    { question_no: 3, max_marks: 15, marks_obtained: 0, co_code: "CO2", bloom_level: "Apply" },
    { question_no: 4, max_marks: 15, marks_obtained: 0, co_code: "CO2", bloom_level: "Analyze" },
    { question_no: 5, max_marks: 20, marks_obtained: 0, co_code: "CO3", bloom_level: "Apply" },
    { question_no: 6, max_marks: 10, marks_obtained: 0, co_code: "CO4", bloom_level: "Evaluate" },
    { question_no: 7, max_marks: 20, marks_obtained: 0, co_code: "CO5", bloom_level: "Create" },
  ],
  // English (subject_id: 23)
  23: [
    { question_no: 1, max_marks: 10, marks_obtained: 0, co_code: "CO1", bloom_level: "Remember" },
    { question_no: 2, max_marks: 15, marks_obtained: 0, co_code: "CO1", bloom_level: "Understand" },
    { question_no: 3, max_marks: 15, marks_obtained: 0, co_code: "CO2", bloom_level: "Apply" },
    { question_no: 4, max_marks: 20, marks_obtained: 0, co_code: "CO2", bloom_level: "Analyze" },
    { question_no: 5, max_marks: 20, marks_obtained: 0, co_code: "CO3", bloom_level: "Create" },
    { question_no: 6, max_marks: 20, marks_obtained: 0, co_code: "CO3", bloom_level: "Evaluate" },
  ],
};

// Fallback blueprint for unknown subjects
const DEFAULT_BLUEPRINT: QuestionCO[] = [
  { question_no: 1, max_marks: 15, marks_obtained: 0, co_code: "CO1", bloom_level: "Remember" },
  { question_no: 2, max_marks: 15, marks_obtained: 0, co_code: "CO1", bloom_level: "Understand" },
  { question_no: 3, max_marks: 20, marks_obtained: 0, co_code: "CO2", bloom_level: "Apply" },
  { question_no: 4, max_marks: 20, marks_obtained: 0, co_code: "CO2", bloom_level: "Analyze" },
  { question_no: 5, max_marks: 15, marks_obtained: 0, co_code: "CO3", bloom_level: "Evaluate" },
  { question_no: 6, max_marks: 15, marks_obtained: 0, co_code: "CO3", bloom_level: "Create" },
];

// Bloom level colors
const BLOOM_COLORS: Record<string, string> = {
  Remember: "#E3F2FD",
  Understand: "#E8F5E9",
  Apply: "#FFF3E0",
  Analyze: "#FCE4EC",
  Evaluate: "#F3E5F5",
  Create: "#FFEBEE",
};

const CO_TARGET_PCT = 60; // 60% attainment is the pass threshold

/**
 * QuestionWiseMarkDialog — OBE-aligned marks entry
 *
 * Shows a question breakdown table with:
 * - Q#, Max Marks, Marks Obtained (editable), CO Code, Bloom Level
 * - Auto-calculated: Total, per-CO attainment %, overall CO attainment, Grade
 */
export function QuestionWiseMarkDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: QuestionWiseMarkDialogProps) {
  const currentAcademicYearId = useAuthStore((state) => state.currentAcademicYearId);

  // Selection state
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);
  const [studentId, setStudentId] = useState(0);
  const [subjectId, setSubjectId] = useState(0);
  const [examId, setExamId] = useState(0);
  const [remarks, setRemarks] = useState("");

  // Question-level marks
  const [questions, setQuestions] = useState<QuestionCO[]>([]);

  // Dropdown data
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: students = [], isLoading: studentsLoading } = useStudents(selectedClassId);
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects(selectedClassId);
  const { data: exams = [], isLoading: examsLoading } = useExams(currentAcademicYearId, selectedClassId);

  // Load question blueprint when subject changes
  useEffect(() => {
    if (subjectId > 0) {
      const blueprint = QUESTION_BLUEPRINTS[subjectId] || DEFAULT_BLUEPRINT;
      setQuestions(blueprint.map((q) => ({ ...q, marks_obtained: 0 })));
    } else {
      setQuestions([]);
    }
  }, [subjectId]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedClassId(undefined);
      setStudentId(0);
      setSubjectId(0);
      setExamId(0);
      setRemarks("");
      setQuestions([]);
    }
  }, [open]);

  // ── Derived calculations ──

  const totalMax = useMemo(() => questions.reduce((s, q) => s + q.max_marks, 0), [questions]);
  const totalObtained = useMemo(() => questions.reduce((s, q) => s + q.marks_obtained, 0), [questions]);
  const percentage = totalMax > 0 ? calculatePercentage(totalObtained, totalMax) : 0;
  const grade = calculateGrade(percentage);

  // CO-wise attainment
  const coAttainments = useMemo((): COAttainmentResult[] => {
    if (questions.length === 0) return [];
    const coMap = new Map<string, { max: number; obtained: number }>();
    questions.forEach((q) => {
      const entry = coMap.get(q.co_code) || { max: 0, obtained: 0 };
      entry.max += q.max_marks;
      entry.obtained += q.marks_obtained;
      coMap.set(q.co_code, entry);
    });
    return Array.from(coMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([co_code, { max, obtained }]) => {
        const pct = max > 0 ? Math.round((obtained / max) * 100 * 10) / 10 : 0;
        return { co_code, max, obtained, attainment_pct: pct, achieved: pct >= CO_TARGET_PCT };
      });
  }, [questions]);

  const cosAchieved = coAttainments.filter((c) => c.achieved).length;
  const cosTotal = coAttainments.length;
  const overallCOPct = cosTotal > 0 ? Math.round((cosAchieved / cosTotal) * 100) : 0;

  // ── Handlers ──

  const handleQuestionMarkChange = (idx: number, value: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], marks_obtained: Math.min(Math.max(0, value), next[idx].max_marks) };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !subjectId || !examId) return;

    onSubmit({
      student_id: studentId,
      subject_id: subjectId,
      exam_id: examId,
      marks_obtained: totalObtained,
      max_marks: totalMax,
      remarks: remarks || undefined,
      questions,
    });
  };

  const getGradeColor = (g: string): "success" | "info" | "warning" | "error" => {
    if (g.startsWith("A")) return "success";
    if (g.startsWith("B")) return "info";
    if (g.startsWith("C")) return "warning";
    return "error";
  };

  const canSubmit = studentId > 0 && subjectId > 0 && examId > 0 && questions.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Question-wise Marks Entry
            <Tooltip title="Enter marks per question. Each question is mapped to a CO and Bloom level. CO attainment is auto-calculated.">
              <IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            OBE-aligned entry — auto-computes CO attainment from question-level marks
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* ── Step 1: Select class, student, subject, exam ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2, mt: 1 }}>
            <TextField
              select
              label="Grade — Section"
              value={selectedClassId || ""}
              onChange={(e) => {
                const v = Number(e.target.value) || undefined;
                setSelectedClassId(v);
                setStudentId(0);
                setSubjectId(0);
              }}
              disabled={loading || classesLoading}
              size="small"
            >
              <MenuItem value="">Select Grade</MenuItem>
              {classes.map((cls: any) => (
                <MenuItem key={cls.class_id} value={cls.class_id}>
                  Grade {cls.grade_level} — Section {cls.section}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Student *"
              value={studentId || ""}
              onChange={(e) => setStudentId(Number(e.target.value))}
              disabled={loading || studentsLoading || !selectedClassId}
              size="small"
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
              value={subjectId || ""}
              onChange={(e) => setSubjectId(Number(e.target.value))}
              disabled={loading || subjectsLoading || !selectedClassId}
              size="small"
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
              value={examId || ""}
              onChange={(e) => setExamId(Number(e.target.value))}
              disabled={loading || examsLoading || !selectedClassId}
              size="small"
            >
              <MenuItem value="">Select Exam</MenuItem>
              {exams.map((e: any) => (
                <MenuItem key={e.exam_id} value={e.exam_id}>
                  {e.exam_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* ── Step 2: Question-wise entry table ── */}
          {questions.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Question Breakdown
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 600, width: 60 }}>Q #</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>Max</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: 100 }}>Marks</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: 70 }}>CO</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Bloom Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((q, idx) => (
                      <TableRow key={q.question_no} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>Q{q.question_no}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{q.max_marks}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={q.marks_obtained}
                            onChange={(e) => handleQuestionMarkChange(idx, parseFloat(e.target.value) || 0)}
                            inputProps={{ min: 0, max: q.max_marks, step: 0.5 }}
                            sx={{ width: 80 }}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={q.co_code} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={q.bloom_level}
                            size="small"
                            sx={{ bgcolor: BLOOM_COLORS[q.bloom_level] || "#f5f5f5", fontWeight: 500 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total row */}
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>Total</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={700}>{totalMax}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={700} color="primary.main">{totalObtained}</Typography>
                      </TableCell>
                      <TableCell colSpan={2}>
                        <Chip
                          label={`${percentage.toFixed(1)}% — Grade ${grade}`}
                          color={getGradeColor(grade)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ── Step 3: CO Attainment Summary ── */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                CO Attainment (auto-calculated)
                <Tooltip title={`Attainment = (Marks Obtained in CO questions / Max Marks for CO questions) × 100. Target: ≥${CO_TARGET_PCT}%`}>
                  <IconButton size="small" sx={{ ml: 0.5 }}><InfoIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Typography>

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
                {coAttainments.map((co) => (
                  <Paper
                    key={co.co_code}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      minWidth: 120,
                      borderLeft: "3px solid",
                      borderColor: co.achieved ? "success.main" : "error.main",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      <Chip label={co.co_code} size="small" color="primary" />
                      {co.achieved ? (
                        <CheckCircleIcon fontSize="small" color="success" />
                      ) : (
                        <WarningIcon fontSize="small" color="error" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {co.obtained}/{co.max}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={co.achieved ? "success.main" : "error.main"}
                    >
                      {co.attainment_pct}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={co.attainment_pct}
                      sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                      color={co.achieved ? "success" : "error"}
                    />
                  </Paper>
                ))}
              </Box>

              {/* Overall CO summary */}
              <Alert
                severity={overallCOPct >= 80 ? "success" : overallCOPct >= 60 ? "warning" : "error"}
                icon={false}
                sx={{ mb: 2 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Overall CO Achievement: {cosAchieved}/{cosTotal} COs achieved ({overallCOPct}%)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Target: ≥{CO_TARGET_PCT}% per CO | Grade: {grade}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Grade ${grade}`}
                    color={getGradeColor(grade)}
                    sx={{ fontWeight: 700, fontSize: "1rem", px: 1 }}
                  />
                </Box>
              </Alert>

              {/* Remarks */}
              <TextField
                label="Remarks (Optional)"
                multiline
                rows={2}
                fullWidth
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any comments or observations..."
                disabled={loading}
                size="small"
              />
            </>
          )}

          {/* Empty state */}
          {questions.length === 0 && selectedClassId && subjectId > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Loading question blueprint for this subject...
            </Alert>
          )}
          {!selectedClassId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Select a Grade, Student, Subject, and Exam to begin question-wise entry.
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || !canSubmit}>
            {loading ? "Saving..." : "Submit Marks"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
