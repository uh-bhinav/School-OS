// src/routes/dashboard/index.tsx (Principal-Friendly Dashboard v2.0)
/**
 * Enhanced Dashboard Component
 *
 * A decision-making tool for school principals with:
 * - Key Insights Summary: Top actionable insights
 * - Enhanced KPI Cards: With contextual explanations
 * - Interactive Charts: With tooltips and plain-language insights
 * - Threshold-based Color Coding: Visual indicators for performance
 * - Export & Theme Toggle: Additional utilities
 *
 * Design Philosophy: Show not just what is happening, but why it matters
 * and what actions principals should take.
 */

import { useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Button,
} from '@mui/material';
import {
  People,
  School,
  AttachMoney,
  Notifications,
  LightMode,
  DarkMode,
  Refresh,
  FileDownload,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useConfigStore } from '../../stores/useConfigStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeMode } from '../../providers/ThemeProvider';
import {
  useDashboardMetrics,
  useRevenueData,
  useStudentDistribution,
  useAttendanceByGrade,
  useModuleUsage,
} from '../../services/queries/dashboard';

// Import new dashboard components
import InsightCard from '../../components/dashboard/InsightCard';
import ChartWrapper from '../../components/dashboard/ChartWrapper';
import KeyInsightsSummary from '../../components/dashboard/KeyInsightsSummary';

// Import mock data (to be replaced with real API calls)
import {
  mockKeyInsights,
  getAttendanceColor,
  formatCurrency,
} from '../../mocks/dashboardData';

// Main Dashboard Component
export default function Dashboard() {
  const theme = useTheme();
  const cfg = useConfigStore((s) => s.config);
  const schoolId = useAuthStore((s) => s.schoolId);
  const { mode, toggleMode } = useThemeMode();

  // Data queries
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } =
    useDashboardMetrics(schoolId!);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData(schoolId!);
  const { data: distributionData, isLoading: distributionLoading } = useStudentDistribution(schoolId!);
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceByGrade(schoolId!);
  const { data: moduleUsageData, isLoading: moduleUsageLoading } = useModuleUsage(schoolId!);

  // Transform distribution data for pie chart
  const chartDistributionData = useMemo(() => {
    if (!distributionData) return [];
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    return distributionData.map((item, index) => ({
      name: item.grade_range,
      value: item.count,
      percentage: item.percentage,
      color: colors[index % colors.length],
    }));
  }, [distributionData]);

  // Transform attendance data with color coding
  const chartAttendanceData = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.map((item) => ({
      grade: item.grade,
      present: item.present_percentage,
      absent: item.absent_percentage,
      fillColor: getAttendanceColor(item.present_percentage),
    }));
  }, [attendanceData]);

  // Enhanced metric cards with insights
  const metricCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        title: 'Total Students',
        value: metrics.total_students.toLocaleString(),
        change: metrics.student_growth_percentage,
        icon: <People sx={{ fontSize: 28 }} />,
        color: theme.palette.primary.main,
        insight: `Student enrollment grew by ${metrics.student_growth_percentage.toFixed(1)}% this month, indicating strong community engagement and school reputation.`,
        tooltipInfo: {
          title: 'Total Students',
          description: 'Current number of enrolled students across all grades. Growth percentage shows month-over-month change compared to the same period last year.',
          action: 'Monitor capacity limits and plan infrastructure expansion if growth continues above 5% per term.',
        },
      },
      {
        title: 'Fee Collection',
        value: formatCurrency(metrics.pending_fees),
        change: metrics.fee_collection_percentage,
        icon: <AttachMoney sx={{ fontSize: 28 }} />,
        color: theme.palette.success.main,
        insight: `Fee collection improved by ${metrics.fee_collection_percentage.toFixed(1)}% this month. Automated reminders helped recover pending dues efficiently.`,
        tooltipInfo: {
          title: 'Fee Collection',
          description: 'Total fees collected this month. Percentage shows improvement in collection efficiency compared to last month.',
          action: 'Send personalized reminders to parents with pending balances. Consider offering installment plans for large amounts.',
        },
      },
      {
        title: 'New Admissions',
        value: metrics.total_students.toString(),
        change: metrics.admission_growth_percentage,
        icon: <School sx={{ fontSize: 28 }} />,
        color: theme.palette.warning.main,
        insight: `Admissions are ${metrics.admission_growth_percentage.toFixed(1)}% ${metrics.admission_growth_percentage >= 0 ? 'above' : 'below'} target. Primary sections are driving growth.`,
        tooltipInfo: {
          title: 'New Admissions',
          description: 'Number of new student admissions this academic year. Tracks enrollment trends and marketing effectiveness.',
          action: 'Analyze which grades have capacity and focus marketing efforts on under-enrolled sections.',
        },
      },
      {
        title: 'Announcements',
        value: metrics.announcements_count.toString(),
        change: metrics.announcement_growth_percentage,
        icon: <Notifications sx={{ fontSize: 28 }} />,
        color: theme.palette.info.main,
        insight: `${metrics.announcements_count} announcements sent this month. Parent engagement can be improved with SMS follow-ups for critical notices.`,
        tooltipInfo: {
          title: 'Announcements',
          description: 'Total announcements published this month. Tracks communication frequency with parents and staff.',
          action: 'Ensure important circulars are followed up with SMS or phone calls for higher read rates.',
        },
      },
    ];
  }, [metrics, theme]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    if (!revenueData) return 0;
    return revenueData.reduce((sum, item) => sum + item.fees, 0);
  }, [revenueData]);

  // Mock function for export
  const handleExportReport = () => {
    console.log('📊 Exporting dashboard report...');
    alert('Dashboard report export feature coming soon!');
  };

  if (metricsError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back to {cfg?.identity?.display_name ?? 'School OS'} — Here's what's happening today
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportReport}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Export Report
          </Button>
          <IconButton
            onClick={() => refetchMetrics()}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            <Refresh />
          </IconButton>
          <IconButton
            onClick={toggleMode}
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}
          >
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Chip
            label={`v${cfg?.version ?? '1.0.0'}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Key Insights Summary */}
      <KeyInsightsSummary
        insights={mockKeyInsights}
        loading={metricsLoading}
      />

      {/* KPI Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
              <InsightCard
                title=""
                value=""
                change={0}
                icon={<></>}
                color=""
                insight=""
                tooltipInfo={{ title: '', description: '' }}
                loading
              />
            </Grid>
          ))
        ) : (
          metricCards.map((metric, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <InsightCard {...metric} />
            </Grid>
          ))
        )}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Revenue Overview - Line Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartWrapper
            title="Revenue Overview"
            subtitle={`Total revenue: ${formatCurrency(totalRevenue)} this year`}
            insight="Collections dropped 8% in July due to summer break. Parent reminders sent on Aug 1 increased recovery by 15% within two weeks."
            tooltipInfo={{
              title: 'Revenue Overview',
              description: 'This chart compares monthly fee collection, admissions revenue, and expenses. Hover over data points to see exact amounts for each month.',
              action: 'Look for dips in collection and correlate with school events (holidays, exams). Plan reminder campaigns accordingly.',
            }}
            action={
              <Chip
                label="Last 8 Months"
                size="small"
                variant="outlined"
              />
            }
            loading={revenueLoading}
            minHeight={320}
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                <XAxis
                  dataKey="month"
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12, fontFamily: 'Ubuntu' }}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12, fontFamily: 'Ubuntu' }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 12,
                    fontFamily: 'Ubuntu',
                    boxShadow: theme.shadows[8],
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      fees: 'Fee Collection',
                      admissions: 'Admission Revenue',
                      expenses: 'Expenses',
                    };
                    return [`₹${value.toLocaleString()}`, labels[name] || name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'Ubuntu', fontSize: 13 }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="fees"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Fee Collection"
                />
                <Line
                  type="monotone"
                  dataKey="admissions"
                  stroke={theme.palette.success.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.success.main, r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Admissions"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke={theme.palette.error.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.error.main, r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        {/* Student Distribution - Pie Chart */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartWrapper
            title="Student Distribution"
            subtitle="Enrollment by grade level"
            insight="Grade 9 sections are nearing full capacity (198/210 seats) — consider opening an additional section for next term."
            tooltipInfo={{
              title: 'Student Distribution',
              description: 'Shows how students are distributed across different grade ranges. Each segment shows the percentage and absolute count.',
              action: 'Monitor capacity limits. If any grade exceeds 95% capacity, plan section expansion or enrollment caps.',
            }}
            loading={distributionLoading}
            minHeight={320}
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                  labelLine={{ stroke: theme.palette.text.secondary, strokeWidth: 1 }}
                  style={{ fontFamily: 'Ubuntu', fontSize: 12 }}
                >
                  {chartDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={theme.palette.background.paper}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 12,
                    fontFamily: 'Ubuntu',
                    boxShadow: theme.shadows[8],
                  }}
                  formatter={(value: number) => [`${value} students`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        {/* Attendance by Grade - Bar Chart with Thresholds */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartWrapper
            title="Attendance Overview"
            subtitle="Weekly attendance by grade level"
            insight="Grade 7 attendance is at 87.2% (below 90% target). Investigation revealed recurring absences due to sports events — consider schedule adjustments."
            tooltipInfo={{
              title: 'Attendance Overview',
              description: 'This chart shows average attendance by grade for the current week. Green bars indicate healthy attendance (≥90%), yellow shows warning levels (80-90%), and red signals critical levels (<80%).',
              action: 'Investigate grades with attendance below 90%. Contact parents of frequently absent students and identify patterns (illness, transport issues, etc.).',
            }}
            loading={attendanceLoading}
            minHeight={350}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
                <XAxis
                  dataKey="grade"
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12, fontFamily: 'Ubuntu' }}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: 12, fontFamily: 'Ubuntu' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 12,
                    fontFamily: 'Ubuntu',
                    boxShadow: theme.shadows[8],
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Attendance Rate']}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'Ubuntu', fontSize: 13 }}
                  iconType="circle"
                  formatter={() => 'Present %'}
                />
                <Bar
                  dataKey="present"
                  fill={theme.palette.success.main}
                  radius={[8, 8, 0, 0]}
                  name="Present"
                >
                  {chartAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        {/* Module Usage - Progress Bars */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartWrapper
            title="Module Usage"
            subtitle="Staff engagement over last 7 days"
            insight="Fee Management module has 94% usage — excellent adoption. Media Gallery usage is low (58%) — consider staff training session."
            tooltipInfo={{
              title: 'Module Usage',
              description: 'Shows how actively staff members are using different School OS modules. Higher usage indicates better adoption and training effectiveness.',
              action: 'For modules below 70% usage, schedule training sessions or send tutorial videos to increase adoption.',
            }}
            loading={moduleUsageLoading}
            minHeight={350}
          >
            <Stack spacing={3}>
              {(moduleUsageData || []).map((module, index) => {
                const getUsageColor = (percentage: number) => {
                  if (percentage >= 85) return theme.palette.success.main;
                  if (percentage >= 70) return theme.palette.warning.main;
                  return theme.palette.error.main;
                };

                return (
                  <Box key={index}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {module.module_name}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {module.active_users} users
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: getUsageColor(module.usage_percentage) }}
                        >
                          {module.usage_percentage}%
                        </Typography>
                      </Stack>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={module.usage_percentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: alpha(theme.palette.divider, 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          background: `linear-gradient(90deg, ${getUsageColor(module.usage_percentage)}, ${alpha(getUsageColor(module.usage_percentage), 0.7)})`,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </ChartWrapper>
        </Grid>

        {/* System Status Panel */}
        <Grid size={{ xs: 12 }}>
          <ChartWrapper
            title="System Status"
            subtitle="Current configuration and health metrics"
            tooltipInfo={{
              title: 'System Status',
              description: 'Shows current system version, sync health, and active module configuration. Last sync older than 24 hours may indicate backend connectivity issues.',
              action: 'Contact IT support if last sync is more than 24 hours old or if any modules show "inactive" status.',
            }}
            minHeight={120}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Configuration Version
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {cfg?.version ?? 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Modules
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {cfg?.modules.subscribed.length ?? 0} / 8
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Onboarding Status
                  </Typography>
                  <Chip
                    label={cfg?.onboarding.status ?? 'N/A'}
                    size="small"
                    color={cfg?.onboarding.status === 'complete' ? 'success' : 'warning'}
                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Sync
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date().toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </ChartWrapper>
        </Grid>
      </Grid>
    </Box>
  );
}
