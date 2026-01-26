// ============================================================================
// REGULATORY ALERTS PAGE - Super Admin Compliance & Risk
// ============================================================================
// Route: /group-overview/compliance/alerts
// Purpose: Proactive compliance mindset - upcoming deadlines and history.
// Answer: "What's coming up, and who needs to know?"
// Read-only, frontend-only, no mutations.
// ============================================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Info as InfoIcon,
  ArrowBack as BackIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Gavel as PenaltyIcon,
  Assignment as RenewalIcon,
  Search as InspectionIcon,
  ReportProblem as WarningLogIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../../providers/ThemeProvider';
import {
  mockComplianceAlerts,
  mockNotificationConfig,
  mockHistoricalEvents,
  certificateCategoryConfig,
  formatDaysRemaining,
  type ComplianceAlert,
  type HistoricalEvent,
  type NotificationConfig,
} from '../../../mockDataProviders/mockCompliance';

// ============================================================================
// TYPES
// ============================================================================

type TabValue = 'timeline' | 'notifications' | 'history';

// ============================================================================
// TIMELINE ITEM COMPONENT
// ============================================================================

interface TimelineItemProps {
  alert: ComplianceAlert;
  onClick: () => void;
}

function TimelineItem({ alert, onClick }: TimelineItemProps) {
  const { mode } = useThemeMode();

  const severityConfig = {
    urgent: {
      color: mode === 'dark' ? '#ef5350' : '#d32f2f',
      bg: mode === 'dark' ? alpha('#ef5350', 0.15) : alpha('#d32f2f', 0.08),
      icon: <ErrorIcon />,
    },
    attention: {
      color: mode === 'dark' ? '#ff9800' : '#ed6c02',
      bg: mode === 'dark' ? alpha('#ff9800', 0.15) : alpha('#ed6c02', 0.08),
      icon: <WarningIcon />,
    },
    'on-track': {
      color: mode === 'dark' ? '#66bb6a' : '#2e7d32',
      bg: mode === 'dark' ? alpha('#66bb6a', 0.15) : alpha('#2e7d32', 0.08),
      icon: <CheckCircleIcon />,
    },
  };

  const typeIcons = {
    expiry: <RenewalIcon />,
    renewal: <RenewalIcon />,
    inspection: <InspectionIcon />,
    penalty: <PenaltyIcon />,
  };

  const config = severityConfig[alert.severity];

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderLeft: `4px solid ${config.color}`,
        '&:hover': {
          boxShadow: mode === 'dark'
            ? '0 4px 16px rgba(0,0,0,0.3)'
            : '0 4px 16px rgba(0,0,0,0.1)',
          transform: 'translateX(4px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Icon */}
        <Avatar
          sx={{
            width: 44,
            height: 44,
            backgroundColor: config.bg,
            color: config.color,
          }}
        >
          {typeIcons[alert.type]}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {alert.title}
            </Typography>
            <Chip
              label={formatDaysRemaining(alert.daysUntil)}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                backgroundColor: config.bg,
                color: config.color,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {alert.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {alert.schoolName}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {certificateCategoryConfig[alert.certificateType].name}
            </Typography>
          </Box>
        </Box>

        {/* Date */}
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(alert.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            })}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ============================================================================
// NOTIFICATION CONFIG CARD
// ============================================================================

interface NotificationCardProps {
  config: NotificationConfig;
}

function NotificationCard({ config }: NotificationCardProps) {
  const { mode } = useThemeMode();

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.6) : '#fff',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {config.typeName}
          </Typography>
          <Chip
            label={config.enabled ? 'Active' : 'Disabled'}
            size="small"
            color={config.enabled ? 'success' : 'default'}
            sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }}
          />
        </Box>
        <NotificationsIcon sx={{ color: 'text.secondary' }} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Alert Schedule (days before expiry)
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {config.alertDays.map((days) => (
            <Chip
              key={days}
              label={`${days}d`}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Recipients
        </Typography>
        <Typography variant="body2" color="text.primary">
          {config.recipients.join(', ')}
        </Typography>
      </Box>
    </Paper>
  );
}

// ============================================================================
// HISTORY ITEM COMPONENT
// ============================================================================

interface HistoryItemProps {
  event: HistoricalEvent;
}

function HistoryItem({ event }: HistoryItemProps) {
  const { mode } = useThemeMode();

  const eventConfig: Record<HistoricalEvent['eventType'], { icon: React.ReactNode; color: string; label: string }> = {
    'late-renewal': {
      icon: <RenewalIcon />,
      color: mode === 'dark' ? '#ff9800' : '#ed6c02',
      label: 'Late Renewal',
    },
    'penalty': {
      icon: <PenaltyIcon />,
      color: mode === 'dark' ? '#ef5350' : '#d32f2f',
      label: 'Penalty',
    },
    'warning': {
      icon: <WarningLogIcon />,
      color: mode === 'dark' ? '#ff9800' : '#ed6c02',
      label: 'Warning',
    },
    'inspection-failed': {
      icon: <InspectionIcon />,
      color: mode === 'dark' ? '#ef5350' : '#d32f2f',
      label: 'Inspection Failed',
    },
    'license-lapse': {
      icon: <ErrorIcon />,
      color: mode === 'dark' ? '#ef5350' : '#d32f2f',
      label: 'License Lapse',
    },
  };

  const config = eventConfig[event.eventType];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.4) : alpha('#f5f5f5', 0.5),
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Icon */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: alpha(config.color, 0.15),
            color: config.color,
          }}
        >
          {config.icon}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {event.title}
            </Typography>
            <Chip
              label={config.label}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                backgroundColor: alpha(config.color, 0.15),
                color: config.color,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {event.description}
          </Typography>
          {event.resolution && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Resolution: {event.resolution}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {event.schoolName}
            </Typography>
            {event.financialImpact && event.financialImpact > 0 && (
              <>
                <Typography variant="caption" color="text.disabled">•</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'error.main', fontWeight: 600 }}
                >
                  Impact: {formatCurrency(event.financialImpact)}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* Date */}
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(event.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RegulatoryAlertsPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const [activeTab, setActiveTab] = useState<TabValue>('timeline');

  // Group alerts by timeframe
  const groupedAlerts = useMemo(() => {
    const groups: { label: string; alerts: ComplianceAlert[] }[] = [
      { label: 'This Week (Next 7 Days)', alerts: [] },
      { label: 'Week 2 (8-14 Days)', alerts: [] },
      { label: 'Week 3 (15-21 Days)', alerts: [] },
      { label: 'Week 4 (22-28 Days)', alerts: [] },
      { label: 'Next Month (29-60 Days)', alerts: [] },
      { label: 'Beyond 60 Days', alerts: [] },
    ];

    mockComplianceAlerts.forEach(alert => {
      if (alert.daysUntil <= 7) {
        groups[0].alerts.push(alert);
      } else if (alert.daysUntil <= 14) {
        groups[1].alerts.push(alert);
      } else if (alert.daysUntil <= 21) {
        groups[2].alerts.push(alert);
      } else if (alert.daysUntil <= 28) {
        groups[3].alerts.push(alert);
      } else if (alert.daysUntil <= 60) {
        groups[4].alerts.push(alert);
      } else {
        groups[5].alerts.push(alert);
      }
    });

    return groups.filter(g => g.alerts.length > 0);
  }, []);

  // Count urgent alerts
  const urgentCount = useMemo(() => {
    return mockComplianceAlerts.filter(a => a.severity === 'urgent').length;
  }, []);

  const handleBack = () => {
    navigate('/group-overview/compliance');
  };

  const handleAlertClick = (alert: ComplianceAlert) => {
    navigate(`/group-overview/schools/${alert.schoolId}`);
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
            Regulatory Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upcoming deadlines, notification settings, and compliance history
          </Typography>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Paper
        sx={{
          mb: 3,
          borderRadius: 2,
          backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.8) : alpha('#fff', 0.9),
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue as TabValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 56,
            },
          }}
        >
          <Tab
            value="timeline"
            icon={<ScheduleIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Upcoming Deadlines</span>
                {urgentCount > 0 && (
                  <Chip
                    label={urgentCount}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            value="notifications"
            icon={<NotificationsIcon />}
            iconPosition="start"
            label="Notification Settings"
          />
          <Tab
            value="history"
            icon={<HistoryIcon />}
            iconPosition="start"
            label="Compliance History"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <Box>
          {groupedAlerts.map((group, groupIndex) => (
            <Box key={groupIndex} sx={{ mb: 4 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ display: 'block', mb: 2, letterSpacing: 1 }}
              >
                {group.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {group.alerts.map((alert) => (
                  <TimelineItem
                    key={alert.id}
                    alert={alert}
                    onClick={() => handleAlertClick(alert)}
                  />
                ))}
              </Box>
            </Box>
          ))}

          {/* Info note */}
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.4) : alpha('#f5f5f5', 0.6),
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Click any alert to view the school's compliance details. All dates shown are based on certificate expiry records.
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {activeTab === 'notifications' && (
        <Box>
          {/* Read-only notice */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? alpha('#0288d1', 0.1) : alpha('#0288d1', 0.05),
              border: `1px solid ${mode === 'dark' ? alpha('#0288d1', 0.3) : alpha('#0288d1', 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <InfoIcon sx={{ color: 'info.main' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="info.main">
                  Notification Configuration Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  These settings show when and to whom compliance alerts are sent. Configuration is managed at the system level.
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Notification cards grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {mockNotificationConfig.map((config) => (
              <NotificationCard key={config.certificateType} config={config} />
            ))}
          </Box>

          {/* Summary */}
          <Paper
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.5) : alpha('#fff', 0.9),
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Alert Delivery Summary
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <NotificationsIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Email notifications sent automatically"
                  secondary="Based on configured alert schedules"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Super Admin receives all critical alerts"
                  secondary="Regardless of individual certificate settings"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 'history' && (
        <Box>
          {/* History header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1 }}
            >
              Historical Compliance Events
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mockHistoricalEvents.length} events recorded
            </Typography>
          </Box>

          {/* History list */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {mockHistoricalEvents.map((event) => (
              <HistoryItem key={event.id} event={event} />
            ))}
          </Box>

          {/* Summary stats */}
          <Paper
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? alpha('#1a1a2e', 0.5) : alpha('#f5f5f5', 0.6),
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <InfoIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Historical Summary (Past 18 Months)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Late Renewals
                </Typography>
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  {mockHistoricalEvents.filter(e => e.eventType === 'late-renewal').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Penalties Received
                </Typography>
                <Typography variant="h6" fontWeight={600} color="error.main">
                  {mockHistoricalEvents.filter(e => e.eventType === 'penalty').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Failed Inspections
                </Typography>
                <Typography variant="h6" fontWeight={600} color="error.main">
                  {mockHistoricalEvents.filter(e => e.eventType === 'inspection-failed').length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Financial Impact
                </Typography>
                <Typography variant="h6" fontWeight={600} color="error.main">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(
                    mockHistoricalEvents.reduce((sum, e) => sum + (e.financialImpact || 0), 0)
                  )}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
