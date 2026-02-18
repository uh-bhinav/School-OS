// ============================================================================
// LiveFeedWidget — Compact live feed for the dashboard (latest 8 actions)
// Clean design with readable text, proper font sizes
// ============================================================================
import { Box, Typography, Card, CardContent, Chip, Button } from '@mui/material';
import { DynamicFeed as FeedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useSimulationStore,
  getAgentMeta,
  CATEGORY_COLORS,
  type AgentAction,
} from '../../../lib/agentSimulation';

function formatTimeAgo(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_CHIP_COLORS: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  completed: 'success',
  in_progress: 'info',
  flagged: 'warning',
  escalated: 'error',
  pending: 'default',
};

function FeedItem({ action }: { action: AgentAction }) {
  const meta = getAgentMeta(action.agentType);
  const catColor = meta ? CATEGORY_COLORS[meta.category] : '#6366f1';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      {/* Category color bar */}
      <Box sx={{ width: 4, borderRadius: 1, bgcolor: catColor, flexShrink: 0 }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: catColor }}>
            {meta?.shortName ?? 'Agent'}
          </Typography>
          <Chip
            label={action.status.replace('_', ' ')}
            size="small"
            color={STATUS_CHIP_COLORS[action.status] ?? 'default'}
            sx={{ fontWeight: 600, textTransform: 'uppercase' }}
          />
        </Box>
        <Typography variant="body2" color="text.primary" noWrap>
          {action.description}
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, mt: 0.5 }}>
        {formatTimeAgo(action.timestamp)}
      </Typography>
    </Box>
  );
}

export default function LiveFeedWidget() {
  const actions = useSimulationStore((s) => s.actions);
  const navigate = useNavigate();
  const recentActions = actions.slice(0, 8);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FeedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              AI Live Feed
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                animation: 'pulse-dot 2s infinite',
                '@keyframes pulse-dot': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
          </Box>
          <Button size="small" onClick={() => navigate('/ai-ops/live-feed')} sx={{ textTransform: 'none' }}>
            View All →
          </Button>
        </Box>
        {recentActions.map((action) => (
          <FeedItem key={action.id} action={action} />
        ))}
        {recentActions.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No actions yet — agents starting up…
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
