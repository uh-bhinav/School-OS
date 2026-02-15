// ============================================================================
// RESULTS MODULE - Term Results, Report Cards & Promotion
// ============================================================================
// Combines subject totals, overall %, grade, CO summary, pass/fail logic.
// This is where term results, final results, and promotion logic happen.
// Data is auto-computed from Marks & CO Attainment — read-only view.

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Download as DownloadIcon,
  Lock as LockIcon,
  Publish as PublishIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

// Tab panel component
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

// Mock data for results
const MOCK_TERM_RESULTS = [
  {
    id: 1,
    student_name: "Rahul Sharma",
    roll_no: "2024001",
    class: "Grade 10 — A",
    subjects: [
      { name: "Mathematics", marks: 87, max: 100, grade: "A", co_achieved: 4, co_total: 5 },
      { name: "Science", marks: 78, max: 100, grade: "B+", co_achieved: 3, co_total: 5 },
      { name: "English", marks: 92, max: 100, grade: "A+", co_achieved: 5, co_total: 5 },
      { name: "Hindi", marks: 74, max: 100, grade: "B", co_achieved: 3, co_total: 4 },
      { name: "Social Studies", marks: 81, max: 100, grade: "A", co_achieved: 4, co_total: 5 },
    ],
    total_marks: 412,
    max_marks: 500,
    percentage: 82.4,
    overall_grade: "A",
    rank: 3,
    cos_achieved: 19,
    cos_total: 24,
    status: "published" as const,
    pass: true,
  },
  {
    id: 2,
    student_name: "Priya Patel",
    roll_no: "2024002",
    class: "Grade 10 — A",
    subjects: [
      { name: "Mathematics", marks: 95, max: 100, grade: "A+", co_achieved: 5, co_total: 5 },
      { name: "Science", marks: 88, max: 100, grade: "A", co_achieved: 4, co_total: 5 },
      { name: "English", marks: 90, max: 100, grade: "A+", co_achieved: 5, co_total: 5 },
      { name: "Hindi", marks: 82, max: 100, grade: "A", co_achieved: 4, co_total: 4 },
      { name: "Social Studies", marks: 86, max: 100, grade: "A", co_achieved: 4, co_total: 5 },
    ],
    total_marks: 441,
    max_marks: 500,
    percentage: 88.2,
    overall_grade: "A+",
    rank: 1,
    cos_achieved: 22,
    cos_total: 24,
    status: "published" as const,
    pass: true,
  },
  {
    id: 3,
    student_name: "Amit Kumar",
    roll_no: "2024003",
    class: "Grade 10 — A",
    subjects: [
      { name: "Mathematics", marks: 45, max: 100, grade: "D", co_achieved: 2, co_total: 5 },
      { name: "Science", marks: 52, max: 100, grade: "C", co_achieved: 2, co_total: 5 },
      { name: "English", marks: 61, max: 100, grade: "B", co_achieved: 3, co_total: 5 },
      { name: "Hindi", marks: 58, max: 100, grade: "C+", co_achieved: 2, co_total: 4 },
      { name: "Social Studies", marks: 49, max: 100, grade: "D", co_achieved: 2, co_total: 5 },
    ],
    total_marks: 265,
    max_marks: 500,
    percentage: 53.0,
    overall_grade: "C",
    rank: 12,
    cos_achieved: 11,
    cos_total: 24,
    status: "locked" as const,
    pass: true,
  },
  {
    id: 4,
    student_name: "Sneha Gupta",
    roll_no: "2024004",
    class: "Grade 10 — A",
    subjects: [
      { name: "Mathematics", marks: 32, max: 100, grade: "F", co_achieved: 1, co_total: 5 },
      { name: "Science", marks: 38, max: 100, grade: "F", co_achieved: 1, co_total: 5 },
      { name: "English", marks: 55, max: 100, grade: "C", co_achieved: 2, co_total: 5 },
      { name: "Hindi", marks: 42, max: 100, grade: "D", co_achieved: 1, co_total: 4 },
      { name: "Social Studies", marks: 36, max: 100, grade: "F", co_achieved: 1, co_total: 5 },
    ],
    total_marks: 203,
    max_marks: 500,
    percentage: 40.6,
    overall_grade: "D",
    rank: 28,
    cos_achieved: 6,
    cos_total: 24,
    status: "draft" as const,
    pass: false,
  },
  {
    id: 5,
    student_name: "Vikram Singh",
    roll_no: "2024005",
    class: "Grade 10 — A",
    subjects: [
      { name: "Mathematics", marks: 91, max: 100, grade: "A+", co_achieved: 5, co_total: 5 },
      { name: "Science", marks: 85, max: 100, grade: "A", co_achieved: 4, co_total: 5 },
      { name: "English", marks: 88, max: 100, grade: "A", co_achieved: 4, co_total: 5 },
      { name: "Hindi", marks: 79, max: 100, grade: "B+", co_achieved: 3, co_total: 4 },
      { name: "Social Studies", marks: 83, max: 100, grade: "A", co_achieved: 4, co_total: 5 },
    ],
    total_marks: 426,
    max_marks: 500,
    percentage: 85.2,
    overall_grade: "A",
    rank: 2,
    cos_achieved: 20,
    cos_total: 24,
    status: "published" as const,
    pass: true,
  },
];

const MOCK_PROMOTION_SUMMARY = {
  total_students: 32,
  promoted: 28,
  detained: 2,
  pending: 2,
  pass_rate: 87.5,
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "success";
  if (grade.startsWith("B")) return "info";
  if (grade.startsWith("C")) return "warning";
  return "error";
};

const getStatusChip = (status: string) => {
  switch (status) {
    case "published":
      return <Chip icon={<PublishIcon />} label="Published" size="small" color="success" />;
    case "locked":
      return <Chip icon={<LockIcon />} label="Locked" size="small" color="info" />;
    case "draft":
      return <Chip icon={<WarningIcon />} label="Draft" size="small" color="warning" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string>("10");
  const [selectedSection, setSelectedSection] = useState<string>("A");
  const [selectedExamType, setSelectedExamType] = useState<string>("mid-term");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof MOCK_TERM_RESULTS[0] | null>(null);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = MOCK_TERM_RESULTS.length;
    const passed = MOCK_TERM_RESULTS.filter((r) => r.pass).length;
    const avgPercentage = MOCK_TERM_RESULTS.reduce((sum, r) => sum + r.percentage, 0) / total;
    const topPerformer = MOCK_TERM_RESULTS.reduce((max, r) => (r.percentage > max.percentage ? r : max));
    return { total, passed, failed: total - passed, avgPercentage, topPerformer };
  }, []);

  const handleViewDetails = (student: typeof MOCK_TERM_RESULTS[0]) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Results & Report Cards
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Term results, promotion logic, and report card generation — compiled from marks & CO attainment
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} size="small">
            Print Report Cards
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="small">
            Export
          </Button>
        </Box>
      </Box>

      {/* Info Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Results are auto-generated from marks entered via the Marks module. Lock results before publishing report cards.
        Promotion decisions are based on pass/fail criteria set in school policy.
      </Alert>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Class</InputLabel>
            <Select value={selectedClass} label="Class" onChange={(e) => setSelectedClass(e.target.value)}>
              {Array.from({ length: 10 }, (_, i) => (
                <MenuItem key={i + 1} value={String(i + 1)}>Grade {i + 1}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Section</InputLabel>
            <Select value={selectedSection} label="Section" onChange={(e) => setSelectedSection(e.target.value)}>
              {["A", "B", "C", "D"].map((s) => (
                <MenuItem key={s} value={s}>Section {s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Exam Type</InputLabel>
            <Select value={selectedExamType} label="Exam Type" onChange={(e) => setSelectedExamType(e.target.value)}>
              <MenuItem value="unit-test-1">Unit Test 1</MenuItem>
              <MenuItem value="mid-term">Mid-Term</MenuItem>
              <MenuItem value="unit-test-2">Unit Test 2</MenuItem>
              <MenuItem value="final">Final Exam</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" size="small">
            Load Results
          </Button>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase">Total Students</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">{summaryStats.total}</Typography>
              <Typography variant="caption" color="text.secondary">Grade {selectedClass}-{selectedSection}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase">Average %</Typography>
              <Typography variant="h4" fontWeight="bold" color={summaryStats.avgPercentage >= 60 ? "success.main" : "warning.main"}>
                {summaryStats.avgPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">Class average</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase">Pass Rate</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {((summaryStats.passed / summaryStats.total) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">{summaryStats.passed} passed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase">Failed</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">{summaryStats.failed}</Typography>
              <Typography variant="caption" color="text.secondary">Below pass criteria</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase">Top Performer</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">{summaryStats.topPerformer.student_name}</Typography>
              <Typography variant="caption" color="text.secondary">{summaryStats.topPerformer.percentage}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Term Results" />
          <Tab icon={<CheckCircleIcon />} iconPosition="start" label="Promotion Status" />
          <Tab icon={<PrintIcon />} iconPosition="start" label="Report Cards" />
        </Tabs>

        {/* Term Results Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Term Results — Grade {selectedClass}-{selectedSection} ({selectedExamType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())})
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" startIcon={<LockIcon />} size="small" color="warning">
                  Lock All Results
                </Button>
                <Button variant="contained" startIcon={<PublishIcon />} size="small" color="success">
                  Publish Results
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Roll No</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Grade</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>COs Achieved</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Pass/Fail</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_TERM_RESULTS.map((result) => (
                    <TableRow key={result.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">#{result.rank}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{result.student_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{result.roll_no}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {result.total_marks}/{result.max_marks}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color={result.percentage >= 60 ? "success.main" : result.percentage >= 40 ? "warning.main" : "error.main"}>
                          {result.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={result.overall_grade} size="small" color={getGradeColor(result.overall_grade) as any} />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`${result.cos_achieved} of ${result.cos_total} COs achieved (≥70%)`}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {result.cos_achieved}/{result.cos_total}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(result.cos_achieved / result.cos_total) * 100}
                              sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                              color={result.cos_achieved / result.cos_total >= 0.7 ? "success" : "warning"}
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={result.pass ? "PASS" : "FAIL"}
                          size="small"
                          color={result.pass ? "success" : "error"}
                          variant="filled"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(result.status)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewDetails(result)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Promotion Status Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Promotion Summary — Grade {selectedClass}-{selectedSection}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Total Students</Typography>
                    <Typography variant="h4" fontWeight="bold">{MOCK_PROMOTION_SUMMARY.total_students}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Promoted</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">{MOCK_PROMOTION_SUMMARY.promoted}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Detained</Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">{MOCK_PROMOTION_SUMMARY.detained}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Pending Review</Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">{MOCK_PROMOTION_SUMMARY.pending}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mb: 2 }}>
              Promotion criteria: Minimum 40% overall percentage and pass in at least 3 out of 5 subjects.
              Students marked "Pending" need manual review by the admin.
            </Alert>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Roll No</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Subjects Passed</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Promotion Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_TERM_RESULTS.map((result) => {
                    const subjectsPassed = result.subjects.filter((s) => (s.marks / s.max) * 100 >= 40).length;
                    const promoted = result.percentage >= 40 && subjectsPassed >= 3;
                    return (
                      <TableRow key={result.id} hover>
                        <TableCell><Typography variant="body2" fontWeight="medium">{result.student_name}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{result.roll_no}</Typography></TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">{result.percentage.toFixed(1)}%</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{subjectsPassed}/{result.subjects.length}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={promoted ? "Promoted" : "Detained"}
                            size="small"
                            color={promoted ? "success" : "error"}
                            icon={promoted ? <CheckCircleIcon /> : <ErrorIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {!promoted ? "Below minimum criteria" : "Eligible for promotion"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Report Cards Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Report Card Generation
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Lock all results before generating report cards. Only locked/published results will appear on report cards.
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📄 Generate Report Cards
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Generate PDF report cards for Grade {selectedClass}-{selectedSection} with subject-wise marks,
                      grades, CO attainment summary, attendance, and remarks.
                    </Typography>
                    <Button variant="contained" startIcon={<PrintIcon />} fullWidth>
                      Generate for Entire Class
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📊 Result Summary Sheet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Download a consolidated Excel sheet with all student results, rankings, CO attainment,
                      and promotion status for records and analysis.
                    </Typography>
                    <Button variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                      Download Summary Sheet
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Student Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedStudent && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{selectedStudent.student_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Roll No: {selectedStudent.roll_no} • {selectedStudent.class} • Rank #{selectedStudent.rank}
                  </Typography>
                </Box>
                <Chip
                  label={`${selectedStudent.percentage.toFixed(1)}% — Grade ${selectedStudent.overall_grade}`}
                  color={getGradeColor(selectedStudent.overall_grade) as any}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              {/* Subject-wise breakdown */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Subject-wise Performance
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Marks</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Grade</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>COs Achieved</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStudent.subjects.map((subj) => (
                      <TableRow key={subj.name} hover>
                        <TableCell><Typography variant="body2" fontWeight="medium">{subj.name}</Typography></TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">{subj.marks}/{subj.max}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={(subj.marks / subj.max) * 100 >= 60 ? "success.main" : (subj.marks / subj.max) * 100 >= 40 ? "warning.main" : "error.main"}
                          >
                            {((subj.marks / subj.max) * 100).toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={subj.grade} size="small" color={getGradeColor(subj.grade) as any} />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {subj.co_achieved}/{subj.co_total}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(subj.co_achieved / subj.co_total) * 100}
                            sx={{ height: 3, borderRadius: 2, mt: 0.5 }}
                            color={subj.co_achieved / subj.co_total >= 0.7 ? "success" : "warning"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell><Typography variant="body2" fontWeight="bold">TOTAL</Typography></TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {selectedStudent.total_marks}/{selectedStudent.max_marks}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {selectedStudent.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={selectedStudent.overall_grade} size="small" color={getGradeColor(selectedStudent.overall_grade) as any} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {selectedStudent.cos_achieved}/{selectedStudent.cos_total}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* CO Summary */}
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                CO Attainment Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${selectedStudent.cos_achieved} COs Achieved`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<WarningIcon />}
                  label={`${selectedStudent.cos_total - selectedStudent.cos_achieved} COs Below Target`}
                  color={selectedStudent.cos_total - selectedStudent.cos_achieved > 0 ? "warning" : "default"}
                  variant="outlined"
                />
                <Chip
                  label={`${((selectedStudent.cos_achieved / selectedStudent.cos_total) * 100).toFixed(0)}% Overall CO Attainment`}
                  color="primary"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button variant="outlined" startIcon={<PrintIcon />}>Print Report Card</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
