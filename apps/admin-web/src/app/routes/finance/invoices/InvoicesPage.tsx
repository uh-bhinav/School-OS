import { Box, Typography, Card, CardContent } from '@mui/material';
import { Receipt } from '@mui/icons-material';

export default function InvoicesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Receipt sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Invoices
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            The Invoices module is currently under development. This page will allow you to:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Generate and manage invoices</li>
            <li>Track invoice status (pending, paid, overdue)</li>
            <li>Send invoices to parents via email</li>
            <li>View invoice history and reports</li>
            <li>Export invoices to PDF</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
