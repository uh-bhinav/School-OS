import { Box, Typography, Card, CardContent } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';

export default function RefundsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Refunds
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            The Refunds module is currently under development. This page will allow you to:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Process refund requests</li>
            <li>Track refund status and approvals</li>
            <li>View refund history</li>
            <li>Manage refund policies</li>
            <li>Generate refund reports</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
