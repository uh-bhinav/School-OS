// BudgetReportsPage.tsx - Budget analytics and reports
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Skeleton,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  useBudgetAnalytics,
  useExpenseBreakdown,
  useTrendData,
  useReports,
  useGenerateReport,
  useDownloadReport,
  useDeleteReport,
} from "../../../services/budget.hooks";

const COLORS = ["#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#00BCD4", "#E91E63"];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BudgetReportsPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState("monthly");
  const [reportFormat, setReportFormat] = useState<"pdf" | "xlsx" | "csv">("pdf");

  const { data: analyticsData, isLoading: analyticsLoading } = useBudgetAnalytics();
  const { data: breakdownData, isLoading: breakdownLoading } = useExpenseBreakdown();
  const { data: trendData, isLoading: trendLoading } = useTrendData();
  const { data: reportsData } = useReports();

  const generateReportMutation = useGenerateReport();
  const downloadReportMutation = useDownloadReport();
  const deleteReportMutation = useDeleteReport();

  const analytics = analyticsData as any;
  const breakdown = (breakdownData as any[]) || [];
  const trends = (trendData as any[]) || [];
  const savedReports = (reportsData as any[]) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleGenerateReport = async () => {
    await generateReportMutation.mutateAsync({
      type: reportType,
      options: { format: reportFormat },
    });
  };

  const handleDownloadReport = async (reportId: string) => {
    await downloadReportMutation.mutateAsync(reportId);
  };

  const handleDeleteReport = async (reportId: string) => {
    await deleteReportMutation.mutateAsync(reportId);
  };

  const isLoading = analyticsLoading || breakdownLoading || trendLoading;

  // Mock data for charts
  const categoryBreakdown = breakdown.length > 0 ? breakdown : [
    { name: "Academic", value: 450000 },
    { name: "Infrastructure", value: 380000 },
    { name: "Administrative", value: 220000 },
    { name: "Technology", value: 180000 },
    { name: "Extracurricular", value: 120000 },
    { name: "Welfare", value: 80000 },
  ];

  const monthlyTrend = trends.length > 0 ? trends : [
    { month: "Jan", budget: 500000, actual: 450000 },
    { month: "Feb", budget: 500000, actual: 480000 },
    { month: "Mar", budget: 500000, actual: 520000 },
    { month: "Apr", budget: 500000, actual: 490000 },
    { month: "May", budget: 500000, actual: 510000 },
    { month: "Jun", budget: 500000, actual: 470000 },
  ];

  const departmentComparison = [
    { name: "Science", allocated: 300000, spent: 245000, utilization: 82 },
    { name: "Mathematics", allocated: 250000, spent: 198000, utilization: 79 },
    { name: "Languages", allocated: 200000, spent: 180000, utilization: 90 },
    { name: "Sports", allocated: 150000, spent: 142000, utilization: 95 },
    { name: "Arts", allocated: 100000, spent: 78000, utilization: 78 },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/finance/budgets")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Budget Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze budget performance and generate reports
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab icon={<PieChartIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Trends" />
          <Tab icon={<BarChartIcon />} iconPosition="start" label="Comparison" />
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Generated Reports" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Category Breakdown Pie Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Expense by Category
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }: any) =>
                              `${name} ${((percent || 0) * 100).toFixed(0)}%`
                            }
                          >
                            {categoryBreakdown.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Summary Stats */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Budget Summary
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Budgets</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                              {analytics?.totalBudgets || 6}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Allocated</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                              {formatCurrency(analytics?.totalAllocated || 2500000)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Spent</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                              {formatCurrency(analytics?.totalSpent || 1830000)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Remaining</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>
                              {formatCurrency(analytics?.totalRemaining || 670000)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Average Utilization</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                              {analytics?.avgUtilization?.toFixed(1) || "73.2"}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Budgets Over 90%</TableCell>
                            <TableCell align="right">
                              <Chip
                                size="small"
                                label={analytics?.budgetsOver90 || 2}
                                color="warning"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Trends Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Budget vs Actual Spending (Monthly)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        stroke="#2196F3"
                        strokeWidth={2}
                        name="Budget"
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#4CAF50"
                        strokeWidth={2}
                        name="Actual"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Comparison Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Budget Comparison
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentComparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="allocated" fill="#2196F3" name="Allocated" />
                      <Bar dataKey="spent" fill="#4CAF50" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Utilization Table */}
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Utilization Details
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="right">Allocated</TableCell>
                        <TableCell align="right">Spent</TableCell>
                        <TableCell align="right">Remaining</TableCell>
                        <TableCell align="right">Utilization</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departmentComparison.map((dept) => (
                        <TableRow key={dept.name}>
                          <TableCell>{dept.name}</TableCell>
                          <TableCell align="right">{formatCurrency(dept.allocated)}</TableCell>
                          <TableCell align="right">{formatCurrency(dept.spent)}</TableCell>
                          <TableCell align="right" sx={{ color: "success.main" }}>
                            {formatCurrency(dept.allocated - dept.spent)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              size="small"
                              label={`${dept.utilization}%`}
                              color={
                                dept.utilization >= 90
                                  ? "error"
                                  : dept.utilization >= 75
                                  ? "warning"
                                  : "success"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Generated Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            {/* Generate New Report */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate New Report
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Report Type</InputLabel>
                      <Select
                        value={reportType}
                        label="Report Type"
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <MenuItem value="monthly">Monthly Summary</MenuItem>
                        <MenuItem value="quarterly">Quarterly Report</MenuItem>
                        <MenuItem value="annual">Annual Report</MenuItem>
                        <MenuItem value="category">Category Breakdown</MenuItem>
                        <MenuItem value="department">Department Analysis</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Format</InputLabel>
                      <Select
                        value={reportFormat}
                        label="Format"
                        onChange={(e) => setReportFormat(e.target.value as any)}
                      >
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="xlsx">Excel</MenuItem>
                        <MenuItem value="csv">CSV</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleGenerateReport}
                      fullWidth
                    >
                      Generate Report
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Saved Reports */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Saved Reports
                </Typography>
                {savedReports.length > 0 ? (
                  <List>
                    {savedReports.map((report: any) => (
                      <ListItem key={report.id} divider>
                        <ListItemText
                          primary={report.name}
                          secondary={
                            <>
                              {report.type} • Generated on {formatDate(report.created_at)}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            size="small"
                            icon={report.format === "pdf" ? <PdfIcon /> : <ExcelIcon />}
                            label={report.format.toUpperCase()}
                            sx={{ mr: 1 }}
                          />
                          <IconButton
                            edge="end"
                            onClick={() => handleDownloadReport(report.id)}
                            sx={{ mr: 1 }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <AssessmentIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                    <Typography color="text.secondary">
                      No reports generated yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
}
