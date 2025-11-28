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
  CircularProgress,
  Stack,
} from '@mui/material';
import { Payment as PaymentIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { paymentService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { PaymentStatus } from '../../../services/finance/types';

const STATUS_COLORS: Record<PaymentStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  authorized: 'info',
  captured: 'success',
  failed: 'error',
  refunded: 'default',
  captured_allocation_failed: 'error',
};

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const { payments, setPayments } = useFinanceStore();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: payments.length,
    captured: payments.filter((p) => p.status === 'captured').length,
    pending: payments.filter((p) => p.status === 'pending').length,
    totalAmount: payments.reduce((sum, p) => (p.status === 'captured' ? sum + p.amount_paid : sum), 0),
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
            <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Payments
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Track and manage all payment transactions
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadPayments} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Total Payments</Typography>
            <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Captured</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">{stats.captured}</Typography>
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
            <Typography variant="body2" color="text.secondary">Total Collected</Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              ₹{stats.totalAmount.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment ID</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No payments found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.payment_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        #{payment.payment_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.invoice_number || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{payment.student_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{payment.amount_paid.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.method ? payment.method.toUpperCase() : 'N/A'}</TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={payment.status} color={STATUS_COLORS[payment.status]} size="small" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
