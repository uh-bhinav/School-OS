import { Box, Typography, Card, CardContent } from '@mui/material';
import { Inventory } from '@mui/icons-material';

export default function ProductsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Products
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            The Products module is currently under development. This page will allow you to:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Manage school merchandise and products</li>
            <li>Set up product catalog with pricing</li>
            <li>Track inventory and stock levels</li>
            <li>Configure product variants and options</li>
            <li>Generate product sales reports</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
