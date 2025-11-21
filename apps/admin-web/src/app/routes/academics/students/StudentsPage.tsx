import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Add,
  Phone,
  Email,
  Person,
  School,
  People,
  Visibility,
} from '@mui/icons-material';
import { getStudentKPI, filterStudents } from '@/app/services/students.api';
import type { Student } from '@/app/services/student.schema';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedSection, setSelectedSection] = useState<string>('');

  const kpi = getStudentKPI();

  // Apply filters
  const filteredStudents = filterStudents({
    classId: selectedClass || undefined,
    section: selectedSection || undefined,
    searchQuery: searchQuery || undefined,
    isActive: true,
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedSection('');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Student Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage student records, contacts, and academic information
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} color="primary">
          Add Student
        </Button>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {kpi.total_students}
                </Typography>
              </Box>
              <People sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Students
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {kpi.active_students}
                </Typography>
              </Box>
              <Person sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg Attendance
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {kpi.avg_attendance.toFixed(1)}%
                </Typography>
              </Box>
              <School sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Classes Covered
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {kpi.classes_covered}
                </Typography>
              </Box>
              <School sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by name, admission no, or parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as number | '')}
                label="Class"
              >
                <MenuItem value="">All Classes</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    Grade {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Section</InputLabel>
              <Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                label="Section"
              >
                <MenuItem value="">All Sections</MenuItem>
                <MenuItem value="A">Section A</MenuItem>
                <MenuItem value="B">Section B</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" onClick={handleResetFilters}>
              Reset
            </Button>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchQuery && (
              <Chip
                label={`Search: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
                size="small"
              />
            )}
            {selectedClass && (
              <Chip
                label={`Class: Grade ${selectedClass}`}
                onDelete={() => setSelectedClass('')}
                size="small"
              />
            )}
            {selectedSection && (
              <Chip
                label={`Section: ${selectedSection}`}
                onDelete={() => setSelectedSection('')}
                size="small"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Students ({filteredStudents.length})
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                  <TableCell>Student</TableCell>
                  <TableCell>Admission No</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Roll No</TableCell>
                  <TableCell>Parent Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student: Student) => (
                  <TableRow
                    key={student.student_id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/academics/students/${student.student_id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: student.gender === 'Male' ? '#1976d2' : '#e91e63' }}>
                          {student.full_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">{student.full_name}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Email fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {student.admission_no}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${student.class_name} - ${student.section}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{student.roll_number}</Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {student.parent_name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Phone fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {student.parent_phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={student.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={student.is_active ? 'success' : 'default'}
                      />
                    </TableCell>

                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        color="primary"
                        title="View Details"
                        onClick={() => navigate(`/academics/students/${student.student_id}`)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="info" title="Edit Student">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" title="Delete Student">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredStudents.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {searchQuery || selectedClass || selectedSection
                  ? 'No students found matching your filters'
                  : 'No students available'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
