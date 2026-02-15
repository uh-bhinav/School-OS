// ============================================================================
// VOUCHERS PAGE - Daily Expense Voucher Management (Audit-Ready)
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Stack, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress,
  Divider, Paper, Alert, InputAdornment, Tabs, Tab, Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  ReceiptLong as VoucherIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Send as SubmitIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  AttachFile as AttachIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import {
  mockVouchersProvider,
  EXPENSE_CATEGORIES_LIST,
  PAYMENT_MODES_LIST,
} from '../../../mockDataProviders/finance/mockVouchers';
import type {
  Voucher,
  VoucherStatus,
  VoucherCreate,
  ExpenseCategory,
  PaymentMode,
} from '../../../mockDataProviders/finance/mockVouchers';

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_COLORS: Record<VoucherStatus, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  draft: 'default',
  submitted: 'warning',
  approved: 'success',
  rejected: 'error',
};

const STATUS_LABELS: Record<VoucherStatus, string> = {
  draft: 'Draft',
  submitted: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
};

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VouchersPage() {
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComment, setApprovalComment] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0=All, 1=Pending, 2=Approved

  // Filters
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('');
  const [filterMode, setFilterMode] = useState<PaymentMode | ''>('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Create form
  const [form, setForm] = useState<VoucherCreate>({
    date: new Date().toISOString().split('T')[0],
    expense_category: 'Stationery',
    description: '',
    amount: 0,
    gst_percent: 0,
    payment_mode: 'Cash',
    paid_to: '',
    bill_reference: '',
    attachment_name: '',
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const data = await mockVouchersProvider.getVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // DATE FILTERING
  // ============================================================================

  const getDateRange = (): { from: string; to: string } | null => {
    const today = new Date();
    switch (datePreset) {
      case 'today':
        return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
      case 'this_week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { from: startOfWeek.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
      }
      case 'this_month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: startOfMonth.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
      }
      case 'custom':
        if (customFrom && customTo) return { from: customFrom, to: customTo };
        return null;
      default:
        return null;
    }
  };

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredVouchers = useMemo(() => {
    let filtered = [...vouchers];

    // Tab filter
    if (activeTab === 1) filtered = filtered.filter(v => v.status === 'submitted');
    if (activeTab === 2) filtered = filtered.filter(v => v.status === 'approved');

    // Category
    if (filterCategory) filtered = filtered.filter(v => v.expense_category === filterCategory);

    // Payment mode
    if (filterMode) filtered = filtered.filter(v => v.payment_mode === filterMode);

    // Date range
    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter(v => v.date >= dateRange.from && v.date <= dateRange.to);
    }

    return filtered;
  }, [vouchers, activeTab, filterCategory, filterMode, datePreset, customFrom, customTo]);

  // ============================================================================
  // STATS
  // ============================================================================

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const todayExpenses = vouchers
      .filter(v => v.date === today && v.status === 'approved')
      .reduce((sum, v) => sum + v.total_amount, 0);

    const monthExpenses = vouchers
      .filter(v => v.date >= monthStart && v.status === 'approved')
      .reduce((sum, v) => sum + v.total_amount, 0);

    const pendingApproval = vouchers.filter(v => v.status === 'submitted').length;
    const approved = vouchers.filter(v => v.status === 'approved').length;

    return { todayExpenses, monthExpenses, pendingApproval, approved };
  }, [vouchers]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreate = async () => {
    try {
      await mockVouchersProvider.createVoucher(form);
      await loadVouchers();
      setCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create voucher:', error);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      const created = await mockVouchersProvider.createVoucher(form);
      await mockVouchersProvider.submitVoucher(created.voucher_id);
      await loadVouchers();
      setCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to submit voucher:', error);
    }
  };

  const handleSubmitDraft = async (id: number) => {
    await mockVouchersProvider.submitVoucher(id);
    await loadVouchers();
  };

  const handleApproval = async () => {
    if (!selectedVoucher) return;
    try {
      if (approvalAction === 'approve') {
        await mockVouchersProvider.approveVoucher(selectedVoucher.voucher_id, approvalComment);
      } else {
        await mockVouchersProvider.rejectVoucher(selectedVoucher.voucher_id, approvalComment);
      }
      await loadVouchers();
      setApprovalOpen(false);
      setApprovalComment('');
    } catch (error) {
      console.error('Approval action failed:', error);
    }
  };

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      expense_category: 'Stationery',
      description: '',
      amount: 0,
      gst_percent: 0,
      payment_mode: 'Cash',
      paid_to: '',
      bill_reference: '',
      attachment_name: '',
    });
  };

  const openApprovalDialog = (voucher: Voucher, action: 'approve' | 'reject') => {
    setSelectedVoucher(voucher);
    setApprovalAction(action);
    setApprovalOpen(true);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <VoucherIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">Daily Vouchers</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Record, approve and audit daily school expenses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Create Voucher
        </Button>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Today's Expenses</Typography>
            <Typography variant="h4" fontWeight="bold">
              ₹{stats.todayExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">This Month</Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              ₹{stats.monthExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Pending Approval</Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {stats.pendingApproval}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Approved</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.approved}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Vouchers" />
        <Tab label={
          <Badge badgeContent={stats.pendingApproval} color="warning" sx={{ '& .MuiBadge-badge': { right: -12, top: 2 } }}>
            Pending Approval
          </Badge>
        } />
        <Tab label="Approved" />
      </Tabs>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FilterIcon color="action" />

            <TextField
              select label="Category" value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
              size="small" sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {EXPENSE_CATEGORIES_LIST.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>

            <TextField
              select label="Payment Mode" value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as PaymentMode | '')}
              size="small" sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Modes</MenuItem>
              {PAYMENT_MODES_LIST.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>

            <Divider orientation="vertical" flexItem />

            <Stack direction="row" spacing={1}>
              {(['all', 'today', 'this_week', 'this_month', 'custom'] as DatePreset[]).map(p => (
                <Chip
                  key={p}
                  label={p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'this_week' ? 'This Week' : p === 'this_month' ? 'This Month' : 'Custom'}
                  onClick={() => setDatePreset(p)}
                  color={datePreset === p ? 'primary' : 'default'}
                  variant={datePreset === p ? 'filled' : 'outlined'}
                  size="small"
                  icon={p === 'today' ? <TodayIcon /> : p === 'custom' ? <DateRangeIcon /> : undefined}
                />
              ))}
            </Stack>

            {datePreset === 'custom' && (
              <>
                <TextField
                  type="date" label="From" value={customFrom} size="small"
                  onChange={(e) => setCustomFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 160 }}
                />
                <TextField
                  type="date" label="To" value={customTo} size="small"
                  onChange={(e) => setCustomTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 160 }}
                />
              </>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto !important' }}>
              {filteredVouchers.length} vouchers
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Voucher #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Paid To</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">GST</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No vouchers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map(v => (
                  <TableRow key={v.voucher_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{v.voucher_number}</Typography>
                    </TableCell>
                    <TableCell>{new Date(v.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                    <TableCell>
                      <Chip label={v.expense_category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" noWrap title={v.description}>{v.description}</Typography>
                    </TableCell>
                    <TableCell>{v.paid_to}</TableCell>
                    <TableCell align="right">₹{v.amount.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {v.gst_percent > 0 ? `₹${v.gst_amount.toLocaleString()} (${v.gst_percent}%)` : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>₹{v.total_amount.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>{v.payment_mode}</TableCell>
                    <TableCell>
                      <Chip label={STATUS_LABELS[v.status]} color={STATUS_COLORS[v.status]} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => { setSelectedVoucher(v); setDetailOpen(true); }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {v.status === 'draft' && (
                          <Tooltip title="Submit for Approval">
                            <IconButton size="small" color="primary" onClick={() => handleSubmitDraft(v.voucher_id)}>
                              <SubmitIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {v.status === 'submitted' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success" onClick={() => openApprovalDialog(v, 'approve')}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error" onClick={() => openApprovalDialog(v, 'reject')}>
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ================================================================== */}
      {/* CREATE VOUCHER DIALOG */}
      {/* ================================================================== */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon color="primary" /> Create New Voucher
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              type="date" label="Date" value={form.date} fullWidth
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select label="Expense Category" value={form.expense_category} fullWidth
              onChange={(e) => setForm({ ...form, expense_category: e.target.value as ExpenseCategory })}
            >
              {EXPENSE_CATEGORIES_LIST.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField
              label="Description" value={form.description} fullWidth multiline rows={2}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the expense"
            />
            <TextField
              label="Paid To" value={form.paid_to} fullWidth
              onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
              placeholder="Vendor / Person name"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Amount (₹)" type="number" value={form.amount || ''} fullWidth
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
              <TextField
                label="GST %" type="number" value={form.gst_percent || ''} sx={{ width: 120 }}
                onChange={(e) => setForm({ ...form, gst_percent: Number(e.target.value) })}
              />
            </Stack>
            {form.amount > 0 && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                <Typography variant="body2">
                  Amount: ₹{form.amount.toLocaleString()}
                  {form.gst_percent > 0 && ` + GST ₹${Math.round(form.amount * form.gst_percent / 100).toLocaleString()}`}
                  {' = '}
                  <strong>Total: ₹{(form.amount + Math.round(form.amount * form.gst_percent / 100)).toLocaleString()}</strong>
                </Typography>
              </Alert>
            )}
            <TextField
              select label="Payment Mode" value={form.payment_mode} fullWidth
              onChange={(e) => setForm({ ...form, payment_mode: e.target.value as PaymentMode })}
            >
              {PAYMENT_MODES_LIST.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <TextField
              label="Bill / Reference No." value={form.bill_reference} fullWidth
              onChange={(e) => setForm({ ...form, bill_reference: e.target.value })}
              placeholder="Optional"
            />
            <Button
              variant="outlined" component="label" startIcon={<AttachIcon />}
              sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
            >
              {form.attachment_name || 'Upload Bill / Receipt'}
              <input type="file" hidden onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setForm({ ...form, attachment_name: file.name });
              }} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="outlined" onClick={handleCreate}
            disabled={!form.description || !form.amount || !form.paid_to}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained" onClick={handleSubmitForApproval}
            disabled={!form.description || !form.amount || !form.paid_to}
            startIcon={<SubmitIcon />}
          >
            Submit for Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================================================================== */}
      {/* VOUCHER DETAIL DIALOG */}
      {/* ================================================================== */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedVoucher && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <VoucherIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>Voucher {selectedVoucher.voucher_number}</Typography>
                </Box>
                <Chip label={STATUS_LABELS[selectedVoucher.status]} color={STATUS_COLORS[selectedVoucher.status]} />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* Voucher Info */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Voucher Information</Typography>
                  <Stack direction="row" spacing={4} flexWrap="wrap">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Date</Typography>
                      <Typography variant="body1" fontWeight={600}>{new Date(selectedVoucher.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Category</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedVoucher.expense_category}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Payment Mode</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedVoucher.payment_mode}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Bill Ref</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedVoucher.bill_reference || '—'}</Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Description & Amount */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Expense Details</Typography>
                  <Typography variant="body1" gutterBottom>{selectedVoucher.description}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Paid to: <strong>{selectedVoucher.paid_to}</strong></Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Base Amount</Typography>
                      <Typography variant="body2">₹{selectedVoucher.amount.toLocaleString()}</Typography>
                    </Stack>
                    {selectedVoucher.gst_percent > 0 && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">GST ({selectedVoucher.gst_percent}%)</Typography>
                        <Typography variant="body2">₹{selectedVoucher.gst_amount.toLocaleString()}</Typography>
                      </Stack>
                    )}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.5 }}>
                      <Typography variant="body1" fontWeight={700}>Total Amount</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">₹{selectedVoucher.total_amount.toLocaleString()}</Typography>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Signatures / Audit Trail */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Audit Trail</Typography>
                  <Stack direction="row" spacing={4}>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Created By</Typography>
                      <Typography variant="body1" fontWeight={600}>{selectedVoucher.created_by}</Typography>
                      <Typography variant="caption" color="text.secondary">{selectedVoucher.created_by_role}</Typography>
                      <Box sx={{ mt: 1, fontFamily: "'Dancing Script', cursive", fontSize: 18, color: 'primary.main', fontStyle: 'italic' }}>
                        {selectedVoucher.created_by}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(selectedVoucher.created_at).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Approved By</Typography>
                      {selectedVoucher.approved_by ? (
                        <>
                          <Typography variant="body1" fontWeight={600}>{selectedVoucher.approved_by}</Typography>
                          <Typography variant="caption" color="text.secondary">{selectedVoucher.approved_by_role}</Typography>
                          <Box sx={{ mt: 1, fontFamily: "'Dancing Script', cursive", fontSize: 18, color: 'success.main', fontStyle: 'italic' }}>
                            {selectedVoucher.approved_by}
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {selectedVoucher.approval_date}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {selectedVoucher.status === 'submitted' ? 'Awaiting approval...' : selectedVoucher.status === 'rejected' ? 'Rejected' : 'Not yet submitted'}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  {selectedVoucher.approval_comment && (
                    <Alert severity={selectedVoucher.status === 'rejected' ? 'error' : 'info'} sx={{ mt: 2 }}>
                      <Typography variant="body2"><strong>Comment:</strong> {selectedVoucher.approval_comment}</Typography>
                    </Alert>
                  )}
                </Paper>

                {/* Attachment */}
                {selectedVoucher.attachment_name && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Attached Document</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AttachIcon color="action" />
                      <Typography variant="body2">{selectedVoucher.attachment_name}</Typography>
                      <Chip label="View" size="small" clickable variant="outlined" />
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button startIcon={<DownloadIcon />} sx={{ textTransform: 'none' }}>Download PDF</Button>
              <Button startIcon={<PrintIcon />} sx={{ textTransform: 'none' }}>Print</Button>
              <Box sx={{ flex: 1 }} />
              {selectedVoucher.status === 'submitted' && (
                <>
                  <Button
                    variant="outlined" color="error" startIcon={<RejectIcon />}
                    onClick={() => { setDetailOpen(false); openApprovalDialog(selectedVoucher, 'reject'); }}
                    sx={{ textTransform: 'none' }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained" color="success" startIcon={<ApproveIcon />}
                    onClick={() => { setDetailOpen(false); openApprovalDialog(selectedVoucher, 'approve'); }}
                    sx={{ textTransform: 'none' }}
                  >
                    Approve
                  </Button>
                </>
              )}
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ================================================================== */}
      {/* APPROVAL DIALOG */}
      {/* ================================================================== */}
      <Dialog open={approvalOpen} onClose={() => setApprovalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalAction === 'approve' ? '✅ Approve Voucher' : '❌ Reject Voucher'}
        </DialogTitle>
        <DialogContent>
          {selectedVoucher && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity={approvalAction === 'approve' ? 'success' : 'error'}>
                <Typography variant="body2">
                  {approvalAction === 'approve'
                    ? `You are approving voucher ${selectedVoucher.voucher_number} for ₹${selectedVoucher.total_amount.toLocaleString()}`
                    : `You are rejecting voucher ${selectedVoucher.voucher_number}`}
                </Typography>
              </Alert>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2"><strong>Description:</strong> {selectedVoucher.description}</Typography>
                <Typography variant="body2"><strong>Amount:</strong> ₹{selectedVoucher.total_amount.toLocaleString()}</Typography>
                <Typography variant="body2"><strong>Paid to:</strong> {selectedVoucher.paid_to}</Typography>
              </Paper>
              <TextField
                label={approvalAction === 'approve' ? 'Comment (optional)' : 'Reason for rejection (required)'}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                multiline rows={3} fullWidth
                required={approvalAction === 'reject'}
                placeholder={approvalAction === 'approve' ? 'Optional note...' : 'Provide reason for rejection'}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={approvalAction === 'approve' ? 'success' : 'error'}
            onClick={handleApproval}
            disabled={approvalAction === 'reject' && !approvalComment}
          >
            {approvalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
