/**
 * Timetable Generator - Results Page (ERP Integration)
 *
 * Displays generated timetable results with class, teacher, and resource views.
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  MeetingRoom as RoomIcon,
} from '@mui/icons-material';
import { getJobResult, rerunJob, downloadResult } from '../lib/api';
import type { JobResultResponse, TimetablePeriod } from '../lib/schemas';

// Day and period configuration
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES: Record<string, string> = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
};

// Color palette for subjects
const SUBJECT_COLORS = [
  '#e3f2fd', '#e8f5e9', '#f3e5f5', '#fff3e0', '#fce4ec',
  '#e0f2f1', '#e8eaf6', '#fff8e1', '#e0f7fa', '#fbe9e7',
];

interface DisplayPeriod {
  period: number;
  subject_id: string;
  subject_name?: string;
  teacher_id: string;
  teacher_name?: string;
  day: string;
  class_id?: string;
  class_name?: string;
  room_id?: string;
  room_name?: string;
  resource_id?: string;
}

export function ResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  // Fetch results
  const {
    data: result,
    isLoading,
    error,
  } = useQuery<JobResultResponse>({
    queryKey: ['jobResult', jobId],
    queryFn: () => getJobResult(jobId!),
    enabled: !!jobId,
    staleTime: Infinity,
  });

  // Rerun mutation
  const rerunMutation = useMutation({
    mutationFn: () => rerunJob(jobId!),
    onSuccess: () => {
      navigate('/timetable-generator/generate');
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async (format: 'xlsx' | 'csv' | 'json') => {
      const blob = await downloadResult(jobId!, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timetable-${jobId?.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  // Build subject color map
  const subjectColorMap = useMemo(() => {
    if (!result) return {};
    const subjects = new Set<string>();
    const timetable = result.timetable_json?.timetable || {};
    Object.values(timetable).forEach((daySchedules) => {
      if (daySchedules && typeof daySchedules === 'object') {
        Object.values(daySchedules).forEach((periods: TimetablePeriod[]) => {
          if (Array.isArray(periods)) {
            periods.forEach((p) => subjects.add(p.subject_id));
          }
        });
      }
    });
    const map: Record<string, string> = {};
    Array.from(subjects).forEach((subjectId, i) => {
      map[subjectId] = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
    });
    return map;
  }, [result]);

  // Get entities for current tab
  const entities = useMemo(() => {
    if (!result) return [];
    const timetable = result.timetable_json?.timetable || {};
    const teacherSchedules = result.timetable_json?.teacher_schedules || {};
    const resourceViews = result.timetable_json?.resource_views || {};
    switch (activeTab) {
      case 0:
        return Object.keys(timetable).sort();
      case 1:
        return Object.keys(teacherSchedules).sort();
      case 2:
        return Object.keys(resourceViews).sort();
      default:
        return [];
    }
  }, [result, activeTab]);

  // Auto-select first entity when tab changes
  useMemo(() => {
    if (entities.length > 0 && !entities.includes(selectedEntity)) {
      setSelectedEntity(entities[0]);
    }
  }, [entities]);

  // Get periods for selected entity
  const periods = useMemo((): DisplayPeriod[] => {
    if (!result || !selectedEntity) return [];
    const timetable = result.timetable_json?.timetable || {};
    const teacherSchedules = result.timetable_json?.teacher_schedules || {};

    switch (activeTab) {
      case 0: { // Classes
        const sectionTimetable = timetable[selectedEntity];
        if (!sectionTimetable) return [];
        const flatPeriods: DisplayPeriod[] = [];
        Object.entries(sectionTimetable).forEach(([day, dayPeriods]) => {
          if (Array.isArray(dayPeriods)) {
            dayPeriods.forEach((p) => {
              flatPeriods.push({ ...p, day });
            });
          }
        });
        return flatPeriods;
      }
      case 1: { // Teachers
        const teacherSchedule = teacherSchedules[selectedEntity];
        if (!teacherSchedule) return [];
        const flatPeriods: DisplayPeriod[] = [];
        Object.entries(teacherSchedule).forEach(([day, dayPeriods]) => {
          if (Array.isArray(dayPeriods)) {
            dayPeriods.forEach((p: { period: number; section_id: string; subject_id: string }) => {
              flatPeriods.push({
                period: p.period,
                subject_id: p.subject_id,
                teacher_id: selectedEntity,
                day,
                class_id: p.section_id,
                class_name: p.section_id,
              });
            });
          }
        });
        return flatPeriods;
      }
      default:
        return [];
    }
  }, [result, selectedEntity, activeTab]);

  // Build grid data
  const gridData = useMemo(() => {
    const grid: Record<string, Record<number, DisplayPeriod>> = {};
    DAYS.forEach((day) => {
      grid[day] = {};
    });
    periods.forEach((p) => {
      if (grid[p.day]) {
        grid[p.day][p.period] = p;
      }
    });
    return grid;
  }, [periods]);

  // Get max periods
  const maxPeriods = useMemo(() => {
    let max = 8;
    periods.forEach((p) => {
      if (p.period > max) max = p.period;
    });
    return max;
  }, [periods]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error Loading Results</AlertTitle>
          {error instanceof Error ? error.message : 'Failed to load timetable results'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/timetable-generator/generate')} sx={{ mt: 2 }}>
          Back to Generate
        </Button>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No results found for this job.</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/timetable-generator/generate')} sx={{ mt: 2 }}>
          Back to Generate
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Timetable Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Job ID: {jobId?.slice(0, 8)}...
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => downloadMutation.mutate('xlsx')}
            disabled={downloadMutation.isPending}
          >
            Download Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => rerunMutation.mutate()}
            disabled={rerunMutation.isPending}
          >
            Regenerate
          </Button>
        </Stack>
      </Stack>

      {/* Metrics Summary */}
      {result.metrics && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generation Summary
            </Typography>
            <Stack direction="row" spacing={2}>
              {result.metrics.solve_time_seconds && (
                <Chip label={`Solved in ${result.metrics.solve_time_seconds.toFixed(1)}s`} color="success" />
              )}
              {result.timetable_json?.status && (
                <Chip label={`Status: ${result.timetable_json.status}`} color="info" />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* View Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<SchoolIcon />} label="Class View" />
          <Tab icon={<PersonIcon />} label="Teacher View" />
          <Tab icon={<RoomIcon />} label="Resource View" />
        </Tabs>
      </Paper>

      {/* Entity Selector */}
      <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
        <InputLabel>
          {activeTab === 0 ? 'Select Class' : activeTab === 1 ? 'Select Teacher' : 'Select Resource'}
        </InputLabel>
        <Select
          value={selectedEntity}
          label={activeTab === 0 ? 'Select Class' : activeTab === 1 ? 'Select Teacher' : 'Select Resource'}
          onChange={(e) => setSelectedEntity(e.target.value)}
        >
          {entities.map((entity) => (
            <MenuItem key={entity} value={entity}>
              {entity}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Timetable Grid */}
      {selectedEntity && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Period</TableCell>
                {DAYS.map((day) => (
                  <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>
                    {DAY_NAMES[day]}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: maxPeriods }, (_, i) => i + 1).map((periodNum) => (
                <TableRow key={periodNum}>
                  <TableCell sx={{ fontWeight: 'bold' }}>P{periodNum}</TableCell>
                  {DAYS.map((day) => {
                    const period = gridData[day]?.[periodNum];
                    if (!period) {
                      return <TableCell key={day} align="center">-</TableCell>;
                    }
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{
                          bgcolor: subjectColorMap[period.subject_id] || '#f5f5f5',
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {period.subject_name || period.subject_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activeTab === 0
                            ? period.teacher_name || period.teacher_id
                            : period.class_name || period.class_id}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diagnostics/Warnings */}
      {result.diagnostics && result.diagnostics.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Diagnostics
            </Typography>
            {result.diagnostics.map((diag, i) => (
              <Alert key={i} severity={(diag.type as 'error' | 'warning' | 'info') || 'info'} sx={{ mb: 1 }}>
                {diag.message}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      <Button startIcon={<BackIcon />} onClick={() => navigate('/timetable-generator/generate')} sx={{ mt: 3 }}>
        Back to Generate
      </Button>
    </Box>
  );
}
