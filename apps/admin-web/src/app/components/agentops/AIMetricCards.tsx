// ============================================================================
// AIMetricCards — 4 KPI cards matching InsightCard design language
// Clean white cards · accent stripe · icon box · hover lift
// ============================================================================
import { Box, Card, CardContent, Typography, Stack, alpha, useTheme } from '@mui/material';
import {
  SmartToy as AgentIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSimulationStore } from '../../../lib/agentSimulation';

interface MetricDef {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function AIMetricCard({ label, value, subtitle, icon, color }: MetricDef) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          {/* Icon box */}
          <Box
            sx={{
              width: 48,
              height: 48,
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

          {/* Label */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, letterSpacing: 0.3 }}
          >
            {label}
          </Typography>

          {/* Value */}
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.7)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          {/* Subtitle pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: alpha(color, 0.08),
              color: color,
            }}
          >
            <Typography variant="caption" fontWeight={600}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AIMetricCards() {
  const totalActionsToday = useSimulationStore((s) => s.totalActionsToday);
  const agentStatuses = useSimulationStore((s) => s.agentStatuses);
  const escalations = useSimulationStore((s) => s.escalations);
  const issuesResolved = useSimulationStore((s) => s.issuesResolved);

  const activeAgents = agentStatuses.filter((a) => a.isActive).length;
  const openEscalations = escalations.filter((e) => e.column !== 'resolved').length;

  const cards: MetricDef[] = [
    {
      label: 'Active Agents',
      value: activeAgents,
      subtitle: `of ${agentStatuses.length} deployed`,
      icon: <AgentIcon sx={{ fontSize: 24 }} />,
      color: '#667eea',
    },
    {
      label: 'Actions Today',
      value: totalActionsToday,
      subtitle: 'across all agents',
      icon: <BoltIcon sx={{ fontSize: 24 }} />,
      color: '#f5576c',
    },
    {
      label: 'Issues Resolved',
      value: issuesResolved,
      subtitle: 'this session',
      icon: <CheckIcon sx={{ fontSize: 24 }} />,
      color: '#43e97b',
    },
    {
      label: 'Open Escalations',
      value: openEscalations,
      subtitle: 'require attention',
      icon: <WarningIcon sx={{ fontSize: 24 }} />,
      color: '#fa709a',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4,
      }}
    >
      {cards.map((card) => (
        <AIMetricCard key={card.label} {...card} />
      ))}
    </Box>
  );
}
