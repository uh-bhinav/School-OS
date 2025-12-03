import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { invoiceService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { Invoice, InvoiceStatus, BulkInvoiceCreate } from '../../../services/finance/types';
import { MOCK_CLASSES } from '../../../mockDataProviders/finance';

const STATUS_COLORS: Record<InvoiceStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  pending: 'warning',
  due: 'info',
  partially_paid: 'primary',
  paid: 'success',
  overdue: 'error',
  cancelled: 'default',
};

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('');
  const [filterClass, setFilterClass] = useState<number | ''>('');

  const { invoices, setInvoices, addBulkInvoices } = useFinanceStore();

  const [bulkForm, setBulkForm] = useState<BulkInvoiceCreate>({
    class_id: 0,
    fee_term_id: 1,
    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

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

  const handleGenerateBulk = async () => {
    try {
      const result = await invoiceService.generateBulk(bulkForm);
      addBulkInvoices(result.invoices);
      setBulkDialogOpen(false);
      setBulkForm({
        class_id: 0,
        fee_term_id: 1,
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to generate invoices:', error);
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
    setViewDialogOpen(true);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus && inv.status !== filterStatus) return false;
    if (filterClass && inv.class_id !== filterClass) return false;
    return true;
  });

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">Invoices</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage and track all student invoices
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setBulkDialogOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Generate Bulk Invoices
        </Button>
      </Box>

      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Total Invoices</Typography>
            <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Pending</Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.pending}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Overdue</Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">{stats.overdue}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Paid</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">{stats.paid}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <FilterIcon color="action" />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | '')}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="due">Due</MenuItem>
              <MenuItem value="partially_paid">Partially Paid</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField
              select
              label="Class"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value ? Number(e.target.value) : '')}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {MOCK_CLASSES.map((cls) => (
                <MenuItem key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              Showing {filteredInvoices.length} of {stats.total} invoices
            </Typography>
          </Stack>
        </CardContent>
      </Card>

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
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No invoices found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.invoice_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {invoice.invoice_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{invoice.student_name}</Typography>
                    </TableCell>
                    <TableCell>{invoice.class_name}</TableCell>
                    <TableCell>₹{invoice.amount_due.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color={invoice.balance > 0 ? 'error.main' : 'success.main'}>
                        ₹{invoice.balance.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={invoice.status} color={STATUS_COLORS[invoice.status]} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                        <Tooltip title="Cancel Invoice">
                          <IconButton size="small" color="error" onClick={() => handleCancelInvoice(invoice.invoice_id)}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Bulk Invoices</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              select
              label="Select Class"
              value={bulkForm.class_id || ''}
              onChange={(e) => setBulkForm({ ...bulkForm, class_id: Number(e.target.value) })}
              fullWidth
              required
            >
              {MOCK_CLASSES.map((cls) => (
                <MenuItem key={cls.class_id} value={cls.class_id}>
                  {cls.class_name} ({cls.student_count} students)
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              value={bulkForm.due_date}
              onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateBulk} disabled={!bulkForm.class_id || !bulkForm.due_date}>
            Generate Invoices
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedInvoice && (
          <>
            <DialogTitle>Invoice Details - {selectedInvoice.invoice_number}</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Student Information</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedInvoice.student_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Roll No: {selectedInvoice.roll_no} | Class: {selectedInvoice.class_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Invoice Items</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInvoice.items.map((item) => (
                          <TableRow key={item.item_id}>
                            <TableCell>{item.component_name}</TableCell>
                            <TableCell align="right">₹{item.final_amount.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
                    <Typography variant="body2">Amount Due:</Typography>
                    <Typography variant="body2" fontWeight={600}>₹{selectedInvoice.amount_due.toLocaleString()}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
                    <Typography variant="body2">Amount Paid:</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      ₹{selectedInvoice.amount_paid.toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ py: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body1" fontWeight={600}>Balance:</Typography>
                    <Typography variant="body1" fontWeight={700} color={selectedInvoice.balance > 0 ? 'error.main' : 'success.main'}>
                      ₹{selectedInvoice.balance.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
