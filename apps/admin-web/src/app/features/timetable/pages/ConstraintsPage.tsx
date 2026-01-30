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
const HARD_CONSTRAINTS: Array<{
  key: keyof Constraints;
  label: string;
  description: string;
  icon: React.ReactNode;
  critical?: boolean;
}> = [
  {
    key: 'teacher_load_bounds_enabled',
    label: 'Teacher Load Bounds',
    description: 'Enforce min/max periods per day for teachers',
    icon: <PersonIcon />,
    critical: true,
  },
  {
    key: 'subject_frequency_enabled',
    label: 'Subject Frequency',
    description: 'Enforce min/max periods per week for subjects',
    icon: <SchoolIcon />,
    critical: true,
  },
  {
    key: 'block_period_integrity',
    label: 'Block Period Integrity',
    description: 'Lab and double periods must be consecutive',
    icon: <BlockIcon />,
    critical: false,
  },
  {
    key: 'resource_capacity_enabled',
    label: 'Resource Capacity',
    description: 'Respect room/lab capacity limits',
    icon: <AccessTimeIcon />,
    critical: false,
  },
  {
    key: 'language_sync_enabled',
    label: 'Language Sync',
    description: 'Schedule language classes simultaneously across sections',
    icon: <SchoolIcon />,
    critical: false,
  },
  {
    key: 'class_teacher_period_1',
    label: 'Class Teacher Period 1',
    description: 'Class teacher takes first period of the day',
    icon: <PersonIcon />,
    critical: false,
  },
  {
    key: 'no_subject_twice_daily',
    label: 'No Subject Twice Daily',
    description: 'Same subject cannot appear twice in one day',
    icon: <BlockIcon />,
    critical: false,
  },
  {
    key: 'core_morning_only',
    label: 'Core Subjects Morning Only',
    description: 'Core subjects scheduled only in morning periods',
    icon: <AccessTimeIcon />,
    critical: false,
  },
];

// Soft weight definitions
const SOFT_WEIGHTS: Array<{
  key: keyof SoftWeights;
  label: string;
  description: string;
}> = [
  {
    key: 'teacher_balance',
    label: 'Teacher Balance',
    description: 'Distribute workload evenly among teachers',
  },
  {
    key: 'minimize_gaps',
    label: 'Minimize Gaps',
    description: 'Reduce free periods between classes',
  },
  {
    key: 'core_morning',
    label: 'Core Morning',
    description: 'Prefer core subjects in morning',
  },
  {
    key: 'leisure_afternoon',
    label: 'Leisure Afternoon',
    description: 'Prefer leisure subjects in afternoon',
  },
  {
    key: 'avoid_pe_period_1',
    label: 'Avoid PE Period 1',
    description: 'Avoid scheduling PE in first period',
  },
  {
    key: 'avoid_pe_after_lunch',
    label: 'Avoid PE After Lunch',
    description: 'Avoid scheduling PE immediately after lunch',
  },
  {
    key: 'subject_distribution',
    label: 'Subject Distribution',
    description: 'Spread subjects evenly across the week',
  },
  {
    key: 'teacher_free_period',
    label: 'Teacher Free Period',
    description: 'Ensure teachers have free periods',
  },
  {
    key: 'fair_slot_distribution',
    label: 'Fair Slot Distribution',
    description: 'Balance early vs late slots fairly',
  },
  {
    key: 'specialist_priority',
    label: 'Specialist Priority',
    description: 'Prioritize specialist teacher schedules',
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
      teacher_balance: 10,
      minimize_gaps: 5,
      core_morning: 3,
      leisure_afternoon: 2,
      avoid_pe_period_1: 4,
      avoid_pe_after_lunch: 3,
      subject_distribution: 5,
      teacher_free_period: 2,
      fair_slot_distribution: 5,
      specialist_priority: 8,
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

function SoftConstraintsPanel({ weights, onChange }: SoftConstraintsPanelProps) {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Soft constraints are preferences. Higher weights make the solver try harder to satisfy them.
      </Alert>

      <Grid container spacing={3}>
        {SOFT_WEIGHTS.map(({ key, label, description }) => {
          const value = weights[key] ?? 5;

          return (
            <Grid size={{ xs: 12, md: 6 }} key={key}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {label}
                </Typography>
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
                      { value: 10, label: 'Med' },
                      { value: 20, label: 'High' },
                    ]}
                    sx={{ flex: 1 }}
                  />
                  <Chip
                    label={value}
                    color={
                      value === 0
                        ? 'default'
                        : value >= 10
                        ? 'success'
                        : 'primary'
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
