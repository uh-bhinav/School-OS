import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { studentDiscountService } from '../../../services/finance';
import type { StudentDiscountAssignment, DiscountRule } from '../../../services/finance/types';
import { MOCK_STUDENTS } from '../../../mockDataProviders/finance';

interface AssignDiscountDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (assignment: StudentDiscountAssignment) => void;
  discountRules: DiscountRule[];
}

export default function AssignDiscountDialog({
  open,
  onClose,
  onAssign,
  discountRules,
}: AssignDiscountDialogProps) {
  const [studentId, setStudentId] = useState<number>(0);
  const [discountId, setDiscountId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRule = discountRules.find((r) => r.rule_id === discountId);
  const selectedStudent = MOCK_STUDENTS.find((s) => s.student_id === studentId);

  const handleSubmit = async () => {
    if (!studentId || !discountId) {
      setError('Please select both student and discount rule');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const assignment = await studentDiscountService.assign({
        student_id: studentId,
        discount_id: discountId,
      });

      onAssign(assignment);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign discount. Please try again.');
      console.error('Assign discount error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStudentId(0);
    setDiscountId(0);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Assign Discount to Student
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a student and discount rule to apply
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            label="Select Student"
            fullWidth
            required
            select
            value={studentId}
            onChange={(e) => setStudentId(Number(e.target.value))}
          >
            <MenuItem value={0} disabled>
              -- Select a student --
            </MenuItem>
            {MOCK_STUDENTS.map((student) => (
              <MenuItem key={student.student_id} value={student.student_id}>
                {student.student_name} - {student.roll_no} ({student.class_name})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Select Discount Rule"
            fullWidth
            required
            select
            value={discountId}
            onChange={(e) => setDiscountId(Number(e.target.value))}
          >
            <MenuItem value={0} disabled>
              -- Select a discount rule --
            </MenuItem>
            {discountRules.map((rule) => (
              <MenuItem key={rule.rule_id} value={rule.rule_id}>
                {rule.name} -{' '}
                {rule.type === 'percentage' ? `${rule.value}%` : `₹${rule.value}`}
              </MenuItem>
            ))}
          </TextField>

          {discountRules.length === 0 && (
            <Alert severity="warning">
              No active discount rules found. Create discount rules first in the Discounts page.
            </Alert>
          )}

          {selectedStudent && selectedRule && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.50',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Assignment Summary
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Student:</strong> {selectedStudent.student_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Class:</strong> {selectedStudent.class_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Discount:</strong> {selectedRule.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong>{' '}
                  <Chip
                    label={selectedRule.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    size="small"
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Value:</strong>{' '}
                  {selectedRule.type === 'percentage'
                    ? `${selectedRule.value}%`
                    : `₹${selectedRule.value.toLocaleString()}`}
                </Typography>
                {selectedRule.description && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedRule.description}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !studentId || !discountId}
        >
          {loading ? 'Assigning...' : 'Assign Discount'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
