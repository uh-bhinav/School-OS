// ============================================================================
// COMPLIANCE OVERVIEW PAGE - Super Admin Compliance & Risk
// ============================================================================
// Route: /group-overview/compliance
// Purpose: Instant risk snapshot across the entire school group.
// Read-only, frontend-only, no mutations.
// Design: Calm when green, creates urgency when red, never noisy or alarmist.
// ============================================================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon,
  Assignment as CertificateIcon,
  Schedule as TimelineIcon,
  LocalFireDepartment as FireIcon,
  VerifiedUser as VerifiedIcon,
  Business as BuildingIcon,
  LocalHospital as HealthIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  getComplianceSummary,
  getComplianceCategories,
  type ComplianceSeverity,
  type CategoryStatus,
  type CertificateCategory,
} from '../../../mockDataProviders/mockCompliance';

// ============================================================================
// SEVERITY CARD COMPONENT - Top section large cards
// ============================================================================

interface SeverityCardProps {
  severity: ComplianceSeverity;
  count: number;
  label: string;
  description: string;
  onClick: () => void;
}

function SeverityCard({ severity, count, label, description, onClick }: SeverityCardProps) {
  const { mode } = useThemeMode();

  const config = {
    urgent: {
      gradient: mode === 'dark'
        ? 'linear-gradient(135deg, #b71c1c 0%, #880e0e 100%)'
        : 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
      icon: <ErrorIcon sx={{ fontSize: 32 }} />,
      borderColor: mode === 'dark' ? '#ef5350' : '#c62828',
      textColor: '#fff',
    },
    attention: {
      gradient: mode === 'dark'
        ? 'linear-gradient(135deg, #e65100 0%, #bf360c 100%)'
        : 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)',
      icon: <WarningIcon sx={{ fontSize: 32 }} />,
      borderColor: mode === 'dark' ? '#ff9800' : '#e65100',
      textColor: '#fff',
    },
    'on-track': {
      gradient: mode === 'dark'
        ? 'linear-gradient(135deg, #1b5e20 0%, #0d3d12 100%)'
        : 'linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)',
      icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
      borderColor: mode === 'dark' ? '#66bb6a' : '#2e7d32',
      textColor: '#fff',
    },
  };

  const cardConfig = config[severity];

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        background: cardConfig.gradient,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: mode === 'dark'
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: mode === 'dark'
            ? '0 16px 48px rgba(0,0,0,0.5)'
            : '0 16px 48px rgba(0,0,0,0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: cardConfig.textColor,
            mb: 2,
          }}
        >
          {cardConfig.icon}
        </Box>

        {/* Count */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: cardConfig.textColor,
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {count}
        </Typography>

        {/* Label */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: cardConfig.textColor,
            mb: 1,
          }}
        >
          {label}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.85)',
            mb: 2,
            flex: 1,
          }}
        >
          {description}
        </Typography>

        {/* CTA */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            pt: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
            }}
          >
            View Schools
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.85)' }} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CATEGORY CARD COMPONENT - Middle section
// ============================================================================

interface CategoryCardProps {
  id: CertificateCategory;
  name: string;
  description: string;
  whyItMatters: string;
  status: CategoryStatus;
  schoolsAffected: number;
  onClick: () => void;
}

const categoryIcons: Record<CertificateCategory, React.ReactNode> = {
  'board-affiliation': <SchoolIcon />,
  'fire-safety': <FireIcon />,
  'staff-verification': <VerifiedIcon />,
  'building-occupancy': <BuildingIcon />,
  'health-sanitation': <HealthIcon />,
};

function CategoryCard({
  id,
  name,
  status,
  schoolsAffected,
  whyItMatters,
  onClick,
}: CategoryCardProps) {
  const { mode } = useThemeMode();

  const statusConfig = {
    critical: {
      color: mode === 'dark' ? '#ef5350' : '#d32f2f',
      bg: mode === 'dark' ? alpha('#ef5350', 0.15) : alpha('#d32f2f', 0.08),
      label: 'Critical',
      chipColor: 'error' as const,
    },
    warning: {
      color: mode === 'dark' ? '#ff9800' : '#ed6c02',
      bg: mode === 'dark' ? alpha('#ff9800', 0.15) : alpha('#ed6c02', 0.08),
      label: 'Warning',
      chipColor: 'warning' as const,
    },
    good: {
      color: mode === 'dark' ? '#66bb6a' : '#2e7d32',
      bg: mode === 'dark' ? alpha('#66bb6a', 0.15) : alpha('#2e7d32', 0.08),
      label: 'Good',
      chipColor: 'success' as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.8) : '#fff',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        '&:hover': {
          boxShadow: mode === 'dark'
            ? '0 4px 16px rgba(0,0,0,0.3)'
            : '0 4px 16px rgba(0,0,0,0.1)',
          borderColor: config.color,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: config.bg,
            color: config.color,
            flexShrink: 0,
          }}
        >
          {categoryIcons[id]}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {name}
            </Typography>
            <Chip
              label={config.label}
              size="small"
              color={config.chipColor}
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
            />
          </Box>

          {schoolsAffected > 0 ? (
            <Typography variant="body2" color="text.secondary">
              {schoolsAffected} school{schoolsAffected !== 1 ? 's' : ''} require attention
            </Typography>
          ) : (
            <Typography variant="body2" color="success.main">
              All schools compliant
            </Typography>
          )}
        </Box>

        {/* Tooltip */}
        <Tooltip
          title={whyItMatters}
          placement="top"
          arrow
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <InfoIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Arrow */}
        <ChevronRightIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />
      </Box>
    </Paper>
  );
}

// ============================================================================
// QUICK NAV LINK COMPONENT
// ============================================================================

interface QuickNavLinkProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickNavLink({ icon, label, onClick }: QuickNavLinkProps) {
  const { mode } = useThemeMode();

  return (
    <Paper
      onClick={onClick}
      sx={{
        px: 3,
        py: 2,
        borderRadius: 2,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.2s ease',
        backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        '&:hover': {
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.9) : alpha('#1976d2', 0.04),
          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#1976d2',
          '& .nav-icon': {
            color: 'primary.main',
          },
          '& .nav-arrow': {
            transform: 'translateX(4px)',
          },
        },
      }}
    >
      <Box
        className="nav-icon"
        sx={{
          color: 'text.secondary',
          display: 'flex',
          transition: 'color 0.2s ease',
        }}
      >
        {icon}
      </Box>
      <Typography variant="body1" fontWeight={500} sx={{ flex: 1 }}>
        {label}
      </Typography>
      <ChevronRightIcon
        className="nav-arrow"
        sx={{
          color: 'text.secondary',
          transition: 'transform 0.2s ease',
        }}
      />
    </Paper>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ComplianceOverviewPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  // Get compliance data
  const summary = useMemo(() => getComplianceSummary(), []);
  const categories = useMemo(() => getComplianceCategories(), []);

  // Handlers
  const handleSeverityClick = (severity: ComplianceSeverity) => {
    navigate(`/group-overview/schools?filter=compliance&severity=${severity}`);
  };

  const handleCategoryClick = (categoryId: CertificateCategory) => {
    navigate(`/group-overview/compliance/certificates?type=${categoryId}`);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Compliance & Risk
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Monitor certificate validity and regulatory compliance across all schools
        </Typography>
      </Box>

      {/* Severity Alert Cards - Top Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 2, letterSpacing: 1 }}
        >
          Compliance Status Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SeverityCard
              severity="urgent"
              count={summary.urgentSchools}
              label="Urgent"
              description="Schools with certificates expiring within 30 days. Immediate action required."
              onClick={() => handleSeverityClick('urgent')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SeverityCard
              severity="attention"
              count={summary.attentionSchools}
              label="Attention"
              description="Schools with certificates expiring within 60 days. Plan renewals now."
              onClick={() => handleSeverityClick('attention')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SeverityCard
              severity="on-track"
              count={summary.onTrackSchools}
              label="On Track"
              description="Schools with all compliance certificates valid. No immediate concerns."
              onClick={() => handleSeverityClick('on-track')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Compliance Categories - Middle Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1 }}
          >
            Compliance by Category
          </Typography>
          <Tooltip title="Each category represents a type of regulatory certificate required for school operation">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <InfoIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={category.id}>
              <CategoryCard
                id={category.id}
                name={category.name}
                description={category.description}
                whyItMatters={category.whyItMatters}
                status={category.status}
                schoolsAffected={category.schoolsAffected}
                onClick={() => handleCategoryClick(category.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 4 }} />

      {/* Quick Navigation - Bottom Section */}
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 2, letterSpacing: 1 }}
        >
          Quick Navigation
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <QuickNavLink
              icon={<CertificateIcon />}
              label="View All Certificates"
              onClick={() => navigate('/group-overview/compliance/certificates')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <QuickNavLink
              icon={<TimelineIcon />}
              label="View Regulatory Timeline"
              onClick={() => navigate('/group-overview/compliance/alerts')}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Summary Footer */}
      <Paper
        sx={{
          mt: 4,
          p: 2.5,
          borderRadius: 2,
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.5) : alpha('#f5f5f5', 0.8),
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <InfoIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" color="text.secondary">
            Compliance Summary
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Certificates Tracked
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {summary.totalCertificates}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Expiring in 30 Days
            </Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: summary.expiringWithin30 > 0 ? 'error.main' : 'inherit' }}
            >
              {summary.expiringWithin30}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Expiring in 60 Days
            </Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: summary.expiringWithin60 > summary.expiringWithin30 ? 'warning.main' : 'inherit' }}
            >
              {summary.expiringWithin60}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Expiring in 90 Days
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {summary.expiringWithin90}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
