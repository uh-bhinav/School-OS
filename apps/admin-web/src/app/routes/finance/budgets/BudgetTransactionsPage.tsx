// BudgetTransactionsPage.tsx - Full transactions view with filters
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { useBudgets, useBudgetTransactions, useCreateTransaction } from "../../../services/budget.hooks";

const statusColors: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  completed: "success",
  pending: "warning",
  rejected: "error",
  approved: "success",
};

export default function BudgetTransactionsPage() {
  const navigate = useNavigate();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    type: "expense",
    category: "",
    vendor_name: "",
    reference_number: "",
  });

  const { data: budgetsData } = useBudgets();
  const { data: transactionsData, isLoading } = useBudgetTransactions(
    selectedBudgetId || (budgetsData as any[])?.[0]?.id || "",
    {
      type: typeFilter !== "all" ? typeFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery || undefined,
    }
  );
  const createTransactionMutation = useCreateTransaction();

  const budgets = (budgetsData as any[]) || [];
  const transactions = (transactionsData as any[]) || [];
  const activeBudgetId = selectedBudgetId || budgets[0]?.id || "";

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

  const handleCreateTransaction = async () => {
    if (activeBudgetId) {
      await createTransactionMutation.mutateAsync({
        budgetId: activeBudgetId,
        data: newTransaction,
      });
      setCreateDialogOpen(false);
      setNewTransaction({
        description: "",
        amount: 0,
        type: "expense",
        category: "",
        vendor_name: "",
        reference_number: "",
      });
    }
  };

  const itemsPerPage = 10;
  const paginatedTransactions = transactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  if (isLoading && !transactions.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
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
            Budget Transactions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all budget transactions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Transaction
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
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
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reference</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map((tx: any) => (
                <TableRow key={tx.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {tx.reference_number || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {tx.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={tx.type}
                      color={tx.type === "expense" ? "error" : tx.type === "income" ? "success" : "info"}
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
                  <TableCell>{tx.vendor_name || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={tx.status}
                      color={statusColors[tx.status] || "default"}
                    />
                  </TableCell>
                  <TableCell>{formatDate(tx.created_at)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 8 }}>
                      <ReceiptIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                      <Typography color="text.secondary">
                        No transactions found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Description"
              fullWidth
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newTransaction.type}
                    label="Type"
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  >
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="transfer">Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Amount"
                  type="number"
                  fullWidth
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Category"
              fullWidth
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            />
            <TextField
              label="Vendor Name"
              fullWidth
              value={newTransaction.vendor_name}
              onChange={(e) => setNewTransaction({ ...newTransaction, vendor_name: e.target.value })}
            />
            <TextField
              label="Reference Number"
              fullWidth
              value={newTransaction.reference_number}
              onChange={(e) => setNewTransaction({ ...newTransaction, reference_number: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTransaction}
            disabled={!newTransaction.description || !newTransaction.amount}
          >
            Create Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
