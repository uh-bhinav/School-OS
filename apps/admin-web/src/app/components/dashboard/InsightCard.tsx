// src/app/components/dashboard/InsightCard.tsx
/**
 * InsightCard Component
 *
 * Displays a KPI metric card with:
 * - Icon and color-coded visual
 * - Current value and trend indicator
 * - Insight caption explaining what the metric means
 * - Info tooltip for additional context
 *
 * Usage:
 * <InsightCard
 *   title="Total Students"
 *   value={1234}
 *   change={5.2}
 *   icon={<People />}
 *   color="#0B5F5A"
 *   insight="Student enrollment increased by 5.2% compared to last month"
 *   tooltipInfo={{ title: "Total Students", description: "..." }}
 * />
 */

import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import InfoTooltip from './InfoTooltip';

export interface InsightCardProps {
  /**
   * Title of the metric (e.g., "Total Students")
   */
  title: string;

  /**
   * Current value to display
   */
  value: string | number;

  /**
   * Percentage change from previous period
   */
  change: number;

  /**
   * Icon to display in the card
   */
  icon: React.ReactNode;

  /**
   * Primary color for the card's accent
   */
  color: string;

  /**
   * Plain-language insight explaining the metric
   */
  insight: string;

  /**
   * Tooltip information
   */
  tooltipInfo: {
    title: string;
    description: string;
    action?: string;
  };

  /**
   * Loading state
   */
  loading?: boolean;
}

export default function InsightCard({
  title,
  value,
  change,
  icon,
  color,
  insight,
  tooltipInfo,
  loading = false,
}: InsightCardProps) {
  const theme = useTheme();

  // Determine trend direction
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp sx={{ fontSize: 20 }} />;
    if (change < 0) return <TrendingDown sx={{ fontSize: 20 }} />;
    return <TrendingFlat sx={{ fontSize: 20 }} />;
  };

  const getTrendColor = () => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          height: '100%',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="80%" height={40} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.6)
          : theme.palette.background.paper,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[12],
          borderColor: alpha(color, 0.3),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Header: Icon and Info Tooltip */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`,
                color: color,
                boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
              }}
            >
              {icon}
            </Box>
            <InfoTooltip {...tooltipInfo} />
          </Box>

          {/* Title and Value */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500, letterSpacing: 0.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.7)})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
          </Box>

          {/* Trend Indicator */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(getTrendColor(), 0.1),
                color: getTrendColor(),
              }}
            >
              {getTrendIcon()}
              <Typography variant="body2" fontWeight={600}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </Box>

          {/* Insight Caption */}
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              💡 {insight}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
