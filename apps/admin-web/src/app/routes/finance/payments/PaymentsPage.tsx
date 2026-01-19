import { Box, Typography, Card, CardContent } from '@mui/material';
import { Payment } from '@mui/icons-material';

export default function PaymentsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Payment sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Payments
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            The Payments module is currently under development. This page will allow you to:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Record and track payments</li>
            <li>Process online payments via Razorpay</li>
            <li>View payment history and receipts</li>
            <li>Reconcile payments with invoices</li>
            <li>Generate payment reports</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
