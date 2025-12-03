// ============================================================================
// DISCOUNTS PAGE - Discount rules management with mock data
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
import { LocalOffer, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { discountRuleService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';

export default function DiscountsPage() {
  const [loading, setLoading] = useState(true);
  const { discountRules, setDiscountRules } = useFinanceStore();

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountRuleService.getAll();
      setDiscountRules(data);
    } catch (error) {
      console.error('Failed to load discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: discountRules.length,
    active: discountRules.filter((d) => d.is_active).length,
    percentage: discountRules.filter((d) => d.type === 'percentage').length,
    fixed: discountRules.filter((d) => d.type === 'fixed').length,
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
            <LocalOffer sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Discount Rules
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage discount schemes and rules
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadDiscounts} sx={{ textTransform: 'none' }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>
            Add Discount Rule
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total Rules
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {stats.total}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.active}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Percentage Type
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {stats.percentage}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Fixed Amount Type
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
              {stats.fixed}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Discounts Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Discount Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Applicable To</TableCell>
                <TableCell>Valid From</TableCell>
                <TableCell>Valid To</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discountRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No discount rules found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                discountRules.map((discount) => (
                  <TableRow key={discount.rule_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {discount.name}
                      </Typography>
                      {discount.description && (
                        <Typography variant="caption" color="text.secondary">
                          {discount.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        size="small"
                        color={discount.type === 'percentage' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={discount.applicable_to.replace('_', ' ').toUpperCase()} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{discount.valid_from ? new Date(discount.valid_from).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{discount.valid_to ? new Date(discount.valid_to).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={discount.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={discount.is_active ? 'success' : 'default'}
                      />
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
