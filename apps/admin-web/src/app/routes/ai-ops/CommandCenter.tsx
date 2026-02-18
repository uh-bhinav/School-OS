// ============================================================================
// Command Center — 17-agent grid overview with real-time status
// Design: matches Students page — gradient KPI cards, clean white agent cards,
// readable typography, proper spacing.
// ============================================================================
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  alpha,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendIcon,
  SmartToy as AgentIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import {
  useSimulationStore,
  ALL_AGENTS,
  CATEGORY_COLORS,
  CATEGORY_GRADIENTS,
  CATEGORY_ORDER,
  getAgentsByCategory,
  type AgentMeta,
  type AgentStatus,
  type AgentAction,
} from '../../../lib/agentSimulation';

function formatTimeAgo(d: Date | null): string {
  if (!d) return 'Never';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── AGENT CARD (gradient background, white text — like Student KPI cards) ──

function AgentCard({
  meta,
  status,
  onSelect,
}: {
  meta: AgentMeta;
  status: AgentStatus | undefined;
  onSelect: () => void;
}) {
  const catGradient = CATEGORY_GRADIENTS[meta.category];
  const isActive = status?.isActive ?? false;

  return (
    <Card
      onClick={onSelect}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        height: '100%',
        background: catGradient,
        color: 'white',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Chip
            label={meta.category.toUpperCase()}
            size="small"
            icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#4ade80' : 'rgba(255,255,255,0.5)', mr: -0.5 }} />}
            sx={{
              height: 26,
              fontSize: '0.75rem',
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              letterSpacing: 0.5,
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
          <Chip
            label={isActive ? 'Active' : 'Idle'}
            size="small"
            sx={{
              height: 26,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
              color: 'white',
            }}
          />
        </Box>

        {/* Agent name */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
          {meta.name}
        </Typography>

        {/* Goal statement */}
        <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5, mb: 2, flex: 1 }}>
          {meta.goalStatement}
        </Typography>

        {/* Stats row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TrendIcon sx={{ fontSize: 18, opacity: 0.8 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {status?.actionsToday ?? 0}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>today</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 16, opacity: 0.7 }} />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {formatTimeAgo(status?.lastRunTime ?? null)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── AGENT DETAIL DIALOG ────────────────────────────────────────────────────

function AgentDetailDialog({
  open,
  onClose,
  meta,
  status,
  recentActions,
}: {
  open: boolean;
  onClose: () => void;
  meta: AgentMeta | null;
  status: AgentStatus | undefined;
  recentActions: AgentAction[];
}) {
  if (!meta) return null;
  const catColor = CATEGORY_COLORS[meta.category];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: catColor }}>
            {meta.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {meta.category} • {status?.currentState ?? 'idle'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2.5 }}>
          {meta.goalStatement}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Monitored Signals
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
          {meta.monitoredSignals.map((signal) => (
            <Chip key={signal} label={signal} size="small" variant="outlined" />
          ))}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Recent Actions ({recentActions.length})
        </Typography>
        {recentActions.slice(0, 8).map((action) => (
          <Box
            key={action.id}
            sx={{
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {action.actionType.replace(/_/g, ' ')}
              </Typography>
              <Chip
                label={action.status.replace('_', ' ')}
                size="small"
                color={action.status === 'completed' ? 'success' : 'default'}
                sx={{ fontWeight: 600, textTransform: 'uppercase' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {action.description}
            </Typography>
          </Box>
        ))}
        {recentActions.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No actions recorded yet
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── COMMAND CENTER PAGE ────────────────────────────────────────────────────

export default function CommandCenter() {
  const actions = useSimulationStore((s) => s.actions);
  const agentStatuses = useSimulationStore((s) => s.agentStatuses);
  const totalActionsToday = useSimulationStore((s) => s.totalActionsToday);
  const runAllAgentsNow = useSimulationStore((s) => s.runAllAgentsNow);
  const lastRunTime = useSimulationStore((s) => s.lastRunTime);
  const [selectedAgent, setSelectedAgent] = useState<AgentMeta | null>(null);

  const activeAgents = agentStatuses.filter((a) => a.isActive).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header — same pattern as StudentsPage */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            AI Command Center
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor and manage all {ALL_AGENTS.length} AI agents across the school
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PlayIcon />} onClick={runAllAgentsNow} color="primary">
          Run All Agents Now
        </Button>
      </Box>

      {/* KPI Cards — same gradient style as StudentsPage / StudentKPIsOverview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Agents</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {activeAgents} <Typography component="span" variant="body1" sx={{ opacity: 0.7 }}>/ {ALL_AGENTS.length}</Typography>
                </Typography>
              </Box>
              <AgentIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Actions Today</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{totalActionsToday}</Typography>
              </Box>
              <BoltIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Last Cycle</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{formatTimeAgo(lastRunTime)}</Typography>
              </Box>
              <TimeIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Agent grid grouped by category */}
      {CATEGORY_ORDER.map((category) => {
        const categoryAgents = getAgentsByCategory(category);
        const catColor = CATEGORY_COLORS[category];
        if (categoryAgents.length === 0) return null;

        return (
          <Box key={category} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box sx={{ width: 4, height: 24, borderRadius: 1, bgcolor: catColor }} />
              <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                {category}
              </Typography>
              <Chip
                label={`${categoryAgents.length} agents`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: alpha(catColor, 0.1), color: catColor }}
              />
            </Box>
            <Grid container spacing={2.5}>
              {categoryAgents.map((meta) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={meta.type}>
                  <AgentCard
                    meta={meta}
                    status={agentStatuses.find((s) => s.agentType === meta.type)}
                    onSelect={() => setSelectedAgent(meta)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {/* Agent Detail Dialog */}
      <AgentDetailDialog
        open={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        meta={selectedAgent}
        status={selectedAgent ? agentStatuses.find((s) => s.agentType === selectedAgent.type) : undefined}
        recentActions={selectedAgent ? actions.filter((a) => a.agentType === selectedAgent.type) : []}
      />
    </Box>
  );
}
