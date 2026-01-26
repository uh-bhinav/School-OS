import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Breadcrumbs,
  Link,
  Skeleton,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  useSubjectExam,
  useQuestionsBySubjectExam,
  useCOsBySubject,
  useQuestionMarksBySubjectExam,
  useSaveQuestionMarks,
} from "@/app/services/obe.hooks";
import { ExamQuestion, CourseOutcome } from "@/app/services/obe.schema";

// Mock students for the class (in real app, would come from API)
const mockStudents = [
  { id: 1, name: "Rahul Sharma", roll_no: "2024001" },
  { id: 2, name: "Priya Patel", roll_no: "2024002" },
  { id: 3, name: "Amit Kumar", roll_no: "2024003" },
  { id: 4, name: "Sneha Gupta", roll_no: "2024004" },
  { id: 5, name: "Vikram Singh", roll_no: "2024005" },
  { id: 6, name: "Ananya Reddy", roll_no: "2024006" },
  { id: 7, name: "Karthik Nair", roll_no: "2024007" },
  { id: 8, name: "Meera Joshi", roll_no: "2024008" },
];

interface MarksGridEntry {
  questionId: number;
  studentId: number;
  marksObtained: number | null;
  maxMarks: number;
  isDirty: boolean;
}

export default function QuestionMarksEntryPage() {
  const { examId, subjectExamId } = useParams<{ examId: string; subjectExamId: string }>();
  const navigate = useNavigate();

  const subjectExamIdNum = subjectExamId ? Number(subjectExamId) : null;

  // Queries
  const { data: subjectExam, isLoading: examLoading } = useSubjectExam(subjectExamIdNum);
  const { data: questions = [], isLoading: questionsLoading } = useQuestionsBySubjectExam(subjectExamIdNum);
  const { data: cos = [] } = useCOsBySubject(subjectExam?.subject_id ?? null);
  const { data: existingMarks = [], isLoading: marksLoading, refetch: refetchMarks } = useQuestionMarksBySubjectExam(subjectExamIdNum);

  // Mutations
  const saveMarksMutation = useSaveQuestionMarks();

  // State
  const [marksGrid, setMarksGrid] = useState<Map<string, MarksGridEntry>>(new Map());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // Initialize marks grid from existing data
  useMemo(() => {
    if (questions.length > 0 && !marksLoading) {
      const newGrid = new Map<string, MarksGridEntry>();

      questions.forEach((q) => {
        mockStudents.forEach((s) => {
          const key = `${q.id}-${s.id}`;
          const existing = existingMarks.find(
            (m) => m.question_id === q.id && m.student_id === s.id
          );
          newGrid.set(key, {
            questionId: q.id,
            studentId: s.id,
            marksObtained: existing?.marks_obtained ?? null,
            maxMarks: q.max_marks,
            isDirty: false,
          });
        });
      });

      setMarksGrid(newGrid);
    }
  }, [questions, existingMarks, marksLoading]);

  // Group questions by CO
  const questionsByCO = useMemo(() => {
    const grouped = new Map<number | null, ExamQuestion[]>();
    questions.forEach((q) => {
      const coId = q.co_id ?? null;
      if (!grouped.has(coId)) {
        grouped.set(coId, []);
      }
      grouped.get(coId)!.push(q);
    });
    return grouped;
  }, [questions]);

  // Get CO by ID
  const getCO = (coId: number | null): CourseOutcome | undefined => {
    if (coId === null) return undefined;
    return cos.find((c) => c.id === coId);
  };

  // Handle marks change
  const handleMarksChange = (questionId: number, studentId: number, value: string) => {
    const key = `${questionId}-${studentId}`;
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const numValue = value === "" ? null : Number(value);
    const maxMarks = question.max_marks;

    // Validate
    if (numValue !== null && (numValue < 0 || numValue > maxMarks)) {
      return;
    }

    setMarksGrid((prev) => {
      const newGrid = new Map(prev);
      newGrid.set(key, {
        questionId,
        studentId,
        marksObtained: numValue,
        maxMarks,
        isDirty: true,
      });
      return newGrid;
    });
  };

  // Calculate CO-wise attainment preview
  const coAttainmentPreview = useMemo(() => {
    const results: Array<{
      coId: number | null;
      coCode: string;
      totalMarks: number;
      obtainedMarks: number;
      percentage: number;
      questionsCount: number;
    }> = [];

    questionsByCO.forEach((qs, coId) => {
      const co = getCO(coId);
      let totalMarks = 0;
      let obtainedMarks = 0;

      qs.forEach((q) => {
        mockStudents.forEach((s) => {
          const key = `${q.id}-${s.id}`;
          const entry = marksGrid.get(key);
          totalMarks += q.max_marks;
          if (entry?.marksObtained !== null && entry?.marksObtained !== undefined) {
            obtainedMarks += entry.marksObtained;
          }
        });
      });

      results.push({
        coId,
        coCode: co?.code ?? "Unmapped",
        totalMarks,
        obtainedMarks,
        percentage: totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0,
        questionsCount: qs.length,
      });
    });

    return results;
  }, [questionsByCO, marksGrid, cos]);

  // Save marks
  const handleSave = async () => {
    const dirtyEntries = Array.from(marksGrid.values())
      .filter((entry) => entry.isDirty && entry.marksObtained !== null);

    if (dirtyEntries.length === 0) {
      setSnackbar({ open: true, message: "No changes to save", severity: "error" });
      return;
    }

    try {
      await saveMarksMutation.mutateAsync({
        subjectExamId: subjectExamIdNum!,
        marks: dirtyEntries.map((e) => ({
          question_id: e.questionId,
          student_id: e.studentId,
          marks_obtained: e.marksObtained!,
        })),
      });

      // Clear dirty flags
      setMarksGrid((prev) => {
        const newGrid = new Map(prev);
        newGrid.forEach((entry, key) => {
          newGrid.set(key, { ...entry, isDirty: false });
        });
        return newGrid;
      });

      setSnackbar({ open: true, message: `Saved ${dirtyEntries.length} marks entries`, severity: "success" });
      refetchMarks();
    } catch {
      setSnackbar({ open: true, message: "Failed to save marks", severity: "error" });
    }
  };

  // Count dirty entries
  const dirtyCount = useMemo(() => {
    return Array.from(marksGrid.values()).filter((e) => e.isDirty).length;
  }, [marksGrid]);

  // Calculate student totals
  const studentTotals = useMemo(() => {
    const totals = new Map<number, { obtained: number; max: number }>();

    mockStudents.forEach((s) => {
      let obtained = 0;
      let max = 0;

      questions.forEach((q) => {
        const key = `${q.id}-${s.id}`;
        const entry = marksGrid.get(key);
        max += q.max_marks;
        if (entry?.marksObtained !== null && entry?.marksObtained !== undefined) {
          obtained += entry.marksObtained;
        }
      });

      totals.set(s.id, { obtained, max });
    });

    return totals;
  }, [questions, marksGrid]);

  const isLoading = examLoading || questionsLoading || marksLoading;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (!subjectExam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Subject exam not found</Alert>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Question-wise Marks Entry</Typography>
        </Box>
        <Alert severity="info">
          No questions defined for this exam yet. Please add questions first using the Question-CO Mapping page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/academics/exams" underline="hover">
            Exams
          </Link>
          <Link color="inherit" href={`/academics/exams/${examId}/subjects`} underline="hover">
            Subjects
          </Link>
          <Typography color="text.primary">Marks Entry</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {subjectExam.subject_name} - Question-wise Marks Entry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter marks for each question. CO attainment will be calculated automatically.
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <Chip label={`${questions.length} Questions`} size="small" variant="outlined" />
              <Chip label={`${mockStudents.length} Students`} size="small" variant="outlined" />
              <Chip
                label={`Total: ${questions.reduce((sum, q) => sum + q.max_marks, 0)} Marks`}
                size="small"
                color="primary"
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetchMarks()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={dirtyCount === 0 || saveMarksMutation.isPending}
            >
              Save {dirtyCount > 0 && `(${dirtyCount})`}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* CO Attainment Preview */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        CO-wise Attainment Preview
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {coAttainmentPreview.map((preview) => (
          <Grid key={preview.coId ?? "unmapped"} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Chip
                    label={preview.coCode}
                    size="small"
                    color={preview.coId ? "primary" : "default"}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {preview.questionsCount} Q
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color={
                  preview.percentage >= 70 ? "success.main" :
                  preview.percentage >= 50 ? "warning.main" : "error.main"
                }>
                  {preview.percentage.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(preview.percentage, 100)}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  color={
                    preview.percentage >= 70 ? "success" :
                    preview.percentage >= 50 ? "warning" : "error"
                  }
                />
                <Typography variant="caption" color="text.secondary">
                  {preview.obtainedMarks}/{preview.totalMarks} marks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Marks Entry Grid */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Marks Entry Grid
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, minWidth: 150, position: "sticky", left: 0, bgcolor: "grey.100", zIndex: 2 }}>
                Student
              </TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 80, bgcolor: "grey.100" }}>Roll No</TableCell>
              {questions.map((q) => {
                const co = getCO(q.co_id ?? null);
                return (
                  <TableCell
                    key={q.id}
                    align="center"
                    sx={{
                      fontWeight: 600,
                      minWidth: 100,
                      bgcolor: co ? "primary.50" : "grey.100",
                    }}
                  >
                    <Tooltip title={q.description || q.question_number}>
                      <Box>
                        <Typography variant="caption" display="block" fontWeight="bold">
                          Q{q.question_number}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          ({q.max_marks} M)
                        </Typography>
                        {co && (
                          <Chip label={co.code} size="small" color="primary" sx={{ mt: 0.5, height: 18, fontSize: 10 }} />
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                );
              })}
              <TableCell align="center" sx={{ fontWeight: 600, minWidth: 100, bgcolor: "success.50" }}>
                Total
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, minWidth: 80, bgcolor: "success.50" }}>
                %
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockStudents.map((student) => {
              const total = studentTotals.get(student.id);
              const percentage = total && total.max > 0 ? (total.obtained / total.max) * 100 : 0;

              return (
                <TableRow key={student.id} hover>
                  <TableCell sx={{ position: "sticky", left: 0, bgcolor: "background.paper", zIndex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {student.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {student.roll_no}
                    </Typography>
                  </TableCell>
                  {questions.map((q) => {
                    const key = `${q.id}-${student.id}`;
                    const entry = marksGrid.get(key);
                    const value = entry?.marksObtained;
                    const isDirty = entry?.isDirty;

                    return (
                      <TableCell key={q.id} align="center" sx={{ p: 0.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={value ?? ""}
                          onChange={(e) => handleMarksChange(q.id, student.id, e.target.value)}
                          inputProps={{
                            min: 0,
                            max: q.max_marks,
                            style: { textAlign: "center", padding: "4px 8px" },
                          }}
                          sx={{
                            width: 70,
                            "& .MuiOutlinedInput-root": {
                              bgcolor: isDirty ? "warning.50" : undefined,
                            },
                          }}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ bgcolor: "success.50" }}>
                    <Typography variant="body2" fontWeight="bold">
                      {total?.obtained ?? 0}/{total?.max ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: "success.50" }}>
                    <Chip
                      label={`${percentage.toFixed(1)}%`}
                      size="small"
                      color={
                        percentage >= 70 ? "success" :
                        percentage >= 50 ? "warning" : "error"
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box sx={{ mt: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: "warning.50", borderRadius: 0.5 }} />
          <Typography variant="caption">Unsaved changes</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: "primary.50", borderRadius: 0.5 }} />
          <Typography variant="caption">Question mapped to CO</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon color="success" fontSize="small" />
          <Typography variant="caption">≥70% (Target Met)</Typography>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
