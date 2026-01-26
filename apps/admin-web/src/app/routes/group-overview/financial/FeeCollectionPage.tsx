// ============================================================================
// FEE COLLECTION PAGE - Super Admin Financial Health
// ============================================================================
// Route: /group-overview/financial/fee-collection
// Purpose: Track cash flow health and identify revenue stress early.
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
  IconButton,
  Tooltip,
  alpha,
  SelectChangeEvent,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  getFeeCollectionTrend,
  getSchoolFeeCollections,
  getFeeCollectionSummary,
  mockFinancialSavedViews,
  formatCurrency,
  formatCurrencyFull,
  type TimeframeOption,
  TIMEFRAME_OPTIONS,
} from '../../../mockDataProviders/mockFinancialHealth';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'schoolName' | 'region' | 'expectedFees' | 'collectedFees' | 'collectionPercent' | 'status';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig = {
  healthy: { color: 'success' as const, label: 'Healthy' },
  watch: { color: 'warning' as const, label: 'Watch' },
  risk: { color: 'error' as const, label: 'Risk' },
};

// ============================================================================
// CUSTOM CHART TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  const { mode } = useThemeMode();

  if (!active || !payload || !payload.length) return null;

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
        {label}
      </Typography>
      {payload.map((entry, index) => (
        <Typography
          key={index}
          variant="body2"
          sx={{ color: entry.color, display: 'flex', gap: 1 }}
        >
          <span>{entry.dataKey === 'expected' ? 'Expected:' : 'Collected:'}</span>
          <span style={{ fontWeight: 600 }}>{formatCurrencyFull(entry.value)}</span>
        </Typography>
      ))}
      {payload.length === 2 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Gap: {formatCurrencyFull(payload[0].value - payload[1].value)}
        </Typography>
      )}
    </Paper>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FeeCollectionPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter state (synced with URL)
  const [region, setRegion] = useState(searchParams.get('region') || 'All');
  const [timeframe, setTimeframe] = useState<TimeframeOption>(
    (searchParams.get('timeframe') as TimeframeOption) || '6months'
  );
  const [savedView, setSavedView] = useState(searchParams.get('view') || 'view-all');

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('collectionPercent');
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

  // Get trend data for chart
  const trendData = useMemo(() => {
    return getFeeCollectionTrend(region !== 'All' ? region : undefined);
  }, [region]);

  // Get school-wise collections
  const schoolCollections = useMemo(() => {
    return getSchoolFeeCollections(region !== 'All' ? region : undefined);
  }, [region]);

  // Get summary
  const summary = useMemo(() => {
    return getFeeCollectionSummary(schoolCollections);
  }, [schoolCollections]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...schoolCollections].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'schoolName':
          comparison = a.schoolName.localeCompare(b.schoolName);
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
        case 'expectedFees':
          comparison = a.expectedFees - b.expectedFees;
          break;
        case 'collectedFees':
          comparison = a.collectedFees - b.collectedFees;
          break;
        case 'collectionPercent':
          comparison = a.collectionPercent - b.collectionPercent;
          break;
        case 'status':
          const statusOrder = { risk: 0, watch: 1, healthy: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [schoolCollections, sortKey, sortDirection]);

  // Handlers
  const handleRegionChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setRegion(value);
    updateFilters({ region: value === 'All' ? null : value });
  };

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    const value = event.target.value as TimeframeOption;
    setTimeframe(value);
    updateFilters({ timeframe: value });
  };

  const handleSavedViewChange = (event: SelectChangeEvent) => {
    const viewId = event.target.value;
    setSavedView(viewId);
    const view = mockFinancialSavedViews.find(v => v.id === viewId);
    if (view) {
      setRegion(view.filters.region || 'All');
      updateFilters({
        view: viewId,
        region: view.filters.region || null,
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

  const handleRowClick = (schoolId: number) => {
    navigate(`/group-overview/schools/${schoolId}`);
  };

  const handleChartClick = () => {
    // Scroll to table
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExport = () => {
    console.log('[EXPORT] Exporting fee collection data:', sortedRecords.length, 'records');
  };

  // Chart colors
  const expectedColor = mode === 'dark' ? '#90caf9' : '#1976d2';
  const collectedColor = mode === 'dark' ? '#66bb6a' : '#2e7d32';

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Fee Collection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track cash flow health and identify revenue stress early
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
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select value={timeframe} label="Timeframe" onChange={handleTimeframeChange}>
            {TIMEFRAME_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Saved Views */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Saved View</InputLabel>
          <Select value={savedView} label="Saved View" onChange={handleSavedViewChange}>
            {mockFinancialSavedViews.map(view => (
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
          disabled
          sx={{ textTransform: 'none' }}
        >
          Export
        </Button>
      </Paper>

      {/* Upper Content - Two Column Layout */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* Left: Month-over-Month Fee Collection Trend (Dominant) */}
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
          onClick={handleChartClick}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Month-over-Month Fee Collection Trend
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expected vs Collected fees over time
              </Typography>
            </Box>
            <Tooltip title="Gaps indicate delayed or missed collections. Focus on sustained shortfalls.">
              <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={e => e.stopPropagation()}>
                <InfoIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: mode === 'dark' ? '#aaa' : '#666' }}
                stroke={mode === 'dark' ? '#666' : '#ccc'}
              />
              <YAxis
                tick={{ fontSize: 12, fill: mode === 'dark' ? '#aaa' : '#666' }}
                stroke={mode === 'dark' ? '#666' : '#ccc'}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <ChartTooltip content={<CustomChartTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => (
                  <span style={{ color: mode === 'dark' ? '#fff' : '#333', fontSize: 12 }}>
                    {value === 'expected' ? 'Expected Fees' : 'Collected Fees'}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="expected"
                stroke={expectedColor}
                strokeWidth={2}
                dot={{ r: 4, fill: expectedColor }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="collected"
                stroke={collectedColor}
                strokeWidth={2}
                dot={{ r: 4, fill: collectedColor }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            Click anywhere to scroll to school details
          </Typography>
        </Paper>

        {/* Right: Collected vs Expected Comparison */}
        <Paper
          sx={{
            flex: { xs: '1 1 100%', lg: '1 1 35%' },
            p: 2.5,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Collection Summary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current period overview
              </Typography>
            </Box>
          </Box>

          {/* Summary Stats */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Expected</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrencyFull(summary.totalExpected)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Collected</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: collectedColor }}>
                {formatCurrencyFull(summary.totalCollected)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Shortfall</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: mode === 'dark' ? '#ef5350' : '#d32f2f' }}>
                {formatCurrencyFull(summary.totalExpected - summary.totalCollected)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 1.5,
                borderTop: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">Collection Rate</Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: summary.overallPercent >= 90
                    ? collectedColor
                    : summary.overallPercent >= 75
                      ? (mode === 'dark' ? '#ffb74d' : '#ed6c02')
                      : (mode === 'dark' ? '#ef5350' : '#d32f2f'),
                }}
              >
                {summary.overallPercent}%
              </Typography>
            </Box>
          </Box>

          {/* Status Distribution Bar */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              School Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', borderRadius: 1, overflow: 'hidden', height: 8 }}>
              <Box
                sx={{
                  flex: summary.healthyCount,
                  backgroundColor: mode === 'dark' ? '#66bb6a' : '#2e7d32',
                }}
              />
              <Box
                sx={{
                  flex: summary.watchCount,
                  backgroundColor: mode === 'dark' ? '#ffb74d' : '#ed6c02',
                }}
              />
              <Box
                sx={{
                  flex: summary.riskCount,
                  backgroundColor: mode === 'dark' ? '#ef5350' : '#d32f2f',
                }}
              />
            </Box>
          </Box>

          {/* Status Legend */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: mode === 'dark' ? '#66bb6a' : '#2e7d32' }} />
              <Typography variant="caption">Healthy ({summary.healthyCount})</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: mode === 'dark' ? '#ffb74d' : '#ed6c02' }} />
              <Typography variant="caption">Watch ({summary.watchCount})</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: mode === 'dark' ? '#ef5350' : '#d32f2f' }} />
              <Typography variant="caption">Risk ({summary.riskCount})</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Lower Content - Schools Table */}
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
            School-wise Collection ({sortedRecords.length})
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
                  <TableSortLabel
                    active={sortKey === 'expectedFees'}
                    direction={sortKey === 'expectedFees' ? sortDirection : 'asc'}
                    onClick={() => handleSort('expectedFees')}
                  >
                    Expected Fees
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
                  <TableSortLabel
                    active={sortKey === 'collectedFees'}
                    direction={sortKey === 'collectedFees' ? sortDirection : 'asc'}
                    onClick={() => handleSort('collectedFees')}
                  >
                    Collected Fees
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
                      active={sortKey === 'collectionPercent'}
                      direction={sortKey === 'collectionPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('collectionPercent')}
                    >
                      Collection %
                    </TableSortLabel>
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
                  <TableSortLabel
                    active={sortKey === 'status'}
                    direction={sortKey === 'status' ? sortDirection : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
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
                    <Typography variant="body2">
                      {formatCurrency(record.expectedFees)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(record.collectedFees)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: record.collectionPercent >= 90
                          ? mode === 'dark' ? '#66bb6a' : '#2e7d32'
                          : record.collectionPercent >= 75
                            ? mode === 'dark' ? '#ffb74d' : '#ed6c02'
                            : mode === 'dark' ? '#ef5350' : '#d32f2f',
                      }}
                    >
                      {record.collectionPercent}%
                    </Typography>
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
