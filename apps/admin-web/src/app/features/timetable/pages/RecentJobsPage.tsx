/**
 * Recent Jobs Page - View history of timetable generation jobs
 * MUI-styled version for SchoolOS ERP integration
 */

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as QueuedIcon,
  PlayArrow as RunningIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';
import { listJobs } from '../lib/api';
import { formatDistanceToNow } from '../lib/utils';
import type { JobListResponse } from '../lib/schemas';

// Status chip config
const STATUS_CONFIG: Record<
  string,
  { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: React.ReactElement; label: string }
> = {
  queued: { color: 'default', icon: <QueuedIcon fontSize="small" />, label: 'Queued' },
  running: { color: 'primary', icon: <RunningIcon fontSize="small" />, label: 'Running' },
  diagnostics: { color: 'info', icon: <RunningIcon fontSize="small" />, label: 'Diagnostics' },
  completed: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' },
  failed: { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Failed' },
  cancelled: { color: 'warning', icon: <CancelledIcon fontSize="small" />, label: 'Cancelled' },
};

export function RecentJobsPage() {
  const navigate = useNavigate();

  const {
    data: jobsResponse,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<JobListResponse>({
    queryKey: ['recentJobs'],
    queryFn: listJobs,
    refetchInterval: 30000,
  });

  const jobs = jobsResponse?.jobs ?? [];

  const handleViewResult = (jobId: string) => {
    navigate(`/timetable/results/${jobId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/timetable')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Recent Jobs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View history of timetable generation jobs
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load jobs: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && (!jobs || jobs.length === 0) && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Jobs Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate a timetable to see jobs here
          </Typography>
          <Button variant="contained" onClick={() => navigate('/timetable')}>
            Generate Timetable
          </Button>
        </Paper>
      )}

      {/* Jobs Table */}
      {!isLoading && jobs && jobs.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Result</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => {
                const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
                const duration = job.completed_at && job.started_at
                  ? Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)
                  : null;

                return (
                  <TableRow
                    key={job.job_id}
                    hover
                    sx={{ cursor: job.status === 'completed' ? 'pointer' : 'default' }}
                    onClick={() => job.status === 'completed' && handleViewResult(job.job_id)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {job.job_id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {job.created_at ? (
                        <Tooltip title={new Date(job.created_at).toLocaleString()}>
                          <Typography variant="body2" color="text.secondary">
                            {formatDistanceToNow(new Date(job.created_at))}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {duration !== null ? (
                        <Typography variant="body2" color="text.secondary">
                          {duration}s
                        </Typography>
                      ) : job.status === 'running' ? (
                        <Typography variant="body2" color="primary">
                          In progress...
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.status === 'completed' && (
                        <Chip label="View Results" size="small" variant="outlined" color="success" />
                      )}
                      {job.status === 'failed' && job.error && (
                        <Tooltip title={job.error}>
                          <Chip label="Error" size="small" variant="outlined" color="error" />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {job.status === 'completed' && (
                        <Tooltip title="View Results">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResult(job.job_id);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default RecentJobsPage;
