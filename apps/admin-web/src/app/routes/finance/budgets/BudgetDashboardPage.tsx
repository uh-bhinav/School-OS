// ============================================================================
// BUDGET DASHBOARD PAGE
// ============================================================================
// Main dashboard for AcadionAI Budgeting Module
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Button,
  Skeleton,
  Alert,
  Paper,
} from "@mui/material";
import {
  AccountBalance,
  TrendingUp,
  Warning,
  CheckCircle,
  Add,
  ArrowForward,
  Receipt,
  Pending,
  Refresh,
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
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useBudgets, useBudgetKPIs, useAllBudgetActivities, useAllBudgetAlerts } from "../../../services/budget.hooks";

// ============================================================================
// TYPES
// ============================================================================

interface BudgetKPIs {
  totalBudgets: number;
  activeBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  totalPending: number;
  utilizationPercentage: number;
  pendingApprovals: number;
}

interface BudgetAlert {
  id: string;
  type: string;
  message: string;
  severity: string;
}

interface BudgetActivity {
  id: string;
  description: string;
  userName: string;
  timestamp: string;
  amount?: number;
}

interface Budget {
  id: string;
  title: string;
  status: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  coordinator: { name: string };
  timeline: { eventDate: string };
}

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; positive: boolean };
}

function KPICard({ title, value, subtitle, icon, color, trend }: KPICardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Chip
                size="small"
                icon={<TrendingUp fontSize="small" />}
                label={`${trend.positive ? "+" : ""}${trend.value}%`}
                color={trend.positive ? "success" : "error"}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// BUDGET CARD COMPONENT
// ============================================================================

interface BudgetCardProps {
  budget: {
    id: string;
    title: string;
    status: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    coordinator: { name: string };
    timeline: { eventDate: string };
  };
  onClick: () => void;
}

function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const utilization = (budget.spentAmount / budget.allocatedAmount) * 100;
  const isOverBudget = utilization > 100;
  const isAtRisk = utilization > 85 && utilization <= 100;

  const getStatusColor = () => {
    if (budget.status === "completed") return "success";
    if (budget.status === "active") return "primary";
    if (budget.status === "planning") return "warning";
    return "default";
  };

  const getUtilizationColor = () => {
    if (isOverBudget) return "error";
    if (isAtRisk) return "warning";
    return "primary";
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="h6" noWrap sx={{ maxWidth: "70%" }}>
            {budget.title}
          </Typography>
          <Chip
            size="small"
            label={budget.status}
            color={getStatusColor()}
            sx={{ textTransform: "capitalize" }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Spent: ₹{budget.spentAmount.toLocaleString("en-IN")}
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {utilization.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(utilization, 100)}
            color={getUtilizationColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            of ₹{budget.allocatedAmount.toLocaleString("en-IN")} allocated
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {budget.coordinator.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(budget.timeline.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BudgetDashboardPage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: budgetsData, isLoading: budgetsLoading, error: budgetsError } = useBudgets();
  const { data: kpisData, isLoading: kpisLoading } = useBudgetKPIs();
  const { data: activitiesData, isLoading: activitiesLoading } = useAllBudgetActivities(10);
  const { data: alertsData, isLoading: alertsLoading } = useAllBudgetAlerts();

  // Cast data to proper types
  const budgets = budgetsData as Budget[] | undefined;
  const kpis = kpisData as BudgetKPIs | undefined;
  const activities = activitiesData as BudgetActivity[] | undefined;
  const alerts = alertsData as BudgetAlert[] | undefined;

  // Filter active budgets
  const activeBudgets = budgets?.filter((b) => b.status === "active") || [];

  // Prepare chart data
  const categoryData = [
    { name: "Decorations", value: 35, color: "#3b82f6" },
    { name: "Catering", value: 25, color: "#10b981" },
    { name: "Sound & Lighting", value: 15, color: "#f59e0b" },
    { name: "Prizes", value: 10, color: "#8b5cf6" },
    { name: "Costumes", value: 10, color: "#ec4899" },
    { name: "Others", value: 5, color: "#6b7280" },
  ];

  const monthlyData = [
    { month: "Sep", allocated: 50000, spent: 15000 },
    { month: "Oct", allocated: 125000, spent: 45000 },
    { month: "Nov", allocated: 275000, spent: 98000 },
    { month: "Dec", allocated: 525000, spent: 189500 },
  ];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (budgetsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load budget data. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} key={refreshKey}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Budget Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all event and department budgets
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/finance/budgets/create")}
          >
            Create Budget
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {kpisLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Total Budgets"
              value={kpis?.totalBudgets || 0}
              subtitle={`${kpis?.activeBudgets || 0} active`}
              icon={<AccountBalance />}
              color="#3b82f6"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {kpisLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Total Allocated"
              value={`₹${((kpis?.totalAllocated || 0) / 100000).toFixed(1)}L`}
              subtitle={`₹${((kpis?.totalSpent || 0) / 100000).toFixed(1)}L spent`}
              icon={<Receipt />}
              color="#10b981"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {kpisLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Utilization"
              value={`${kpis?.utilizationPercentage || 0}%`}
              subtitle="Overall budget usage"
              icon={<TrendingUp />}
              color="#f59e0b"
              trend={{ value: 5.2, positive: true }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {kpisLoading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Pending Approvals"
              value={kpis?.pendingApprovals || 0}
              subtitle="Awaiting action"
              icon={<Pending />}
              color="#ef4444"
            />
          )}
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Category Breakdown */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Budget Trend
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                  <Legend />
                  <Bar dataKey="allocated" name="Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Budgets & Activity Feed */}
      <Grid container spacing={3}>
        {/* Active Budgets */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Active Budgets</Typography>
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/finance/budgets/list")}
              >
                View All
              </Button>
            </Box>
            {budgetsLoading ? (
              <Grid container spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {activeBudgets.slice(0, 6).map((budget) => (
                  <Grid key={budget.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <BudgetCard
                      budget={budget}
                      onClick={() => navigate(`/finance/budgets/${budget.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Activity Feed & Alerts */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Alerts */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alerts
              </Typography>
              {alertsLoading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : alerts && alerts.length > 0 ? (
                <List dense disablePadding>
                  {alerts.slice(0, 3).map((alert) => (
                    <ListItem key={alert.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alert.severity === "high" ? "#fef2f2" : "#fef3c7",
                          }}
                        >
                          <Warning
                            fontSize="small"
                            sx={{ color: alert.severity === "high" ? "#ef4444" : "#f59e0b" }}
                          />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={alert.message}
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No alerts at this time
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {activitiesLoading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <List dense disablePadding>
                  {activities?.slice(0, 5).map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#e0f2fe" }}>
                          <Receipt fontSize="small" sx={{ color: "#0ea5e9" }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.description}
                        secondary={`${activity.userName} • ${new Date(activity.timestamp).toLocaleDateString("en-IN")}`}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                      {activity.amount && (
                        <Typography variant="body2" fontWeight="medium">
                          ₹{activity.amount.toLocaleString("en-IN")}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
