// ============================================================================
// SUBJECT CLASSES TAB
// ============================================================================
// Tab showing which classes this subject is taught in

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
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";
import { SubjectDetail } from "@/app/services/obe.schema";

interface SubjectClassesTabProps {
  subject: SubjectDetail;
}

// Mock data for classes - in production this would come from an API
const MOCK_CLASS_ASSIGNMENTS = [
  {
    id: "ca1",
    class_id: "class-10a",
    class_name: "Grade 10-A",
    section: "A",
    grade: 10,
    teacher_id: "teacher-1",
    teacher_name: "Dr. Sarah Wilson",
    teacher_avatar: undefined,
    student_count: 32,
    periods_per_week: 5,
    co_coverage: 85,
  },
  {
    id: "ca2",
    class_id: "class-10b",
    class_name: "Grade 10-B",
    section: "B",
    grade: 10,
    teacher_id: "teacher-2",
    teacher_name: "Mr. James Rodriguez",
    teacher_avatar: undefined,
    student_count: 30,
    periods_per_week: 5,
    co_coverage: 90,
  },
  {
    id: "ca3",
    class_id: "class-9a",
    class_name: "Grade 9-A",
    section: "A",
    grade: 9,
    teacher_id: "teacher-1",
    teacher_name: "Dr. Sarah Wilson",
    teacher_avatar: undefined,
    student_count: 28,
    periods_per_week: 4,
    co_coverage: 75,
  },
  {
    id: "ca4",
    class_id: "class-9b",
    class_name: "Grade 9-B",
    section: "B",
    grade: 9,
    teacher_id: "teacher-3",
    teacher_name: "Ms. Emily Chen",
    teacher_avatar: undefined,
    student_count: 29,
    periods_per_week: 4,
    co_coverage: 80,
  },
];

export default function SubjectClassesTab({ subject }: SubjectClassesTabProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter classes by subject's grades_taught and search term
  const filteredClasses = MOCK_CLASS_ASSIGNMENTS.filter((cls) => {
    const matchesGrade = subject.grades_taught.includes(cls.grade);
    const matchesSearch =
      searchTerm === "" ||
      cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacher_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return "success";
    if (coverage >= 70) return "warning";
    return "error";
  };

  return (
    <Box>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search classes or teachers..."
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
      </Box>

      {/* Classes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell align="center">Students</TableCell>
              <TableCell align="center">Periods/Week</TableCell>
              <TableCell align="center">CO Coverage</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <SchoolIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography color="text.secondary">
                    No classes found for this subject
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((cls) => (
                <TableRow key={cls.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
                        {cls.grade}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {cls.class_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Section {cls.section}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {cls.teacher_name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{cls.teacher_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{cls.student_count}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{cls.periods_per_week}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${cls.co_coverage}%`}
                      size="small"
                      color={getCoverageColor(cls.co_coverage)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Class">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/academics/classes/${cls.class_id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary */}
      {filteredClasses.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${filteredClasses.length} Classes`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${filteredClasses.reduce((sum, c) => sum + c.student_count, 0)} Total Students`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${new Set(filteredClasses.map((c) => c.teacher_id)).size} Teachers`}
            size="small"
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
}
