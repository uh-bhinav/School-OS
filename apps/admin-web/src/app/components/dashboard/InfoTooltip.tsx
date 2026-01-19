// src/app/components/dashboard/InfoTooltip.tsx
/**
 * InfoTooltip Component
 *
 * Displays an information icon with a tooltip that provides context
 * and explanations for metrics, charts, and dashboard elements.
 *
 * Usage:
 * <InfoTooltip title="Attendance %" description="Shows the percentage..." />
 */

import { IconButton, Tooltip, Box, Typography, alpha, useTheme } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface InfoTooltipProps {
  /**
   * Main title of the tooltip
   */
  title: string;

  /**
   * Detailed description explaining the metric or chart
   */
  description: string;

  /**
   * Optional suggested action or interpretation guide
   */
  action?: string;

  /**
   * Size of the info icon
   * @default 'small'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Placement of the tooltip
   * @default 'top'
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export default function InfoTooltip({
  title,
  description,
  action,
  size = 'small',
  placement = 'top',
}: InfoTooltipProps) {
  const theme = useTheme();

  const tooltipContent = (
    <Box sx={{ maxWidth: 320, p: 1 }}>
      <Typography
        variant="subtitle2"
        fontWeight={600}
        gutterBottom
        sx={{ color: theme.palette.primary.light }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mb: action ? 1.5 : 0,
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {description}
      </Typography>

      {action && (
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: `1px solid ${alpha('#fff', 0.2)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              color: theme.palette.warning.light,
              display: 'block',
            }}
          >
            💡 Tip: {action}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement={placement}
      arrow
      enterDelay={300}
      leaveDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: alpha(theme.palette.grey[900], 0.95),
            backdropFilter: 'blur(10px)',
            boxShadow: theme.shadows[8],
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            p: 0,
          },
        },
        arrow: {
          sx: {
            color: alpha(theme.palette.grey[900], 0.95),
            '&::before': {
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          },
        },
      }}
    >
      <IconButton
        size={size}
        sx={{
          color: theme.palette.text.secondary,
          opacity: 0.7,
          transition: 'all 0.2s ease',
          '&:hover': {
            opacity: 1,
            color: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
      >
        <InfoOutlined fontSize={size} />
      </IconButton>
    </Tooltip>
  );
}
