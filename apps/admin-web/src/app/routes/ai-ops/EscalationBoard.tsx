// ============================================================================
// Escalation Board — Kanban-style board with timeline details
// Clean design: white cards, readable text, proper MUI chips, spacious layout
// ============================================================================
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as ResolveIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import {
  useSimulationStore,
  getAgentMeta,
  type EscalationRecord,
} from '../../../lib/agentSimulation';

type ColumnId = 'detected' | 'hod_notified' | 'principal_notified' | 'franchise_flagged' | 'resolved';

const COLUMNS: { id: ColumnId; label: string; color: string }[] = [
  { id: 'detected', label: 'Detected', color: '#3b82f6' },
  { id: 'hod_notified', label: 'HOD Notified', color: '#f59e0b' },
  { id: 'principal_notified', label: 'Principal Notified', color: '#f97316' },
  { id: 'franchise_flagged', label: 'Franchise Flagged', color: '#ef4444' },
  { id: 'resolved', label: 'Resolved', color: '#10b981' },
];

function formatTimeAgo(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── ESCALATION CARD ────────────────────────────────────────────────────────

function EscalationCard({
  record,
  colColor,
  onClick,
}: {
  record: EscalationRecord;
  colColor: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Issue type & level badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={record.issueType.replace(/_/g, ' ')}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: alpha(colColor, 0.1),
              color: colColor,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
            }}
          />
          <Chip
            label={`L${record.level}`}
            size="small"
            color={record.level >= 2 ? 'error' : 'warning'}
            sx={{ fontWeight: 700 }}
          />
        </Box>

        {/* Entity name */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          {record.entityName}
        </Typography>

        {/* Trigger summary */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
          {record.triggerSummary}
        </Typography>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {record.assignedTo}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatTimeAgo(record.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── KANBAN COLUMN ──────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  records,
  onCardClick,
}: {
  column: (typeof COLUMNS)[0];
  records: EscalationRecord[];
  onCardClick: (r: EscalationRecord) => void;
}) {
  return (
    <Box sx={{ flex: '1 1 0', minWidth: 260, display: 'flex', flexDirection: 'column' }}>
      {/* Column header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: column.color }} />
          <Typography variant="subtitle1" fontWeight={700}>
            {column.label}
          </Typography>
        </Box>
        <Chip
          label={records.length}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha(column.color, 0.12),
            color: column.color,
          }}
        />
      </Box>

      {/* Cards container */}
      <Box
        sx={{
          flex: 1,
          bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
          borderRadius: 2,
          p: 1.5,
          minHeight: 200,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 280px)',
        }}
      >
        {records.map((record) => (
          <EscalationCard key={record.id} record={record} colColor={column.color} onClick={() => onCardClick(record)} />
        ))}
        {records.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No escalations
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ── DETAIL DIALOG ──────────────────────────────────────────────────────────

function EscalationDetailDialog({
  record,
  open,
  onClose,
  onResolve,
}: {
  record: EscalationRecord | null;
  open: boolean;
  onClose: () => void;
  onResolve: (id: string) => void;
}) {
  if (!record) return null;
  const meta = getAgentMeta(record.agentType);
  const colDef = COLUMNS.find((c) => c.id === record.column);
  const colColor = colDef?.color ?? '#3b82f6';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {record.issueType.replace(/_/g, ' ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Level {record.level} • {colDef?.label ?? 'Unknown'} • Triggered by {meta?.shortName ?? 'Agent'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="text.secondary">Entity</Typography>
            <Typography variant="body1" fontWeight={600}>{record.entityName} ({record.entityType})</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">Description</Typography>
            <Typography variant="body1">{record.description}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">Assigned To</Typography>
            <Typography variant="body1">{record.assignedTo}</Typography>
          </Box>
          {record.nextEscalationAt && (
            <Box>
              <Typography variant="overline" color="text.secondary">Next Escalation</Typography>
              <Typography variant="body1">
                {record.nextEscalationAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </Typography>
            </Box>
          )}

          <Divider />
          <Typography variant="subtitle1" fontWeight={700}>
            Escalation Timeline
          </Typography>
          <Stepper orientation="vertical" activeStep={record.timelineEvents.length - 1}>
            {record.timelineEvents.map((event, idx) => (
              <Step key={idx} completed>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color: idx === record.timelineEvents.length - 1 ? colColor : 'text.disabled',
                      '&.Mui-completed': { color: colColor },
                    },
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>{event.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">{event.description}</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    {event.timestamp.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Stack>
      </DialogContent>
      <DialogActions>
        {record.column !== 'resolved' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<ResolveIcon />}
            onClick={() => { onResolve(record.id); onClose(); }}
          >
            Mark Resolved
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── ESCALATION BOARD PAGE ──────────────────────────────────────────────────

export default function EscalationBoard() {
  const escalations = useSimulationStore((s) => s.escalations);
  const resolveEscalation = useSimulationStore((s) => s.resolveEscalation);
  const [selectedRecord, setSelectedRecord] = useState<EscalationRecord | null>(null);

  const openCount = escalations.filter((e) => e.column !== 'resolved').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight="bold">
              Escalation Board
            </Typography>
            {openCount > 0 && (
              <Chip icon={<WarningIcon />} label={`${openCount} open`} color="error" sx={{ fontWeight: 600 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {escalations.length} total escalations • {escalations.filter((e) => e.column === 'resolved').length} resolved
          </Typography>
        </Box>
      </Box>

      {/* Kanban Board */}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            records={escalations.filter((e) => e.column === column.id)}
            onCardClick={setSelectedRecord}
          />
        ))}
      </Box>

      {/* Detail Dialog */}
      <EscalationDetailDialog
        record={selectedRecord}
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onResolve={resolveEscalation}
      />
    </Box>
  );
}
