import { useState, useMemo } from 'react';
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
  Tooltip,
} from '@mui/material';
import { Search, Edit, Delete, Add, Phone, Email, Visibility, School } from '@mui/icons-material';
import { getTeachers, getTeacherKPI } from '@/app/services/teachers.api';
import type { Teacher } from '@/app/services/teacher.schema';
import TeacherFilters, {
  defaultTeacherFilters,
  type TeacherFilterState,
} from '@/app/components/teachers/TeacherFilters';
import {
  useClassTeacherIds,
  useTeacherIdsBySubjects,
} from '@/app/services/teachersFilters.hooks';

// Extended teacher type with class teacher info
interface TeacherWithInfo extends Teacher {
  isClassTeacher: boolean;
}

export default function TeachersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TeacherFilterState>(defaultTeacherFilters);

  // Get base teacher data
  const teachers = getTeachers();
  const kpi = getTeacherKPI();

  // Fetch filter data
  const { data: classTeacherIds = [], isLoading: classTeacherIdsLoading } = useClassTeacherIds();
  const { data: teacherIdsBySubject = [], isLoading: subjectTeachersLoading } = useTeacherIdsBySubjects(
    filters.subjectIds
  );

  // Enrich teachers with class teacher info
  const teachersWithInfo: TeacherWithInfo[] = useMemo(() => {
    return teachers.map((teacher) => ({
      ...teacher,
      isClassTeacher: classTeacherIds.includes(teacher.teacher_id),
    }));
  }, [teachers, classTeacherIds]);

  // Apply all filters
  const filteredTeachers = useMemo(() => {
    let result = [...teachersWithInfo];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (teacher) =>
          teacher.full_name.toLowerCase().includes(query) ||
          teacher.email?.toLowerCase().includes(query) ||
          (teacher.subjects && teacher.subjects.some((s: string) => s.toLowerCase().includes(query)))
      );
    }

    // Apply class teachers only filter
    if (filters.classTeachersOnly) {
      result = result.filter((teacher) => teacher.isClassTeacher);
    }

    // Apply subject filter
    if (filters.subjectIds.length > 0 && !subjectTeachersLoading) {
      result = result.filter((teacher) => teacherIdsBySubject.includes(teacher.teacher_id));
    }

    return result;
  }, [teachersWithInfo, searchQuery, filters, teacherIdsBySubject, subjectTeachersLoading]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: TeacherFilterState) => {
    setFilters(newFilters);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(defaultTeacherFilters);
    setSearchQuery('');
  };

  const isFilterLoading = classTeacherIdsLoading || (filters.subjectIds.length > 0 && subjectTeachersLoading);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Teacher Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} color="primary">
          Add Teacher
        </Button>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Teachers
            </Typography>
            <Typography variant="h4">{kpi.total_teachers}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active Teachers
            </Typography>
            <Typography variant="h4">{kpi.active_teachers}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Avg Experience
            </Typography>
            <Typography variant="h4">{kpi.avg_experience_years} years</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Subjects Taught
            </Typography>
            <Typography variant="h4">{kpi.subjects_covered}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Advanced Filters */}
      <TeacherFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        disabled={isFilterLoading}
      />

      {/* Results count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredTeachers.length} of {teachers.length} teachers
          {(filters.classTeachersOnly || filters.subjectIds.length > 0) && (
            <Chip label="Filtered" size="small" color="primary" sx={{ ml: 1 }} />
          )}
        </Typography>
      </Box>

      {/* Teachers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Teacher</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Classes</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers.map((teacher: TeacherWithInfo) => (
              <TableRow
                key={teacher.teacher_id}
                hover
                onClick={() => navigate(`/academics/teachers/${teacher.teacher_id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{teacher.full_name.charAt(0)}</Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="medium">{teacher.full_name}</Typography>
                        {teacher.isClassTeacher && (
                          <Tooltip title="Class Teacher">
                            <Chip
                              icon={<School fontSize="small" />}
                              label="Class Teacher"
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {teacher.employee_code}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {teacher.subjects && teacher.subjects.slice(0, 2).map((subject: string) => (
                      <Chip key={subject} label={subject} size="small" />
                    ))}
                    {teacher.subjects && teacher.subjects.length > 2 && (
                      <Chip label={`+${teacher.subjects.length - 2}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{teacher.experience_years || 0} years</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {teacher.classes && teacher.classes.slice(0, 2).map((cls: string) => (
                      <Chip key={cls} label={cls} size="small" color="primary" />
                    ))}
                    {teacher.classes && teacher.classes.length > 2 && (
                      <Chip label={`+${teacher.classes.length - 2}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Phone fontSize="small" />
                    <Typography variant="body2">{teacher.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                    <Email fontSize="small" />
                    <Typography variant="body2">{teacher.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={teacher.employment_status}
                    size="small"
                    color={teacher.employment_status === 'Active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/academics/teachers/${teacher.teacher_id}`);
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTeachers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {searchQuery || filters.classTeachersOnly || filters.subjectIds.length > 0
              ? 'No teachers found matching the current filters'
              : 'No teachers found'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
