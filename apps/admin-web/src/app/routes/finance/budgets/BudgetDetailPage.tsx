// BudgetDetailPage.tsx - Single budget view with tabs for transactions, approvals, etc.
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  LinearProgress,
  Grid,
  Divider,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Approval as ApprovalIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  useBudget,
  useBudgetTransactions,
  useBudgetActivities,
  useBudgetAlerts,
  useBudgetApprovals,
} from "../../../services/budget.hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

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

const statusColors: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  active: "success",
  pending: "warning",
  exceeded: "error",
  closed: "default",
  draft: "info",
  approved: "success",
  rejected: "error",
};

export default function BudgetDetailPage() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const { data: budgetData, isLoading: budgetLoading } = useBudget(budgetId || "");
  const { data: transactionsData } = useBudgetTransactions(budgetId || "");
  const { data: activitiesData } = useBudgetActivities(budgetId || "", 10);
  const { data: alertsData } = useBudgetAlerts(budgetId || "");
  const { data: approvalsData } = useBudgetApprovals(budgetId || "");

  const budget = budgetData as any;
  const transactions = (transactionsData as any[]) || [];
  const activities = (activitiesData as any[]) || [];
  const alerts = (alertsData as any[]) || [];
  const approvals = (approvalsData as any[]) || [];

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

  if (budgetLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (!budget) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Budget not found
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/finance/budgets")} sx={{ mt: 2 }}>
          Back to Budgets
        </Button>
      </Box>
    );
  }

  const utilizationPercentage = (budget.spent_amount / budget.allocated_amount) * 100;
  const remaining = budget.allocated_amount - budget.spent_amount;

  // Mock monthly spend data for chart
  const monthlyData = [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 38000 },
    { month: "Apr", amount: 61000 },
    { month: "May", amount: 44000 },
    { month: "Jun", amount: budget.spent_amount * 0.15 },
  ];

  // Category colors for pie chart
  const categoryColors: Record<string, string> = {
    "Venue & Logistics": "#3b82f6",
    "Catering": "#10b981",
    "Entertainment": "#f59e0b",
    "Marketing": "#8b5cf6",
    "Equipment": "#ef4444",
    "Miscellaneous": "#6b7280",
  };

  // Category data for pie chart
  const categoryData = (budget.categories || []).map((cat: { name: string; allocated: number; spent: number; color?: string }) => ({
    name: cat.name,
    value: cat.allocated,
    spent: cat.spent,
    color: cat.color || categoryColors[cat.name] || "#6b7280",
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/finance/budgets")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h4" fontWeight="bold">
              {budget.name}
            </Typography>
            <Chip
              label={budget.status}
              color={statusColors[budget.status] || "default"}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {budget.department_name} • FY {budget.fiscal_year}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />}>
          Edit Budget
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccountBalanceIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Allocated
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                {formatCurrency(budget.allocated_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingDownIcon color="error" />
                <Typography variant="body2" color="text.secondary">
                  Spent
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                {formatCurrency(budget.spent_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Remaining
                </Typography>
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={remaining < 0 ? "error" : "success.main"}
                sx={{ mt: 1 }}
              >
                {formatCurrency(remaining)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Utilization
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {utilizationPercentage.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(utilizationPercentage, 100)}
                color={
                  utilizationPercentage >= 90
                    ? "error"
                    : utilizationPercentage >= 75
                    ? "warning"
                    : "success"
                }
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: "warning.light" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <WarningIcon color="warning" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {alerts.length} Active Alert{alerts.length > 1 ? "s" : ""}
              </Typography>
              <Typography variant="body2">
                {alerts[0]?.message}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab icon={<ReceiptIcon />} iconPosition="start" label="Transactions" />
          <Tab icon={<ApprovalIcon />} iconPosition="start" label="Approvals" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Activity" />
          <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Analytics" />
        </Tabs>

        {/* Transactions Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.slice(0, 10).map((tx: any) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.type}
                          color={tx.type === "expense" ? "error" : "success"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell align="right">
                        <Typography
                          color={tx.type === "expense" ? "error" : "success.main"}
                          fontWeight="medium"
                        >
                          {tx.type === "expense" ? "-" : "+"}
                          {formatCurrency(tx.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.status}
                          color={statusColors[tx.status] || "default"}
                        />
                      </TableCell>
                      <TableCell>{formatDate(tx.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No transactions yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Approvals Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            {approvals.length > 0 ? (
              <List>
                {approvals.map((approval: any) => (
                  <ListItem key={approval.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: categoryColors[budget.category] }}>
                        <ApprovalIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={approval.description}
                      secondary={
                        <>
                          Requested by {approval.requester_name} •{" "}
                          {formatCurrency(approval.amount)} • {formatDate(approval.created_at)}
                        </>
                      }
                    />
                    <Chip
                      label={approval.status}
                      color={statusColors[approval.status] || "default"}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No approval requests
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            {activities.length > 0 ? (
              <List>
                {activities.map((activity: any) => (
                  <ListItem key={activity.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.light" }}>
                        <HistoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <>
                          {activity.performed_by_name} •{" "}
                          {new Date(activity.created_at).toLocaleString()}
                        </>
                      }
                    />
                    <Chip label={activity.action} size="small" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No activity recorded
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Category Breakdown Pie Chart */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Category Breakdown
                </Typography>
                <Card variant="outlined" sx={{ height: 340 }}>
                  <CardContent>
                    {categoryData.length > 0 ? (
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
                            label={({ name, percent }: any) =>
                              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                            }
                            labelLine={false}
                          >
                            {categoryData.map((entry: { name: string; value: number; spent: number; color: string }, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip
                            formatter={(value: any) => [formatCurrency(Number(value)), "Amount"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
                        <Typography color="text.secondary">No category data available</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Monthly Spending */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Spending
                </Typography>
                <Card variant="outlined" sx={{ height: 340 }}>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                        <ChartTooltip
                          formatter={(value: any) => [formatCurrency(Number(value)), "Spent"]}
                        />
                        <Bar dataKey="amount" fill="#1976d2" radius={[4, 4, 0, 0]}>
                          {monthlyData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === monthlyData.length - 1 ? "#4CAF50" : "#1976d2"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Category Table */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Category Details
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Allocated</TableCell>
                        <TableCell align="right">Spent</TableCell>
                        <TableCell align="right">Utilization</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryData.map((cat: { name: string; value: number; spent: number; color: string }) => {
                        const utilization = cat.value > 0 ? (cat.spent / cat.value) * 100 : 0;
                        return (
                          <TableRow key={cat.name} hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: cat.color,
                                  }}
                                />
                                {cat.name}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{formatCurrency(cat.value)}</TableCell>
                            <TableCell align="right">{formatCurrency(cat.spent)}</TableCell>
                            <TableCell align="right">
                              <Chip
                                size="small"
                                label={`${utilization.toFixed(0)}%`}
                                color={utilization > 90 ? "error" : utilization > 75 ? "warning" : "success"}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {categoryData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography color="text.secondary" sx={{ py: 2 }}>
                              No categories defined
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Budget Summary */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Budget Summary
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Category</Typography>
                        <Chip
                          label={budget.category || budget.eventType || "General"}
                          size="small"
                          sx={{
                            bgcolor: `${categoryColors[budget.category] || "#1976d2"}20`,
                            color: categoryColors[budget.category] || "#1976d2",
                          }}
                        />
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Coordinator</Typography>
                        <Typography fontWeight="medium">
                          {budget.coordinator_name || budget.coordinator?.name || "N/A"}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Start Date</Typography>
                        <Typography fontWeight="medium">
                          {formatDate(budget.start_date || budget.timeline?.startDate)}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">End Date</Typography>
                        <Typography fontWeight="medium">
                          {formatDate(budget.end_date || budget.timeline?.endDate)}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Event Date</Typography>
                        <Typography fontWeight="medium">
                          {formatDate(budget.eventDate || budget.timeline?.eventDate || budget.end_date)}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">Total Transactions</Typography>
                        <Typography fontWeight="medium">{transactions.length}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
}
