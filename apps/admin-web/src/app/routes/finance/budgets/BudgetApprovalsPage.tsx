// BudgetApprovalsPage.tsx - Approval queue management
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  HelpOutline as HelpIcon,
  ArrowUpward as EscalateIcon,
  Approval as ApprovalIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
} from "@mui/icons-material";
import { usePendingApprovals, useApprovals, useProcessApproval, useBudgets } from "../../../services/budget.hooks";

const statusColors: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  needs_info: "info",
  escalated: "default",
};

const priorityColors: Record<string, string> = {
  high: "#f44336",
  medium: "#ff9800",
  low: "#4caf50",
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function BudgetApprovalsPage() {
  const navigate = useNavigate();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [tabValue, setTabValue] = useState(0);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [actionType, setActionType] = useState<string>("");
  const [comments, setComments] = useState("");

  const { data: budgetsData } = useBudgets();
  const { data: pendingApprovalsData, isLoading: pendingLoading } = usePendingApprovals();
  const { data: allApprovalsData, isLoading: allLoading } = useApprovals(
    selectedBudgetId || (budgetsData as any[])?.[0]?.id || ""
  );
  const processApprovalMutation = useProcessApproval();

  const budgets = (budgetsData as any[]) || [];
  const pendingApprovals = (pendingApprovalsData as any[]) || [];
  const allApprovals = (allApprovalsData as any[]) || [];
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenAction = (approval: any, action: string) => {
    setSelectedApproval(approval);
    setActionType(action);
    setComments("");
    setActionDialogOpen(true);
  };

  const handleProcessApproval = async () => {
    if (selectedApproval && actionType) {
      await processApprovalMutation.mutateAsync({
        budgetId: selectedApproval.budget_id,
        approvalId: selectedApproval.id,
        action: {
          action: actionType as any,
          comments,
        },
      });
      setActionDialogOpen(false);
      setSelectedApproval(null);
      setActionType("");
      setComments("");
    }
  };

  const isLoading = pendingLoading || allLoading;

  if (isLoading && !pendingApprovals.length && !allApprovals.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  const renderApprovalItem = (approval: any, showActions: boolean = true) => (
    <ListItem
      key={approval.id}
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        mb: 1,
        border: 1,
        borderColor: "divider",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
      }}
    >
      <ListItemAvatar sx={{ display: { xs: "none", sm: "block" } }}>
        <Avatar
          sx={{
            bgcolor: priorityColors[approval.priority] || "#9e9e9e",
          }}
        >
          <ApprovalIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {approval.description}
            </Typography>
            <Chip
              size="small"
              label={approval.type}
              variant="outlined"
            />
            {approval.priority === "high" && (
              <Chip size="small" label="Urgent" color="error" />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Requested by {approval.requester_name} • {formatDate(approval.created_at)}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {formatCurrency(approval.amount)}
            </Typography>
          </Box>
        }
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Chip
          label={approval.status}
          color={statusColors[approval.status] || "default"}
          size="small"
        />
        {showActions && approval.status === "pending" && (
          <>
            <IconButton
              color="success"
              onClick={() => handleOpenAction(approval, "approve")}
              title="Approve"
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleOpenAction(approval, "reject")}
              title="Reject"
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              color="info"
              onClick={() => handleOpenAction(approval, "request_info")}
              title="Request Info"
            >
              <HelpIcon />
            </IconButton>
            <IconButton
              onClick={() => handleOpenAction(approval, "escalate")}
              title="Escalate"
            >
              <EscalateIcon />
            </IconButton>
          </>
        )}
      </Box>
    </ListItem>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/finance/budgets")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Budget Approvals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and process budget approval requests
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "warning.main" }}>
                <ScheduleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {pendingApprovals.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "success.main" }}>
                <ApprovedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {allApprovals.filter((a: any) => a.status === "approved").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "error.main" }}>
                <RejectedIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {allApprovals.filter((a: any) => a.status === "rejected").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <ApprovalIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(
                    pendingApprovals.reduce((sum: number, a: any) => sum + a.amount, 0)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Value
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab
            label={
              <Badge badgeContent={pendingApprovals.length} color="warning">
                <Box sx={{ pr: 2 }}>Pending</Box>
              </Badge>
            }
          />
          <Tab label="All Approvals" />
        </Tabs>

        {/* Pending Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            {pendingApprovals.length > 0 ? (
              <List sx={{ p: 0 }}>
                {pendingApprovals.map((approval: any) => renderApprovalItem(approval, true))}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <ApprovedIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  All caught up!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No pending approvals
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* All Approvals Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <FormControl size="small" sx={{ mb: 2, minWidth: 200 }}>
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

            {allApprovals.length > 0 ? (
              <List sx={{ p: 0 }}>
                {allApprovals.map((approval: any) => renderApprovalItem(approval, false))}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <ApprovalIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No approvals found
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === "approve" && "Approve Request"}
          {actionType === "reject" && "Reject Request"}
          {actionType === "request_info" && "Request More Information"}
          {actionType === "escalate" && "Escalate Request"}
        </DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {selectedApproval.description}
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(selectedApproval.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requested by {selectedApproval.requester_name}
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <TextField
            label="Comments"
            fullWidth
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              actionType === "reject"
                ? "Please provide a reason for rejection..."
                : actionType === "request_info"
                ? "What additional information is needed?"
                : "Add any comments (optional)..."
            }
            required={actionType === "reject" || actionType === "request_info"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={actionType === "reject" ? "error" : actionType === "approve" ? "success" : "primary"}
            onClick={handleProcessApproval}
            disabled={
              (actionType === "reject" || actionType === "request_info") && !comments
            }
          >
            {actionType === "approve" && "Approve"}
            {actionType === "reject" && "Reject"}
            {actionType === "request_info" && "Request Info"}
            {actionType === "escalate" && "Escalate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
