// ============================================================================
// ACADEMIC ANALYTICS MODULE — formula-driven, with "How this is calculated" tooltips
// ============================================================================

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  BarChart as BarChartIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  MenuBook as SubjectIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

// Tab panel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Bloom level colors
const BLOOM_COLORS: Record<string, string> = {
  Remember: "#E3F2FD",
  Understand: "#E8F5E9",
  Apply: "#FFF3E0",
  Analyze: "#FCE4EC",
  Evaluate: "#F3E5F5",
  Create: "#FFEBEE",
};

// ── Formula Tooltip Component ──
function FormulaTooltip({ formula, description }: { formula: string; description: string }) {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
            ⓘ How this is calculated
          </Typography>
          <Typography variant="caption" display="block" sx={{ fontFamily: "monospace", mb: 0.5, bgcolor: "rgba(255,255,255,0.1)", p: 0.5, borderRadius: 0.5 }}>
            {formula}
          </Typography>
          <Typography variant="caption" color="grey.300">
            {description}
          </Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <IconButton size="small" sx={{ ml: 0.5 }}>
        <InfoIcon fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  );
}

// ── Raw Mock Data ── (simulates what the backend would return)

const RAW_GRADE_DATA = [
  { grade: "Grade 1", students: 64, total_marks_sum: 5280, total_max_sum: 6400, passed: 61, trend: "up" as const },
  { grade: "Grade 2", students: 58, total_marks_sum: 4588, total_max_sum: 5800, passed: 55, trend: "up" as const },
  { grade: "Grade 3", students: 62, total_marks_sum: 4700, total_max_sum: 6200, passed: 56, trend: "down" as const },
  { grade: "Grade 4", students: 70, total_marks_sum: 5124, total_max_sum: 7000, passed: 62, trend: "down" as const },
  { grade: "Grade 5", students: 65, total_marks_sum: 4674, total_max_sum: 6500, passed: 57, trend: "up" as const },
  { grade: "Grade 6", students: 72, total_marks_sum: 4925, total_max_sum: 7200, passed: 61, trend: "down" as const },
  { grade: "Grade 7", students: 68, total_marks_sum: 4536, total_max_sum: 6800, passed: 56, trend: "down" as const },
  { grade: "Grade 8", students: 71, total_marks_sum: 4565, total_max_sum: 7100, passed: 57, trend: "down" as const },
  { grade: "Grade 9", students: 57, total_marks_sum: 3825, total_max_sum: 5700, passed: 47, trend: "up" as const },
  { grade: "Grade 10", students: 61, total_marks_sum: 4429, total_max_sum: 6100, passed: 54, trend: "up" as const },
];

const RAW_SUBJECT_DATA = [
  { subject: "Mathematics", total_marks: 14280, total_max: 22900, total_students: 229, failed_count: 41, co_target: 5, co_achieved: 2.7 },
  { subject: "Science", total_marks: 15220, total_max: 22100, total_students: 221, failed_count: 27, co_target: 5, co_achieved: 3.2 },
  { subject: "English", total_marks: 17050, total_max: 23000, total_students: 230, failed_count: 18, co_target: 5, co_achieved: 3.8 },
  { subject: "Hindi", total_marks: 15580, total_max: 21800, total_students: 218, failed_count: 22, co_target: 4, co_achieved: 2.5 },
  { subject: "Social Studies", total_marks: 15110, total_max: 21700, total_students: 217, failed_count: 24, co_target: 5, co_achieved: 3.1 },
  { subject: "Computer Science", total_marks: 12870, total_max: 16900, total_students: 169, failed_count: 10, co_target: 4, co_achieved: 3.1 },
  { subject: "Physical Education", total_marks: 13430, total_max: 15800, total_students: 158, failed_count: 3, co_target: 3, co_achieved: 2.6 },
];

const RAW_TEACHER_DATA = [
  { name: "Dr. Sarah Wilson", subjects: ["Mathematics", "Physics"], classes: 4, total_marks: 9420, total_max: 12000, students: 120, co_achieved_count: 14, co_total: 20, pass_count: 104, trend: "up" as const },
  { name: "Mr. James Rodriguez", subjects: ["Science"], classes: 3, total_marks: 6508, total_max: 9000, students: 90, co_achieved_count: 12, co_total: 15, pass_count: 72, trend: "down" as const },
  { name: "Ms. Emily Chen", subjects: ["English", "Hindi"], classes: 5, total_marks: 12180, total_max: 15000, students: 150, co_achieved_count: 22, co_total: 25, pass_count: 138, trend: "up" as const },
  { name: "Mr. Rakesh Sharma", subjects: ["Mathematics"], classes: 3, total_marks: 5922, total_max: 9000, students: 90, co_achieved_count: 8, co_total: 15, pass_count: 65, trend: "down" as const },
  { name: "Ms. Anjali Patel", subjects: ["Social Studies"], classes: 4, total_marks: 8892, total_max: 12000, students: 120, co_achieved_count: 16, co_total: 20, pass_count: 96, trend: "up" as const },
];

const MOCK_CO_WEAKNESSES = [
  { co_code: "CO3", subject: "Mathematics", grade: "Grade 8", description: "Problem Solving & Application", attainment: 42, bloom: "Apply", students_below: 28 },
  { co_code: "CO5", subject: "Science", grade: "Grade 7", description: "Experimental Analysis", attainment: 48, bloom: "Analyze", students_below: 22 },
  { co_code: "CO2", subject: "Mathematics", grade: "Grade 9", description: "Algebraic Reasoning", attainment: 51, bloom: "Analyze", students_below: 18 },
  { co_code: "CO4", subject: "English", grade: "Grade 6", description: "Creative Writing", attainment: 55, bloom: "Create", students_below: 15 },
  { co_code: "CO1", subject: "Social Studies", grade: "Grade 8", description: "Historical Analysis", attainment: 58, bloom: "Evaluate", students_below: 14 },
];

const MOCK_BLOOM_DISTRIBUTION = [
  { level: "Remember", cos_count: 12, avg_attainment: 85.2 },
  { level: "Understand", cos_count: 18, avg_attainment: 78.6 },
  { level: "Apply", cos_count: 15, avg_attainment: 66.3 },
  { level: "Analyze", cos_count: 10, avg_attainment: 58.7 },
  { level: "Evaluate", cos_count: 7, avg_attainment: 62.1 },
  { level: "Create", cos_count: 4, avg_attainment: 54.8 },
];

// ── Computed Data ──

const getDifficultyLabel = (score: number): "Hard" | "Medium" | "Easy" => {
  if (score >= 30) return "Hard";
  if (score >= 15) return "Medium";
  return "Easy";
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Hard": return "error";
    case "Medium": return "warning";
    case "Easy": return "success";
    default: return "default";
  }
};

export default function AcademicAnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-26");

  // ── Derived: Grade Performance ──
  const gradePerformance = useMemo(() =>
    RAW_GRADE_DATA.map((g) => ({
      ...g,
      avg_percentage: Math.round((g.total_marks_sum / g.total_max_sum) * 100 * 10) / 10,
      pass_rate: Math.round((g.passed / g.students) * 100 * 10) / 10,
    })),
  []);

  // ── Derived: Subject Difficulty ──
  // Formula: Difficulty Score = (100 - Avg Score) + (Fail Rate * 0.5) + (CO Gap * 0.3)
  const subjectDifficulty = useMemo(() =>
    RAW_SUBJECT_DATA.map((s) => {
      const avg_score = Math.round((s.total_marks / s.total_max) * 100 * 10) / 10;
      const fail_rate = Math.round((s.failed_count / s.total_students) * 100 * 10) / 10;
      const co_gap = Math.round((s.co_target - s.co_achieved) * 10) / 10;
      const difficulty_score = Math.round(((100 - avg_score) + (fail_rate * 0.5) + (co_gap * 0.3)) * 10) / 10;
      return {
        subject: s.subject,
        avg_score,
        fail_rate,
        co_gap,
        difficulty_score,
        difficulty: getDifficultyLabel(difficulty_score),
      };
    }).sort((a, b) => b.difficulty_score - a.difficulty_score),
  []);

  // ── Derived: Teacher Effectiveness ──
  // Formula: Index = (Avg % * 0.4) + (% COs Achieved * 0.4) + (Pass Rate * 0.2)
  const teacherPerformance = useMemo(() =>
    RAW_TEACHER_DATA.map((t) => {
      const avg_result = Math.round((t.total_marks / t.total_max) * 100 * 10) / 10;
      const co_achievement = Math.round((t.co_achieved_count / t.co_total) * 100 * 10) / 10;
      const pass_rate = Math.round((t.pass_count / t.students) * 100 * 10) / 10;
      const effectiveness_index = Math.round((avg_result * 0.4 + co_achievement * 0.4 + pass_rate * 0.2) * 10) / 10;
      return { ...t, avg_result, co_achievement, pass_rate, effectiveness_index };
    }).sort((a, b) => b.effectiveness_index - a.effectiveness_index),
  []);

  // School-wide KPIs (computed)
  const schoolKPIs = useMemo(() => {
    const totalStudents = gradePerformance.reduce((sum, g) => sum + g.students, 0);
    const avgPerformance = Math.round(gradePerformance.reduce((sum, g) => sum + g.avg_percentage, 0) / gradePerformance.length * 10) / 10;
    const avgPassRate = Math.round(gradePerformance.reduce((sum, g) => sum + g.pass_rate, 0) / gradePerformance.length * 10) / 10;
    const weakCOs = MOCK_CO_WEAKNESSES.length;
    return { totalStudents, avgPerformance, avgPassRate, weakCOs };
  }, [gradePerformance]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Academic Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            School-wide performance insights, trends, and CO gap analysis
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Academic Year</InputLabel>
          <Select value={selectedAcademicYear} label="Academic Year" onChange={(e) => setSelectedAcademicYear(e.target.value)}>
            <MenuItem value="2025-26">2025-26</MenuItem>
            <MenuItem value="2024-25">2024-25</MenuItem>
            <MenuItem value="2023-24">2023-24</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* School-wide KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%", borderLeft: "4px solid", borderColor: "primary.main" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase">Total Students</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">{schoolKPIs.totalStudents}</Typography>
              <Typography variant="caption" color="text.secondary">Across all grades</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%", borderLeft: "4px solid", borderColor: "success.main" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">Avg Performance</Typography>
                <FormulaTooltip formula="Σ(marks) / Σ(max_marks) × 100" description="Weighted average across all grades" />
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">{schoolKPIs.avgPerformance}%</Typography>
              <Typography variant="caption" color="text.secondary">School average</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%", borderLeft: "4px solid", borderColor: "info.main" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">Avg Pass Rate</Typography>
                <FormulaTooltip formula="(Students >= 40%) / Total Students × 100" description="Students scoring ≥40% in all subjects" />
              </Box>
              <Typography variant="h4" fontWeight="bold" color="info.main">{schoolKPIs.avgPassRate}%</Typography>
              <Typography variant="caption" color="text.secondary">Across all grades</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%", borderLeft: "4px solid", borderColor: "warning.main" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">CO Gaps Identified</Typography>
                <FormulaTooltip formula="Count(COs where attainment < 60%)" description="COs below the 60% attainment target" />
              </Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">{schoolKPIs.weakCOs}</Typography>
              <Typography variant="caption" color="text.secondary">Below 60% attainment</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Grade Performance" />
          <Tab icon={<SubjectIcon />} iconPosition="start" label="Subject Difficulty" />
          <Tab icon={<WarningIcon />} iconPosition="start" label="CO Weakness Map" />
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Bloom Distribution" />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Teacher Effectiveness" />
        </Tabs>

        {/* Tab 0: Grade Performance */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>Grade-wise Performance Trend</Typography>
              <FormulaTooltip
                formula="Avg % = Σ(marks) / Σ(max_marks) × 100 | Pass Rate = passed / total × 100"
                description="Computed from all marks entries per grade. Trends compare to previous term."
              />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Students</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Avg Percentage</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Pass Rate</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Trend</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Performance Bar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gradePerformance.map((grade) => (
                    <TableRow key={grade.grade} hover>
                      <TableCell><Typography variant="body2" fontWeight="bold">{grade.grade}</Typography></TableCell>
                      <TableCell align="center">{grade.students}</TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={grade.avg_percentage >= 70 ? "success.main" : grade.avg_percentage >= 60 ? "warning.main" : "error.main"}
                        >
                          {grade.avg_percentage}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{grade.pass_rate}%</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {grade.trend === "up" ? (
                          <Chip icon={<TrendingUpIcon />} label="Up" size="small" color="success" variant="outlined" />
                        ) : (
                          <Chip icon={<TrendingDownIcon />} label="Down" size="small" color="error" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 200 }}>
                        <LinearProgress
                          variant="determinate"
                          value={grade.avg_percentage}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={grade.avg_percentage >= 70 ? "success" : grade.avg_percentage >= 60 ? "warning" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab 1: Subject Difficulty */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>Subject Difficulty Analysis</Typography>
              <FormulaTooltip
                formula="Difficulty Score = (100 - Avg Score) + (Fail Rate × 0.5) + (CO Gap × 0.3)"
                description="Higher score = harder subject. Avg Score from marks, Fail Rate = %students below 40%, CO Gap = target COs - achieved COs."
              />
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Subjects ranked by computed difficulty score. Formula: <strong>Difficulty = (100 - Avg%) + (Fail% × 0.5) + (CO Gap × 0.3)</strong>
            </Alert>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Avg Score</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Fail Rate</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        CO Gap
                        <FormulaTooltip formula="CO Gap = Target COs - Achieved COs" description="Number of COs that did not meet the 60% attainment threshold" />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        Difficulty Score
                        <FormulaTooltip formula="(100 - Avg%) + (Fail% × 0.5) + (CO Gap × 0.3)" description="Composite score — higher = more difficult" />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Difficulty</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Score Distribution</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjectDifficulty.map((subj) => (
                    <TableRow key={subj.subject} hover>
                      <TableCell><Typography variant="body2" fontWeight="bold">{subj.subject}</Typography></TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">{subj.avg_score}%</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={subj.fail_rate > 15 ? "error.main" : "text.secondary"}>
                          {subj.fail_rate}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={subj.co_gap > 2 ? "error.main" : "warning.main"}>
                          {subj.co_gap} COs
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color={subj.difficulty_score >= 30 ? "error.main" : subj.difficulty_score >= 15 ? "warning.main" : "success.main"}>
                          {subj.difficulty_score}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={subj.difficulty} size="small" color={getDifficultyColor(subj.difficulty) as any} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 200 }}>
                        <LinearProgress
                          variant="determinate"
                          value={subj.avg_score}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={subj.avg_score >= 70 ? "success" : subj.avg_score >= 60 ? "warning" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab 2: CO Weakness Map */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>CO Weakness Map — Below Target Across School</Typography>
              <FormulaTooltip
                formula="CO Attainment = Σ(marks for CO questions) / Σ(max marks for CO questions) × 100"
                description="COs where aggregated attainment across all students falls below 60%. Derived from question-level marks with CO mapping."
              />
            </Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              These Course Outcomes are below 60% attainment across the school. Action required from subject teachers to address gaps.
            </Alert>

            <Grid container spacing={2}>
              {MOCK_CO_WEAKNESSES.map((co) => (
                <Grid key={`${co.subject}-${co.co_code}`} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined" sx={{ borderLeft: "4px solid", borderColor: co.attainment < 50 ? "error.main" : "warning.main" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Chip label={co.co_code} size="small" color="primary" />
                        <Chip
                          label={co.bloom}
                          size="small"
                          sx={{ bgcolor: BLOOM_COLORS[co.bloom], textTransform: "capitalize" }}
                        />
                      </Box>
                      <Typography variant="subtitle2" fontWeight="bold">{co.subject}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{co.grade}</Typography>
                      <Typography variant="body2" sx={{ mt: 1, mb: 1.5 }}>{co.description}</Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h5" fontWeight="bold" color={co.attainment < 50 ? "error.main" : "warning.main"}>
                          {co.attainment}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {co.students_below} students below target
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={co.attainment}
                        sx={{ height: 6, borderRadius: 3, mt: 1 }}
                        color={co.attainment < 50 ? "error" : "warning"}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 3: Bloom Distribution */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>Bloom's Taxonomy Distribution & Attainment</Typography>
              <FormulaTooltip
                formula="Avg Attainment per level = Σ(CO attainment at level) / count(COs at level)"
                description="Lower-order thinking (Remember/Understand) typically has higher attainment, while higher-order (Evaluate/Create) is more challenging."
              />
            </Box>

            <Grid container spacing={3}>
              {MOCK_BLOOM_DISTRIBUTION.map((item) => (
                <Grid key={item.level} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{ bgcolor: BLOOM_COLORS[item.level] || "#f5f5f5" }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" textTransform="capitalize">
                        {item.level}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.cos_count} COs mapped to this level
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2">Avg Attainment</Typography>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={item.avg_attainment >= 70 ? "success.main" : item.avg_attainment >= 60 ? "warning.main" : "error.main"}
                        >
                          {item.avg_attainment.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.avg_attainment}
                        sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        color={item.avg_attainment >= 70 ? "success" : item.avg_attainment >= 60 ? "warning" : "error"}
                      />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {item.avg_attainment >= 70 ? "✅ On Target" : "⚠️ Below Target"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target: 70%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 4: Teacher Effectiveness */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight={600}>Teacher Effectiveness Summary</Typography>
              <FormulaTooltip
                formula="Index = (Avg % × 0.4) + (CO Achievement % × 0.4) + (Pass Rate × 0.2)"
                description="Weighted composite of student results, CO attainment rate, and pass percentage for all classes taught by the teacher."
              />
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Formula: <strong>Effectiveness = (Avg% × 0.4) + (CO% × 0.4) + (PassRate × 0.2)</strong> — Sorted by effectiveness index.
            </Alert>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Classes</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Avg Result</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>CO Achievement</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Pass Rate</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        Effectiveness
                        <FormulaTooltip formula="(Avg% × 0.4) + (CO% × 0.4) + (Pass% × 0.2)" description="Composite weighted index" />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teacherPerformance.map((teacher) => (
                    <TableRow key={teacher.name} hover>
                      <TableCell><Typography variant="body2" fontWeight="bold">{teacher.name}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {teacher.subjects.map((s) => (
                            <Chip key={s} label={s} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{teacher.classes}</TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={teacher.avg_result >= 75 ? "success.main" : teacher.avg_result >= 65 ? "warning.main" : "error.main"}
                        >
                          {teacher.avg_result}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {teacher.co_achievement}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {teacher.pass_rate}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={teacher.effectiveness_index.toFixed(1)}
                          size="small"
                          color={teacher.effectiveness_index >= 75 ? "success" : teacher.effectiveness_index >= 65 ? "warning" : "error"}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {teacher.trend === "up" ? (
                          <Chip icon={<TrendingUpIcon />} label="Improving" size="small" color="success" variant="outlined" />
                        ) : (
                          <Chip icon={<TrendingDownIcon />} label="Declining" size="small" color="error" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
