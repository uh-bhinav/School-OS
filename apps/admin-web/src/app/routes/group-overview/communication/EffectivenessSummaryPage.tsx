// ============================================================================
// COMMUNICATION EFFECTIVENESS SUMMARY - Super Admin Communication
// ============================================================================
// Route: /group-overview/communication/effectiveness
// Purpose: Discover which communication methods work best.
// Answers: "Which communication methods actually work — and which schools do it best?"
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
  Card,
  CardContent,
  Tooltip,
  alpha,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Info as InfoIcon,
  LightbulbOutlined as InsightIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  mockSchoolEffectivenessRecords,
  getChannelPerformanceOverview,
  filterEffectivenessRecords,
  mockBestPracticeInsights,
  TIMEFRAME_OPTIONS,
  type TimeframeOption,
} from '../../../mockDataProviders/mockCommunicationGroupLevel';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'schoolName' | 'region' | 'circularDeliveryPercent' | 'smsOpenPercent' | 'emailOpenPercent' | 'responseRatePercent' | 'overallEffectivenessScore';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// CHANNEL METRIC CARD COMPONENT
// ============================================================================

interface ChannelMetricCardProps {
  title: string;
  value: number;
  description: string;
}

function ChannelMetricCard({ title, value, description }: ChannelMetricCardProps) {
  const { mode } = useThemeMode();

  // Color based on value thresholds
  const getColor = () => {
    if (value >= 80) return mode === 'dark' ? '#66bb6a' : '#2e7d32';
    if (value >= 60) return mode === 'dark' ? '#ffb74d' : '#f57c00';
    return mode === 'dark' ? '#ef5350' : '#d32f2f';
  };

  return (
    <Card
      sx={{
        flex: '1 1 200px',
        backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, textAlign: 'center' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
          {/* Circular progress representation */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `conic-gradient(${getColor()} ${value * 3.6}deg, ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: mode === 'dark' ? '#1a1a2e' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ color: getColor() }}>
                {value}%
              </Typography>
            </Box>
          </Box>
        </Box>
        <Tooltip title={description}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              cursor: 'help',
            }}
          >
            {description}
            <InfoIcon sx={{ fontSize: 12 }} />
          </Typography>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EffectivenessSummaryPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state (synced with URL)
  const [region, setRegion] = useState(searchParams.get('region') || 'All');
  const [timeframe, setTimeframe] = useState<TimeframeOption>(
    (searchParams.get('timeframe') as TimeframeOption) || '30days'
  );

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('overallEffectivenessScore');
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

  // Get channel performance overview
  const channelMetrics = useMemo(() => {
    return getChannelPerformanceOverview();
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    return filterEffectivenessRecords(
      mockSchoolEffectivenessRecords,
      region !== 'All' ? region : undefined
    );
  }, [region]);

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
        case 'circularDeliveryPercent':
          comparison = a.circularDeliveryPercent - b.circularDeliveryPercent;
          break;
        case 'smsOpenPercent':
          comparison = a.smsOpenPercent - b.smsOpenPercent;
          break;
        case 'emailOpenPercent':
          comparison = a.emailOpenPercent - b.emailOpenPercent;
          break;
        case 'responseRatePercent':
          comparison = a.responseRatePercent - b.responseRatePercent;
          break;
        case 'overallEffectivenessScore':
          comparison = a.overallEffectivenessScore - b.overallEffectivenessScore;
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
    const value = event.target.value as TimeframeOption;
    setTimeframe(value);
    updateFilters({ timeframe: value });
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
    console.log('[EXPORT] Communication effectiveness data:', sortedRecords.length, 'records');
  };

  // Color helper for metric values
  const getMetricColor = (value: number, thresholds: { good: number; warn: number }) => {
    if (value >= thresholds.good) return mode === 'dark' ? '#66bb6a' : '#2e7d32';
    if (value >= thresholds.warn) return mode === 'dark' ? '#ffb74d' : '#f57c00';
    return mode === 'dark' ? '#ef5350' : '#d32f2f';
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Communication Effectiveness
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Discover which communication methods work best across schools
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

      {/* Channel Performance Overview */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Channel Performance Overview
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <ChannelMetricCard
            title="Circular Delivery"
            value={channelMetrics.circularDeliveryRate}
            description="Percentage of circulars successfully delivered"
          />
          <ChannelMetricCard
            title="SMS Open Rate"
            value={channelMetrics.smsOpenRate}
            description="Percentage of SMS messages opened by parents"
          />
          <ChannelMetricCard
            title="Email Open Rate"
            value={channelMetrics.emailOpenRate}
            description="Percentage of emails opened by parents"
          />
          <ChannelMetricCard
            title="Response Rate"
            value={channelMetrics.responseRate}
            description="Percentage of communications receiving a response"
          />
        </Box>
      </Box>

      {/* School-wise Effectiveness Table */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
          mb: 3,
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Typography variant="subtitle1" fontWeight={600}>
            School-wise Effectiveness ({sortedRecords.length} schools)
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 450 }}>
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
                    width: 90,
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
                    width: 110,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'circularDeliveryPercent'}
                      direction={sortKey === 'circularDeliveryPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('circularDeliveryPercent')}
                    >
                      Circular
                    </TableSortLabel>
                    <Tooltip title="Circular delivery rate">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 100,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'smsOpenPercent'}
                      direction={sortKey === 'smsOpenPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('smsOpenPercent')}
                    >
                      SMS
                    </TableSortLabel>
                    <Tooltip title="SMS open rate">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 100,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'emailOpenPercent'}
                      direction={sortKey === 'emailOpenPercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('emailOpenPercent')}
                    >
                      Email
                    </TableSortLabel>
                    <Tooltip title="Email open rate">
                      <InfoIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: mode === 'dark' ? '#1a1a2e' : '#f5f5f5',
                    fontWeight: 600,
                    width: 110,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <TableSortLabel
                      active={sortKey === 'responseRatePercent'}
                      direction={sortKey === 'responseRatePercent' ? sortDirection : 'asc'}
                      onClick={() => handleSort('responseRatePercent')}
                    >
                      Response
                    </TableSortLabel>
                    <Tooltip title="Overall response rate">
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
                      active={sortKey === 'overallEffectivenessScore'}
                      direction={sortKey === 'overallEffectivenessScore' ? sortDirection : 'asc'}
                      onClick={() => handleSort('overallEffectivenessScore')}
                    >
                      Overall
                    </TableSortLabel>
                    <Tooltip title="Weighted effectiveness score combining all channels">
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
                      sx={{ color: getMetricColor(record.circularDeliveryPercent, { good: 95, warn: 90 }) }}
                    >
                      {record.circularDeliveryPercent}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ color: getMetricColor(record.smsOpenPercent, { good: 85, warn: 75 }) }}
                    >
                      {record.smsOpenPercent}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ color: getMetricColor(record.emailOpenPercent, { good: 60, warn: 50 }) }}
                    >
                      {record.emailOpenPercent}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ color: getMetricColor(record.responseRatePercent, { good: 40, warn: 30 }) }}
                    >
                      {record.responseRatePercent}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: getMetricColor(record.overallEffectivenessScore, { good: 70, warn: 60 }) }}
                    >
                      {record.overallEffectivenessScore}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {sortedRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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

      {/* Best Practices Highlights */}
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Best Practices Highlights
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Observed patterns from high-performing schools
          </Typography>
        </Box>
        <List sx={{ py: 0 }}>
          {mockBestPracticeInsights.map((insight, index) => (
            <ListItem
              key={insight.id}
              sx={{
                borderBottom: index < mockBestPracticeInsights.length - 1
                  ? `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                  : 'none',
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <InsightIcon sx={{ color: mode === 'dark' ? '#ffb74d' : '#f57c00', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={insight.insight}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.primary',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
