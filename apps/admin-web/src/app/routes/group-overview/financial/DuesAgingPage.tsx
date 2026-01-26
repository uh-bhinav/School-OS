// ============================================================================
// DUES & AGING PAGE - Super Admin Financial Health
// ============================================================================
// Route: /group-overview/financial/dues-aging
// Purpose: Understand which dues are recoverable vs dangerous.
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
  getTotalPendingDues,
  getAgingBuckets,
  getSchoolDuesRecords,
  mockFinancialSavedViews,
  formatCurrency,
  formatCurrencyFull,
  type AgingBucket,
} from '../../../mockDataProviders/mockFinancialHealth';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'schoolName' | 'region' | 'totalPending' | 'oldestDueDays' | 'percent90Plus' | 'riskStatus';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// RISK STATUS CONFIG
// ============================================================================

const riskStatusConfig = {
  low: { color: 'success' as const, label: 'Low' },
  medium: { color: 'info' as const, label: 'Medium' },
  high: { color: 'warning' as const, label: 'High' },
  critical: { color: 'error' as const, label: 'Critical' },
};

// ============================================================================
// CUSTOM CHART TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: AgingBucket;
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
        {data.range}
      </Typography>
      <Typography variant="body2">
        Amount: <strong>{formatCurrencyFull(data.amount)}</strong>
      </Typography>
      <Typography variant="body2">
        Percentage: <strong>{data.percent}%</strong> of total
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.schoolCount} schools affected
      </Typography>
    </Paper>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DuesAgingPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state (synced with URL)
  const [region, setRegion] = useState(searchParams.get('region') || 'All');
  const [savedView, setSavedView] = useState(searchParams.get('view') || 'view-all');
  const [selectedBucket, setSelectedBucket] = useState<string | null>(searchParams.get('bucket') || null);

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('totalPending');
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

  // Get total pending dues
  const totalPendingDues = useMemo(() => {
    return getTotalPendingDues(region !== 'All' ? region : undefined);
  }, [region]);

  // Get aging buckets
  const agingBuckets = useMemo(() => {
    return getAgingBuckets(region !== 'All' ? region : undefined);
  }, [region]);

  // Get school dues records
  const schoolRecords = useMemo(() => {
    return getSchoolDuesRecords(
      region !== 'All' ? region : undefined,
      selectedBucket || undefined
    );
  }, [region, selectedBucket]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...schoolRecords].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'schoolName':
          comparison = a.schoolName.localeCompare(b.schoolName);
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
        case 'totalPending':
          comparison = a.totalPending - b.totalPending;
          break;
        case 'oldestDueDays':
          comparison = a.oldestDueDays - b.oldestDueDays;
          break;
        case 'percent90Plus':
          comparison = a.percent90Plus - b.percent90Plus;
          break;
        case 'riskStatus':
          const statusOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          comparison = statusOrder[a.riskStatus] - statusOrder[b.riskStatus];
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [schoolRecords, sortKey, sortDirection]);

  // Handlers
  const handleRegionChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setRegion(value);
    updateFilters({ region: value === 'All' ? null : value });
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

  const handleBucketClick = (bucket: AgingBucket) => {
    if (selectedBucket === bucket.range) {
      setSelectedBucket(null);
      updateFilters({ bucket: null });
    } else {
      setSelectedBucket(bucket.range);
      updateFilters({ bucket: bucket.range });
    }
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
    console.log('[EXPORT] Exporting dues aging data:', sortedRecords.length, 'records');
  };

  // Bucket colors (from safe to dangerous)
  const bucketColors = [
    mode === 'dark' ? '#66bb6a' : '#2e7d32',
    mode === 'dark' ? '#ffee58' : '#fbc02d',
    mode === 'dark' ? '#ffb74d' : '#ed6c02',
    mode === 'dark' ? '#ef5350' : '#d32f2f',
  ];

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Dues and Aging
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Understand which dues are recoverable vs dangerous
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

      {/* Top Summary */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #1e3a5f 0%, #1a1a2e 100%)'
            : 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)',
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
          Total Pending Dues
        </Typography>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
          {formatCurrencyFull(totalPendingDues)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Across {region === 'All' ? 'all schools' : `${region} region`}
        </Typography>
      </Paper>

      {/* Aging Buckets Visualization */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Aging Buckets
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click a bucket to filter the table below
            </Typography>
          </Box>
          <Tooltip title="Older dues are harder to recover. Prioritize 61+ days.">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <InfoIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={agingBuckets}
            layout="horizontal"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: mode === 'dark' ? '#aaa' : '#666' }}
              stroke={mode === 'dark' ? '#666' : '#ccc'}
            />
            <YAxis
              tick={{ fontSize: 12, fill: mode === 'dark' ? '#aaa' : '#666' }}
              stroke={mode === 'dark' ? '#666' : '#ccc'}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip content={<CustomChartTooltip />} />
            <Bar
              dataKey="amount"
              cursor="pointer"
              radius={[4, 4, 0, 0]}
              onClick={(data) => handleBucketClick(data as unknown as AgingBucket)}
            >
              {agingBuckets.map((entry, index) => (
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

        {/* Bucket Summary Cards */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          {agingBuckets.map((bucket, index) => (
            <Box
              key={bucket.range}
              onClick={() => handleBucketClick(bucket)}
              sx={{
                flex: '1 1 calc(25% - 12px)',
                minWidth: 140,
                p: 1.5,
                borderRadius: 1,
                cursor: 'pointer',
                border: `2px solid ${selectedBucket === bucket.range ? '#1976d2' : 'transparent'}`,
                backgroundColor: mode === 'dark'
                  ? alpha(bucketColors[index], 0.15)
                  : alpha(bucketColors[index], 0.1),
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: mode === 'dark'
                    ? alpha(bucketColors[index], 0.25)
                    : alpha(bucketColors[index], 0.2),
                },
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {bucket.range}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatCurrency(bucket.amount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bucket.percent}% of total
              </Typography>
            </Box>
          ))}
        </Box>

        {selectedBucket && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
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

      {/* High-Risk Schools Table */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Typography variant="subtitle1" fontWeight={600}>
            High-Risk Schools ({sortedRecords.length})
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
                    width: 150,
                  }}
                >
                  <TableSortLabel
                    active={sortKey === 'totalPending'}
                    direction={sortKey === 'totalPending' ? sortDirection : 'asc'}
                    onClick={() => handleSort('totalPending')}
                  >
                    Total Pending
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
                      active={sortKey === 'oldestDueDays'}
                      direction={sortKey === 'oldestDueDays' ? sortDirection : 'asc'}
                      onClick={() => handleSort('oldestDueDays')}
                    >
                      Oldest Due
                    </TableSortLabel>
                    <Tooltip title="Number of days since the oldest unpaid invoice">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
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
                      active={sortKey === 'percent90Plus'}
                      direction={sortKey === 'percent90Plus' ? sortDirection : 'asc'}
                      onClick={() => handleSort('percent90Plus')}
                    >
                      % in 90+
                    </TableSortLabel>
                    <Tooltip title="Percentage of pending dues that are over 90 days old">
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
                  <TableSortLabel
                    active={sortKey === 'riskStatus'}
                    direction={sortKey === 'riskStatus' ? sortDirection : 'asc'}
                    onClick={() => handleSort('riskStatus')}
                  >
                    Risk Status
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
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(record.totalPending)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        color: record.oldestDueDays > 90
                          ? mode === 'dark' ? '#ef5350' : '#d32f2f'
                          : record.oldestDueDays > 60
                            ? mode === 'dark' ? '#ffb74d' : '#ed6c02'
                            : record.oldestDueDays > 30
                              ? mode === 'dark' ? '#ffee58' : '#fbc02d'
                              : 'inherit',
                      }}
                    >
                      {record.oldestDueDays} days
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        color: record.percent90Plus > 25
                          ? mode === 'dark' ? '#ef5350' : '#d32f2f'
                          : record.percent90Plus > 15
                            ? mode === 'dark' ? '#ffb74d' : '#ed6c02'
                            : 'inherit',
                      }}
                    >
                      {record.percent90Plus}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={riskStatusConfig[record.riskStatus].label}
                      color={riskStatusConfig[record.riskStatus].color}
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
