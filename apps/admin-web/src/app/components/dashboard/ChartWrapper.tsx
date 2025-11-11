// src/app/components/dashboard/ChartWrapper.tsx
/**
 * ChartWrapper Component
 *
 * A wrapper for Recharts with enhanced UI features:
 * - Title and subtitle
 * - Info tooltip explaining the chart
 * - Insight caption below the chart
 * - Loading state with skeleton
 * - Consistent card styling
 *
 * Usage:
 * <ChartWrapper
 *   title="Revenue Overview"
 *   subtitle="Monthly fee collection and expenses"
 *   insight="Collections increased by 15% after sending parent reminders"
 *   tooltipInfo={{ title: "Revenue", description: "..." }}
 * >
 *   <ResponsiveContainer>...</ResponsiveContainer>
 * </ChartWrapper>
 */

import {
  Card,
  CardContent,
  Box,
  Typography,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material';
import InfoTooltip from './InfoTooltip';

export interface ChartWrapperProps {
  /**
   * Chart title
   */
  title: string;

  /**
   * Optional subtitle providing context
   */
  subtitle?: string;

  /**
   * Plain-language insight explaining trends
   */
  insight?: string;

  /**
   * Tooltip information
   */
  tooltipInfo: {
    title: string;
    description: string;
    action?: string;
  };

  /**
   * Chart component (Recharts)
   */
  children: React.ReactNode;

  /**
   * Optional action button or chip (e.g., "Monthly", "Export")
   */
  action?: React.ReactNode;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Minimum height for the chart area
   */
  minHeight?: number;
}

export default function ChartWrapper({
  title,
  subtitle,
  insight,
  tooltipInfo,
  children,
  action,
  loading = false,
  minHeight = 300,
}: ChartWrapperProps) {
  const theme = useTheme();

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
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
              <InfoTooltip {...tooltipInfo} />
            </Box>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && (
            <Box ml={2}>
              {action}
            </Box>
          )}
        </Box>

        {/* Chart Area */}
        <Box sx={{ minHeight }}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={minHeight}
              sx={{ borderRadius: 2 }}
            />
          ) : (
            children
          )}
        </Box>

        {/* Insight Caption */}
        {insight && !loading && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.06),
              border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
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
        )}
      </CardContent>
    </Card>
  );
}
