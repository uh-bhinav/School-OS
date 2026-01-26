// ============================================================================
// SUBJECT EXAMS TAB
// ============================================================================
// Shows exams for this subject with CO mapping status

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  LinearProgress,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import { useNavigate } from "react-router-dom";
import { SubjectDetail, SubjectExamStatus } from "@/app/services/obe.schema";

interface SubjectExamsTabProps {
  subject: SubjectDetail;
}

// Mock data for subject exams - in production from API
const MOCK_SUBJECT_EXAMS = [
  {
    id: 1,
    exam_id: 1,
    exam_title: "Mid-Term Examination",
    class_id: 101,
    class_name: "Grade 10-A",
    exam_date: "2024-02-15",
    status: "cos_mapped" as SubjectExamStatus,
    total_marks: 100,
    question_count: 25,
    cos_mapped_count: 20,
  },
  {
    id: 2,
    exam_id: 1,
    exam_title: "Mid-Term Examination",
    class_id: 102,
    class_name: "Grade 10-B",
    exam_date: "2024-02-15",
    status: "questions_defined" as SubjectExamStatus,
    total_marks: 100,
    question_count: 25,
    cos_mapped_count: 10,
  },
  {
    id: 3,
    exam_id: 2,
    exam_title: "Unit Test 1",
    class_id: 101,
    class_name: "Grade 10-A",
    exam_date: "2024-01-20",
    status: "published" as SubjectExamStatus,
    total_marks: 50,
    question_count: 15,
    cos_mapped_count: 15,
  },
  {
    id: 4,
    exam_id: 3,
    exam_title: "Final Examination",
    class_id: 101,
    class_name: "Grade 10-A",
    exam_date: "2024-04-15",
    status: "draft" as SubjectExamStatus,
    total_marks: 100,
    question_count: 0,
    cos_mapped_count: 0,
  },
];

const STATUS_CONFIG: Record<SubjectExamStatus, { label: string; color: "default" | "info" | "warning" | "success"; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "default", icon: <AssignmentIcon fontSize="small" /> },
  questions_defined: { label: "Questions Defined", color: "info", icon: <AssignmentIcon fontSize="small" /> },
  cos_mapped: { label: "COs Mapped", color: "warning", icon: <WarningIcon fontSize="small" /> },
  published: { label: "Published", color: "success", icon: <CheckCircleIcon fontSize="small" /> },
};

export default function SubjectExamsTab({ subject }: SubjectExamsTabProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter exams by subject and search term
  const filteredExams = MOCK_SUBJECT_EXAMS.filter((exam) => {
    return (
      searchTerm === "" ||
      exam.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.class_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getMappingProgress = (exam: typeof MOCK_SUBJECT_EXAMS[0]) => {
    if (exam.question_count === 0) return 0;
    return Math.round((exam.cos_mapped_count / exam.question_count) * 100);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <TextField
          placeholder="Search exams..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: "100%", sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={() => navigate("/academics/exams")}
        >
          View All Exams
        </Button>
      </Box>

      {/* Exams Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Date</TableCell>
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
                  <AssignmentIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography color="text.secondary">
                    No exams found for {subject.subject_name}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => {
                const progress = getMappingProgress(exam);
                const statusConfig = STATUS_CONFIG[exam.status];

                return (
                  <TableRow key={exam.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {exam.exam_title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exam.total_marks} marks
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{exam.class_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{exam.question_count}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption">
                            {exam.cos_mapped_count}/{exam.question_count}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ height: 6, borderRadius: 3 }}
                          color={progress === 100 ? "success" : progress > 0 ? "warning" : "inherit"}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon as React.ReactElement}
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/academics/exams/${exam.exam_id}/subject/${exam.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Stats */}
      {filteredExams.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${filteredExams.length} Exams`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${filteredExams.filter(e => e.status === "published").length} Published`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${filteredExams.filter(e => e.status === "draft").length} Draft`}
            size="small"
            color="default"
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
}
