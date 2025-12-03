// BudgetListPage.tsx - List all budgets with filtering and management
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
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useBudgets, useCreateBudget, useDeleteBudget } from "../../../services/budget.hooks";

const categoryColors: Record<string, string> = {
  academic: "#4CAF50",
  infrastructure: "#2196F3",
  administrative: "#9C27B0",
  extracurricular: "#FF9800",
  technology: "#00BCD4",
  welfare: "#E91E63",
};

const statusColors: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  active: "success",
  pending: "warning",
  exceeded: "error",
  closed: "default",
  draft: "info",
};

export default function BudgetListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: "",
    category: "academic",
    allocated_amount: 0,
    fiscal_year: new Date().getFullYear().toString(),
    description: "",
  });

  const { data: budgetsData, isLoading } = useBudgets({
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    search: searchQuery || undefined,
  });
  const createBudgetMutation = useCreateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const budgets = (budgetsData as any[]) || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, budgetId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedBudgetId(budgetId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBudgetId(null);
  };

  const handleViewBudget = () => {
    if (selectedBudgetId) {
      navigate(`/finance/budgets/${selectedBudgetId}`);
    }
    handleMenuClose();
  };

  const handleEditBudget = () => {
    if (selectedBudgetId) {
      navigate(`/finance/budgets/${selectedBudgetId}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteBudget = async () => {
    if (selectedBudgetId) {
      await deleteBudgetMutation.mutateAsync(selectedBudgetId);
    }
    handleMenuClose();
  };

  const handleCreateBudget = async () => {
    await createBudgetMutation.mutateAsync(newBudget as any);
    setCreateDialogOpen(false);
    setNewBudget({
      name: "",
      category: "academic",
      allocated_amount: 0,
      fiscal_year: new Date().getFullYear().toString(),
      description: "",
    });
  };

  const getUtilizationColor = (percentage: number): "success" | "warning" | "error" => {
    if (percentage >= 90) return "error";
    if (percentage >= 75) return "warning";
    return "success";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Budget Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage departmental budgets
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/finance/budgets/create")}
        >
          Create Budget
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search budgets..."
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
            <Grid size={{ xs: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="exceeded">Exceeded</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="infrastructure">Infrastructure</MenuItem>
                  <MenuItem value="administrative">Administrative</MenuItem>
                  <MenuItem value="extracurricular">Extracurricular</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                  <MenuItem value="welfare">Welfare</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button startIcon={<FilterIcon />} fullWidth>
                More Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Budget Grid */}
      <Grid container spacing={3}>
        {budgets.map((budget: any) => {
          const utilizationPercentage = (budget.spent_amount / budget.allocated_amount) * 100;
          const remaining = budget.allocated_amount - budget.spent_amount;

          return (
            <Grid key={budget.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                  borderLeft: 4,
                  borderColor: categoryColors[budget.category] || "#grey",
                }}
                onClick={() => navigate(`/finance/budgets/${budget.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {budget.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {budget.department_name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Chip
                        size="small"
                        label={budget.status}
                        color={statusColors[budget.status] || "default"}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, budget.id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Allocated
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(budget.allocated_amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Spent
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(budget.spent_amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color={remaining < 0 ? "error" : "success.main"}
                      >
                        {formatCurrency(remaining)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Utilization
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {utilizationPercentage >= 90 && (
                          <WarningIcon fontSize="small" color="error" />
                        )}
                        <Typography variant="caption" fontWeight="medium">
                          {utilizationPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(utilizationPercentage, 100)}
                      color={getUtilizationColor(utilizationPercentage)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Chip
                      size="small"
                      label={budget.category}
                      sx={{
                        bgcolor: `${categoryColors[budget.category]}20`,
                        color: categoryColors[budget.category],
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      FY {budget.fiscal_year}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {budgets.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <TrendingUpIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No budgets found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first budget to start tracking expenses
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            Create Budget
          </Button>
        </Box>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleViewBudget}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleEditBudget}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteBudget} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create Budget Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Budget</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Budget Name"
              fullWidth
              value={newBudget.name}
              onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newBudget.category}
                label="Category"
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              >
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="infrastructure">Infrastructure</MenuItem>
                <MenuItem value="administrative">Administrative</MenuItem>
                <MenuItem value="extracurricular">Extracurricular</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="welfare">Welfare</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Allocated Amount"
              type="number"
              fullWidth
              value={newBudget.allocated_amount}
              onChange={(e) => setNewBudget({ ...newBudget, allocated_amount: Number(e.target.value) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            <TextField
              label="Fiscal Year"
              fullWidth
              value={newBudget.fiscal_year}
              onChange={(e) => setNewBudget({ ...newBudget, fiscal_year: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newBudget.description}
              onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateBudget}
            disabled={!newBudget.name || !newBudget.allocated_amount}
          >
            Create Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
