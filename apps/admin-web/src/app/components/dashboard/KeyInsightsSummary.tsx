// src/app/components/dashboard/KeyInsightsSummary.tsx
/**
 * KeyInsightsSummary Component
 *
 * Displays the top 3-5 actionable insights at the top of the dashboard.
 * These insights are automatically generated from dashboard metrics and
 * provide principals with quick, digestible information about what needs
 * attention.
 *
 * Usage:
 * <KeyInsightsSummary insights={[
 *   { type: 'success', message: 'Attendance up 5% this week' },
 *   { type: 'warning', message: 'Grade 8 admissions below target' },
 * ]} />
 */

import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Info,
  Error,
} from '@mui/icons-material';

export interface Insight {
  /**
   * Type of insight (determines color and icon)
   */
  type: 'success' | 'warning' | 'error' | 'info';

  /**
   * Plain-language message
   */
  message: string;

  /**
   * Optional category label (e.g., "Academics", "Finance")
   */
  category?: string;
}

interface KeyInsightsSummaryProps {
  /**
   * Array of insights to display
   */
  insights: Insight[];

  /**
   * Loading state
   */
  loading?: boolean;
}

export default function KeyInsightsSummary({
  insights,
  loading = false
}: KeyInsightsSummaryProps) {
  const theme = useTheme();

  const getInsightConfig = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle sx={{ fontSize: 20 }} />,
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          borderColor: alpha(theme.palette.success.main, 0.3),
        };
      case 'warning':
        return {
          icon: <Warning sx={{ fontSize: 20 }} />,
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          borderColor: alpha(theme.palette.warning.main, 0.3),
        };
      case 'error':
        return {
          icon: <Error sx={{ fontSize: 20 }} />,
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          borderColor: alpha(theme.palette.error.main, 0.3),
        };
      case 'info':
      default:
        return {
          icon: <Info sx={{ fontSize: 20 }} />,
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          borderColor: alpha(theme.palette.info.main, 0.3),
        };
    }
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Paper>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        background: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.6)
          : theme.palette.background.paper,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <TrendingUp sx={{ fontSize: 28, color: theme.palette.primary.main }} />
        <Typography variant="h6" fontWeight={600}>
          Key Insights
        </Typography>
        <Chip
          label="Updated Now"
          size="small"
          sx={{
            ml: 'auto',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 500,
          }}
        />
      </Box>

      {/* Insights Grid */}
      <Stack spacing={2}>
        {insights.map((insight, index) => {
          const config = getInsightConfig(insight.type);

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: config.bgcolor,
                border: `1px solid ${config.borderColor}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: `0 4px 12px ${alpha(config.color, 0.15)}`,
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(config.color, 0.15),
                  color: config.color,
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </Box>

              {/* Content */}
              <Box flex={1}>
                {insight.category && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: config.color,
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {insight.category}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {insight.message}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
