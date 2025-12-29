// ============================================================================
// CO ATTAINMENT DASHBOARD
// ============================================================================
// Comprehensive view of Course Outcome attainment at multiple levels:
// - Subject level: How each CO is being met across all students
// - Class level: Overall CO attainment by class
// - Student level: Individual student CO attainment
// - Drill-down capabilities for detailed analysis

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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  useCOAttainmentBySubject,
  useCOAttainmentByClass,
  useCOAttainmentByStudent,
  useSubjects,
} from "@/app/services/obe.hooks";
import { BloomLevel } from "@/app/services/obe.schema";

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

// Bloom level colors
const BLOOM_COLORS: Record<BloomLevel, string> = {
  Remember: "#E3F2FD",
  Understand: "#E8F5E9",
  Apply: "#FFF3E0",
  Analyze: "#FCE4EC",
  Evaluate: "#F3E5F5",
  Create: "#FFEBEE",
};

// Attainment status helper
const getAttainmentStatus = (percentage: number) => {
  if (percentage >= 70) return { label: "Achieved", color: "success" as const, icon: <CheckCircleIcon /> };
  if (percentage >= 50) return { label: "Partial", color: "warning" as const, icon: <WarningIcon /> };
  return { label: "Below Target", color: "error" as const, icon: <ErrorIcon /> };
};

// KPI Card component
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
  icon?: React.ReactNode;
}

function KPICard({ title, value, subtitle, trend, color = "primary.main", icon }: KPICardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {icon}
            {trend && (
              <Box sx={{ mt: 1 }}>
                {trend === "up" && <TrendingUpIcon color="success" />}
                {trend === "down" && <TrendingDownIcon color="error" />}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Attainment bar component
interface AttainmentBarProps {
  label: string;
  value: number;
  target?: number;
  showLabel?: boolean;
}

function AttainmentBar({ label, value, target = 70, showLabel = true }: AttainmentBarProps) {
  const status = getAttainmentStatus(value);

  return (
    <Box sx={{ mb: 2 }}>
      {showLabel && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" fontWeight="medium">{label}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" fontWeight="bold" color={`${status.color}.main`}>
              {value.toFixed(1)}%
            </Typography>
            <Chip label={status.label} size="small" color={status.color} sx={{ height: 20 }} />
          </Box>
        </Box>
      )}
      <Box sx={{ position: "relative" }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(value, 100)}
          sx={{ height: 10, borderRadius: 5 }}
          color={status.color}
        />
        {/* Target line */}
        <Box
          sx={{
            position: "absolute",
            left: `${target}%`,
            top: -2,
            bottom: -2,
            width: 2,
            bgcolor: "grey.700",
            "&::after": {
              content: '""',
              position: "absolute",
              top: -4,
              left: -3,
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "4px solid grey",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default function COAttainmentPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");

  // Fetch subjects
  const { data: subjects = [] } = useSubjects();

  // Fetch attainment data based on selected filters
  const {
    data: subjectAttainment = [],
    isLoading: subjectAttainmentLoading,
    refetch: refetchSubjectAttainment
  } = useCOAttainmentBySubject(selectedSubjectId || null);

  const {
    data: classAttainment = [],
    isLoading: classAttainmentLoading
  } = useCOAttainmentByClass(
    selectedSubjectId || null,
    selectedClassId || null
  );

  const {
    data: studentAttainment = [],
    isLoading: studentAttainmentLoading
  } = useCOAttainmentByStudent(
    selectedSubjectId || null,
    selectedStudentId || null
  );

  // Mock class data
  const mockClasses = [
    { id: 1, name: "Class 10-A" },
    { id: 2, name: "Class 10-B" },
    { id: 3, name: "Class 9-A" },
  ];

  // Mock student data
  const mockStudents = [
    { id: 1, name: "Rahul Sharma", roll_no: "2024001" },
    { id: 2, name: "Priya Patel", roll_no: "2024002" },
    { id: 3, name: "Amit Kumar", roll_no: "2024003" },
    { id: 4, name: "Sneha Gupta", roll_no: "2024004" },
    { id: 5, name: "Vikram Singh", roll_no: "2024005" },
  ];

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (subjectAttainment.length === 0) {
      return {
        averageAttainment: 0,
        cosAchieved: 0,
        cosPartial: 0,
        cosBelowTarget: 0,
        totalCOs: 0,
      };
    }

    const total = subjectAttainment.length;
    const avgAttainment = subjectAttainment.reduce((sum, co) => sum + co.attainment_percentage, 0) / total;
    const achieved = subjectAttainment.filter((co) => co.attainment_percentage >= 70).length;
    const partial = subjectAttainment.filter((co) => co.attainment_percentage >= 50 && co.attainment_percentage < 70).length;
    const below = subjectAttainment.filter((co) => co.attainment_percentage < 50).length;

    return {
      averageAttainment: avgAttainment,
      cosAchieved: achieved,
      cosPartial: partial,
      cosBelowTarget: below,
      totalCOs: total,
    };
  }, [subjectAttainment]);

  // Group attainment by Bloom level
  const bloomAttainment = useMemo(() => {
    const grouped = new Map<BloomLevel, { total: number; count: number }>();

    subjectAttainment.forEach((co) => {
      if (co.bloom_level) {
        const current = grouped.get(co.bloom_level) || { total: 0, count: 0 };
        grouped.set(co.bloom_level, {
          total: current.total + co.attainment_percentage,
          count: current.count + 1,
        });
      }
    });

    return Array.from(grouped.entries()).map(([level, data]) => ({
      level,
      average: data.count > 0 ? data.total / data.count : 0,
      count: data.count,
    }));
  }, [subjectAttainment]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleExportReport = () => {
    // Generate CSV
    const headers = ["CO Code", "Description", "Bloom Level", "Attainment %", "Status"];
    const rows = subjectAttainment.map((co) => [
      co.co_code,
      co.co_description,
      co.bloom_level || "N/A",
      co.attainment_percentage.toFixed(1),
      getAttainmentStatus(co.attainment_percentage).label,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `co_attainment_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            CO Attainment Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and analyze Course Outcome attainment across subjects, classes, and students
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => refetchSubjectAttainment()}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleExportReport} disabled={subjectAttainment.length === 0}>
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Subject Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Select Subject</InputLabel>
          <Select
            value={selectedSubjectId}
            label="Select Subject"
            onChange={(e) => {
              const value = e.target.value;
              setSelectedSubjectId(value as number | "");
              setSelectedClassId("");
              setSelectedStudentId("");
            }}
          >
            <MenuItem value="">
              <em>Select a subject to view attainment</em>
            </MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject.subject_id} value={subject.subject_id}>
                {subject.subject_name} ({subject.subject_code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {!selectedSubjectId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please select a subject to view CO attainment data
        </Alert>
      )}

      {selectedSubjectId && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="Average Attainment"
                value={`${summaryStats.averageAttainment.toFixed(1)}%`}
                subtitle="Across all COs"
                color={summaryStats.averageAttainment >= 70 ? "success.main" : "warning.main"}
                trend={summaryStats.averageAttainment >= 70 ? "up" : "down"}
                icon={<SchoolIcon color="primary" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="COs Achieved"
                value={summaryStats.cosAchieved}
                subtitle={`of ${summaryStats.totalCOs} total COs (≥70%)`}
                color="success.main"
                icon={<CheckCircleIcon color="success" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="Partial Attainment"
                value={summaryStats.cosPartial}
                subtitle="50-70% attainment"
                color="warning.main"
                icon={<WarningIcon color="warning" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="Below Target"
                value={summaryStats.cosBelowTarget}
                subtitle="<50% attainment"
                color="error.main"
                icon={<ErrorIcon color="error" />}
              />
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
            >
              <Tab icon={<SchoolIcon />} iconPosition="start" label="Subject Overview" />
              <Tab icon={<GroupIcon />} iconPosition="start" label="Class-wise" />
              <Tab icon={<PersonIcon />} iconPosition="start" label="Student-wise" />
            </Tabs>

            {/* Subject Overview Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ p: 3 }}>
                {subjectAttainmentLoading ? (
                  <Box>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} height={60} sx={{ mb: 2 }} />
                    ))}
                  </Box>
                ) : subjectAttainment.length === 0 ? (
                  <Alert severity="info">
                    No attainment data available for this subject yet. Complete some exams with CO-mapped questions to see data.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {/* CO-wise Attainment */}
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        CO-wise Attainment
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        {subjectAttainment.map((co) => (
                          <AttainmentBar
                            key={co.co_id}
                            label={`${co.co_code}: ${co.co_description.substring(0, 50)}...`}
                            value={co.attainment_percentage}
                          />
                        ))}
                      </Paper>
                    </Grid>

                    {/* Bloom Level Analysis */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Bloom Level Analysis
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        {bloomAttainment.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No Bloom level data available
                          </Typography>
                        ) : (
                          bloomAttainment.map((item) => (
                            <Box
                              key={item.level}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor: BLOOM_COLORS[item.level],
                              }}
                            >
                              <Box>
                                <Typography variant="body2" fontWeight="bold" textTransform="capitalize">
                                  {item.level}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.count} COs
                                </Typography>
                              </Box>
                              <Chip
                                label={`${item.average.toFixed(1)}%`}
                                size="small"
                                color={getAttainmentStatus(item.average).color}
                              />
                            </Box>
                          ))
                        )}
                      </Paper>
                    </Grid>

                    {/* Detailed Table */}
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Detailed CO Attainment
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "grey.100" }}>
                              <TableCell sx={{ fontWeight: 600 }}>CO Code</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Bloom Level</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Target %</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Actual %</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600 }}>Marks</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {subjectAttainment.map((co) => {
                              const status = getAttainmentStatus(co.attainment_percentage);
                              return (
                                <TableRow key={co.co_id} hover>
                                  <TableCell>
                                    <Chip label={co.co_code} size="small" color="primary" />
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip title={co.co_description}>
                                      <Typography variant="body2">
                                        {co.co_description.substring(0, 60)}
                                        {co.co_description.length > 60 ? "..." : ""}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    {co.bloom_level ? (
                                      <Chip
                                        label={co.bloom_level}
                                        size="small"
                                        sx={{
                                          bgcolor: BLOOM_COLORS[co.bloom_level],
                                          textTransform: "capitalize",
                                        }}
                                      />
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography variant="body2">70%</Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color={`${status.color}.main`}
                                    >
                                      {co.attainment_percentage.toFixed(1)}%
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={status.label}
                                      size="small"
                                      color={status.color}
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography variant="body2">
                                      {co.obtained_marks}/{co.max_marks}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </TabPanel>

            {/* Class-wise Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ p: 3 }}>
                <FormControl size="small" sx={{ minWidth: 200, mb: 3 }}>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClassId}
                    label="Select Class"
                    onChange={(e) => setSelectedClassId(e.target.value as number | "")}
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {mockClasses.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {classAttainmentLoading ? (
                  <Skeleton height={300} />
                ) : classAttainment.length === 0 ? (
                  <Alert severity="info">
                    Select a class to view class-specific CO attainment
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {classAttainment.map((co) => {
                      const status = getAttainmentStatus(co.attainment_percentage);
                      return (
                        <Grid key={co.co_id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                <Chip label={co.co_code} size="small" color="primary" />
                                <Chip label={status.label} size="small" color={status.color} />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                {co.co_description.substring(0, 80)}...
                              </Typography>
                              <Typography variant="h4" fontWeight="bold" color={`${status.color}.main`}>
                                {co.attainment_percentage.toFixed(1)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(co.attainment_percentage, 100)}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                color={status.color}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                {co.obtained_marks} of {co.max_marks} marks obtained
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </TabPanel>

            {/* Student-wise Tab */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ p: 3 }}>
                <FormControl size="small" sx={{ minWidth: 200, mb: 3 }}>
                  <InputLabel>Select Student</InputLabel>
                  <Select
                    value={selectedStudentId}
                    label="Select Student"
                    onChange={(e) => setSelectedStudentId(e.target.value as number | "")}
                  >
                    <MenuItem value="">Select a student</MenuItem>
                    {mockStudents.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.name} ({student.roll_no})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {!selectedStudentId ? (
                  <Alert severity="info">
                    Select a student to view their individual CO attainment
                  </Alert>
                ) : studentAttainmentLoading ? (
                  <Skeleton height={300} />
                ) : studentAttainment.length === 0 ? (
                  <Alert severity="info">
                    No attainment data available for this student
                  </Alert>
                ) : (
                  <Box>
                    {/* Student Summary Card */}
                    <Card sx={{ mb: 3, bgcolor: "primary.50" }}>
                      <CardContent>
                        <Grid container spacing={3} alignItems="center">
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {mockStudents.find((s) => s.id === selectedStudentId)?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Roll No: {mockStudents.find((s) => s.id === selectedStudentId)?.roll_no}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: "flex", gap: 3, justifyContent: { md: "flex-end" } }}>
                              <Box textAlign="center">
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                  {studentAttainment.filter((co) => co.attainment_percentage >= 70).length}
                                </Typography>
                                <Typography variant="caption">COs Achieved</Typography>
                              </Box>
                              <Box textAlign="center">
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                  {studentAttainment.filter((co) => co.attainment_percentage >= 50 && co.attainment_percentage < 70).length}
                                </Typography>
                                <Typography variant="caption">Partial</Typography>
                              </Box>
                              <Box textAlign="center">
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                  {studentAttainment.filter((co) => co.attainment_percentage < 50).length}
                                </Typography>
                                <Typography variant="caption">Below Target</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Student CO Attainment Table */}
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "grey.100" }}>
                            <TableCell sx={{ fontWeight: 600 }}>CO Code</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Marks Obtained</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Max Marks</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Attainment</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentAttainment.map((co) => {
                            const status = getAttainmentStatus(co.attainment_percentage);
                            return (
                              <TableRow key={co.co_id} hover>
                                <TableCell>
                                  <Chip label={co.co_code} size="small" color="primary" />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {co.co_description.substring(0, 50)}...
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2" fontWeight="bold">
                                    {co.obtained_marks}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {co.max_marks}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={`${status.color}.main`}
                                  >
                                    {co.attainment_percentage.toFixed(1)}%
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={status.label}
                                    size="small"
                                    color={status.color}
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </>
      )}
    </Box>
  );
}
