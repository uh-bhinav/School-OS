// ============================================================================
// PAYMENTS PAGE - Enhanced with Filters, Extra Columns, Student Ledger
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Stack, TextField, MenuItem,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Alert, IconButton, Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon, Refresh as RefreshIcon, FilterList as FilterIcon,
  AccountBalanceWallet, Download as DownloadIcon, Print as PrintIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { paymentService, invoiceService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { PaymentStatus, PaymentMethod, Invoice } from '../../../services/finance/types';
import { MOCK_CLASSES } from '../../../mockDataProviders/finance';

const STATUS_COLORS: Record<PaymentStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  authorized: 'info',
  captured: 'success',
  failed: 'error',
  refunded: 'default',
  captured_allocation_failed: 'error',
};

type DatePreset = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const { payments, setPayments } = useFinanceStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Filters
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('');
  const [filterClass, setFilterClass] = useState<number | ''>('');
  const [filterSearch, setFilterSearch] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Ledger
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerStudent, setLedgerStudent] = useState<{ name: string; id: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, invoicesData] = await Promise.all([
        paymentService.getAll(),
        invoiceService.getAll(),
      ]);
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build invoice lookup
  const invoiceLookup = useMemo(() => {
    const map = new Map<number, Invoice>();
    invoices.forEach(inv => map.set(inv.invoice_id, inv));
    return map;
  }, [invoices]);

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

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (filterStatus) filtered = filtered.filter(p => p.status === filterStatus);
    if (filterMethod) filtered = filtered.filter(p => p.method === filterMethod);
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.student_name.toLowerCase().includes(q) ||
        (p.invoice_number || '').toLowerCase().includes(q) ||
        String(p.payment_id).includes(q)
      );
    }

    if (filterClass) {
      // Filter by invoice class
      filtered = filtered.filter(p => {
        if (!p.invoice_id) return false;
        const inv = invoiceLookup.get(p.invoice_id);
        return inv ? inv.class_id === filterClass : false;
      });
    }

    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter(p => p.payment_date >= dateRange.from && p.payment_date <= dateRange.to);
    }

    return filtered;
  }, [payments, filterStatus, filterMethod, filterClass, filterSearch, datePreset, customFrom, customTo, invoiceLookup]);

  const stats = useMemo(() => ({
    total: payments.length,
    captured: payments.filter(p => p.status === 'captured').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments.reduce((sum, p) => p.status === 'captured' ? sum + p.amount_paid : sum, 0),
  }), [payments]);

  const openLedger = (studentId: number, studentName: string) => {
    setLedgerStudent({ id: studentId, name: studentName });
    setLedgerOpen(true);
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
            <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">Payments</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Track and manage all payment transactions — cash movement records
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadData} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Total Payments</Typography>
          <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Captured</Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">{stats.captured}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Pending</Typography>
          <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pending}</Typography>
        </CardContent></Card>
        <Card sx={{ flex: 1 }}><CardContent>
          <Typography variant="body2" color="text.secondary">Total Collected</Typography>
          <Typography variant="h4" fontWeight="bold" color="primary.main">₹{stats.totalAmount.toLocaleString()}</Typography>
        </CardContent></Card>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <FilterIcon color="action" />

            <TextField
              size="small" label="Search" placeholder="Student, Invoice #, ID..."
              value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            <TextField select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')} size="small" sx={{ minWidth: 140 }}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="captured">Captured</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="authorized">Authorized</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </TextField>

            <TextField select label="Method" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | '')} size="small" sx={{ minWidth: 140 }}>
              <MenuItem value="">All Methods</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="netbanking">Net Banking</MenuItem>
            </TextField>

            <TextField select label="Class" value={filterClass} onChange={(e) => setFilterClass(e.target.value ? Number(e.target.value) : '')} size="small" sx={{ minWidth: 140 }}>
              <MenuItem value="">All Classes</MenuItem>
              {MOCK_CLASSES.map(cls => <MenuItem key={cls.class_id} value={cls.class_id}>{cls.class_name}</MenuItem>)}
            </TextField>

            <Divider orientation="vertical" flexItem />

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
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Showing {filteredPayments.length} of {stats.total} payments
          </Typography>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment ID</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Student</TableCell>
                <TableCell align="right">Amount Paid</TableCell>
                <TableCell align="right">Invoice Total</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No payments found.</Typography>
                </TableCell></TableRow>
              ) : (
                filteredPayments.map(payment => {
                  const invoice = payment.invoice_id ? invoiceLookup.get(payment.invoice_id) : null;
                  const invoiceTotal = invoice?.amount_due || 0;
                  const remaining = invoice ? invoice.balance : 0;

                  return (
                    <TableRow key={payment.payment_id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>#{payment.payment_id}</Typography></TableCell>
                      <TableCell>{payment.invoice_number || 'N/A'}</TableCell>
                      <TableCell><Typography variant="body2">{payment.student_name}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={600} color="success.main">₹{payment.amount_paid.toLocaleString()}</Typography></TableCell>
                      <TableCell align="right">{invoiceTotal > 0 ? `₹${invoiceTotal.toLocaleString()}` : '—'}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color={remaining > 0 ? 'error.main' : 'success.main'}>
                          {invoiceTotal > 0 ? `₹${remaining.toLocaleString()}` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.method ? payment.method.toUpperCase() : 'N/A'}</TableCell>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell><Chip label={payment.status} color={STATUS_COLORS[payment.status]} size="small" /></TableCell>
                      <TableCell align="center">
                        <Tooltip title="Student Ledger">
                          <IconButton size="small" color="primary" onClick={() => openLedger(payment.student_id, payment.student_name)}>
                            <AccountBalanceWallet fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ================================================================== */}
      {/* STUDENT LEDGER DIALOG */}
      {/* ================================================================== */}
      <Dialog open={ledgerOpen} onClose={() => setLedgerOpen(false)} maxWidth="md" fullWidth>
        {ledgerStudent && (() => {
          const studentInvoices = invoices.filter(i => i.student_id === ledgerStudent.id && i.status !== 'cancelled');
          const studentPayments = payments.filter(p => p.student_id === ledgerStudent.id && p.status === 'captured');

          const ledgerEntries: Array<{ date: string; description: string; debit: number; credit: number; balance: number }> = [];
          let runningBalance = 0;

          ledgerEntries.push({ date: '2025-04-01', description: 'Opening Balance (AY 2025-26)', debit: 0, credit: 0, balance: 0 });

          // Combine and sort events
          const events: Array<{ date: string; type: 'invoice' | 'payment'; amount: number; desc: string }> = [];

          studentInvoices.forEach(inv => {
            events.push({ date: inv.issue_date || inv.created_at.split('T')[0], type: 'invoice', amount: inv.amount_due, desc: `Invoice ${inv.invoice_number} — ${inv.class_name}` });
          });

          studentPayments.forEach(p => {
            events.push({ date: p.payment_date, type: 'payment', amount: p.amount_paid, desc: `Payment via ${(p.method || 'N/A').toUpperCase()} — #${p.payment_id}` });
          });

          events.sort((a, b) => a.date.localeCompare(b.date));

          events.forEach(ev => {
            if (ev.type === 'invoice') {
              runningBalance += ev.amount;
              ledgerEntries.push({ date: ev.date, description: ev.desc, debit: ev.amount, credit: 0, balance: runningBalance });
            } else {
              runningBalance -= ev.amount;
              ledgerEntries.push({ date: ev.date, description: ev.desc, debit: 0, credit: ev.amount, balance: runningBalance });
            }
          });

          return (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountBalanceWallet color="primary" />
                  <Typography variant="h6" fontWeight={700}>Student Ledger — {ledgerStudent.name}</Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={4} alignItems="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary">Student</Typography>
                        <Typography variant="body1" fontWeight={600}>{ledgerStudent.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Invoiced</Typography>
                        <Typography variant="body1" fontWeight={600}>₹{studentInvoices.reduce((s, i) => s + i.amount_due, 0).toLocaleString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                        <Typography variant="body1" fontWeight={600} color="success.main">₹{studentPayments.reduce((s, p) => s + p.amount_paid, 0).toLocaleString()}</Typography>
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
                    Bank statement–style running balance. Debit = Fee charged, Credit = Payment received.
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
