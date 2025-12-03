import { useNavigate } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useClassStudents } from "@/app/services/classes.hooks";

interface ClassStudentsTabProps {
  classId: number;
}

export default function ClassStudentsTab({ classId }: ClassStudentsTabProps) {
  const navigate = useNavigate();
  const { data: students, isLoading, error } = useClassStudents(classId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load students: {error.message}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Students ({students?.length || 0})
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Roll No</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Attendance %</TableCell>
              <TableCell>Average Marks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students?.map((student) => (
              <TableRow key={student.student_id} hover>
                <TableCell>
                  <Chip label={`#${student.rank}`} size="small" color="primary" />
                </TableCell>
                <TableCell>{student.roll_number}</TableCell>
                <TableCell>
                  <Typography fontWeight="medium">{student.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${student.attendance_percentage}%`}
                    size="small"
                    color={student.attendance_percentage >= 80 ? "success" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${student.average_marks}%`}
                    size="small"
                    color={student.average_marks >= 75 ? "success" : student.average_marks >= 60 ? "warning" : "error"}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.is_active ? "Active" : "Inactive"}
                    size="small"
                    color={student.is_active ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/academics/students/${student.student_id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
