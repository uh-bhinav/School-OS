// ============================================================================
// EXAM SUBJECTS PAGE
// ============================================================================
// Shows the expansion of an exam into subject-wise exams per class.
// This is where teachers manage questions and CO mappings for their subject.

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
  LinearProgress,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GradingIcon from "@mui/icons-material/Grading";
import { useSubjectExamsByExam, useExpandExam } from "@/app/services/obe.hooks";
import { SubjectExamStatus } from "@/app/services/obe.schema";

// Status configuration
const STATUS_CONFIG: Record<SubjectExamStatus, { label: string; color: "default" | "info" | "warning" | "success" }> = {
  draft: { label: "Draft", color: "default" },
  questions_defined: { label: "Questions Defined", color: "info" },
  cos_mapped: { label: "COs Mapped", color: "warning" },
  published: { label: "Published", color: "success" },
};

export default function ExamSubjectsPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const examIdNum = examId ? parseInt(examId, 10) : null;
  const { data: subjectExams, isLoading, error } = useSubjectExamsByExam(examIdNum);
  const expandExamMutation = useExpandExam();

  // Mock exam info - in production would come from API
  const examInfo = {
    id: examIdNum,
    title: "Mid-Term Examination",
    date: "2024-02-15",
    type: "Mid-Term",
  };

  // Get unique classes and subjects for filters
  const uniqueClasses = [...new Set((subjectExams || []).map((se) => se.class_name))];
  const uniqueSubjects = [...new Set((subjectExams || []).map((se) => se.subject_name))];

  // Filter subject exams
  const filteredExams = (subjectExams || []).filter((se) => {
    const matchesClass = classFilter === "all" || se.class_name === classFilter;
    const matchesSubject = subjectFilter === "all" || se.subject_name === subjectFilter;
    return matchesClass && matchesSubject;
  });

  // Summary stats
  const totalSubjectExams = filteredExams.length;
  const publishedCount = filteredExams.filter((se) => se.status === "published").length;
  const cosMappedCount = filteredExams.filter((se) => se.status === "cos_mapped" || se.status === "published").length;

  const handleExpandExam = () => {
    if (examIdNum) {
      expandExamMutation.mutate(examIdNum);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load subject exams</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small" onClick={() => navigate("/academics/exams")}>
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/academics")}
          >
            Academics
          </Link>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/academics/exams")}
          >
            Exams
          </Link>
          <Typography color="text.primary">{examInfo.title} - Subjects</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {examInfo.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {examInfo.type} • {new Date(examInfo.date).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={`${totalSubjectExams} Subject Exams`} />
            <Chip
              label={`${publishedCount} Published`}
              color="success"
              icon={<CheckCircleIcon />}
            />
            <Chip
              label={`${cosMappedCount} COs Mapped`}
              color={cosMappedCount === totalSubjectExams ? "success" : "warning"}
            />
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Exam Preparation Progress</Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round((publishedCount / totalSubjectExams) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(publishedCount / totalSubjectExams) * 100}
            sx={{ height: 8, borderRadius: 4 }}
            color={publishedCount === totalSubjectExams ? "success" : "primary"}
          />
        </Box>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Workflow:</strong> Define questions → Map COs to questions → Publish for marks entry
        </Typography>
      </Alert>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={classFilter}
            label="Class"
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <MenuItem value="all">All Classes</MenuItem>
            {uniqueClasses.map((cls) => (
              <MenuItem key={cls} value={cls}>{cls}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Subject</InputLabel>
          <Select
            value={subjectFilter}
            label="Subject"
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <MenuItem value="all">All Subjects</MenuItem>
            {uniqueSubjects.map((subj) => (
              <MenuItem key={subj} value={subj}>{subj}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleExpandExam}
          disabled={expandExamMutation.isPending}
        >
          {expandExamMutation.isPending ? "Expanding..." : "Expand to New Classes"}
        </Button>
      </Box>

      {/* Subject Exams Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell align="center">Total Marks</TableCell>
              <TableCell align="center">Questions</TableCell>
              <TableCell>CO Mapping</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    No subject exams found. Click "Expand to New Classes" to create them.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((se) => {
                const statusConfig = STATUS_CONFIG[se.status];
                const coProgress = se.questions_count > 0
                  ? Math.round((se.questions_mapped / se.questions_count) * 100)
                  : 0;

                return (
                  <TableRow key={se.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {se.class_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Section {se.section}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{se.subject_name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{se.total_marks}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{se.questions_count}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 100 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption">
                            {se.questions_mapped}/{se.questions_count}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {coProgress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={coProgress}
                          sx={{ height: 6, borderRadius: 3 }}
                          color={coProgress === 100 ? "success" : coProgress > 0 ? "warning" : "inherit"}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                        <Tooltip title="View Questions & CO Mapping">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/academics/exams/${examId}/subjects/${se.id}/questions`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Enter Marks">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => navigate(`/academics/exams/${examId}/subjects/${se.id}/marks`)}
                          >
                            <GradingIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/academics/exams/${examId}/subjects/${se.id}/questions`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Status Workflow
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label="1. Draft" size="small" color="default" variant="outlined" />
            <Typography variant="caption">→</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label="2. Questions Defined" size="small" color="info" variant="outlined" />
            <Typography variant="caption">→</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label="3. COs Mapped" size="small" color="warning" variant="outlined" />
            <Typography variant="caption">→</Typography>
          </Box>
          <Chip label="4. Published" size="small" color="success" variant="outlined" />
        </Box>
      </Paper>
    </Box>
  );
}
