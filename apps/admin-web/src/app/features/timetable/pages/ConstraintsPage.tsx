/**
 * Constraints Page - Configure timetable generation constraints
 * MUI-styled version for SchoolOS ERP integration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Alert,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  AccessTime as AccessTimeIcon,
  Block as BlockIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Tune as TuneIcon,
  RestartAlt as RestartIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useConstraintsStore } from '../stores';
import type { Constraints, SoftWeights } from '../lib/schemas';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`constraints-tabpanel-${index}`}
      aria-labelledby={`constraints-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Hard constraint definitions
// ONLY truly essential constraints that MUST be satisfied
// Language Sync is CRITICAL for Indian schools - relaxed ONLY as absolute last resort
const HARD_CONSTRAINTS: Array<{
  key: keyof Constraints;
  label: string;
  description: string;
  icon: React.ReactNode;
  critical?: boolean;
}> = [
  {
    key: 'language_sync_enabled',
    label: 'Language Block Synchronization',
    description: 'All language teachers for a tier (1st/2nd/3rd language) must be free during language periods. Critical for Indian schools.',
    icon: <SchoolIcon />,
    critical: true,
  },
  {
    key: 'subject_frequency_enabled',
    label: 'Subject Frequency Bounds',
    description: 'Enforce min/max periods per week for each subject',
    icon: <SchoolIcon />,
    critical: true,
  },
  {
    key: 'teacher_load_bounds_enabled',
    label: 'Teacher Load Bounds',
    description: 'Enforce min/max periods per day and week for teachers',
    icon: <PersonIcon />,
    critical: false,
  },
  {
    key: 'block_period_integrity',
    label: 'Block Period Integrity',
    description: 'Lab sessions must have consecutive periods and cannot bridge breaks',
    icon: <BlockIcon />,
    critical: false,
  },
];

// NOTE: The following were moved to SOFT CONSTRAINTS:
// - Class Teacher Period 1 (nice to have, not essential)
// - No Subject Twice Daily (preference, not requirement)
// - Core Subjects in Morning (preference, not requirement)
// - Resource Capacity Limits (handled via optimization)

// Soft weight definitions
// These are PREFERENCES that improve quality but don't block feasibility
const SOFT_WEIGHTS: Array<{
  key: keyof SoftWeights;
  label: string;
  description: string;
  category?: 'high' | 'medium' | 'low';  // For sweet spot guidance
}> = [
  // === MOVED FROM HARD CONSTRAINTS (important preferences) ===
  {
    key: 'class_teacher_period_1',
    label: 'Class Teacher in Period 1',
    description: 'Class teacher takes first period for attendance/announcements',
    category: 'high',
  },
  {
    key: 'no_subject_twice_daily',
    label: 'No Subject Twice Daily',
    description: 'Avoid same subject appearing twice in one day (except labs)',
    category: 'high',
  },
  {
    key: 'resource_capacity',
    label: 'Resource Capacity Limits',
    description: 'Respect max simultaneous usage of labs, grounds, etc.',
    category: 'high',
  },
  // === SCHEDULING PREFERENCES ===
  {
    key: 'core_morning',
    label: 'Core Subjects in Morning',
    description: 'Schedule core subjects (Math, Science, English) before lunch',
    category: 'medium',
  },
  {
    key: 'leisure_afternoon',
    label: 'Leisure Afternoon',
    description: 'Prefer leisure subjects in afternoon',
    category: 'low',
  },
  {
    key: 'avoid_pe_period_1',
    label: 'Avoid PE Period 1',
    description: 'Avoid scheduling PE in first period',
    category: 'low',
  },
  {
    key: 'avoid_pe_after_lunch',
    label: 'Avoid PE After Lunch',
    description: 'Avoid scheduling PE immediately after lunch',
    category: 'low',
  },
  // === DISTRIBUTION PREFERENCES ===
  {
    key: 'subject_distribution',
    label: 'Subject Distribution',
    description: 'Spread subjects evenly across the week',
    category: 'medium',
  },
  {
    key: 'teacher_balance',
    label: 'Teacher Balance',
    description: 'Distribute workload evenly among teachers',
    category: 'medium',
  },
  {
    key: 'minimize_gaps',
    label: 'Minimize Gaps',
    description: 'Reduce idle periods between classes',
    category: 'medium',
  },
  // === TEACHER PREFERENCES ===
  {
    key: 'teacher_free_period',
    label: 'Teacher Free Period',
    description: 'Ensure teachers have at least one free period daily',
    category: 'low',
  },
  {
    key: 'fair_slot_distribution',
    label: 'Fair Slot Distribution',
    description: 'Balance early vs late slots fairly among teachers',
    category: 'low',
  },
  {
    key: 'specialist_priority',
    label: 'Specialist Priority',
    description: 'Prioritize specialist teacher preferred slots',
    category: 'medium',
  },
];

export function ConstraintsPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const {
    constraints,
    setConstraints,
    resetConstraints,
    isDirty,
    markClean,
  } = useConstraintsStore();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleHardConstraint = (key: keyof Constraints) => {
    const currentValue = constraints[key];
    if (typeof currentValue === 'boolean') {
      setConstraints({ [key]: !currentValue });
    }
  };

  const handleSoftWeightChange = (key: keyof SoftWeights, value: number) => {
    const currentWeights: SoftWeights = constraints.soft_weights || {
      // === MOVED FROM HARD CONSTRAINTS (High Priority: 15-20) ===
      class_teacher_period_1: 15,
      no_subject_twice_daily: 15,
      resource_capacity: 18,

      // === SCHEDULING PREFERENCES (Medium Priority: 10-15) ===
      core_morning: 12,
      subject_distribution: 10,
      teacher_balance: 10,
      minimize_gaps: 10,
      specialist_priority: 8,

      // === LOWER PRIORITY PREFERENCES (5-10) ===
      leisure_afternoon: 5,
      avoid_pe_period_1: 5,
      avoid_pe_after_lunch: 5,
      teacher_free_period: 5,
      fair_slot_distribution: 5,
      thinking_break_math: 3,
      language_spread: 3,
      saturday_monday_balance: 3,
    };
    setConstraints({
      soft_weights: {
        ...currentWeights,
        [key]: value,
      },
    });
  };

  const handleTimingChange = (key: keyof Constraints, value: number | string | boolean) => {
    setConstraints({ [key]: value });
  };

  const handleSave = () => {
    markClean();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/timetable')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Timetable Constraints
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure rules and preferences for timetable generation
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isDirty && (
            <Chip label="Unsaved changes" color="warning" size="small" />
          )}
          <Tooltip title="Reset to defaults">
            <Button
              variant="outlined"
              color="warning"
              onClick={resetConstraints}
              startIcon={<RestartIcon />}
            >
              Reset
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            disabled={!isDirty}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Timing" icon={<AccessTimeIcon />} iconPosition="start" />
          <Tab label="Hard Constraints" icon={<BlockIcon />} iconPosition="start" />
          <Tab label="Soft Preferences" icon={<TuneIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <TimingPanel constraints={constraints} onChange={handleTimingChange} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <HardConstraintsPanel
          constraints={constraints}
          onToggle={handleToggleHardConstraint}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <SoftConstraintsPanel
          weights={constraints.soft_weights || {}}
          onChange={handleSoftWeightChange}
        />
      </TabPanel>
    </Box>
  );
}

interface TimingPanelProps {
  constraints: Constraints;
  onChange: (key: keyof Constraints, value: number | string | boolean) => void;
}

function TimingPanel({ constraints, onChange }: TimingPanelProps) {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Configure school timing, breaks, and assembly settings.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              School Hours
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Start Time
                </Typography>
                <Typography variant="h6">{constraints.school_start_time}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  End Time
                </Typography>
                <Typography variant="h6">{constraints.school_end_time}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Periods Per Day (Mon-Fri)
                </Typography>
                <Slider
                  value={constraints.periods_per_weekday}
                  onChange={(_, value) => onChange('periods_per_weekday', value as number)}
                  min={4}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="on"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Saturday Periods
                </Typography>
                <Slider
                  value={constraints.saturday_periods}
                  onChange={(_, value) => onChange('saturday_periods', value as number)}
                  min={0}
                  max={6}
                  step={1}
                  marks
                  valueLabelDisplay="on"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Period Duration (minutes)
                </Typography>
                <Slider
                  value={constraints.period_duration_minutes}
                  onChange={(_, value) => onChange('period_duration_minutes', value as number)}
                  min={30}
                  max={60}
                  step={5}
                  marks
                  valueLabelDisplay="on"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon />
              Assembly / Prayer
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={constraints.prayer_enabled}
                    onChange={(e) => onChange('prayer_enabled', e.target.checked)}
                  />
                }
                label="Enable Assembly / Prayer"
              />
              {constraints.prayer_enabled && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Duration (minutes)
                  </Typography>
                  <Slider
                    value={constraints.prayer_duration_minutes}
                    onChange={(_, value) => onChange('prayer_duration_minutes', value as number)}
                    min={10}
                    max={45}
                    step={5}
                    marks
                    valueLabelDisplay="on"
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              Recess
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Recess After Period
                </Typography>
                <Slider
                  value={constraints.recess_after_period}
                  onChange={(_, value) => onChange('recess_after_period', value as number)}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="on"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Recess Duration (minutes)
                </Typography>
                <Slider
                  value={constraints.recess_duration_minutes}
                  onChange={(_, value) => onChange('recess_duration_minutes', value as number)}
                  min={10}
                  max={30}
                  step={5}
                  marks
                  valueLabelDisplay="on"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              Lunch Break
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lunch After Period
                </Typography>
                <Slider
                  value={constraints.lunch_after_period}
                  onChange={(_, value) => onChange('lunch_after_period', value as number)}
                  min={3}
                  max={7}
                  step={1}
                  marks
                  valueLabelDisplay="on"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Lunch Duration (minutes)
                </Typography>
                <Slider
                  value={constraints.lunch_duration_minutes}
                  onChange={(_, value) => onChange('lunch_duration_minutes', value as number)}
                  min={20}
                  max={60}
                  step={5}
                  marks
                  valueLabelDisplay="on"
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

interface HardConstraintsPanelProps {
  constraints: Constraints;
  onToggle: (key: keyof Constraints) => void;
}

function HardConstraintsPanel({ constraints, onToggle }: HardConstraintsPanelProps) {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Hard constraints must always be satisfied. The solver will fail if these cannot be met.
      </Alert>

      <Grid container spacing={2}>
        {HARD_CONSTRAINTS.map((item) => {
          const value = constraints[item.key];
          const isEnabled = typeof value === 'boolean' ? value : false;

          return (
            <Grid size={{ xs: 12, md: 6 }} key={item.key}>
              <Card
                sx={{
                  height: '100%',
                  borderLeft: isEnabled ? 4 : 0,
                  borderColor: 'success.main',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: isEnabled ? 'success.light' : 'grey.200',
                        color: isEnabled ? 'success.dark' : 'grey.600',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {item.label}
                        </Typography>
                        {item.critical && (
                          <Chip label="Critical" size="small" color="error" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isEnabled}
                          onChange={() => onToggle(item.key)}
                        />
                      }
                      label=""
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

interface SoftConstraintsPanelProps {
  weights: Partial<SoftWeights>;
  onChange: (key: keyof SoftWeights, value: number) => void;
}

// Sweet Spot Calculation Helper
function getSweetSpotInfo(category?: 'high' | 'medium' | 'low') {
  switch (category) {
    case 'high':
      return { range: '15-20', color: 'error' as const, tip: 'High Priority - Critical preferences' };
    case 'medium':
      return { range: '10-15', color: 'warning' as const, tip: 'Medium Priority - Important preferences' };
    case 'low':
      return { range: '5-10', color: 'info' as const, tip: 'Lower Priority - Nice-to-have preferences' };
    default:
      return { range: '5-10', color: 'default' as const, tip: 'Default priority' };
  }
}

function SoftConstraintsPanel({ weights, onChange }: SoftConstraintsPanelProps) {
  // Calculate sweet spot distribution
  const sweetSpotStats = {
    high: SOFT_WEIGHTS.filter((w) => w.category === 'high').length,
    medium: SOFT_WEIGHTS.filter((w) => w.category === 'medium').length,
    low: SOFT_WEIGHTS.filter((w) => w.category === 'low').length,
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Soft constraints are preferences. Higher weights make the solver try harder to satisfy them.
      </Alert>

      {/* Sweet Spot Guide */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          🎯 Weight Sweet Spot Guide
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Chip
            size="small"
            color="error"
            label={`15-20: High Priority (${sweetSpotStats.high} constraints)`}
          />
          <Chip
            size="small"
            color="warning"
            label={`10-15: Medium Priority (${sweetSpotStats.medium} constraints)`}
          />
          <Chip
            size="small"
            color="info"
            label={`5-10: Lower Priority (${sweetSpotStats.low} constraints)`}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Tip: Keep 2-3 constraints in the high range, 4-5 in medium, and the rest in low for best results.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {SOFT_WEIGHTS.map(({ key, label, description, category }) => {
          const value = weights[key] ?? 5;
          const sweetSpot = getSweetSpotInfo(category);

          return (
            <Grid size={{ xs: 12, md: 6 }} key={key}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {label}
                  </Typography>
                  <Tooltip title={sweetSpot.tip}>
                    <Chip
                      size="small"
                      color={sweetSpot.color}
                      variant="outlined"
                      label={`Sweet: ${sweetSpot.range}`}
                    />
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Slider
                    value={value}
                    onChange={(_, v) => onChange(key, v as number)}
                    min={0}
                    max={20}
                    step={1}
                    marks={[
                      { value: 0, label: 'Off' },
                      { value: 5, label: '5' },
                      { value: 10, label: '10' },
                      { value: 15, label: '15' },
                      { value: 20, label: '20' },
                    ]}
                    sx={{ flex: 1 }}
                  />
                  <Chip
                    label={value}
                    color={
                      value === 0
                        ? 'default'
                        : value >= 15
                        ? 'error'
                        : value >= 10
                        ? 'warning'
                        : 'info'
                    }
                    size="small"
                    sx={{ minWidth: 40, justifyContent: 'center' }}
                  />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default ConstraintsPage;
