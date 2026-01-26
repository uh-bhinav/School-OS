// ============================================================================
// CAPACITY FORECAST PAGE - Super Admin Financial Health
// ============================================================================
// Route: /group-overview/financial/capacity-forecast
// Purpose: Prevent future revenue loss from unfilled seats.
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
  Tooltip,
  alpha,
  SelectChangeEvent,
  Alert,
  AlertTitle,
  LinearProgress,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  getGroupCapacity,
  getCapacityForecast,
  getSchoolCapacityRisks,
  mockFinancialSavedViews,
} from '../../../mockDataProviders/mockFinancialHealth';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'schoolName' | 'region' | 'totalCapacity' | 'currentEnrollment' | 'projectedEnrollment' | 'emptySeatsPercent' | 'riskLevel';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// RISK LEVEL CONFIG
// ============================================================================

const riskLevelConfig = {
  low: { color: 'success' as const, label: 'Low' },
  medium: { color: 'warning' as const, label: 'Medium' },
  high: { color: 'error' as const, label: 'High' },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CapacityForecastPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state (synced with URL)
  const [region, setRegion] = useState(searchParams.get('region') || 'All');
  const [savedView, setSavedView] = useState(searchParams.get('view') || 'view-all');
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(searchParams.get('highRisk') === 'true');

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('emptySeatsPercent');
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

  // Get group capacity
  const groupCapacity = useMemo(() => {
    return getGroupCapacity(region !== 'All' ? region : undefined);
  }, [region]);

  // Get forecast
  const forecast = useMemo(() => {
    return getCapacityForecast(region !== 'All' ? region : undefined);
  }, [region]);

  // Get school capacity risks
  const schoolRisks = useMemo(() => {
    const risks = getSchoolCapacityRisks(region !== 'All' ? region : undefined);
    if (showHighRiskOnly) {
      return risks.filter(r => r.riskLevel === 'high');
    }
    return risks;
  }, [region, showHighRiskOnly]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...schoolRisks].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'schoolName':
          comparison = a.schoolName.localeCompare(b.schoolName);
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
        case 'totalCapacity':
          comparison = a.totalCapacity - b.totalCapacity;
          break;
        case 'currentEnrollment':
          comparison = a.currentEnrollment - b.currentEnrollment;
          break;
        case 'projectedEnrollment':
          comparison = a.projectedEnrollment - b.projectedEnrollment;
          break;
        case 'emptySeatsPercent':
          comparison = a.emptySeatsPercent - b.emptySeatsPercent;
          break;
        case 'riskLevel':
          const riskOrder = { low: 0, medium: 1, high: 2 };
          comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [schoolRisks, sortKey, sortDirection]);

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

  const handleAlertClick = () => {
    setShowHighRiskOnly(true);
    updateFilters({ highRisk: 'true' });
  };

  const handleClearHighRiskFilter = () => {
    setShowHighRiskOnly(false);
    updateFilters({ highRisk: null });
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
    console.log('[EXPORT] Exporting capacity forecast data:', sortedRecords.length, 'records');
  };

  // Utilization color
  const getUtilizationColor = (percent: number) => {
    if (percent >= 90) return mode === 'dark' ? '#66bb6a' : '#2e7d32';
    if (percent >= 75) return mode === 'dark' ? '#ffb74d' : '#ed6c02';
    return mode === 'dark' ? '#ef5350' : '#d32f2f';
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Capacity Forecast
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prevent future revenue loss from unfilled seats
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

      {/* Group Capacity Snapshot */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Group Capacity Snapshot
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Current seat utilization across {region === 'All' ? 'all schools' : `${region} region`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Capacity Progress */}
          <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Seats Filled
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {groupCapacity.filledSeats.toLocaleString()} / {groupCapacity.totalSeats.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={groupCapacity.utilizationPercent}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  backgroundColor: getUtilizationColor(groupCapacity.utilizationPercent),
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                0%
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ color: getUtilizationColor(groupCapacity.utilizationPercent) }}
              >
                {groupCapacity.utilizationPercent}% Utilized
              </Typography>
              <Typography variant="caption" color="text.secondary">
                100%
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: mode === 'dark' ? '#66bb6a' : '#2e7d32' }}>
                {groupCapacity.filledSeats.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Filled Seats
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700}>
                {groupCapacity.totalSeats.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Capacity
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: mode === 'dark' ? '#ffb74d' : '#ed6c02' }}
              >
                {(groupCapacity.totalSeats - groupCapacity.filledSeats).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available Seats
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Forecast Indicators */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Paper
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Expected Admissions (Next Year)
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: mode === 'dark' ? '#66bb6a' : '#2e7d32' }}>
            +{forecast.expectedAdmissions.toLocaleString()}
          </Typography>
          <Tooltip title="Based on historical admission trends and current inquiries">
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">
                Projected
              </Typography>
            </Box>
          </Tooltip>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Projected Empty Seats
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: forecast.projectedEmptySeats > 500 ? (mode === 'dark' ? '#ef5350' : '#d32f2f') : 'inherit' }}
          >
            {forecast.projectedEmptySeats.toLocaleString()}
          </Typography>
          <Tooltip title="After accounting for expected admissions and graduations">
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">
                End of next year
              </Typography>
            </Box>
          </Tooltip>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Schools at Risk
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: forecast.alertSchoolCount > 0 ? (mode === 'dark' ? '#ef5350' : '#d32f2f') : (mode === 'dark' ? '#66bb6a' : '#2e7d32') }}
          >
            {forecast.alertSchoolCount}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {forecast.alertThreshold}%+ projected empty seats
          </Typography>
        </Paper>
      </Box>

      {/* Alert Banner */}
      {forecast.alertSchoolCount > 0 && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          onClick={handleAlertClick}
          sx={{
            mb: 3,
            cursor: 'pointer',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: mode === 'dark' ? alpha('#ed6c02', 0.2) : alpha('#ed6c02', 0.15),
            },
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Capacity Alert</AlertTitle>
          {forecast.alertSchoolCount} school{forecast.alertSchoolCount > 1 ? 's' : ''} projected to have {forecast.alertThreshold}%+ empty seats next year. Click to view.
        </Alert>
      )}

      {/* Filter indicator */}
      {showHighRiskOnly && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Showing high-risk schools only
          </Typography>
          <Button
            size="small"
            onClick={handleClearHighRiskFilter}
            sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
          >
            Show all
          </Button>
        </Box>
      )}

      {/* School-wise Capacity Risk Table */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Typography variant="subtitle1" fontWeight={600}>
            School-wise Capacity Risk ({sortedRecords.length})
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
                    width: 120,
                  }}
                >
                  <TableSortLabel
                    active={sortKey === 'totalCapacity'}
                    direction={sortKey === 'totalCapacity' ? sortDirection : 'asc'}
                    onClick={() => handleSort('totalCapacity')}
                  >
                    Total Capacity
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
                    active={sortKey === 'currentEnrollment'}
                    direction={sortKey === 'currentEnrollment' ? sortDirection : 'asc'}
                    onClick={() => handleSort('currentEnrollment')}
                  >
                    Current Enrollment
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'projectedEnrollment'}
                      direction={sortKey === 'projectedEnrollment' ? sortDirection : 'asc'}
                      onClick={() => handleSort('projectedEnrollment')}
                    >
                      Projected Enrollment
                    </TableSortLabel>
                    <Tooltip title="Projected enrollment at the end of next academic year based on historical trends">
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
                      active={sortKey === 'emptySeatsPercent'}
                      direction={sortKey === 'emptySeatsPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('emptySeatsPercent')}
                    >
                      Empty Seats %
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
                    active={sortKey === 'riskLevel'}
                    direction={sortKey === 'riskLevel' ? sortDirection : 'asc'}
                    onClick={() => handleSort('riskLevel')}
                  >
                    Risk Level
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
                      {record.totalCapacity.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {record.currentEnrollment.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {record.projectedEnrollment.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        color: record.emptySeatsPercent >= 25
                          ? mode === 'dark' ? '#ef5350' : '#d32f2f'
                          : record.emptySeatsPercent >= 15
                            ? mode === 'dark' ? '#ffb74d' : '#ed6c02'
                            : 'inherit',
                      }}
                    >
                      {record.emptySeatsPercent}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={riskLevelConfig[record.riskLevel].label}
                      color={riskLevelConfig[record.riskLevel].color}
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
