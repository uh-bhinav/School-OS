import { Box, Typography, Card, CardContent } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';

export default function DiscountsPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <LocalOffer sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Discounts
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            The Discounts module is currently under development. This page will allow you to:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>Create and manage discount schemes</li>
            <li>Apply discounts to student fees</li>
            <li>Set up scholarship programs</li>
            <li>Track discount utilization</li>
            <li>Generate discount reports</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
