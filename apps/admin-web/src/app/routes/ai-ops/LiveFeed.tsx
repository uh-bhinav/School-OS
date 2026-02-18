// ============================================================================
// Live Feed — Full-page feed with filtering, search, and detail drawer
// Clean design matching StudentsPage: Card wrappers, readable body text,
// proper MUI Chip colors, spacious layout.
// ============================================================================
import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  Button,
  Drawer,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  useSimulationStore,
  getAgentMeta,
  CATEGORY_COLORS,
  AgentCategory,
  type AgentAction,
} from '../../../lib/agentSimulation';

const STATUS_CHIP: Record<string, { color: 'success' | 'info' | 'warning' | 'error' | 'default'; label: string }> = {
  completed: { color: 'success', label: 'Completed' },
  in_progress: { color: 'info', label: 'In Progress' },
  flagged: { color: 'warning', label: 'Flagged' },
  escalated: { color: 'error', label: 'Escalated' },
  pending: { color: 'default', label: 'Pending' },
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatTimeAgo(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── FEED CARD ──────────────────────────────────────────────────────────────

function FeedCard({ action, onClick }: { action: AgentAction; onClick: () => void }) {
  const meta = getAgentMeta(action.agentType);
  const catColor = meta ? CATEGORY_COLORS[meta.category] : '#6366f1';
  const statusInfo = STATUS_CHIP[action.status] ?? STATUS_CHIP.pending;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: catColor,
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ display: 'flex', gap: 2 }}>
        {/* Left color bar */}
        <Box sx={{ width: 4, borderRadius: 1, bgcolor: catColor, flexShrink: 0 }} />

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={meta?.shortName ?? 'Agent'}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: alpha(catColor, 0.1),
                  color: catColor,
                }}
              />
              <Chip
                label={statusInfo.label}
                size="small"
                color={statusInfo.color}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={action.entityType}
                size="small"
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatTimeAgo(action.timestamp)}
            </Typography>
          </Box>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
            {action.entityName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {action.description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── DETAIL DRAWER ──────────────────────────────────────────────────────────

function ActionDetailDrawer({ action, open, onClose }: { action: AgentAction | null; open: boolean; onClose: () => void }) {
  if (!action) return null;
  const meta = getAgentMeta(action.agentType);
  const catColor = meta ? CATEGORY_COLORS[meta.category] : '#6366f1';
  const statusInfo = STATUS_CHIP[action.status] ?? STATUS_CHIP.pending;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420, borderRadius: '12px 0 0 12px' } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: catColor }}>
            Action Detail
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="text.secondary">Agent</Typography>
            <Typography variant="body1" fontWeight={600}>{meta?.name ?? 'Unknown Agent'}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">Action Type</Typography>
            <Typography variant="body1">{action.actionType.replace(/_/g, ' ')}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">Entity</Typography>
            <Typography variant="body1" fontWeight={600}>
              {action.entityName}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({action.entityType})
              </Typography>
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="overline" color="text.secondary">Description</Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>{action.description}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">AI Reasoning</Typography>
            <Card variant="outlined" sx={{ mt: 0.5, bgcolor: alpha(catColor, 0.04), borderColor: alpha(catColor, 0.15) }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {action.reasoning}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Divider />
          <Box>
            <Typography variant="overline" color="text.secondary">Outcome</Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>{action.outcome}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">Status</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={statusInfo.label} size="small" color={statusInfo.color} sx={{ fontWeight: 600 }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary">Timestamp</Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>{formatTime(action.timestamp)}</Typography>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}

// ── LIVE FEED PAGE ─────────────────────────────────────────────────────────

export default function LiveFeed() {
  const actions = useSimulationStore((s) => s.actions);
  const totalActionsToday = useSimulationStore((s) => s.totalActionsToday);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  const filteredActions = useMemo(() => {
    let result = actions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(q) ||
          a.entityName.toLowerCase().includes(q) ||
          a.actionType.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((a) => a.status === statusFilter);
    if (categoryFilter !== 'all') {
      result = result.filter((a) => {
        const meta = getAgentMeta(a.agentType);
        return meta?.category === categoryFilter;
      });
    }
    return result;
  }, [actions, search, statusFilter, categoryFilter]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4" fontWeight="bold">AI Live Feed</Typography>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              animation: 'pulse-live 2s infinite',
              '@keyframes pulse-live': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {totalActionsToday} actions today • Showing {filteredActions.length} of {actions.length}
        </Typography>
      </Box>

      {/* Filters — same Card pattern as StudentsPage */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search actions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="flagged">Flagged</MenuItem>
                <MenuItem value="escalated">Escalated</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {Object.values(AgentCategory).map((cat) => (
                  <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {(search || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <Button
                variant="outlined"
                onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
              >
                Reset
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Feed list */}
      <Stack spacing={1.5}>
        {filteredActions.slice(0, 50).map((action) => (
          <FeedCard key={action.id} action={action} onClick={() => setSelectedAction(action)} />
        ))}
        {filteredActions.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No actions match your filters</Typography>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Detail Drawer */}
      <ActionDetailDrawer action={selectedAction} open={!!selectedAction} onClose={() => setSelectedAction(null)} />
    </Box>
  );
}
