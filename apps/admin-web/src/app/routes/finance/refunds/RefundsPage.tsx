// ============================================================================
// REFUNDS PAGE - Displays refunded payments from the payment service
// ============================================================================

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import { AccountBalanceWallet, Refresh as RefreshIcon } from '@mui/icons-material';
import { paymentService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';

export default function RefundsPage() {
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

  // Filter only refunded payments
  const refundedPayments = payments.filter((p) => p.status === 'refunded');

  const stats = {
    total: refundedPayments.length,
    totalAmount: refundedPayments.reduce((sum, p) => sum + p.amount_paid, 0),
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
            <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Refunds
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            View and track refunded payments
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadPayments} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Refunds
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {stats.total}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Amount Refunded
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              ₹{stats.totalAmount.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Refunds Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment ID</TableCell>
                <TableCell>Invoice #</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Amount Refunded</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refundedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No refunds found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                refundedPayments.map((payment) => (
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
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        ₹{payment.amount_paid.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.method ? payment.method.toUpperCase() : 'N/A'}</TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label="Refunded" color="default" size="small" />
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
