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
  Paper,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocalOffer as DiscountIcon,
} from '@mui/icons-material';
import { studentDiscountService, discountRuleService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { StudentDiscountAssignment, DiscountRule } from '../../../services/finance/types';
import { MOCK_CLASSES } from '../../../mockDataProviders/finance';
import AssignDiscountDialog from './AssignDiscountDialog';
import BulkAssignDiscountDialog from './BulkAssignDiscountDialog';

export default function StudentDiscountsPage() {
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [filterClass, setFilterClass] = useState<number | ''>('');

  const { studentDiscounts, setStudentDiscounts, addStudentDiscount, removeStudentDiscount } =
    useFinanceStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData] = await Promise.all([discountRuleService.getAll()]);

      // Get all student discount assignments
      const allAssignments: StudentDiscountAssignment[] = [];
      for (const classInfo of MOCK_CLASSES) {
        const classAssignments = await studentDiscountService.getByClass(classInfo.class_id);
        allAssignments.push(...classAssignments);
      }

      setStudentDiscounts(allAssignments);
      setDiscountRules(rulesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDiscount = (assignment: StudentDiscountAssignment) => {
    addStudentDiscount(assignment);
    setAssignDialogOpen(false);
  };

  const handleBulkAssign = (assignments: StudentDiscountAssignment[]) => {
    assignments.forEach((a) => addStudentDiscount(a));
    setBulkDialogOpen(false);
  };

  const handleRemoveDiscount = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this discount assignment?')) {
      return;
    }

    try {
      await studentDiscountService.unassign(assignmentId);
      removeStudentDiscount(assignmentId);
    } catch (error) {
      console.error('Failed to remove discount:', error);
    }
  };

  const filteredDiscounts = studentDiscounts.filter((discount) => {
    if (filterClass && discount.class_id !== filterClass) return false;
    return true;
  });

  const activeAssignments = studentDiscounts.filter((d) => d.is_active);
  const uniqueStudents = new Set(studentDiscounts.map((d) => d.student_id)).size;
  const totalDiscount = activeAssignments.reduce((sum, a) => sum + a.calculated_discount, 0);

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
            <DiscountIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Student Discount Assignments
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Assign discount rules to students for invoice calculations
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setBulkDialogOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Bulk Assign
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAssignDialogOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Assign Discount
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Assignments
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {studentDiscounts.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Students with Discounts
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {uniqueStudents}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Rules
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {discountRules.filter((r) => r.is_active).length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Discount Value
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              ₹{totalDiscount.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note:</strong> Discounts are automatically applied during invoice generation.
        Multiple discounts can be assigned to a single student and will be cumulative.
      </Alert>

      {/* Filter */}
      <Box mb={3}>
        <TextField
          select
          size="small"
          label="Filter by Class"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value === '' ? '' : Number(e.target.value))}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">All Classes</MenuItem>
          {MOCK_CLASSES.map((cls) => (
            <MenuItem key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Assignments Table */}
      {filteredDiscounts.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <DiscountIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Discount Assignments Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start assigning discount rules to students to reduce their fee amounts
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAssignDialogOpen(true)}
          >
            Assign Discount
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Discount Rule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Discount Value</TableCell>
                <TableCell align="right">Calculated Amount</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDiscounts.map((assignment) => (
                <TableRow key={assignment.assignment_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {assignment.student_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Roll: {assignment.roll_no}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{assignment.class_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {assignment.discount_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                      size="small"
                      color={assignment.discount_type === 'percentage' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {assignment.discount_type === 'percentage'
                        ? `${assignment.discount_value}%`
                        : `₹${assignment.discount_value.toLocaleString()}`}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600} color="success.main">
                      -₹{assignment.calculated_discount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(assignment.applied_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.is_active ? 'ACTIVE' : 'INACTIVE'}
                      size="small"
                      color={assignment.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Remove Assignment">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveDiscount(assignment.assignment_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogs */}
      <AssignDiscountDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        onAssign={handleAssignDiscount}
        discountRules={discountRules.filter((r) => r.is_active)}
      />

      <BulkAssignDiscountDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onAssign={handleBulkAssign}
        discountRules={discountRules.filter((r) => r.is_active)}
      />
    </Box>
  );
}
