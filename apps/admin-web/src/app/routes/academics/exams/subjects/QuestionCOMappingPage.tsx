// ============================================================================
// QUESTION CO MAPPING PAGE
// ============================================================================
// Page for managing exam questions and their CO mappings for a subject exam.
// This is where teachers define questions and map each to a Course Outcome.

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Skeleton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSubjectExam, useQuestionsBySubjectExam, useApprovedCOsBySubjectAndGrade, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from "@/app/services/obe.hooks";
import { ExamQuestion } from "@/app/services/obe.schema";

export default function QuestionCOMappingPage() {
  const { examId, subjectExamId } = useParams<{ examId: string; subjectExamId: string }>();
  const navigate = useNavigate();

  const subjectExamIdNum = subjectExamId ? parseInt(subjectExamId, 10) : null;

  // Fetch data
  const { data: subjectExam, isLoading: loadingExam } = useSubjectExam(subjectExamIdNum);
  const { data: questions, isLoading: loadingQuestions } = useQuestionsBySubjectExam(subjectExamIdNum);
  const { data: approvedCOs, isLoading: loadingCOs } = useApprovedCOsBySubjectAndGrade(
    subjectExam?.subject_id ?? null,
    subjectExam?.grade ?? null
  );

  // Mutations
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<ExamQuestion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    question_number: 1,
    description: "",
    max_marks: 5,
    co_id: null as number | null,
  });

  const cos = approvedCOs || [];
  const questionsList = questions || [];

  // Calculate stats
  const totalMarks = questionsList.reduce((sum, q) => sum + q.max_marks, 0);
  const mappedCount = questionsList.filter((q) => q.co_id !== null).length;
  const mappingProgress = questionsList.length > 0 ? Math.round((mappedCount / questionsList.length) * 100) : 0;

  // Handlers
  const handleOpenDialog = (question?: ExamQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question_number: question.question_number,
        description: question.description || "",
        max_marks: question.max_marks,
        co_id: question.co_id,
      });
    } else {
      setEditingQuestion(null);
      const nextNumber = questionsList.length + 1;
      setFormData({
        question_number: nextNumber,
        description: "",
        max_marks: 5,
        co_id: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingQuestion(null);
    setFormData({ question_number: 1, description: "", max_marks: 5, co_id: null });
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({
        questionId: editingQuestion.id,
        data: formData,
      });
    } else {
      createQuestionMutation.mutate({
        subject_exam_id: subjectExamIdNum!,
        ...formData,
      });
    }
    handleCloseDialog();
  };

  const handleDeleteClick = (question: ExamQuestion) => {
    setQuestionToDelete(question);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (questionToDelete) {
      deleteQuestionMutation.mutate(questionToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setQuestionToDelete(null);
  };

  const handleQuickCOUpdate = (questionId: number, coId: number | null) => {
    updateQuestionMutation.mutate({
      questionId,
      data: { co_id: coId },
    });
  };

  // Loading state
  if (loadingExam || loadingQuestions) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
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

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small" onClick={() => navigate(`/academics/exams/${examId}/subjects`)}>
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/academics/exams")}
          >
            Exams
          </Link>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/academics/exams/${examId}/subjects`)}
          >
            Subjects
          </Link>
          <Typography color="text.primary">
            {subjectExam.class_name} - {subjectExam.subject_name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {subjectExam.subject_name} - Questions & CO Mapping
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subjectExam.class_name} • {subjectExam.exam_title}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={`${questionsList.length} Questions`} />
            <Chip label={`${totalMarks} Total Marks`} color="primary" />
            <Chip
              label={`${mappedCount}/${questionsList.length} COs Mapped`}
              color={mappingProgress === 100 ? "success" : "warning"}
              icon={mappingProgress === 100 ? <CheckCircleIcon /> : undefined}
            />
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">CO Mapping Progress</Typography>
            <Typography variant="body2" fontWeight="bold">{mappingProgress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={mappingProgress}
            sx={{ height: 8, borderRadius: 4 }}
            color={mappingProgress === 100 ? "success" : "primary"}
          />
        </Box>
      </Paper>

      {/* Info Alert */}
      {loadingCOs ? (
        <Skeleton variant="rectangular" height={50} sx={{ mb: 3 }} />
      ) : cos.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No approved Course Outcomes found for this subject and grade.
          Please approve COs in the Subject module first.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Map each question to a Course Outcome (CO) for attainment calculation.
            Only <strong>approved</strong> COs are available for mapping.
          </Typography>
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Question
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/academics/subjects/${subjectExam.subject_id}`)}
        >
          Manage COs
        </Button>
      </Box>

      {/* Questions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80 }}>Q.No</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center" sx={{ width: 100 }}>Marks</TableCell>
              <TableCell sx={{ minWidth: 250 }}>Course Outcome</TableCell>
              <TableCell align="center" sx={{ width: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questionsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No questions defined yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Add First Question
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              questionsList.map((question) => (
                <TableRow key={question.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      Q{question.question_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {question.description || <em style={{ color: "gray" }}>No description</em>}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={question.max_marks} size="small" />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select<number | "">
                        value={question.co_id || ""}
                        displayEmpty
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const value = rawValue === "" ? null : Number(rawValue);
                          handleQuickCOUpdate(question.id, value);
                        }}
                        sx={{
                          bgcolor: question.co_id ? "success.50" : "warning.50",
                          "& .MuiSelect-select": {
                            py: 1,
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>Select CO...</em>
                        </MenuItem>
                        {cos.map((co) => (
                          <MenuItem key={co.id} value={co.id}>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {co.code}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {co.description.substring(0, 50)}...
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(question)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(question)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CO Summary */}
      {questionsList.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Marks Distribution by CO
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {cos.map((co) => {
              const coMarks = questionsList
                .filter((q) => q.co_id === co.id)
                .reduce((sum, q) => sum + q.max_marks, 0);
              if (coMarks === 0) return null;
              return (
                <Chip
                  key={co.id}
                  label={`${co.code}: ${coMarks} marks`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              );
            })}
            {questionsList.filter((q) => q.co_id === null).length > 0 && (
              <Chip
                label={`Unmapped: ${questionsList.filter((q) => q.co_id === null).reduce((sum, q) => sum + q.max_marks, 0)} marks`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Add/Edit Question Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingQuestion ? "Edit Question" : "Add Question"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Question No."
                value={formData.question_number}
                onChange={(e) => setFormData({ ...formData, question_number: parseInt(e.target.value) || 1 })}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Marks"
                value={formData.max_marks}
                onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) || 1 })}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormControl fullWidth>
                <InputLabel>CO (Optional)</InputLabel>
                <Select<number | "">
                  value={formData.co_id || ""}
                  label="CO (Optional)"
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    setFormData({ ...formData, co_id: rawValue === "" ? null : Number(rawValue) });
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {cos.map((co) => (
                    <MenuItem key={co.id} value={co.id}>
                      {co.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Question Description (Optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the question..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveQuestion}
            disabled={formData.question_number < 1 || formData.max_marks < 1}
          >
            {editingQuestion ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Question?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>Q{questionToDelete?.question_number}</strong>?
            This will also remove any marks entered for this question.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
