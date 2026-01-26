// ============================================================================
// PARENT ENGAGEMENT MONITOR - Super Admin Communication
// ============================================================================
// Route: /group-overview/communication/parent-engagement
// Purpose: Early warning surface for parent engagement.
// Answers: "Are parents actually engaged — and where are they tuning out?"
// Read-only, frontend-only, no mutations.
// ============================================================================

import { useState, useMemo, useCallback, useRef } from 'react';
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
  mockParentEngagementRecords,
  mockEngagementSavedViews,
  getEngagementChartData,
  getEngagementSummary,
  filterEngagementRecords,
  TIMEFRAME_OPTIONS,
  ENGAGEMENT_THRESHOLD,
  type TimeframeOption,
} from '../../../mockDataProviders/mockCommunicationGroupLevel';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'schoolName' | 'region' | 'parentReachPercent' | 'engagementPercent' | 'trend' | 'status';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig = {
  healthy: { color: 'success' as const, label: 'Healthy' },
  watch: { color: 'warning' as const, label: 'Watch' },
  risk: { color: 'error' as const, label: 'Risk' },
};

const trendConfig = {
  improving: { icon: TrendingUpIcon, color: 'success.main', label: 'Improving' },
  stable: { icon: TrendingFlatIcon, color: 'text.secondary', label: 'Stable' },
  declining: { icon: TrendingDownIcon, color: 'error.main', label: 'Declining' },
};

// ============================================================================
// SUMMARY CARD COMPONENT
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  onClick?: () => void;
  isActive?: boolean;
}

function SummaryCard({ title, value, subtitle, onClick, isActive }: SummaryCardProps) {
  const { mode } = useThemeMode();

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        backgroundColor: isActive
          ? (mode === 'dark' ? alpha('#1976d2', 0.15) : alpha('#1976d2', 0.08))
          : (mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff'),
        border: isActive
          ? `2px solid ${mode === 'dark' ? '#1976d2' : '#1976d2'}`
          : `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        } : {},
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 0.5,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 0.5,
            color: mode === 'dark' ? '#fff' : 'text.primary',
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CUSTOM CHART TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      schoolName: string;
      engagement: number;
      status: string;
    };
  }>;
}

function CustomChartTooltip({ active, payload }: CustomTooltipProps) {
  const { mode } = useThemeMode();

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <Paper
      sx={{
        p: 1.5,
        backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fff',
        border: `1px solid ${mode === 'dark' ? '#333' : '#ddd'}`,
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
        {data.schoolName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Engagement: <strong>{data.engagement}%</strong>
      </Typography>
    </Paper>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ParentEngagementPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter state (synced with URL)
  const [region, setRegion] = useState(searchParams.get('region') || 'All');
  const [timeframe, setTimeframe] = useState<TimeframeOption>(
    (searchParams.get('timeframe') as TimeframeOption) || '30days'
  );
  const [savedView, setSavedView] = useState(searchParams.get('view') || 'view-all');
  const [selectedSchool, setSelectedSchool] = useState<number | null>(
    searchParams.get('school') ? parseInt(searchParams.get('school')!, 10) : null
  );
  const [filterBelowThreshold, setFilterBelowThreshold] = useState(
    searchParams.get('belowThreshold') === 'true'
  );

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('engagementPercent');
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

  // Get chart data
  const chartData = useMemo(() => {
    return getEngagementChartData(region !== 'All' ? region : undefined);
  }, [region]);

  // Get summary
  const summary = useMemo(() => {
    return getEngagementSummary(region !== 'All' ? region : undefined);
  }, [region]);

  // Filter records for table (at-risk schools only by default)
  const filteredRecords = useMemo(() => {
    let filters: {
      region?: string;
      status?: string;
      schoolId?: number;
    } = {};

    if (region !== 'All') {
      filters.region = region;
    }

    if (selectedSchool) {
      filters.schoolId = selectedSchool;
    }

    let records = filterEngagementRecords(mockParentEngagementRecords, filters);

    // Apply below threshold filter
    if (filterBelowThreshold) {
      records = records.filter(r => r.engagementPercent < ENGAGEMENT_THRESHOLD);
    }

    return records;
  }, [region, selectedSchool, filterBelowThreshold]);

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
        case 'parentReachPercent':
          comparison = a.parentReachPercent - b.parentReachPercent;
          break;
        case 'engagementPercent':
          comparison = a.engagementPercent - b.engagementPercent;
          break;
        case 'trend':
          const trendOrder = { declining: 0, stable: 1, improving: 2 };
          comparison = trendOrder[a.trend] - trendOrder[b.trend];
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
    setSelectedSchool(null);
    updateFilters({ region: value === 'All' ? null : value, school: null });
  };

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    const value = event.target.value as TimeframeOption;
    setTimeframe(value);
    updateFilters({ timeframe: value });
  };

  const handleSavedViewChange = (event: SelectChangeEvent) => {
    const viewId = event.target.value;
    setSavedView(viewId);
    const view = mockEngagementSavedViews.find(v => v.id === viewId);
    if (view) {
      setRegion(view.filters.region || 'All');
      if (viewId === 'view-below-70') {
        setFilterBelowThreshold(true);
      } else {
        setFilterBelowThreshold(false);
      }
      updateFilters({
        view: viewId,
        region: view.filters.region || null,
        belowThreshold: viewId === 'view-below-70' ? 'true' : null,
      });
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

  const handleChartBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const schoolId = data.activePayload[0].payload.schoolId;
      if (selectedSchool === schoolId) {
        setSelectedSchool(null);
        updateFilters({ school: null });
      } else {
        setSelectedSchool(schoolId);
        updateFilters({ school: String(schoolId) });
      }
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSummaryCardClick = (type: 'belowThreshold') => {
    if (type === 'belowThreshold') {
      const newValue = !filterBelowThreshold;
      setFilterBelowThreshold(newValue);
      setSelectedSchool(null);
      updateFilters({
        belowThreshold: newValue ? 'true' : null,
        school: null,
      });
    }
  };

  const handleRowClick = (schoolId: number) => {
    navigate(`/group-overview/schools/${schoolId}`);
  };

  const handleExport = () => {
    const exportParams = new URLSearchParams();
    if (region !== 'All') exportParams.set('region', region);
    if (timeframe !== '30days') exportParams.set('timeframe', timeframe);
    console.log('[EXPORT] Parent engagement data:', {
      route: `/communication/parent-engagement/export?${exportParams.toString()}`,
      recordCount: sortedRecords.length,
    });
  };

  // Chart colors
  const getBarColor = (status: string) => {
    if (status === 'risk') return mode === 'dark' ? '#ef5350' : '#d32f2f';
    if (status === 'watch') return mode === 'dark' ? '#ffb74d' : '#f57c00';
    return mode === 'dark' ? '#66bb6a' : '#43a047';
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Parent Engagement Monitor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Identify schools where parent engagement needs attention
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
            {TIMEFRAME_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Saved Views */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Saved View</InputLabel>
          <Select value={savedView} label="Saved View" onChange={handleSavedViewChange}>
            {mockEngagementSavedViews.map(view => (
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
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* Left: Engagement Comparison Chart */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', lg: '1 1 65%' },
            p: 2.5,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Engagement by School
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click a bar to filter the table below
              </Typography>
            </Box>
            <Tooltip title="Engagement reflects whether parents open, read, or respond to school communications.">
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <InfoIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              layout="horizontal"
              onClick={handleChartBarClick}
              margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            >
              <XAxis
                dataKey="schoolName"
                tick={{ fontSize: 10, fill: mode === 'dark' ? '#aaa' : '#666' }}
                stroke={mode === 'dark' ? '#666' : '#ccc'}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: mode === 'dark' ? '#aaa' : '#666' }}
                stroke={mode === 'dark' ? '#666' : '#ccc'}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip content={<CustomChartTooltip />} />
              <Bar
                dataKey="engagement"
                cursor="pointer"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={selectedSchool === entry.schoolId ? '#1976d2' : getBarColor(entry.status)}
                    style={{
                      opacity: selectedSchool && selectedSchool !== entry.schoolId ? 0.4 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {selectedSchool && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Filtering by selected school
              </Typography>
              <Button
                size="small"
                onClick={() => { setSelectedSchool(null); updateFilters({ school: null }); }}
                sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
              >
                Clear
              </Button>
            </Box>
          )}
        </Paper>

        {/* Right: Summary Indicators */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 35%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SummaryCard
            title="Average Engagement"
            value={`${summary.averageEngagement}%`}
            subtitle={`Across ${summary.totalSchools} schools`}
          />
          <SummaryCard
            title={`Schools Below ${ENGAGEMENT_THRESHOLD}%`}
            value={summary.schoolsBelowThreshold}
            subtitle={`Need attention`}
            onClick={() => handleSummaryCardClick('belowThreshold')}
            isActive={filterBelowThreshold}
          />
        </Box>
      </Box>

      {/* Lower Content - At-Risk Schools Table */}
      <Paper
        ref={tableRef}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {filterBelowThreshold ? 'At-Risk Schools' : 'All Schools'} ({sortedRecords.length})
          </Typography>
          {filterBelowThreshold && (
            <Typography variant="caption" color="text.secondary">
              Schools with engagement below {ENGAGEMENT_THRESHOLD}%
            </Typography>
          )}
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
                    width: 130,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'parentReachPercent'}
                      direction={sortKey === 'parentReachPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('parentReachPercent')}
                    >
                      Parent Reach
                    </TableSortLabel>
                    <Tooltip title="Percentage of parents receiving communications">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 130,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'engagementPercent'}
                      direction={sortKey === 'engagementPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('engagementPercent')}
                    >
                      Engagement
                    </TableSortLabel>
                    <Tooltip title="Percentage of parents who open, read, or respond">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 110,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'trend'}
                      direction={sortKey === 'trend' ? sortDirection : 'asc'}
                      onClick={() => handleSort('trend')}
                    >
                      Trend
                    </TableSortLabel>
                    <Tooltip title="Engagement trend over the selected period">
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
                    <TableSortLabel
                      active={sortKey === 'status'}
                      direction={sortKey === 'status' ? sortDirection : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                    <Tooltip title="Healthy: Above 70% engagement. Watch: 60-70%. Risk: Below 60%.">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRecords.map((record) => {
                const TrendIcon = trendConfig[record.trend].icon;
                return (
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
                      <Typography variant="body2">
                        {record.parentReachPercent}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          color: record.engagementPercent >= ENGAGEMENT_THRESHOLD
                            ? (mode === 'dark' ? '#66bb6a' : '#2e7d32')
                            : record.engagementPercent >= 60
                              ? (mode === 'dark' ? '#ffb74d' : '#f57c00')
                              : (mode === 'dark' ? '#ef5350' : '#d32f2f'),
                        }}
                      >
                        {record.engagementPercent}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={trendConfig[record.trend].label}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <TrendIcon
                            sx={{
                              fontSize: 20,
                              color: trendConfig[record.trend].color,
                            }}
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusConfig[record.status].label}
                        size="small"
                        color={statusConfig[record.status].color}
                        sx={{
                          fontWeight: 500,
                          minWidth: 70,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No schools match the current filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
