// ============================================================================
// AgentStatusBar — Sleek AI status strip for the dashboard
// Matches InsightCard / dashboard design language: subtle, professional, clean
// ============================================================================
import { Box, Typography, alpha, useTheme, Card, CardContent, Tooltip } from '@mui/material';
import { SmartToy as AiIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useSimulationStore,
  ALL_AGENTS,
  CATEGORY_COLORS,
  type AgentStatus,
} from '../../../lib/agentSimulation';

/* ── tiny agent dot with tooltip ── */
function AgentDot({
  meta,
  status,
}: {
  meta: (typeof ALL_AGENTS)[0];
  status: AgentStatus | undefined;
}) {
  const navigate = useNavigate();
  const catColor = CATEGORY_COLORS[meta.category];
  const isActive = status?.isActive ?? false;
  const actions = status?.actionsToday ?? 0;

  return (
    <Tooltip
      title={
        <Box sx={{ px: 0.5, py: 0.25 }}>
          <Typography variant="body2" fontWeight={600}>
            {meta.shortName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {isActive ? `Active · ${actions} actions today` : 'Idle'}
          </Typography>
        </Box>
      }
      arrow
      placement="bottom"
    >
      <Box
        onClick={() => navigate('/ai-ops/command-center')}
        sx={{
          width: 32,
          height: 32,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(catColor, 0.1),
          border: `1.5px solid ${alpha(catColor, 0.25)}`,
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            bgcolor: alpha(catColor, 0.18),
            borderColor: catColor,
            boxShadow: `0 4px 12px ${alpha(catColor, 0.25)}`,
          },
        }}
      >
        {/* Activity indicator */}
        {isActive && (
          <Box
            sx={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              border: '1.5px solid white',
            }}
          />
        )}
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: catColor,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {meta.shortName.slice(0, 2).toUpperCase()}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default function AgentStatusBar() {
  const theme = useTheme();
  const agentStatuses = useSimulationStore((s) => s.agentStatuses);
  const totalActionsToday = useSimulationStore((s) => s.totalActionsToday);
  const activeCount = agentStatuses.filter((a) => a.isActive).length;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
        },
      }}
    >
      <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Left: Title + Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha('#667eea', 0.15)}, ${alpha('#764ba2', 0.08)})`,
                color: '#667eea',
              }}
            >
              <AiIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                Acadion AI
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeCount}/{ALL_AGENTS.length} agents active · {totalActionsToday} actions today
              </Typography>
            </Box>
            {/* Live pulse */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                boxShadow: `0 0 0 3px ${alpha('#22c55e', 0.2)}`,
                animation: 'acadion-pulse 2s infinite',
                '@keyframes acadion-pulse': {
                  '0%, 100%': { boxShadow: `0 0 0 3px ${alpha('#22c55e', 0.2)}` },
                  '50%': { boxShadow: `0 0 0 6px ${alpha('#22c55e', 0.05)}` },
                },
              }}
            />
          </Box>

          {/* Right: Agent dots */}
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {ALL_AGENTS.map((meta) => (
              <AgentDot
                key={meta.type}
                meta={meta}
                status={agentStatuses.find((s) => s.agentType === meta.type)}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
