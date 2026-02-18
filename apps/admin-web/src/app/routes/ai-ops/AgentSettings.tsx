// ============================================================================
// Agent Settings — Configuration page with sliders, toggles, and per-agent params
// Clean design: proper MUI typography, readable labels, Card wrappers
// ============================================================================
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Slider,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Divider,
  Chip,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  useSimulationStore,
  ALL_AGENTS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  getAgentsByCategory,
  AgentType,
  type AgentConfig,
  type AgentConfigParameter,
} from '../../../lib/agentSimulation';

// ── PARAMETER CONTROLS ─────────────────────────────────────────────────────

function ParamControl({
  param,
  onValueChange,
}: {
  param: AgentConfigParameter;
  onValueChange: (value: number | boolean | string) => void;
}) {
  switch (param.type) {
    case 'slider':
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>{param.label}</Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              {param.value as number}{param.unit ?? ''}
            </Typography>
          </Box>
          <Slider
            value={param.value as number}
            min={param.min ?? 0}
            max={param.max ?? 100}
            step={param.step ?? 1}
            onChange={(_, v) => onValueChange(v as number)}
            size="small"
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}${param.unit ?? ''}`}
          />
          <Typography variant="body2" color="text.secondary">
            {param.description}
          </Typography>
        </Box>
      );

    case 'toggle':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" fontWeight={600}>{param.label}</Typography>
            <Typography variant="body2" color="text.secondary">{param.description}</Typography>
          </Box>
          <Switch
            checked={param.value as boolean}
            onChange={(e) => onValueChange(e.target.checked)}
          />
        </Box>
      );

    case 'number':
      return (
        <Box>
          <Typography variant="body2" fontWeight={600}>{param.label}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <TextField
              type="number"
              size="small"
              value={param.value as number}
              onChange={(e) => onValueChange(Number(e.target.value))}
              inputProps={{ min: param.min, max: param.max, step: param.step ?? 1 }}
              sx={{ width: 120 }}
            />
            {param.unit && <Typography variant="body2" color="text.secondary">{param.unit}</Typography>}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {param.description}
          </Typography>
        </Box>
      );

    case 'select':
      return (
        <Box>
          <Typography variant="body2" fontWeight={600}>{param.label}</Typography>
          <FormControl size="small" sx={{ mt: 0.5, display: 'block' }}>
            <Select
              value={param.value as string}
              onChange={(e) => onValueChange(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {param.options?.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {param.description}
          </Typography>
        </Box>
      );

    default:
      return null;
  }
}

// ── AGENT CONFIG ACCORDION ─────────────────────────────────────────────────

function AgentConfigPanel({
  agentType,
  config,
}: {
  agentType: AgentType;
  config: AgentConfig | undefined;
}) {
  const updateConfig = useSimulationStore((s) => s.updateAgentConfig);
  const toggleAgent = useSimulationStore((s) => s.toggleAgent);
  const meta = ALL_AGENTS.find((a) => a.type === agentType);
  if (!meta || !config) return null;

  const catColor = CATEGORY_COLORS[meta.category];

  return (
    <Accordion
      elevation={0}
      disableGutters
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px !important',
        mb: 1.5,
        '&:before': { display: 'none' },
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5 } }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: config.enabled ? '#22c55e' : '#d1d5db',
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: catColor }}>
            {meta.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {meta.goalStatement}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 1 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title={`${config.completeness}% of logic implemented`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
              <LinearProgress
                variant="determinate"
                value={config.completeness}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  flex: 1,
                  bgcolor: alpha(catColor, 0.1),
                  '& .MuiLinearProgress-bar': { bgcolor: catColor, borderRadius: 3 },
                }}
              />
              <Typography variant="body2" fontWeight={600} sx={{ color: catColor }}>
                {config.completeness}%
              </Typography>
            </Box>
          </Tooltip>
          <Switch checked={config.enabled} onChange={() => toggleAgent(agentType)} />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
          {meta.monitoredSignals.map((signal) => (
            <Chip key={signal} label={signal} size="small" variant="outlined" />
          ))}
        </Box>
        <Divider sx={{ mb: 2.5 }} />
        <Stack spacing={3}>
          {config.parameters.map((param) => (
            <ParamControl
              key={param.key}
              param={param}
              onValueChange={(value) => updateConfig(agentType, param.key, value)}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// ── AGENT SETTINGS PAGE ────────────────────────────────────────────────────

export default function AgentSettings() {
  const configs = useSimulationStore((s) => s.agentConfigs);
  const enabledCount = configs.filter((c) => c.enabled).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Agent Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configure thresholds, parameters, and toggles for all {ALL_AGENTS.length} agents •{' '}
          {enabledCount} currently enabled
        </Typography>
      </Box>

      {/* KPI summary cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Agents</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{ALL_AGENTS.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Enabled</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{enabledCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Disabled</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{ALL_AGENTS.length - enabledCount}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Agents grouped by category */}
      {CATEGORY_ORDER.map((category) => {
        const categoryAgents = getAgentsByCategory(category);
        const catColor = CATEGORY_COLORS[category];
        if (categoryAgents.length === 0) return null;

        return (
          <Box key={category} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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

            {categoryAgents.map((meta) => (
              <AgentConfigPanel
                key={meta.type}
                agentType={meta.type}
                config={configs.find((c) => c.agentType === meta.type)}
              />
            ))}
          </Box>
        );
      })}
    </Box>
  );
}
