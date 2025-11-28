// BudgetPettyCashPage.tsx - Petty cash wallet management
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Skeleton,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Wallet as WalletIcon,
  TrendingDown as ExpenseIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MoneyIcon,
} from "@mui/icons-material";
import {
  useBudgets,
  usePettySummary,
  usePettyTransactions,
  useLogPettyExpense,
  useReloadPettyWallet,
} from "../../../services/budget.hooks";

export default function BudgetPettyCashPage() {
  const navigate = useNavigate();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [reloadDialogOpen, setReloadDialogOpen] = useState(false);
  const [reloadAmount, setReloadAmount] = useState(0);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: 0,
    category: "",
    receipt_number: "",
    notes: "",
  });

  const { data: budgetsData } = useBudgets();
  const budgets = (budgetsData as any[]) || [];
  const activeBudgetId = selectedBudgetId || budgets[0]?.id || "";

  const { data: summaryData, isLoading: summaryLoading } = usePettySummary(activeBudgetId);
  const { data: transactionsData, isLoading: txLoading } = usePettyTransactions(activeBudgetId);
  const logExpenseMutation = useLogPettyExpense();
  const reloadMutation = useReloadPettyWallet();

  const summary = summaryData as any;
  const transactions = (transactionsData as any[]) || [];

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogExpense = async () => {
    if (activeBudgetId) {
      await logExpenseMutation.mutateAsync({
        budgetId: activeBudgetId,
        data: newExpense,
      });
      setExpenseDialogOpen(false);
      setNewExpense({
        description: "",
        amount: 0,
        category: "",
        receipt_number: "",
        notes: "",
      });
    }
  };

  const handleReload = async () => {
    if (activeBudgetId && reloadAmount > 0) {
      await reloadMutation.mutateAsync({
        budgetId: activeBudgetId,
        amount: reloadAmount,
      });
      setReloadDialogOpen(false);
      setReloadAmount(0);
    }
  };

  const isLoading = summaryLoading || txLoading;

  if (isLoading && !summary) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  const utilizationPercentage = summary
    ? ((summary.total_limit - summary.current_balance) / summary.total_limit) * 100
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/finance/budgets")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Petty Cash Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage petty cash expenses
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setReloadDialogOpen(true)}
          >
            Reload Wallet
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setExpenseDialogOpen(true)}
          >
            Log Expense
          </Button>
        </Box>
      </Box>

      {/* Budget Selector */}
      <FormControl size="small" sx={{ mb: 3, minWidth: 250 }}>
        <InputLabel>Budget</InputLabel>
        <Select
          value={activeBudgetId}
          label="Budget"
          onChange={(e) => setSelectedBudgetId(e.target.value)}
        >
          {budgets.map((budget: any) => (
            <MenuItem key={budget.id} value={budget.id}>
              {budget.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                  <WalletIcon />
                </Avatar>
                <Typography variant="body1">Current Balance</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {formatCurrency(summary?.current_balance || 0)}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Utilized
                  </Typography>
                  <Typography variant="body2">
                    {utilizationPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={utilizationPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.2)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "white",
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: "error.light" }}>
                  <ExpenseIcon />
                </Avatar>
                <Typography variant="body1" color="text.secondary">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(summary?.total_expenses || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: "success.light" }}>
                  <MoneyIcon />
                </Avatar>
                <Typography variant="body1" color="text.secondary">
                  Wallet Limit
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(summary?.total_limit || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Maximum allowed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Recent Transactions
          </Typography>
          {transactions.length > 0 ? (
            <List>
              {transactions.map((tx: any) => (
                <ListItem
                  key={tx.id}
                  divider
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: "background.default",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: tx.type === "expense" ? "error.light" : "success.light",
                      }}
                    >
                      {tx.type === "expense" ? <ExpenseIcon /> : <RefreshIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={tx.description}
                    secondary={
                      <>
                        {tx.category && <Chip size="small" label={tx.category} sx={{ mr: 1 }} />}
                        {formatDate(tx.created_at)}
                        {tx.receipt_number && ` • Receipt: ${tx.receipt_number}`}
                      </>
                    }
                  />
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h6"
                      color={tx.type === "expense" ? "error" : "success.main"}
                      fontWeight="medium"
                    >
                      {tx.type === "expense" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Balance: {formatCurrency(tx.balance_after)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <ReceiptIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No transactions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Log your first petty cash expense
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Log Expense Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Petty Cash Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Description"
              fullWidth
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText={`Available balance: ${formatCurrency(summary?.current_balance || 0)}`}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newExpense.category}
                label="Category"
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <MenuItem value="office_supplies">Office Supplies</MenuItem>
                <MenuItem value="travel">Travel</MenuItem>
                <MenuItem value="food">Food & Refreshments</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Receipt Number"
              fullWidth
              value={newExpense.receipt_number}
              onChange={(e) => setNewExpense({ ...newExpense, receipt_number: e.target.value })}
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              value={newExpense.notes}
              onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleLogExpense}
            disabled={
              !newExpense.description ||
              !newExpense.amount ||
              newExpense.amount > (summary?.current_balance || 0)
            }
          >
            Log Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reload Wallet Dialog */}
      <Dialog open={reloadDialogOpen} onClose={() => setReloadDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reload Petty Cash Wallet</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Balance: {formatCurrency(summary?.current_balance || 0)}
            </Typography>
            <TextField
              label="Reload Amount"
              type="number"
              fullWidth
              value={reloadAmount}
              onChange={(e) => setReloadAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReloadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReload}
            disabled={reloadAmount <= 0}
          >
            Reload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
