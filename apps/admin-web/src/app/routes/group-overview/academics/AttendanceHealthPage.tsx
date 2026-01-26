// ============================================================================
// ATTENDANCE HEALTH PAGE - Super Admin Group Level
// ============================================================================
// Route: /group-overview/academics/attendance
// Purpose: Identify schools with sustained low attendance.
// This page turns attendance into an exception list, not a report.
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
  IconButton,
  Tooltip,
  alpha,
  SelectChangeEvent,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  mockAttendanceRecords,
  getAttendanceBuckets,
  getAttendanceInsights,
  filterAttendanceRecords,
  mockSavedViews,
  type AttendanceBucket,
  type AttendanceInsight,
} from '../../../mockDataProviders/mockAcademicsGroupLevel';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'schoolName' | 'region' | 'currentAttendance' | 'weeksBelowThreshold' | 'status';
type SortDirection = 'asc' | 'desc';
type Timeframe = '7days' | '30days' | 'term';

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig = {
  healthy: { color: 'success' as const, label: 'Healthy' },
  watch: { color: 'warning' as const, label: 'Watch' },
  risk: { color: 'error' as const, label: 'Risk' },
};

// ============================================================================
// SPARKLINE COMPONENT
// ============================================================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

function Sparkline({ data, width = 80, height = 24 }: SparklineProps) {
  const { mode } = useThemeMode();
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] - data[0];
  const color = trend >= 0
    ? (mode === 'dark' ? '#66bb6a' : '#2e7d32')
    : (mode === 'dark' ? '#ef5350' : '#d32f2f');

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" display="block">Weekly attendance trend</Typography>
          {data.map((v, i) => (
            <Typography key={i} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
              Week {i + 1}: {v.toFixed(1)}%
            </Typography>
          ))}
        </Box>
      }
    >
      <svg width={width} height={height} style={{ cursor: 'pointer' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </Tooltip>
  );
}

// ============================================================================
// INSIGHT CARD COMPONENT
// ============================================================================

interface InsightCardProps {
  insight: AttendanceInsight;
  onClick: () => void;
}

function InsightCard({ insight, onClick }: InsightCardProps) {
  const { mode } = useThemeMode();

  const typeConfig = {
    positive: { bg: mode === 'dark' ? alpha('#2e7d32', 0.1) : alpha('#2e7d32', 0.05), border: '#2e7d32' },
    warning: { bg: mode === 'dark' ? alpha('#ed6c02', 0.1) : alpha('#ed6c02', 0.05), border: '#ed6c02' },
    critical: { bg: mode === 'dark' ? alpha('#d32f2f', 0.1) : alpha('#d32f2f', 0.05), border: '#d32f2f' },
  };

  const config = typeConfig[insight.type];

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: config.bg,
        border: `1px solid ${alpha(config.border, 0.3)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, color: config.border }}>
          {insight.value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {insight.metric}
        </Typography>
        {insight.schoolName && (
          <Typography variant="caption" color="text.disabled">
            {insight.schoolName}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AttendanceHealthPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state (synced with URL)
  const [region, setRegion] = useState(searchParams.get('region') || 'All');
  const [timeframe, setTimeframe] = useState<Timeframe>((searchParams.get('timeframe') as Timeframe) || '30days');
  const [savedView, setSavedView] = useState(searchParams.get('view') || 'view-all');
  const [selectedBucket, setSelectedBucket] = useState<string | null>(searchParams.get('bucket') || null);
  const [insightFilter, setInsightFilter] = useState<string | null>(searchParams.get('insight') || null);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('currentAttendance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  // Get bucket data for chart
  const buckets = useMemo(() => getAttendanceBuckets(), []);

  // Get insights
  const insights = useMemo(() => getAttendanceInsights(), []);

  // Filter records
  const filteredRecords = useMemo(() => {
    let filters: {
      region?: string;
      status?: string;
      bucket?: string;
      schoolId?: number;
    } = {};

    if (region !== 'All') {
      filters.region = region;
    }

    if (selectedBucket) {
      filters.bucket = selectedBucket;
    }

    if (insightFilter) {
      if (insightFilter === 'above-90') {
        // Filter to schools above 90%
        return mockAttendanceRecords.filter(r =>
          r.currentAttendance >= 90 &&
          (region === 'All' || r.region === region)
        );
      } else if (insightFilter === 'below-85') {
        // Filter to schools below 85%
        return mockAttendanceRecords.filter(r =>
          r.currentAttendance < 85 &&
          (region === 'All' || r.region === region)
        );
      } else if (insightFilter.startsWith('school-')) {
        const schoolId = parseInt(insightFilter.replace('school-', ''), 10);
        filters.schoolId = schoolId;
      }
    }

    return filterAttendanceRecords(mockAttendanceRecords, filters);
  }, [region, selectedBucket, insightFilter]);

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
        case 'currentAttendance':
          comparison = a.currentAttendance - b.currentAttendance;
          break;
        case 'weeksBelowThreshold':
          comparison = a.weeksBelowThreshold - b.weeksBelowThreshold;
          break;
        case 'status':
          const statusOrder = { risk: 0, watch: 1, healthy: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
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

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    const value = event.target.value as Timeframe;
    setTimeframe(value);
    updateFilters({ timeframe: value });
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

  const handleBucketClick = (bucket: AttendanceBucket) => {
    if (selectedBucket === bucket.range) {
      setSelectedBucket(null);
      updateFilters({ bucket: null });
    } else {
      setSelectedBucket(bucket.range);
      setInsightFilter(null);
      updateFilters({ bucket: bucket.range, insight: null });
    }
  };

  const handleInsightClick = (insight: AttendanceInsight) => {
    if (insight.filterAction) {
      if (insightFilter === insight.filterAction) {
        setInsightFilter(null);
        updateFilters({ insight: null });
      } else {
        setInsightFilter(insight.filterAction);
        setSelectedBucket(null);
        updateFilters({ insight: insight.filterAction, bucket: null });
      }
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (schoolId: number) => {
    navigate(`/group-overview/schools/${schoolId}`);
  };

  const handleExport = () => {
    // Mock export - in production would generate CSV/PDF
    console.log('[EXPORT] Exporting attendance data:', sortedRecords.length, 'records');
    alert('Export initiated. In production, this would download a CSV/PDF file.');
  };

  // Chart colors
  const bucketColors = ['#2e7d32', '#66bb6a', '#ffb74d', '#d32f2f'];

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Attendance Health
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Identify schools with sustained low attendance
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

        {/* Timeframe Selector */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select value={timeframe} label="Timeframe" onChange={handleTimeframeChange}>
            <MenuItem value="7days">Last 7 days</MenuItem>
            <MenuItem value="30days">Last 30 days</MenuItem>
            <MenuItem value="term">Term</MenuItem>
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

      {/* Upper Content - Two Column Layout */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        {/* Left: Attendance Distribution Chart */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', md: '1 1 60%' },
            p: 2.5,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Attendance Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Schools grouped by attendance range
              </Typography>
            </Box>
            <Tooltip title="This shows how many schools fall into each attendance range. Click a bar to filter the table below.">
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <InfoIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={buckets}
              layout="horizontal"
              onClick={(data: any) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  handleBucketClick(data.activePayload[0].payload as AttendanceBucket);
                }
              }}
            >
              <XAxis
                dataKey="range"
                tick={{ fontSize: 12 }}
                stroke={mode === 'dark' ? '#666' : '#999'}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke={mode === 'dark' ? '#666' : '#999'}
                allowDecimals={false}
              />
              <ChartTooltip
                contentStyle={{
                  backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fff',
                  border: `1px solid ${mode === 'dark' ? '#333' : '#ddd'}`,
                  borderRadius: 4,
                }}
                formatter={(value: number, _name: string, props: any) => [
                  `${value} schools`,
                  props.payload.range
                ]}
              />
              <Bar
                dataKey="count"
                cursor="pointer"
                radius={[4, 4, 0, 0]}
              >
                {buckets.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={selectedBucket === entry.range ? '#1976d2' : bucketColors[index]}
                    style={{
                      opacity: selectedBucket && selectedBucket !== entry.range ? 0.4 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {selectedBucket && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Filtering by: {selectedBucket}
              </Typography>
              <Button
                size="small"
                onClick={() => { setSelectedBucket(null); updateFilters({ bucket: null }); }}
                sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
              >
                Clear
              </Button>
            </Box>
          )}
        </Paper>

        {/* Right: Summary Insight Cards */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {insights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onClick={() => handleInsightClick(insight)}
            />
          ))}
          {insightFilter && (
            <Button
              size="small"
              onClick={() => { setInsightFilter(null); updateFilters({ insight: null }); }}
              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
            >
              Clear insight filter
            </Button>
          )}
        </Box>
      </Box>

      {/* Lower Content - Schools Table */}
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
                  align="right"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 140,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'currentAttendance'}
                      direction={sortKey === 'currentAttendance' ? sortDirection : 'asc'}
                      onClick={() => handleSort('currentAttendance')}
                    >
                      Attendance %
                    </TableSortLabel>
                    <Tooltip title="Current average attendance percentage">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
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
                    Trend
                    <Tooltip title="Weekly attendance trend over the past 7 weeks. Hover to see exact values.">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 160,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'weeksBelowThreshold'}
                      direction={sortKey === 'weeksBelowThreshold' ? sortDirection : 'asc'}
                      onClick={() => handleSort('weeksBelowThreshold')}
                    >
                      Weeks Below 85%
                    </TableSortLabel>
                    <Tooltip title="Number of weeks attendance was below the 85% threshold">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 120,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'status'}
                      direction={sortKey === 'status' ? sortDirection : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                    <Tooltip title="Healthy: Above 88% with few weeks below threshold. Watch: 85-88% or some weeks below. Risk: Below 85% or many weeks below threshold.">
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
                  onClick={() => handleRowClick(record.schoolId)}
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
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {record.schoolName}
                    </Typography>
                  </TableCell>
                  <TableCell>{record.region}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        color: record.currentAttendance >= 90
                          ? mode === 'dark' ? '#66bb6a' : '#2e7d32'
                          : record.currentAttendance >= 85
                            ? mode === 'dark' ? '#ffb74d' : '#ed6c02'
                            : mode === 'dark' ? '#ef5350' : '#d32f2f',
                      }}
                    >
                      {record.currentAttendance.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Sparkline data={record.weeklyTrend} />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {record.weeksBelowThreshold}
                      </Typography>
                      {record.weeksBelowThreshold > 0 && (
                        record.weeksBelowThreshold >= 4
                          ? <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          : record.weeksBelowThreshold >= 2
                            ? <TrendingFlatIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                            : <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={statusConfig[record.status].label}
                      color={statusConfig[record.status].color}
                      size="small"
                      sx={{ fontWeight: 500, minWidth: 80 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
