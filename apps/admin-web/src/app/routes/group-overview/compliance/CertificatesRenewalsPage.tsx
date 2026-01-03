// ============================================================================
// CERTIFICATES & RENEWALS PAGE - Super Admin Compliance & Risk
// ============================================================================
// Route: /group-overview/compliance/certificates
// Purpose: Absolute clarity on what's expiring, where, and when.
// Used before inspections, audits, and board meetings.
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
  ChevronRight as ChevronRightIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  getCertificatesByFilter,
  certificateCategoryConfig,
  formatDaysRemaining,
  type Certificate,
  type CertificateCategory,
  type ComplianceSeverity,
} from '../../../mockDataProviders/mockCompliance';
import { mockRegions } from '../../../mockDataProviders/mockSuperAdmin';

// ============================================================================
// TYPES
// ============================================================================

type SortKey = 'typeName' | 'schoolName' | 'region' | 'expiryDate' | 'daysRemaining' | 'severity';
type SortDirection = 'asc' | 'desc';
type ExpiryWindowOption = 'all' | '30' | '60' | '90';

// ============================================================================
// STATUS CONFIG
// ============================================================================

const severityConfig = {
  urgent: { color: 'error' as const, label: 'Urgent', tooltip: 'Expiring within 30 days - requires immediate action' },
  attention: { color: 'warning' as const, label: 'Attention', tooltip: 'Expiring within 60 days - plan renewal now' },
  'on-track': { color: 'success' as const, label: 'On Track', tooltip: 'Valid for more than 60 days - no immediate action required' },
};

const expiryWindowOptions: { value: ExpiryWindowOption; label: string }[] = [
  { value: 'all', label: 'All Certificates' },
  { value: '30', label: 'Expiring in 30 Days' },
  { value: '60', label: 'Expiring in 60 Days' },
  { value: '90', label: 'Expiring in 90 Days' },
];

const categoryOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  ...Object.entries(certificateCategoryConfig).map(([id, config]) => ({
    value: id,
    label: config.name,
  })),
];

// ============================================================================
// TOOLTIP INFO CONTENT
// ============================================================================

const columnTooltips: Record<string, string> = {
  typeName: 'The type of compliance certificate required for school operation',
  schoolName: 'The school where this certificate is registered',
  region: 'Geographic region for regional compliance management',
  expiryDate: 'The date when this certificate expires and requires renewal',
  daysRemaining: 'Number of days until certificate expiry. Lower numbers indicate higher urgency.',
  severity: 'Risk level based on time until expiry: Urgent (<30 days), Attention (30-60 days), On Track (>60 days)',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CertificatesRenewalsPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state (synced with URL)
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get('type') || 'all'
  );
  const [regionFilter, setRegionFilter] = useState<string>(
    searchParams.get('region') || 'all'
  );
  const [expiryWindow, setExpiryWindow] = useState<ExpiryWindowOption>(
    (searchParams.get('expiry') as ExpiryWindowOption) || 'all'
  );

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('daysRemaining');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Get filtered certificates
  const certificates = useMemo(() => {
    const type = categoryFilter !== 'all' ? categoryFilter as CertificateCategory : undefined;
    const region = regionFilter !== 'all' ? regionFilter : undefined;
    const expiry = expiryWindow !== 'all' ? parseInt(expiryWindow) as 30 | 60 | 90 : undefined;

    return getCertificatesByFilter(type, region, expiry);
  }, [categoryFilter, regionFilter, expiryWindow]);

  // Sort certificates
  const sortedCertificates = useMemo(() => {
    return [...certificates].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'typeName':
          comparison = a.typeName.localeCompare(b.typeName);
          break;
        case 'schoolName':
          comparison = a.schoolName.localeCompare(b.schoolName);
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
        case 'expiryDate':
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case 'daysRemaining':
          comparison = a.daysRemaining - b.daysRemaining;
          break;
        case 'severity':
          const severityOrder: Record<ComplianceSeverity, number> = { 'urgent': 0, 'attention': 1, 'on-track': 2 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [certificates, sortKey, sortDirection]);

  // Handlers
  const handleCategoryChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCategoryFilter(value);
    updateFilters({ type: value });
  };

  const handleRegionChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setRegionFilter(value);
    updateFilters({ region: value });
  };

  const handleExpiryWindowChange = (event: SelectChangeEvent) => {
    const value = event.target.value as ExpiryWindowOption;
    setExpiryWindow(value);
    updateFilters({ expiry: value });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (cert: Certificate) => {
    navigate(`/group-overview/schools/${cert.schoolId}`);
  };

  const handleExport = () => {
    console.log('[EXPORT] Exporting certificates data:', sortedCertificates.length, 'records');
    // In production, this would trigger a CSV/Excel download
  };

  const handleBack = () => {
    navigate('/group-overview/compliance');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Tooltip title="Back to Compliance Overview">
          <IconButton onClick={handleBack} sx={{ mt: 0.5 }}>
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Certificates & Renewals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track certificate validity and upcoming renewal deadlines
          </Typography>
        </Box>
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
        {/* Certificate Type Filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Certificate Type</InputLabel>
          <Select value={categoryFilter} label="Certificate Type" onChange={handleCategoryChange}>
            {categoryOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Region Filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Region</InputLabel>
          <Select value={regionFilter} label="Region" onChange={handleRegionChange}>
            <MenuItem value="all">All Regions</MenuItem>
            {mockRegions.map(r => (
              <MenuItem key={r.id} value={r.name}>{r.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Expiry Window Filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Expiry Window</InputLabel>
          <Select value={expiryWindow} label="Expiry Window" onChange={handleExpiryWindowChange}>
            {expiryWindowOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary">
          {sortedCertificates.length} certificate{sortedCertificates.length !== 1 ? 's' : ''}
        </Typography>

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

      {/* Certificates Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.9) : alpha('#f5f5f5', 0.8),
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableSortLabel
                    active={sortKey === 'typeName'}
                    direction={sortKey === 'typeName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('typeName')}
                  >
                    Certificate Type
                  </TableSortLabel>
                  <Tooltip title={columnTooltips.typeName}>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableSortLabel
                    active={sortKey === 'schoolName'}
                    direction={sortKey === 'schoolName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('schoolName')}
                  >
                    School
                  </TableSortLabel>
                  <Tooltip title={columnTooltips.schoolName}>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableSortLabel
                    active={sortKey === 'region'}
                    direction={sortKey === 'region' ? sortDirection : 'asc'}
                    onClick={() => handleSort('region')}
                  >
                    Region
                  </TableSortLabel>
                  <Tooltip title={columnTooltips.region}>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableSortLabel
                    active={sortKey === 'expiryDate'}
                    direction={sortKey === 'expiryDate' ? sortDirection : 'asc'}
                    onClick={() => handleSort('expiryDate')}
                  >
                    Expiry Date
                  </TableSortLabel>
                  <Tooltip title={columnTooltips.expiryDate}>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableSortLabel
                    active={sortKey === 'daysRemaining'}
                    direction={sortKey === 'daysRemaining' ? sortDirection : 'asc'}
                    onClick={() => handleSort('daysRemaining')}
                  >
                    Days Remaining
                  </TableSortLabel>
                  <Tooltip title={columnTooltips.daysRemaining}>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TableSortLabel
                    active={sortKey === 'severity'}
                    direction={sortKey === 'severity' ? sortDirection : 'asc'}
                    onClick={() => handleSort('severity')}
                  >
                    Status
                  </TableSortLabel>
                  <Tooltip title={columnTooltips.severity}>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ width: 48 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCertificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No certificates match the selected filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedCertificates.map((cert) => {
                const config = severityConfig[cert.severity];
                return (
                  <TableRow
                    key={cert.id}
                    hover
                    onClick={() => handleRowClick(cert)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: mode === 'dark'
                          ? alpha('#1a1a2e', 0.5)
                          : alpha('#1976d2', 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {cert.typeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cert.certificateNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cert.schoolName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cert.region}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(cert.expiryDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: cert.severity === 'urgent'
                            ? 'error.main'
                            : cert.severity === 'attention'
                              ? 'warning.main'
                              : 'text.primary',
                        }}
                      >
                        {formatDaysRemaining(cert.daysRemaining)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={config.tooltip}>
                        <Chip
                          label={config.label}
                          color={config.color}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info Footer */}
      <Paper
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.5) : alpha('#f5f5f5', 0.6),
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <InfoIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" color="text.secondary">
            Understanding Certificate Status
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Urgent" color="error" size="small" />
            <Typography variant="caption" color="text.secondary">
              Expiring within 30 days - Immediate action required
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="Attention" color="warning" size="small" />
            <Typography variant="caption" color="text.secondary">
              Expiring within 60 days - Plan renewal now
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label="On Track" color="success" size="small" />
            <Typography variant="caption" color="text.secondary">
              Valid for 60+ days - No immediate action needed
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
