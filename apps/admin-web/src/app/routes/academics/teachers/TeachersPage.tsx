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
} from '@mui/material';
import { Search, Edit, Delete, Add, Phone, Email, Visibility } from '@mui/icons-material';
import { getTeachers, getTeacherKPI } from '@/app/services/teachers.api';
import type { Teacher } from '@/app/services/teacher.schema';

export default function TeachersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const teachers = getTeachers();
  const kpi = getTeacherKPI();

  const filteredTeachers = teachers.filter(
    (teacher: Teacher) =>
      teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.subjects && teacher.subjects.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

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
            {filteredTeachers.map((teacher: Teacher) => (
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
                      <Typography fontWeight="medium">{teacher.full_name}</Typography>
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
          <Typography color="text.secondary">No teachers found matching "{searchQuery}"</Typography>
        </Box>
      )}
    </Box>
  );
}
