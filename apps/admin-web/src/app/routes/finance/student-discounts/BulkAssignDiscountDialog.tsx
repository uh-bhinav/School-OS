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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { studentDiscountService } from '../../../services/finance';
import type { StudentDiscountAssignment, DiscountRule } from '../../../services/finance/types';
import { MOCK_STUDENTS } from '../../../mockDataProviders/finance';

interface BulkAssignDiscountDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (assignments: StudentDiscountAssignment[]) => void;
  discountRules: DiscountRule[];
}

export default function BulkAssignDiscountDialog({
  open,
  onClose,
  onAssign,
  discountRules,
}: BulkAssignDiscountDialogProps) {
  const [discountId, setDiscountId] = useState<number>(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRule = discountRules.find((r) => r.rule_id === discountId);

  const handleToggleStudent = (studentId: number) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === MOCK_STUDENTS.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(MOCK_STUDENTS.map((s) => s.student_id));
    }
  };

  const handleSubmit = async () => {
    if (!discountId || selectedStudentIds.length === 0) {
      setError('Please select a discount rule and at least one student');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const assignments = await studentDiscountService.bulkAssign(selectedStudentIds, discountId);

      onAssign(assignments);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign discounts. Please try again.');
      console.error('Bulk assign discount error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDiscountId(0);
    setSelectedStudentIds([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Bulk Assign Discount
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Assign the same discount rule to multiple students at once
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
                <Chip
                  label={
                    rule.type === 'percentage' ? `${rule.value}%` : `₹${rule.value}`
                  }
                  size="small"
                  sx={{ ml: 1 }}
                />
              </MenuItem>
            ))}
          </TextField>

          {discountRules.length === 0 && (
            <Alert severity="warning">
              No active discount rules found. Create discount rules first in the Discounts page.
            </Alert>
          )}

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Select Students ({selectedStudentIds.length} selected)
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedStudentIds.length === MOCK_STUDENTS.length}
                    indeterminate={
                      selectedStudentIds.length > 0 &&
                      selectedStudentIds.length < MOCK_STUDENTS.length
                    }
                    onChange={handleSelectAll}
                  />
                }
                label="Select All"
              />
            </Box>

            <List
              dense
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              {MOCK_STUDENTS.map((student) => (
                <ListItem
                  key={student.student_id}
                  onClick={() => handleToggleStudent(student.student_id)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedStudentIds.includes(student.student_id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary={student.student_name}
                    secondary={`${student.roll_no} - ${student.class_name}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {selectedRule && selectedStudentIds.length > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.50',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Bulk Assignment Summary
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Discount:</strong> {selectedRule.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong>{' '}
                  {selectedRule.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </Typography>
                <Typography variant="body2">
                  <strong>Value:</strong>{' '}
                  {selectedRule.type === 'percentage'
                    ? `${selectedRule.value}%`
                    : `₹${selectedRule.value.toLocaleString()}`}
                </Typography>
                <Typography variant="body2">
                  <strong>Students:</strong> {selectedStudentIds.length} selected
                </Typography>
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
          disabled={loading || !discountId || selectedStudentIds.length === 0}
        >
          {loading ? 'Assigning...' : `Assign to ${selectedStudentIds.length} Students`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
