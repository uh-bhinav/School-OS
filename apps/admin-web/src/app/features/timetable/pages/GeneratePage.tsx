/**
 * AI Timetable Generator - Launch Page
 */

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  Tune as TuneIcon,
  TableChart as TableIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';

// Timetable Generator URL
const TIMETABLE_GENERATOR_URL = 'http://localhost:3000';

export function GeneratePage() {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenTimetableGenerator = () => {
    setIsOpening(true);
    window.open(TIMETABLE_GENERATOR_URL, '_blank', 'noopener,noreferrer');
    setTimeout(() => setIsOpening(false), 1000);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4, px: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            AI Timetable Generator
          </Typography>
          <Chip
            icon={<AIIcon sx={{ fontSize: 16 }} />}
            label="Powered by OR-Tools"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Create optimized school timetables automatically with intelligent constraint solving.
        </Typography>
      </Box>

      {/* Main Action Card */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ py: 5, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 72, mb: 2, opacity: 0.9 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Launch Timetable Generator
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, maxWidth: 500, mx: 'auto' }}>
            Configure constraints, generate schedules, and view results in an intuitive interface.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleOpenTimetableGenerator}
            disabled={isOpening}
            startIcon={<OpenInNewIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.dark',
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              '&:hover': {
                bgcolor: 'grey.100',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              },
            }}
          >
            {isOpening ? 'Opening...' : 'Open Generator'}
          </Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Key Features
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List dense>
            <ListItem>
              <ListItemIcon><PlayIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="One-Click Generation"
                secondary="Generate complete timetables in under 60 seconds"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><TuneIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Smart Constraints"
                secondary="Configure hard rules and soft preferences"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><TableIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Multiple Views"
                secondary="Class, Teacher, and Resource perspectives"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><HistoryIcon color="primary" /></ListItemIcon>
              <ListItemText
                primary="Export Options"
                secondary="Download as Excel, CSV, or PDF"
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            How It Works
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {[
              { num: '1', title: 'Load Data', desc: 'Import school data or use sample data' },
              { num: '2', title: 'Set Constraints', desc: 'Configure timing and scheduling rules' },
              { num: '3', title: 'Generate', desc: 'AI solver creates optimal schedule' },
            ].map((step) => (
              <Box key={step.num} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', flexShrink: 0, fontSize: 14,
                  }}
                >
                  {step.num}
                </Box>
                <Box>
                  <Typography fontWeight="medium" fontSize={14}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
                </Box>
              </Box>
            ))}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '50%', bgcolor: 'success.main',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography fontWeight="medium" fontSize={14}>View & Export</Typography>
                <Typography variant="body2" color="text.secondary">Browse results and download</Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Constraint Types Info */}
      <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Supported Constraints
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {[
            'No Teacher Conflicts',
            'Lab Consecutive Periods',
            'Break Time Rules',
            'Core Subjects Morning',
            'Teacher Load Balance',
            'Subject Distribution',
            'Resource Capacity',
            'Language Blocks',
          ].map((constraint) => (
            <Chip key={constraint} label={constraint} size="small" variant="outlined" />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default GeneratePage;
