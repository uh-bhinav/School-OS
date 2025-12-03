// BudgetAuditLogPage.tsx - Audit log and activity tracking
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useBudgets, useAuditLog, useExportAuditLog } from "../../../services/budget.hooks";

const actionColors: Record<string, "success" | "error" | "warning" | "info" | "default"> = {
  create: "success",
  update: "info",
  delete: "error",
  approve: "success",
  reject: "error",
  view: "default",
  export: "info",
  allocate: "warning",
  transfer: "warning",
};

export default function BudgetAuditLogPage() {
  const navigate = useNavigate();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: budgetsData } = useBudgets();
  const { data: auditData, isLoading } = useAuditLog(
    selectedBudgetId || undefined,
    {
      action: actionFilter !== "all" ? actionFilter : undefined,
      searchQuery: searchQuery || undefined,
      startDate: dateFrom || undefined,
      endDate: dateTo || undefined,
    }
  );
  const exportMutation = useExportAuditLog();

  const budgets = (budgetsData as any[]) || [];
  const auditLogs = (auditData as any[]) || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = async (format: "csv" | "pdf") => {
    await exportMutation.mutateAsync({
      budgetId: selectedBudgetId || "all",
      format,
    });
  };

  const itemsPerPage = 15;
  const paginatedLogs = auditLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(auditLogs.length / itemsPerPage);

  if (isLoading && !auditLogs.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mb: 3 }} />
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
            Audit Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track all budget-related activities and changes
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport("csv")}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Budget</InputLabel>
                <Select
                  value={selectedBudgetId}
                  label="Budget"
                  onChange={(e) => setSelectedBudgetId(e.target.value)}
                >
                  <MenuItem value="">All Budgets</MenuItem>
                  {budgets.map((budget: any) => (
                    <MenuItem key={budget.id} value={budget.id}>
                      {budget.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
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
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="create">Create</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                  <MenuItem value="approve">Approve</MenuItem>
                  <MenuItem value="reject">Reject</MenuItem>
                  <MenuItem value="allocate">Allocate</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Button
                variant="text"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSelectedBudgetId("");
                  setSearchQuery("");
                  setActionFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {auditLogs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {auditLogs.filter((l: any) => l.action === "create").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Creates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {auditLogs.filter((l: any) => l.action === "update").length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {auditLogs.filter((l: any) => ["approve", "reject"].includes(l.action)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approvals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Audit Log Table */}
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Performed By</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLogs.map((log: any) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2">{formatDate(log.created_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      color={actionColors[log.action] || "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.entity_type}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.entity_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250 }} noWrap>
                      {log.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{log.performed_by_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.performed_by_role}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontSize={12}>
                      {log.ip_address || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {auditLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 8 }}>
                      <HistoryIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                      <Typography color="text.secondary">No audit logs found</Typography>
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
    </Box>
  );
}
