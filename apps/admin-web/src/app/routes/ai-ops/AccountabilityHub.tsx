// ============================================================================
// Accountability Hub — Staff scores table + department overview
// Clean design matching StudentsPage: Card wrappers, readable table text,
// gradient department cards, proper MUI typography.
// ============================================================================
import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  LinearProgress,
  alpha,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  TrendingFlat as FlatIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import {
  useSimulationStore,
  type AccountabilityScore,
} from '../../../lib/agentSimulation';

const BAND_CONFIG: Record<string, { color: string; chipColor: 'success' | 'warning' | 'error'; label: string; gradient: string }> = {
  green: { color: '#10b981', chipColor: 'success', label: 'On Track', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  amber: { color: '#f59e0b', chipColor: 'warning', label: 'Needs Attention', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  red: { color: '#ef4444', chipColor: 'error', label: 'Critical', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
};

function TrendDisplay({ trend, delta }: { trend: string; delta: number }) {
  const color = trend === 'improving' ? '#10b981' : trend === 'declining' ? '#ef4444' : '#9ca3af';
  const Icon = trend === 'improving' ? UpIcon : trend === 'declining' ? DownIcon : FlatIcon;
  return (
    <Tooltip title={`${delta > 0 ? '+' : ''}${delta}% vs last period`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon sx={{ fontSize: 20, color }} />
        {delta !== 0 && (
          <Typography variant="body2" sx={{ fontWeight: 600, color }}>
            {delta > 0 ? '+' : ''}{delta}%
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

// ── DEPARTMENT SUMMARY CARDS (gradient style like StudentKPIs) ─────────────

function DepartmentSummary({ scores }: { scores: AccountabilityScore[] }) {
  const departments = useMemo(() => {
    const map = new Map<string, { total: number; count: number; red: number; amber: number; green: number }>();
    scores.forEach((s) => {
      const dept = s.department;
      const entry = map.get(dept) ?? { total: 0, count: 0, red: 0, amber: 0, green: 0 };
      entry.total += s.compositeScore;
      entry.count += 1;
      if (s.band === 'red') entry.red++;
      else if (s.band === 'amber') entry.amber++;
      else entry.green++;
      map.set(dept, entry);
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, avg: Math.round(data.total / data.count), ...data }))
      .sort((a, b) => b.avg - a.avg);
  }, [scores]);

  // Cycle through a set of attractive gradients
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  ];
  const icons = [PeopleIcon, SchoolIcon, AssessmentIcon, GavelIcon, PeopleIcon, SchoolIcon];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 2,
        mb: 4,
      }}
    >
      {departments.slice(0, 6).map((dept, i) => {
        const IconComp = icons[i % icons.length];
        return (
          <Card key={dept.name} sx={{ background: gradients[i % gradients.length], color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{dept.name}</Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{dept.avg}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
                    {dept.green > 0 && (
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>✓ {dept.green}</Typography>
                    )}
                    {dept.amber > 0 && (
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>⚠ {dept.amber}</Typography>
                    )}
                    {dept.red > 0 && (
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>✗ {dept.red}</Typography>
                    )}
                  </Box>
                </Box>
                <IconComp sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────

type SortField = 'compositeScore' | 'staffName' | 'department' | 'trend';
type SortDir = 'asc' | 'desc';

export default function AccountabilityHub() {
  const scores = useSimulationStore((s) => s.accountabilityScores);
  const [search, setSearch] = useState('');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('compositeScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filteredScores = useMemo(() => {
    let result = [...scores];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.staffName.toLowerCase().includes(q) || s.department.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)
      );
    }
    if (bandFilter !== 'all') result = result.filter((s) => s.band === bandFilter);
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'compositeScore': cmp = a.compositeScore - b.compositeScore; break;
        case 'staffName': cmp = a.staffName.localeCompare(b.staffName); break;
        case 'department': cmp = a.department.localeCompare(b.department); break;
        case 'trend': cmp = a.trendDelta - b.trendDelta; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [scores, search, bandFilter, sortField, sortDir]);

  const summary = useMemo(() => {
    const green = scores.filter((s) => s.band === 'green').length;
    const amber = scores.filter((s) => s.band === 'amber').length;
    const red = scores.filter((s) => s.band === 'red').length;
    const avg = Math.round(scores.reduce((sum, s) => sum + s.compositeScore, 0) / scores.length);
    return { green, amber, red, avg };
  }, [scores]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Accountability Hub
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {scores.length} staff tracked • School average: {summary.avg}/100 •{' '}
          {summary.green} on-track, {summary.amber} needs attention, {summary.red} critical
        </Typography>
      </Box>

      {/* Department Summary — gradient cards */}
      <DepartmentSummary scores={scores} />

      {/* Filters — Card wrapper like StudentsPage */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search staff by name, role, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon /></InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Band</InputLabel>
              <Select value={bandFilter} label="Band" onChange={(e) => setBandFilter(e.target.value)}>
                <MenuItem value="all">All Bands</MenuItem>
                <MenuItem value="green">🟢 On Track (76–100)</MenuItem>
                <MenuItem value="amber">🟡 Needs Attention (55–75)</MenuItem>
                <MenuItem value="red">🔴 Critical (&lt;55)</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => { setSearch(''); setBandFilter('all'); }}>
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table — matches StudentsPage table style */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Staff Performance ({filteredScores.length})
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'staffName'}
                      direction={sortField === 'staffName' ? sortDir : 'asc'}
                      onClick={() => handleSort('staffName')}
                    >
                      Staff
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'department'}
                      direction={sortField === 'department' ? sortDir : 'asc'}
                      onClick={() => handleSort('department')}
                    >
                      Department
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'compositeScore'}
                      direction={sortField === 'compositeScore' ? sortDir : 'desc'}
                      onClick={() => handleSort('compositeScore')}
                    >
                      Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Band</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'trend'}
                      direction={sortField === 'trend' ? sortDir : 'desc'}
                      onClick={() => handleSort('trend')}
                    >
                      Trend
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Escalation</TableCell>
                  <TableCell>Compliance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredScores.map((score) => {
                  const band = BAND_CONFIG[score.band] ?? BAND_CONFIG.amber;
                  return (
                    <TableRow key={score.id} hover sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{score.staffName}</Typography>
                          <Typography variant="body2" color="text.secondary">{score.role}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{score.department}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
                          <LinearProgress
                            variant="determinate"
                            value={score.compositeScore}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              flex: 1,
                              bgcolor: alpha(band.color, 0.12),
                              '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: band.color },
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 28 }}>
                            {score.compositeScore}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={band.label} size="small" color={band.chipColor} sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <TrendDisplay trend={score.trend} delta={score.trendDelta} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{score.components.taskCompletion}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{score.components.studentPerformance}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{score.components.attendance}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{score.components.escalationFrequency}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{score.components.adminCompliance}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredScores.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No staff found matching your filters</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
