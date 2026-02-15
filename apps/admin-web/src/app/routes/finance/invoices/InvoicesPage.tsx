// ============================================================================
// INVOICES PAGE - Enhanced with Fee Breakdown, Installments, Payment History
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, CircularProgress, Stack, IconButton, Tooltip,
  Divider, Alert, LinearProgress, Tabs, Tab,
} from '@mui/material';
import {
  Add as AddIcon, Receipt as ReceiptIcon, Visibility as ViewIcon,
  Cancel as CancelIcon, FilterList as FilterIcon, AccountBalanceWallet,
  Download as DownloadIcon,
  Print as PrintIcon, History as HistoryIcon,
} from '@mui/icons-material';
import { invoiceService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { Invoice, InvoiceStatus } from '../../../services/finance/types';
import { MOCK_CLASSES } from '../../../mockDataProviders/finance';
import BulkInvoiceWizard from '../../../components/finance/BulkInvoiceWizard';

const STATUS_COLORS: Record<InvoiceStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  pending: 'warning',
  due: 'info',
  partially_paid: 'primary',
  paid: 'success',
  overdue: 'error',
  cancelled: 'default',
};

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';

// ============================================================================
// MOCK INSTALLMENT DATA (generated per invoice for demo)
// ============================================================================

interface Installment {
  installment_no: number;
  label: string;
  due_date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paid_date?: string;
}

interface FeeBreakdownRow {
  component_name: string;
  total: number;
  paid: number;
  balance: number;
}

function generateInstallments(invoice: Invoice): Installment[] {
  if (invoice.status === 'cancelled') return [];
  const total = invoice.amount_due;
  const inst1Amount = Math.round(total * 0.4);
  const inst2Amount = Math.round(total * 0.35);
  const inst3Amount = total - inst1Amount - inst2Amount;

  const installments: Installment[] = [
    {
      installment_no: 1,
      label: 'Installment 1 (Admission)',
      due_date: '2025-06-15',
      amount: inst1Amount,
      status: invoice.amount_paid >= inst1Amount ? 'paid' : 'pending',
      paid_date: invoice.amount_paid >= inst1Amount ? '2025-06-10' : undefined,
    },
    {
      installment_no: 2,
      label: 'Installment 2 (Term 2)',
      due_date: '2025-09-15',
      amount: inst2Amount,
      status: invoice.amount_paid >= inst1Amount + inst2Amount ? 'paid' : (invoice.amount_paid > inst1Amount ? 'pending' : 'pending'),
      paid_date: invoice.amount_paid >= inst1Amount + inst2Amount ? '2025-09-12' : undefined,
    },
    {
      installment_no: 3,
      label: 'Installment 3 (Term 3)',
      due_date: '2025-12-15',
      amount: inst3Amount,
      status: invoice.status === 'paid' ? 'paid' : 'pending',
      paid_date: invoice.status === 'paid' ? '2025-12-10' : undefined,
    },
  ];

  return installments;
}

function generateFeeBreakdown(invoice: Invoice): FeeBreakdownRow[] {
  return invoice.items.map(item => {
    const paidRatio = invoice.amount_due > 0 ? invoice.amount_paid / invoice.amount_due : 0;
    const paid = Math.round(item.final_amount * Math.min(paidRatio, 1));
    return {
      component_name: item.component_name,
      total: item.final_amount,
      paid,
      balance: item.final_amount - paid,
    };
  });
}

function generatePaymentHistory(invoice: Invoice): Array<{ date: string; amount: number; mode: string; receipt_id: string }> {
  if (invoice.amount_paid === 0) return [];
  const methods = ['UPI', 'CARD', 'Bank Transfer', 'Cash', 'Cheque'];
  const payments = [];

  if (invoice.status === 'paid' || invoice.status === 'partially_paid') {
    // First payment
    const firstAmount = invoice.status === 'partially_paid' ? Math.round(invoice.amount_paid * 0.6) : Math.round(invoice.amount_paid * 0.55);
    payments.push({
      date: '2025-06-10',
      amount: firstAmount,
      mode: methods[Math.floor(Math.random() * methods.length)],
      receipt_id: `RCP-${20000 + invoice.invoice_id}-1`,
    });

    const remaining = invoice.amount_paid - firstAmount;
    if (remaining > 0) {
      payments.push({
        date: invoice.status === 'paid' ? '2025-09-12' : '2025-07-22',
        amount: remaining,
        mode: methods[Math.floor(Math.random() * methods.length)],
        receipt_id: `RCP-${20000 + invoice.invoice_id}-2`,
      });
    }
  }
  return payments;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('');
  const [filterClass, setFilterClass] = useState<number | ''>('');
  const [detailTab, setDetailTab] = useState(0);

  // Date filters
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Student ledger
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerStudent, setLedgerStudent] = useState<{ name: string; id: number; class: string; roll: string } | null>(null);

  const { invoices, setInvoices } = useFinanceStore();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await invoiceService.cancel(invoiceId);
      await loadInvoices();
    } catch (error) {
      console.error('Failed to cancel invoice:', error);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailTab(0);
    setViewDialogOpen(true);
  };

  const openStudentLedger = (invoice: Invoice) => {
    setLedgerStudent({
      name: invoice.student_name,
      id: invoice.student_id,
      class: invoice.class_name,
      roll: invoice.roll_no,
    });
    setLedgerOpen(true);
  };

  // Date range
  const getDateRange = (): { from: string; to: string } | null => {
    const today = new Date();
    switch (datePreset) {
      case 'today': return { from: today.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
      case 'this_week': {
        const s = new Date(today); s.setDate(today.getDate() - today.getDay());
        return { from: s.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
      }
      case 'this_month': {
        const s = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: s.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
      }
      case 'custom': return (customFrom && customTo) ? { from: customFrom, to: customTo } : null;
      default: return null;
    }
  };

  const filteredInvoices = useMemo(() => {
    let filtered = invoices.filter((inv) => {
      if (filterStatus && inv.status !== filterStatus) return false;
      if (filterClass && inv.class_id !== filterClass) return false;
      return true;
    });

    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter(inv => inv.due_date >= dateRange.from && inv.due_date <= dateRange.to);
    }

    return filtered;
  }, [invoices, filterStatus, filterClass, datePreset, customFrom, customTo]);

  const stats = {
    total: invoices.length,
    pending: invoices.filter((i) => i.status === 'pending' || i.status === 'due').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
  };

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
            <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">Invoices</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage and track all student invoices — fee obligations & balances
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBulkDialogOpen(true)} sx={{ textTransform: 'none' }}>
          Generate Bulk Invoices
        </Button>
      </Box>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Total Invoices</Typography>
          <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Pending</Typography>
          <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pending}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Overdue</Typography>
          <Typography variant="h4" fontWeight="bold" color="error.main">{stats.overdue}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Paid</Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">{stats.paid}</Typography>
        </CardContent></Card>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FilterIcon color="action" />
            <TextField select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | '')} size="small" sx={{ minWidth: 150 }}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="due">Due</MenuItem>
              <MenuItem value="partially_paid">Partially Paid</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField select label="Class" value={filterClass} onChange={(e) => setFilterClass(e.target.value ? Number(e.target.value) : '')} size="small" sx={{ minWidth: 150 }}>
              <MenuItem value="">All Classes</MenuItem>
              {MOCK_CLASSES.map((cls) => (
                <MenuItem key={cls.class_id} value={cls.class_id}>{cls.class_name}</MenuItem>
              ))}
            </TextField>

            <Divider orientation="vertical" flexItem />

            {/* Date Chips */}
            <Stack direction="row" spacing={1}>
              {(['all', 'today', 'this_week', 'this_month', 'custom'] as DatePreset[]).map(p => (
                <Chip key={p}
                  label={p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'this_week' ? 'This Week' : p === 'this_month' ? 'This Month' : 'Custom'}
                  onClick={() => setDatePreset(p)}
                  color={datePreset === p ? 'primary' : 'default'}
                  variant={datePreset === p ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Stack>

            {datePreset === 'custom' && (
              <>
                <TextField type="date" label="From" value={customFrom} size="small" onChange={(e) => setCustomFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
                <TextField type="date" label="To" value={customTo} size="small" onChange={(e) => setCustomTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
              </>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto !important' }}>
              Showing {filteredInvoices.length} of {stats.total} invoices
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
                <TableCell>Invoice #</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Amount Due</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No invoices found.</Typography>
                </TableCell></TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.invoice_id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{invoice.invoice_number}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{invoice.student_name}</Typography></TableCell>
                    <TableCell>{invoice.class_name}</TableCell>
                    <TableCell>₹{invoice.amount_due.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color={invoice.balance > 0 ? 'error.main' : 'success.main'}>
                        ₹{invoice.balance.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell><Chip label={invoice.status} color={STATUS_COLORS[invoice.status]} size="small" /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details"><IconButton size="small" onClick={() => handleViewInvoice(invoice)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Student Ledger"><IconButton size="small" color="primary" onClick={() => openStudentLedger(invoice)}><AccountBalanceWallet fontSize="small" /></IconButton></Tooltip>
                      {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                        <Tooltip title="Cancel Invoice"><IconButton size="small" color="error" onClick={() => handleCancelInvoice(invoice.invoice_id)}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Bulk Invoice Wizard */}
      <BulkInvoiceWizard open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} onSuccess={loadInvoices} />

      {/* ================================================================== */}
      {/* ENHANCED INVOICE DETAIL DIALOG */}
      {/* ================================================================== */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedInvoice && (() => {
          const breakdown = generateFeeBreakdown(selectedInvoice);
          const installments = generateInstallments(selectedInvoice);
          const paymentHistory = generatePaymentHistory(selectedInvoice);
          const paidPercent = selectedInvoice.amount_due > 0 ? Math.round((selectedInvoice.amount_paid / selectedInvoice.amount_due) * 100) : 0;

          return (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <ReceiptIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>{selectedInvoice.invoice_number}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip label={selectedInvoice.status} color={STATUS_COLORS[selectedInvoice.status]} />
                  </Stack>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  {/* Student Info */}
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Student Information</Typography>
                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedInvoice.student_name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Roll No.</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedInvoice.roll_no}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Class</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedInvoice.class_name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Admission No.</Typography>
                        <Typography variant="body1" fontWeight={600}>ADM-{2024000 + selectedInvoice.student_id}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Payment Progress */}
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" color="text.secondary">Payment Progress</Typography>
                      <Typography variant="body2" fontWeight={600}>{paidPercent}% Paid</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={paidPercent}
                      sx={{ height: 10, borderRadius: 5, mb: 1 }}
                      color={paidPercent >= 100 ? 'success' : paidPercent > 50 ? 'primary' : 'warning'}
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Paid: <strong>₹{selectedInvoice.amount_paid.toLocaleString()}</strong></Typography>
                      <Typography variant="body2">Due: <strong>₹{selectedInvoice.amount_due.toLocaleString()}</strong></Typography>
                      <Typography variant="body2" color={selectedInvoice.balance > 0 ? 'error.main' : 'success.main'}>
                        Balance: <strong>₹{selectedInvoice.balance.toLocaleString()}</strong>
                      </Typography>
                    </Stack>
                  </Paper>

                  {/* Tabs for breakdown */}
                  <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}>
                    <Tab label="Fee Breakdown" />
                    <Tab label="Installments" />
                    <Tab label="Payment History" />
                  </Tabs>

                  {/* Fee Breakdown */}
                  {detailTab === 0 && (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell><strong>Component</strong></TableCell>
                            <TableCell align="right"><strong>Total</strong></TableCell>
                            <TableCell align="right"><strong>Paid</strong></TableCell>
                            <TableCell align="right"><strong>Balance</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {breakdown.map((row) => (
                            <TableRow key={row.component_name}>
                              <TableCell>{row.component_name}</TableCell>
                              <TableCell align="right">₹{row.total.toLocaleString()}</TableCell>
                              <TableCell align="right" sx={{ color: 'success.main' }}>₹{row.paid.toLocaleString()}</TableCell>
                              <TableCell align="right" sx={{ color: row.balance > 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                                ₹{row.balance.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          {selectedInvoice.discounts_applied.length > 0 && (
                            <TableRow>
                              <TableCell sx={{ color: 'success.main' }}>
                                🏷️ {selectedInvoice.discounts_applied[0].discount_name}
                              </TableCell>
                              <TableCell align="right" sx={{ color: 'success.main' }}>
                                -₹{selectedInvoice.discounts_applied[0].amount.toLocaleString()}
                              </TableCell>
                              <TableCell />
                              <TableCell />
                            </TableRow>
                          )}
                          <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell align="right"><strong>₹{selectedInvoice.amount_due.toLocaleString()}</strong></TableCell>
                            <TableCell align="right"><strong style={{ color: '#2e7d32' }}>₹{selectedInvoice.amount_paid.toLocaleString()}</strong></TableCell>
                            <TableCell align="right"><strong style={{ color: selectedInvoice.balance > 0 ? '#d32f2f' : '#2e7d32' }}>₹{selectedInvoice.balance.toLocaleString()}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Installments */}
                  {detailTab === 1 && (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell><strong>Installment</strong></TableCell>
                            <TableCell><strong>Due Date</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Paid Date</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {installments.map((inst) => (
                            <TableRow key={inst.installment_no}>
                              <TableCell>{inst.label}</TableCell>
                              <TableCell>{new Date(inst.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                              <TableCell align="right">₹{inst.amount.toLocaleString()}</TableCell>
                              <TableCell>
                                <Chip
                                  label={inst.status.charAt(0).toUpperCase() + inst.status.slice(1)}
                                  size="small"
                                  color={inst.status === 'paid' ? 'success' : inst.status === 'overdue' ? 'error' : 'warning'}
                                />
                              </TableCell>
                              <TableCell>{inst.paid_date ? new Date(inst.paid_date).toLocaleDateString('en-IN') : '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Payment History */}
                  {detailTab === 2 && (
                    <>
                      {paymentHistory.length === 0 ? (
                        <Alert severity="info">No payments recorded for this invoice yet.</Alert>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell><strong>Date</strong></TableCell>
                                <TableCell align="right"><strong>Amount</strong></TableCell>
                                <TableCell><strong>Mode</strong></TableCell>
                                <TableCell><strong>Receipt ID</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paymentHistory.map((p, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                  <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>₹{p.amount.toLocaleString()}</TableCell>
                                  <TableCell>{p.mode}</TableCell>
                                  <TableCell><Typography variant="body2" fontFamily="monospace">{p.receipt_id}</Typography></TableCell>
                                </TableRow>
                              ))}
                              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell><strong>Total Paid</strong></TableCell>
                                <TableCell align="right"><strong style={{ color: '#2e7d32' }}>₹{selectedInvoice.amount_paid.toLocaleString()}</strong></TableCell>
                                <TableCell />
                                <TableCell />
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button startIcon={<DownloadIcon />} sx={{ textTransform: 'none' }}>Download PDF</Button>
                <Button startIcon={<PrintIcon />} sx={{ textTransform: 'none' }}>Print</Button>
                <Box sx={{ flex: 1 }} />
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      {/* ================================================================== */}
      {/* STUDENT LEDGER DIALOG */}
      {/* ================================================================== */}
      <Dialog open={ledgerOpen} onClose={() => setLedgerOpen(false)} maxWidth="md" fullWidth>
        {ledgerStudent && (() => {
          // Build ledger from all invoices for this student
          const studentInvoices = invoices.filter(i => i.student_id === ledgerStudent.id && i.status !== 'cancelled');
          const ledgerEntries: Array<{ date: string; description: string; debit: number; credit: number; balance: number }> = [];
          let runningBalance = 0;

          // Opening balance
          ledgerEntries.push({ date: '2025-04-01', description: 'Opening Balance (AY 2025-26)', debit: 0, credit: 0, balance: 0 });

          studentInvoices.forEach(inv => {
            // Invoice generated (debit)
            runningBalance += inv.amount_due;
            ledgerEntries.push({
              date: inv.issue_date || '2025-04-15',
              description: `Invoice ${inv.invoice_number} — Fee for ${inv.class_name}`,
              debit: inv.amount_due,
              credit: 0,
              balance: runningBalance,
            });

            // Payments (credits)
            if (inv.amount_paid > 0) {
              const history = generatePaymentHistory(inv);
              history.forEach(p => {
                runningBalance -= p.amount;
                ledgerEntries.push({
                  date: p.date,
                  description: `Payment via ${p.mode} — ${p.receipt_id}`,
                  debit: 0,
                  credit: p.amount,
                  balance: runningBalance,
                });
              });
            }
          });

          return (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountBalanceWallet color="primary" />
                  <Typography variant="h6" fontWeight={700}>Student Ledger</Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body1" fontWeight={600}>{ledgerStudent.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Roll No.</Typography>
                        <Typography variant="body1" fontWeight={600}>{ledgerStudent.roll}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Class</Typography>
                        <Typography variant="body1" fontWeight={600}>{ledgerStudent.class}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                        <Typography variant="body1" fontWeight={700} color={runningBalance > 0 ? 'error.main' : 'success.main'}>
                          ₹{Math.abs(runningBalance).toLocaleString()} {runningBalance > 0 ? '(Due)' : '(Clear)'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Alert severity="info" icon={<HistoryIcon />}>
                    This ledger shows a bank statement–style view of all financial transactions for this student.
                  </Alert>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Description</strong></TableCell>
                          <TableCell align="right"><strong>Debit (₹)</strong></TableCell>
                          <TableCell align="right"><strong>Credit (₹)</strong></TableCell>
                          <TableCell align="right"><strong>Balance (₹)</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {ledgerEntries.map((entry, idx) => (
                          <TableRow key={idx} sx={idx === 0 ? { backgroundColor: 'grey.50' } : {}}>
                            <TableCell>{new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                            <TableCell>{entry.description}</TableCell>
                            <TableCell align="right" sx={{ color: entry.debit > 0 ? 'error.main' : undefined }}>
                              {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '—'}
                            </TableCell>
                            <TableCell align="right" sx={{ color: entry.credit > 0 ? 'success.main' : undefined }}>
                              {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '—'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: entry.balance > 0 ? 'error.main' : 'success.main' }}>
                              ₹{entry.balance.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button startIcon={<DownloadIcon />} sx={{ textTransform: 'none' }}>Export PDF</Button>
                <Button startIcon={<PrintIcon />} sx={{ textTransform: 'none' }}>Print</Button>
                <Box sx={{ flex: 1 }} />
                <Button onClick={() => setLedgerOpen(false)}>Close</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}
