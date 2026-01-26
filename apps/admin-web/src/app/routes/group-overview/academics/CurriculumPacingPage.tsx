// ============================================================================
// CURRICULUM PACING PAGE - Super Admin Group Level
// ============================================================================
// Route: /group-overview/academics/curriculum-pacing
// Purpose: Protect franchise syllabus consistency by identifying schools
// that are falling behind agreed timelines.
// This is about standardization, not pedagogy.
// Read-only, frontend-only, no mutations.
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Card,
  CardContent,
  Tooltip,
  Alert,
  alpha,
  SelectChangeEvent,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  mockCurriculumPacingRecords,
  getPacingStatusCounts,
  getSchoolsSignificantlyBehind,
  filterCurriculumRecords,
  mockSavedViews,
} from '../../../mockDataProviders/mockAcademicsGroupLevel';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'schoolName' | 'region' | 'lagPercent' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

// Grade options for filter
const GRADE_OPTIONS = ['All', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

// Term options
const TERM_OPTIONS = [
  { value: 'term1', label: 'Term 1' },
  { value: 'term2', label: 'Term 2' },
  { value: 'term3', label: 'Term 3' },
];

// ============================================================================
// STATUS TILE COMPONENT
// ============================================================================

interface StatusTileProps {
  label: string;
  count: number;
  type: 'on-track' | 'lagging';
  isActive?: boolean;
  onClick: () => void;
}

function StatusTile({ label, count, type, isActive, onClick }: StatusTileProps) {
  const { mode } = useThemeMode();

  const config = {
    'on-track': {
      bg: mode === 'dark' ? alpha('#2e7d32', 0.15) : alpha('#2e7d32', 0.08),
      activeBg: mode === 'dark' ? alpha('#2e7d32', 0.3) : alpha('#2e7d32', 0.2),
      border: '#2e7d32',
      text: mode === 'dark' ? '#66bb6a' : '#2e7d32',
    },
    'lagging': {
      bg: mode === 'dark' ? alpha('#ed6c02', 0.15) : alpha('#ed6c02', 0.08),
      activeBg: mode === 'dark' ? alpha('#ed6c02', 0.3) : alpha('#ed6c02', 0.2),
      border: '#ed6c02',
      text: mode === 'dark' ? '#ffb74d' : '#ed6c02',
    },
  };

  const c = config[type];

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isActive ? c.activeBg : c.bg,
        border: `1px solid ${alpha(c.border, isActive ? 0.5 : 0.2)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: c.text, mb: 0.5 }}>
          {count}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TREND INDICATOR COMPONENT
// ============================================================================

interface TrendIndicatorProps {
  trend: 'improving' | 'stable' | 'declining';
}

function TrendIndicator({ trend }: TrendIndicatorProps) {
  const { mode } = useThemeMode();

  const config = {
    improving: {
      icon: <TrendingUpIcon sx={{ fontSize: 16 }} />,
      color: mode === 'dark' ? '#66bb6a' : '#2e7d32',
      label: 'Improving',
    },
    stable: {
      icon: <TrendingFlatIcon sx={{ fontSize: 16 }} />,
      color: mode === 'dark' ? '#90caf9' : '#1976d2',
      label: 'Stable',
    },
    declining: {
      icon: <TrendingDownIcon sx={{ fontSize: 16 }} />,
      color: mode === 'dark' ? '#ef5350' : '#d32f2f',
      label: 'Declining',
    },
  };

  const c = config[trend];

  return (
    <Tooltip title={c.label}>
      <Box sx={{ display: 'inline-flex', color: c.color }}>
        {c.icon}
      </Box>
    </Tooltip>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CurriculumPacingPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state (synced with URL)
  const [region, setRegion] = useState(searchParams.get('region') || 'All');
  const [grade, setGrade] = useState(searchParams.get('grade') || 'All');
  const [term, setTerm] = useState(searchParams.get('term') || 'term2');
  const [savedView, setSavedView] = useState(searchParams.get('view') || 'view-all');
  const [statusFilter, setStatusFilter] = useState<string | null>(searchParams.get('status') || null);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('lagPercent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Get status counts
  const statusCounts = useMemo(() => getPacingStatusCounts(), []);

  // Get schools significantly behind
  const schoolsSignificantlyBehind = useMemo(() => getSchoolsSignificantlyBehind(), []);

  // Filter records
  const filteredRecords = useMemo(() => {
    const filters: {
      region?: string;
      grade?: string;
      status?: string;
    } = {};

    if (region !== 'All') {
      filters.region = region;
    }

    if (grade !== 'All') {
      filters.grade = grade;
    }

    if (statusFilter) {
      filters.status = statusFilter;
    }

    return filterCurriculumRecords(mockCurriculumPacingRecords, filters);
  }, [region, grade, statusFilter]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'schoolName':
          comparison = a.schoolName.localeCompare(b.schoolName);
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
        case 'lagPercent':
          comparison = a.lagPercent - b.lagPercent;
          break;
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortKey, sortDirection]);

  // Handlers
  const handleRegionChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setRegion(value);
    updateFilters({ region: value === 'All' ? null : value });
  };

  const handleGradeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setGrade(value);
    updateFilters({ grade: value === 'All' ? null : value });
  };

  const handleTermChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setTerm(value);
    updateFilters({ term: value });
  };

  const handleSavedViewChange = (event: SelectChangeEvent) => {
    const viewId = event.target.value;
    setSavedView(viewId);
    const view = mockSavedViews.find(v => v.id === viewId);
    if (view) {
      setRegion(view.filters.region || 'All');
      updateFilters({
        view: viewId,
        region: view.filters.region || null,
      });
    }
  };

  const handleStatusTileClick = (status: 'on-track' | 'lagging') => {
    if (statusFilter === status) {
      setStatusFilter(null);
      updateFilters({ status: null });
    } else {
      setStatusFilter(status);
      updateFilters({ status });
    }
  };

  const handleAlertBannerClick = () => {
    setStatusFilter('lagging');
    updateFilters({ status: 'lagging' });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (schoolId: number) => {
    navigate(`/group-overview/schools/${schoolId}`);
  };

  const handleExport = () => {
    console.log('[EXPORT] Exporting curriculum pacing data:', sortedRecords.length, 'records');
    alert('Export initiated. In production, this would download a CSV/PDF file.');
  };

  // Get lag % color
  const getLagColor = (lagPercent: number) => {
    if (lagPercent <= 5) return mode === 'dark' ? '#66bb6a' : '#2e7d32';
    if (lagPercent <= 10) return mode === 'dark' ? '#90caf9' : '#1976d2';
    if (lagPercent <= 15) return mode === 'dark' ? '#ffb74d' : '#ed6c02';
    return mode === 'dark' ? '#ef5350' : '#d32f2f';
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Curriculum Pacing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ensure consistent syllabus delivery across all schools
        </Typography>
      </Box>

      {/* Top Controls Bar */}
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2.5,
          py: 1.5,
          mb: 3,
          borderRadius: 2,
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.8) : alpha('#fff', 0.9),
          boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          flexWrap: 'wrap',
        }}
      >
        {/* Region Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Region</InputLabel>
          <Select value={region} label="Region" onChange={handleRegionChange}>
            <MenuItem value="All">All Regions</MenuItem>
            {mockRegions.map(r => (
              <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Grade Level Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Grade Level</InputLabel>
          <Select value={grade} label="Grade Level" onChange={handleGradeChange}>
            {GRADE_OPTIONS.map(g => (
              <MenuItem key={g} value={g}>{g === 'All' ? 'All Grades' : g}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Term Selector */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Term</InputLabel>
          <Select value={term} label="Term" onChange={handleTermChange}>
            {TERM_OPTIONS.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Saved Views */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Saved View</InputLabel>
          <Select value={savedView} label="Saved View" onChange={handleSavedViewChange}>
            {mockSavedViews.map(view => (
              <MenuItem key={view.id} value={view.id}>{view.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        {/* Export Button */}
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={handleExport}
          sx={{ textTransform: 'none' }}
        >
          Export
        </Button>
      </Paper>

      {/* Alert Banner - Only shown when schools are significantly behind */}
      {schoolsSignificantlyBehind.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: mode === 'dark' ? alpha('#ed6c02', 0.15) : alpha('#ed6c02', 0.12),
            },
          }}
          onClick={handleAlertBannerClick}
        >
          <Typography variant="body2">
            <strong>{schoolsSignificantlyBehind.length} schools</strong> are more than 15% behind syllabus plan — review remediation.
          </Typography>
        </Alert>
      )}

      {/* Status Indicators */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <StatusTile
            label="On Track"
            count={statusCounts.onTrack}
            type="on-track"
            isActive={statusFilter === 'on-track'}
            onClick={() => handleStatusTileClick('on-track')}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatusTile
            label="Lagging"
            count={statusCounts.lagging}
            type="lagging"
            isActive={statusFilter === 'lagging'}
            onClick={() => handleStatusTileClick('lagging')}
          />
        </Box>
      </Box>

      {statusFilter && (
        <Box sx={{ mb: 2 }}>
          <Button
            size="small"
            onClick={() => { setStatusFilter(null); updateFilters({ status: null }); }}
            sx={{ textTransform: 'none' }}
          >
            Clear status filter
          </Button>
        </Box>
      )}

      {/* School Pacing Table */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Schools ({sortedRecords.length})
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                  }}
                >
                  <TableSortLabel
                    active={sortKey === 'schoolName'}
                    direction={sortKey === 'schoolName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('schoolName')}
                  >
                    School
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 100,
                  }}
                >
                  <TableSortLabel
                    active={sortKey === 'region'}
                    direction={sortKey === 'region' ? sortDirection : 'asc'}
                    onClick={() => handleSort('region')}
                  >
                    Region
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 180,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Grade(s) Affected
                    <Tooltip title="Grades where syllabus completion is behind schedule">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 120,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'lagPercent'}
                      direction={sortKey === 'lagPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('lagPercent')}
                    >
                      Lag %
                    </TableSortLabel>
                    <Tooltip title="Difference between planned and covered syllabus. 0% means on track. Higher values indicate more syllabus is pending.">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 120,
                  }}
                >
                  <TableSortLabel
                    active={sortKey === 'lastUpdated'}
                    direction={sortKey === 'lastUpdated' ? sortDirection : 'asc'}
                    onClick={() => handleSort('lastUpdated')}
                  >
                    Last Updated
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 100,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    Action
                    <Tooltip title="View school details in read-only mode">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRecords.map((record) => (
                <TableRow
                  key={record.schoolId}
                  sx={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? alpha('#1976d2', 0.15) : alpha('#1976d2', 0.06),
                    },
                    '& td': {
                      borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                    },
                  }}
                  onClick={() => handleRowClick(record.schoolId)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {record.schoolName}
                    </Typography>
                  </TableCell>
                  <TableCell>{record.region}</TableCell>
                  <TableCell>
                    {record.gradesAffected.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {record.gradesAffected.slice(0, 3).map(g => (
                          <Chip
                            key={g}
                            label={g.replace('Grade ', 'G')}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: mode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.06),
                            }}
                          />
                        ))}
                        {record.gradesAffected.length > 3 && (
                          <Chip
                            label={`+${record.gradesAffected.length - 3}`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: mode === 'dark' ? alpha('#fff', 0.1) : alpha('#000', 0.06),
                            }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        None
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ color: getLagColor(record.lagPercent) }}
                      >
                        {record.lagPercent.toFixed(1)}%
                      </Typography>
                      <TrendIndicator trend={record.trend} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(record.lastUpdated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(record.schoolId);
                      }}
                      sx={{
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 1.5,
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Info Footer */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary">
          "On Track" means ≤10% lag from syllabus plan. Lag % shows planned vs covered syllabus difference.
        </Typography>
      </Box>
    </Box>
  );
}
