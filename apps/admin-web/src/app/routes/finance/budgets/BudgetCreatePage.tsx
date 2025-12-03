// ============================================================================
// BUDGET CREATE PAGE - 3-STEP WIZARD
// ============================================================================
// Step 1: Basic Info (title, coordinator, amount, description, timeline)
// Step 2: Category Builder with live pie chart
// Step 3: Approval Flow + Petty Cash Configuration
// ============================================================================

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  FormHelperText,
  CircularProgress,
  Stack,
  SelectChangeEvent,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Add,
  Delete,
  Edit,
  CheckCircle,
  Category,
  AccountBalance,
  EventNote,
  Wallet,
  Approval,
  Settings,
  Save,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useCreateBudget } from "../../../services/budget.hooks";

// ============================================================================
// CONSTANTS
// ============================================================================

const WIZARD_STEPS = ["Basic Information", "Categories", "Approval & Settings"];

const EVENT_TYPES = [
  "Annual Day",
  "Sports Day",
  "Science Exhibition",
  "Cultural Fest",
  "Graduation Ceremony",
  "Parent-Teacher Meeting",
  "Academic Event",
  "Workshop",
  "Field Trip",
  "Other",
];

const CATEGORY_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
  "#06b6d4", "#ef4444", "#84cc16", "#6366f1", "#f97316",
];

const CATEGORY_ICONS = [
  "Decorations", "Catering", "Sound & Lighting", "Prizes & Awards",
  "Costumes", "Venue", "Transportation", "Printing", "Miscellaneous",
];

const APPROVER_ROLES = [
  { value: "principal", label: "Principal" },
  { value: "vice_principal", label: "Vice Principal" },
  { value: "finance_head", label: "Finance Head" },
  { value: "department_head", label: "Department Head" },
  { value: "coordinator", label: "Event Coordinator" },
];

const MOCK_COORDINATORS = [
  { id: 1, name: "Sarah Johnson", role: "Event Coordinator" },
  { id: 2, name: "Michael Chen", role: "Academic Head" },
  { id: 3, name: "Priya Sharma", role: "Finance Manager" },
  { id: 4, name: "David Williams", role: "Activities Head" },
];

// ============================================================================
// TYPES
// ============================================================================

interface Step1Data {
  title: string;
  description: string;
  eventType: string;
  eventDate: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  coordinatorId: number;
}

interface CategoryData {
  id: string;
  name: string;
  allocatedAmount: number;
  icon?: string;
  color?: string;
}

interface ApprovalRule {
  id: string;
  name: string;
  minAmount: number;
  approverRole: string;
  autoApprove: boolean;
}

interface Step3Data {
  approvalEnabled: boolean;
  approvalRules: ApprovalRule[];
  pettyWalletEnabled: boolean;
  pettyWalletLimit: number;
  pettyTransactionLimit: number;
  pettyRequireReceipt: boolean;
  pettyReceiptThreshold: number;
  alertThreshold: number;
}

interface Step1Errors {
  title?: string;
  eventType?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  totalBudget?: string;
  coordinatorId?: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: CategoryData) => void;
  category?: CategoryData | null;
  usedColors: string[];
  remainingBudget: number;
}

function CategoryDialog({
  open,
  onClose,
  onSave,
  category,
  usedColors,
  remainingBudget,
}: CategoryDialogProps) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || "");
  const [amount, setAmount] = useState(category?.allocatedAmount || 0);
  const [selectedColor, setSelectedColor] = useState(
    category?.color || CATEGORY_COLORS.find((c) => !usedColors.includes(c)) || CATEGORY_COLORS[0]
  );
  const [icon, setIcon] = useState(category?.icon || "");
  const [error, setError] = useState("");

  const maxAmount = isEdit
    ? remainingBudget + (category?.allocatedAmount || 0)
    : remainingBudget;

  const handleSave = () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be positive");
      return;
    }
    if (amount > maxAmount) {
      setError(`Amount exceeds available budget (₹${maxAmount.toLocaleString("en-IN")})`);
      return;
    }

    onSave({
      id: category?.id || `cat-${Date.now()}`,
      name: name.trim(),
      allocatedAmount: amount,
      icon,
      color: selectedColor,
    });
    onClose();
  };

  // Reset state when dialog opens with different category
  const handleEnter = () => {
    setName(category?.name || "");
    setAmount(category?.allocatedAmount || 0);
    setSelectedColor(
      category?.color || CATEGORY_COLORS.find((c) => !usedColors.includes(c)) || CATEGORY_COLORS[0]
    );
    setIcon(category?.icon || "");
    setError("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }}
    >
      <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            fullWidth
            placeholder="e.g., Decorations, Catering"
            helperText="Choose a descriptive name for this budget category"
          />

          <FormControl fullWidth>
            <InputLabel>Category Type (Icon)</InputLabel>
            <Select
              value={icon}
              label="Category Type (Icon)"
              onChange={(e) => setIcon(e.target.value)}
              MenuProps={{
                disablePortal: true,
              }}
            >
              <MenuItem value="">
                <em>Select an icon</em>
              </MenuItem>
              {CATEGORY_ICONS.map((iconName) => (
                <MenuItem key={iconName} value={iconName}>
                  {iconName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Allocated Amount"
            type="number"
            value={amount || ""}
            onChange={(e) => {
              setAmount(Number(e.target.value));
              setError("");
            }}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            helperText={`Maximum available: ₹${maxAmount.toLocaleString("en-IN")}`}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Color
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {CATEGORY_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => {
                    if (!(usedColors.includes(color) && color !== category?.color)) {
                      setSelectedColor(color);
                    }
                  }}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: color,
                    cursor: usedColors.includes(color) && color !== category?.color ? "not-allowed" : "pointer",
                    border: selectedColor === color ? "3px solid #000" : "2px solid transparent",
                    opacity: usedColors.includes(color) && color !== category?.color ? 0.3 : 1,
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: usedColors.includes(color) && color !== category?.color ? "none" : "scale(1.1)"
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {isEdit ? "Update" : "Add"} Category
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// STEP 1: BASIC INFORMATION
// ============================================================================

interface Step1Props {
  data: Step1Data;
  onUpdate: (updates: Partial<Step1Data>) => void;
  errors: Step1Errors;
}

function Step1BasicInfo({ data, onUpdate, errors }: Step1Props) {
  const handleTextChange = (field: keyof Step1Data) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ [field]: e.target.value });
  };

  const handleSelectChange = (field: keyof Step1Data) => (e: SelectChangeEvent<string | number>) => {
    onUpdate({ [field]: e.target.value });
  };

  const handleNumberChange = (field: keyof Step1Data) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ [field]: Number(e.target.value) });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Alert severity="info">
        Fill in the basic details about your budget. All fields marked with * are required.
      </Alert>

      <Grid container spacing={3}>
        {/* Title */}
        <Grid size={{ xs: 12 }}>
          <TextField
            value={data.title}
            onChange={handleTextChange("title")}
            label="Budget Title *"
            fullWidth
            placeholder="e.g., Annual Day 2025"
            error={!!errors.title}
            helperText={errors.title || "A descriptive title for this budget"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalance color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Event Type */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={!!errors.eventType}>
            <InputLabel>Event Type *</InputLabel>
            <Select
              value={data.eventType}
              onChange={handleSelectChange("eventType")}
              label="Event Type *"
            >
              {EVENT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {errors.eventType || "Type of event this budget is for"}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Coordinator */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth error={!!errors.coordinatorId}>
            <InputLabel>Budget Coordinator *</InputLabel>
            <Select
              value={data.coordinatorId || ""}
              onChange={handleSelectChange("coordinatorId")}
              label="Budget Coordinator *"
            >
              <MenuItem value="">
                <em>Select a coordinator</em>
              </MenuItem>
              {MOCK_COORDINATORS.map((coord) => (
                <MenuItem key={coord.id} value={coord.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                      {coord.name.charAt(0)}
                    </Avatar>
                    {coord.name}
                    <Chip size="small" label={coord.role} variant="outlined" />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {errors.coordinatorId || "Person responsible for this budget"}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Total Budget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            value={data.totalBudget || ""}
            onChange={handleNumberChange("totalBudget")}
            label="Total Budget Amount *"
            type="number"
            fullWidth
            error={!!errors.totalBudget}
            helperText={errors.totalBudget || "Total allocated budget for this event"}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        {/* Event Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            value={data.eventDate}
            onChange={handleTextChange("eventDate")}
            label="Event Date *"
            type="date"
            fullWidth
            error={!!errors.eventDate}
            helperText={errors.eventDate || "When the event will take place"}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventNote color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Planning Period */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            value={data.startDate}
            onChange={handleTextChange("startDate")}
            label="Planning Start Date *"
            type="date"
            fullWidth
            error={!!errors.startDate}
            helperText={errors.startDate || "When budget planning begins"}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            value={data.endDate}
            onChange={handleTextChange("endDate")}
            label="Planning End Date *"
            type="date"
            fullWidth
            error={!!errors.endDate}
            helperText={errors.endDate || "Budget utilization deadline"}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            value={data.description}
            onChange={handleTextChange("description")}
            label="Description"
            multiline
            rows={3}
            fullWidth
            placeholder="Brief description of the event and budget requirements..."
            helperText="Optional: Add context about this budget"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================================
// STEP 2: CATEGORY BUILDER
// ============================================================================

interface Step2Props {
  categories: CategoryData[];
  totalBudget: number;
  onAddCategory: (category: CategoryData) => void;
  onEditCategory: (category: CategoryData) => void;
  onDeleteCategory: (id: string) => void;
}

function Step2Categories({
  categories,
  totalBudget,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: Step2Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const allocatedTotal = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0),
    [categories]
  );
  const remainingBudget = totalBudget - allocatedTotal;
  const usedColors = categories.map((c) => c.color || "");

  const pieData = useMemo(() => {
    const data = categories.map((cat) => ({
      name: cat.name,
      value: cat.allocatedAmount,
      color: cat.color || CATEGORY_COLORS[0],
    }));
    if (remainingBudget > 0) {
      data.push({
        name: "Unallocated",
        value: remainingBudget,
        color: "#e5e7eb",
      });
    }
    return data;
  }, [categories, remainingBudget]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: CategoryData) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleSave = (category: CategoryData) => {
    if (editingCategory) {
      onEditCategory(category);
    } else {
      onAddCategory(category);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Alert severity="info">
        Allocate your budget across categories. The pie chart updates in real-time as you add categories.
      </Alert>

      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%", minHeight: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Distribution
              </Typography>

              {/* Summary Stats */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Budget
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{totalBudget.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    Allocated
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ₹{allocatedTotal.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" color="text.secondary">
                    Remaining
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color={remainingBudget < 0 ? "error" : "success.main"}
                  >
                    ₹{remainingBudget.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>

              {/* Pie Chart */}
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }: any) =>
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {categories.map((cat) => (
                  <Chip
                    key={cat.id}
                    size="small"
                    label={cat.name}
                    sx={{
                      bgcolor: `${cat.color}20`,
                      color: cat.color,
                      borderColor: cat.color,
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category List */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%", minHeight: 400 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">
                  Categories ({categories.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAdd}
                  disabled={remainingBudget <= 0}
                  size="small"
                >
                  Add Category
                </Button>
              </Box>

              {categories.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "2px dashed",
                    borderColor: "grey.300",
                  }}
                >
                  <Category sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No categories added yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add categories to allocate your budget
                  </Typography>
                  <Button variant="outlined" startIcon={<Add />} onClick={handleOpenAdd}>
                    Add First Category
                  </Button>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 320 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">% of Total</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map((cat) => {
                        const percentage = ((cat.allocatedAmount / totalBudget) * 100).toFixed(1);
                        return (
                          <TableRow key={cat.id} hover>
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
                                <Typography variant="body2">{cat.name}</Typography>
                                {cat.icon && (
                                  <Chip size="small" label={cat.icon} variant="outlined" />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                ₹{cat.allocatedAmount.toLocaleString("en-IN")}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                size="small"
                                label={`${percentage}%`}
                                sx={{ bgcolor: `${cat.color}20`, color: cat.color }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => handleOpenEdit(cat)}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => onDeleteCategory(cat.id)}
                                color="error"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {remainingBudget < 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Budget over-allocated by ₹{Math.abs(remainingBudget).toLocaleString("en-IN")}!
                  Please reduce category amounts.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        category={editingCategory}
        usedColors={usedColors}
        remainingBudget={remainingBudget + (editingCategory?.allocatedAmount || 0)}
      />
    </Box>
  );
}

// ============================================================================
// STEP 3: APPROVAL & PETTY CASH
// ============================================================================

interface Step3Props {
  data: Step3Data;
  onUpdate: (data: Partial<Step3Data>) => void;
}

function Step3ApprovalSettings({ data, onUpdate }: Step3Props) {
  const [newRuleDialog, setNewRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);

  const handleAddRule = (rule: ApprovalRule) => {
    onUpdate({
      approvalRules: [...data.approvalRules, rule],
    });
    setNewRuleDialog(false);
    setEditingRule(null);
  };

  const handleEditRule = (rule: ApprovalRule) => {
    onUpdate({
      approvalRules: data.approvalRules.map((r) => (r.id === rule.id ? rule : r)),
    });
    setNewRuleDialog(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    onUpdate({
      approvalRules: data.approvalRules.filter((r) => r.id !== id),
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Alert severity="info">
        Configure approval workflow and petty cash settings. These can be modified later in budget settings.
      </Alert>

      <Grid container spacing={3}>
        {/* Approval Workflow Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Approval color="primary" />
                <Typography variant="h6">Approval Workflow</Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={data.approvalEnabled}
                    onChange={(e) => onUpdate({ approvalEnabled: e.target.checked })}
                  />
                }
                label="Enable approval workflow for expenses"
              />

              {data.approvalEnabled && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2">Approval Rules</Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        setEditingRule(null);
                        setNewRuleDialog(true);
                      }}
                    >
                      Add Rule
                    </Button>
                  </Box>

                  {data.approvalRules.length === 0 ? (
                    <Box
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        border: "1px dashed",
                        borderColor: "grey.300",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No approval rules configured
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {data.approvalRules.map((rule, index) => (
                        <Paper
                          key={rule.id}
                          variant="outlined"
                          sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip size="small" label={index + 1} color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {rule.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rule.minAmount > 0
                                ? `₹${rule.minAmount.toLocaleString("en-IN")}+ → `
                                : "All amounts → "}
                              {APPROVER_ROLES.find((r) => r.value === rule.approverRole)?.label}
                              {rule.autoApprove && " (Auto)"}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingRule(rule);
                              setNewRuleDialog(true);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Petty Cash Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Wallet color="primary" />
                <Typography variant="h6">Petty Cash Wallet</Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={data.pettyWalletEnabled}
                    onChange={(e) => onUpdate({ pettyWalletEnabled: e.target.checked })}
                  />
                }
                label="Enable petty cash wallet"
              />

              {data.pettyWalletEnabled && (
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Monthly Limit"
                    type="number"
                    value={data.pettyWalletLimit}
                    onChange={(e) => onUpdate({ pettyWalletLimit: Number(e.target.value) })}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    helperText="Maximum petty cash per month"
                  />

                  <TextField
                    label="Per Transaction Limit"
                    type="number"
                    value={data.pettyTransactionLimit}
                    onChange={(e) => onUpdate({ pettyTransactionLimit: Number(e.target.value) })}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    helperText="Maximum amount per transaction"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.pettyRequireReceipt}
                        onChange={(e) => onUpdate({ pettyRequireReceipt: e.target.checked })}
                      />
                    }
                    label="Require receipt for expenses"
                  />

                  {data.pettyRequireReceipt && (
                    <TextField
                      label="Receipt Threshold"
                      type="number"
                      value={data.pettyReceiptThreshold}
                      onChange={(e) => onUpdate({ pettyReceiptThreshold: Number(e.target.value) })}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      helperText="Receipt required above this amount"
                    />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alert Threshold */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Settings color="primary" />
                <Typography variant="h6">Alert Settings</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Trigger alerts when budget utilization reaches this threshold
              </Typography>

              <Box sx={{ px: 2 }}>
                <Slider
                  value={data.alertThreshold}
                  onChange={(_, value) => onUpdate({ alertThreshold: value as number })}
                  min={50}
                  max={100}
                  step={5}
                  marks={[
                    { value: 50, label: "50%" },
                    { value: 75, label: "75%" },
                    { value: 85, label: "85%" },
                    { value: 100, label: "100%" },
                  ]}
                  valueLabelDisplay="on"
                  valueLabelFormat={(v) => `${v}%`}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approval Rule Dialog */}
      <ApprovalRuleDialog
        open={newRuleDialog}
        onClose={() => {
          setNewRuleDialog(false);
          setEditingRule(null);
        }}
        onSave={editingRule ? handleEditRule : handleAddRule}
        rule={editingRule}
      />
    </Box>
  );
}

// ============================================================================
// APPROVAL RULE DIALOG
// ============================================================================

interface ApprovalRuleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: ApprovalRule) => void;
  rule?: ApprovalRule | null;
}

function ApprovalRuleDialog({ open, onClose, onSave, rule }: ApprovalRuleDialogProps) {
  const [name, setName] = useState(rule?.name || "");
  const [minAmount, setMinAmount] = useState(rule?.minAmount || 0);
  const [approverRole, setApproverRole] = useState(rule?.approverRole || "");
  const [autoApprove, setAutoApprove] = useState(rule?.autoApprove || false);
  const [error, setError] = useState("");

  // Reset state when dialog opens with different rule
  const handleEnter = () => {
    setName(rule?.name || "");
    setMinAmount(rule?.minAmount || 0);
    setApproverRole(rule?.approverRole || "");
    setAutoApprove(rule?.autoApprove || false);
    setError("");
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("Rule name is required");
      return;
    }
    if (!approverRole) {
      setError("Approver role is required");
      return;
    }

    onSave({
      id: rule?.id || `rule-${Date.now()}`,
      name: name.trim(),
      minAmount,
      approverRole,
      autoApprove,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionProps={{ onEnter: handleEnter }}>
      <DialogTitle>{rule ? "Edit Approval Rule" : "Add Approval Rule"}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Rule Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            fullWidth
            placeholder="e.g., High Value Purchases"
          />

          <TextField
            label="Minimum Amount (₹)"
            type="number"
            value={minAmount}
            onChange={(e) => setMinAmount(Number(e.target.value))}
            fullWidth
            helperText="Apply this rule for amounts above this threshold (0 = all amounts)"
          />

          <FormControl fullWidth>
            <InputLabel>Approver Role</InputLabel>
            <Select
              value={approverRole}
              label="Approver Role"
              onChange={(e) => {
                setApproverRole(e.target.value);
                setError("");
              }}
            >
              {APPROVER_ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
              />
            }
            label="Auto-approve below threshold"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {rule ? "Update" : "Add"} Rule
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// MAIN WIZARD COMPONENT
// ============================================================================

export default function BudgetCreatePage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const createBudget = useCreateBudget();

  // Step 1 Data
  const [step1Data, setStep1Data] = useState<Step1Data>({
    title: "",
    description: "",
    eventType: "",
    eventDate: "",
    startDate: "",
    endDate: "",
    totalBudget: 100000,
    coordinatorId: 0,
  });

  // Step 3 Data
  const [step3Data, setStep3Data] = useState<Step3Data>({
    approvalEnabled: true,
    approvalRules: [
      { id: "default-1", name: "Standard Approval", minAmount: 5000, approverRole: "coordinator", autoApprove: false },
      { id: "default-2", name: "High Value", minAmount: 25000, approverRole: "finance_head", autoApprove: false },
    ],
    pettyWalletEnabled: true,
    pettyWalletLimit: 10000,
    pettyTransactionLimit: 500,
    pettyRequireReceipt: true,
    pettyReceiptThreshold: 200,
    alertThreshold: 85,
  });

  // Validate Step 1
  const validateStep1 = (): boolean => {
    const errors: Step1Errors = {};

    if (!step1Data.title || step1Data.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    }
    if (!step1Data.eventType) {
      errors.eventType = "Event type is required";
    }
    if (!step1Data.eventDate) {
      errors.eventDate = "Event date is required";
    }
    if (!step1Data.startDate) {
      errors.startDate = "Start date is required";
    }
    if (!step1Data.endDate) {
      errors.endDate = "End date is required";
    }
    if (!step1Data.totalBudget || step1Data.totalBudget < 1000) {
      errors.totalBudget = "Minimum budget is ₹1,000";
    }
    if (!step1Data.coordinatorId) {
      errors.coordinatorId = "Coordinator is required";
    }

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    if (step === 0) {
      return validateStep1();
    }
    if (step === 1) {
      return categories.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    const isValid = validateStep(activeStep);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddCategory = (category: CategoryData) => {
    setCategories((prev) => [...prev, category]);
  };

  const handleEditCategory = (category: CategoryData) => {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateStep1Data = useCallback((updates: Partial<Step1Data>) => {
    setStep1Data((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const keys = Object.keys(updates) as (keyof Step1Errors)[];
    setStep1Errors((prev) => {
      const newErrors = { ...prev };
      keys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  const updateStep3Data = useCallback((updates: Partial<Step3Data>) => {
    setStep3Data((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSubmit = async () => {
    const coordinator = MOCK_COORDINATORS.find((c) => c.id === step1Data.coordinatorId);

    const budgetData = {
      title: step1Data.title,
      description: step1Data.description || "",
      eventType: step1Data.eventType,
      eventDate: step1Data.eventDate,
      allocatedAmount: step1Data.totalBudget,
      spentAmount: 0,
      remainingAmount: step1Data.totalBudget,
      status: "planning" as const,
      coordinator: {
        id: step1Data.coordinatorId,
        name: coordinator?.name || "Unknown",
        role: coordinator?.role,
      },
      timeline: {
        startDate: step1Data.startDate,
        endDate: step1Data.endDate,
        eventDate: step1Data.eventDate,
      },
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        allocated: cat.allocatedAmount,
        spent: 0,
        remaining: cat.allocatedAmount,
        icon: cat.icon,
        color: cat.color,
      })),
      approvalRules: step3Data.approvalEnabled ? step3Data.approvalRules : [],
      pettyWallet: step3Data.pettyWalletEnabled
        ? {
            enabled: true,
            balance: step3Data.pettyWalletLimit,
            monthlyLimit: step3Data.pettyWalletLimit,
            transactionLimit: step3Data.pettyTransactionLimit,
            requireReceipt: step3Data.pettyRequireReceipt,
            receiptThreshold: step3Data.pettyReceiptThreshold,
          }
        : { enabled: false, balance: 0, monthlyLimit: 0, transactionLimit: 0 },
      alertThreshold: step3Data.alertThreshold,
    };

    try {
      await createBudget.mutateAsync(budgetData as any);
      navigate("/finance/budgets");
    } catch (error) {
      console.error("Failed to create budget:", error);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1BasicInfo
            data={step1Data}
            onUpdate={updateStep1Data}
            errors={step1Errors}
          />
        );
      case 1:
        return (
          <Step2Categories
            categories={categories}
            totalBudget={step1Data.totalBudget}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 2:
        return (
          <Step3ApprovalSettings
            data={step3Data}
            onUpdate={updateStep3Data}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/finance/budgets")}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Create New Budget
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up a new budget for an event or department
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {WIZARD_STEPS.map((label, index) => (
          <Step key={label} completed={index < activeStep}>
            <StepLabel
              StepIconComponent={() => (
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: index <= activeStep ? "primary.main" : "grey.300",
                    fontSize: 14,
                  }}
                >
                  {index < activeStep ? <CheckCircle fontSize="small" /> : index + 1}
                </Avatar>
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Paper sx={{ p: 3, mb: 3 }}>{renderStepContent()}</Paper>

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/finance/budgets")}>
            Cancel
          </Button>

          {activeStep === WIZARD_STEPS.length - 1 ? (
            <Button
              variant="contained"
              startIcon={createBudget.isPending ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSubmit}
              disabled={createBudget.isPending}
            >
              {createBudget.isPending ? "Creating..." : "Create Budget"}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={handleNext}
              disabled={activeStep === 1 && categories.length === 0}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
