// ============================================================================
// SUBJECTS PAGE
// ============================================================================
// Main listing page for all subjects in the school
// Part of Academics → Subjects navigation

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { useSubjects } from "@/app/services/obe.hooks";
import { Subject } from "@/app/services/obe.schema";

// Extended subject data from mock (with aggregated fields)
interface SubjectWithStats extends Subject {
  cos_defined_count?: number;
  cos_approved_count?: number;
  total_classes?: number;
  total_teachers?: number;
}

export default function SubjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyExamSubjects, setShowOnlyExamSubjects] = useState(false);

  const { data: subjects = [], isLoading, error } = useSubjects();

  // Filter subjects based on search and toggle
  const filteredSubjects = (subjects as SubjectWithStats[]).filter((subject) => {
    const matchesSearch =
      subject.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.subject_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExamFilter = !showOnlyExamSubjects || subject.is_included_in_exams;
    return matchesSearch && matchesExamFilter;
  });

  // Calculate stats
  const totalSubjects = subjects.length;
  const examSubjects = subjects.filter((s) => s.is_included_in_exams).length;
  const subjectsWithCOs = (subjects as SubjectWithStats[]).filter(
    (s) => (s.cos_defined_count || 0) > 0
  ).length;

  const handleViewSubject = (subjectId: number) => {
    navigate(`/academics/subjects/${subjectId}`);
  };

  const getCOStatusChip = (subject: SubjectWithStats) => {
    const defined = subject.cos_defined_count || 0;
    const approved = subject.cos_approved_count || 0;

    if (defined === 0) {
      return (
        <Chip
          label="No COs"
          size="small"
          sx={{ bgcolor: "grey.200", color: "grey.600" }}
        />
      );
    }

    if (approved === defined) {
      return (
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
          label={`${approved}/${defined}`}
          size="small"
          color="success"
          variant="outlined"
        />
      );
    }

    return (
      <Chip
        icon={<WarningIcon sx={{ fontSize: 16 }} />}
        label={`${approved}/${defined}`}
        size="small"
        color="warning"
        variant="outlined"
      />
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load subjects: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Subjects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage subjects, course outcomes, and curriculum mapping
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {totalSubjects}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Subjects
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            {examSubjects}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Exam Subjects
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="info.main">
            {subjectsWithCOs}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            With COs Defined
          </Typography>
        </Paper>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search subjects..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyExamSubjects}
                onChange={(e) => setShowOnlyExamSubjects(e.target.checked)}
                size="small"
              />
            }
            label="Exam subjects only"
          />
        </Box>
      </Paper>

      {/* Subjects Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>Subject</TableCell>
              <TableCell>Code</TableCell>
              <TableCell align="center">In Exams</TableCell>
              <TableCell align="center">COs Status</TableCell>
              <TableCell align="center">Classes</TableCell>
              <TableCell align="center">Teachers</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubjects.map((subject) => (
              <TableRow
                key={subject.subject_id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => handleViewSubject(subject.subject_id)}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SchoolIcon fontSize="small" color="action" />
                    <Typography fontWeight="medium">{subject.subject_name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={subject.subject_code} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  {subject.is_included_in_exams ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">{getCOStatusChip(subject as SubjectWithStats)}</TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {(subject as SubjectWithStats).total_classes || 0}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {(subject as SubjectWithStats).total_teachers || 0}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSubject(subject.subject_id);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredSubjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No subjects found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
