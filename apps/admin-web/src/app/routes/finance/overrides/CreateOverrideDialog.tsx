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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { studentOverrideService } from '../../../services/finance';
import type { StudentFeeOverride, FeeComponent } from '../../../services/finance/types';
import { MOCK_STUDENTS } from '../../../mockDataProviders/finance';

interface CreateOverrideDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (override: StudentFeeOverride) => void;
  components: FeeComponent[];
}

export default function CreateOverrideDialog({
  open,
  onClose,
  onCreate,
  components,
}: CreateOverrideDialogProps) {
  const [studentId, setStudentId] = useState<number>(0);
  const [componentId, setComponentId] = useState<number>(0);
  const [overrideAmount, setOverrideAmount] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedComponent = components.find((c) => c.component_id === componentId);

  const handleSubmit = async () => {
    if (!studentId || !componentId) {
      setError('Please select both student and component');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const override = await studentOverrideService.create({
        student_id: studentId,
        component_id: componentId,
        override_amount: overrideAmount,
        is_active: isActive,
        reason: reason || undefined,
      });

      onCreate(override);
      handleClose();
    } catch (err) {
      setError('Failed to create override. Please try again.');
      console.error('Create override error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStudentId(0);
    setComponentId(0);
    setOverrideAmount(0);
    setIsActive(true);
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Create Fee Override
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Adjust or opt-out fee component for a student
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
            label="Select Fee Component"
            fullWidth
            required
            select
            value={componentId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setComponentId(id);
              const comp = components.find((c) => c.component_id === id);
              if (comp) setOverrideAmount(comp.base_amount);
            }}
          >
            <MenuItem value={0} disabled>
              -- Select a component --
            </MenuItem>
            {components.filter((c) => c.status === 'active').map((component) => (
              <MenuItem key={component.component_id} value={component.component_id}>
                {component.name} - ₹{component.base_amount.toLocaleString()}
              </MenuItem>
            ))}
          </TextField>

          {selectedComponent && (
            <>
              <TextField
                label="Override Amount"
                fullWidth
                required
                type="number"
                value={overrideAmount}
                onChange={(e) => setOverrideAmount(Number(e.target.value))}
                helperText={`Original amount: ₹${selectedComponent.base_amount.toLocaleString()}`}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => {
                      setIsActive(e.target.checked);
                      if (!e.target.checked) setOverrideAmount(0);
                    }}
                  />
                }
                label={isActive ? 'Active (Amount Adjustment)' : 'Opt-Out (Remove Component)'}
              />

              <TextField
                label="Reason"
                fullWidth
                multiline
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Merit scholarship, Medical exemption, etc."
              />

              {selectedComponent && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.50',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Summary
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      <strong>Original:</strong> ₹{selectedComponent.base_amount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Override:</strong> ₹{overrideAmount.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        selectedComponent.base_amount - overrideAmount > 0
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      <strong>Adjustment:</strong>{' '}
                      {selectedComponent.base_amount - overrideAmount > 0 ? '-' : '+'}₹
                      {Math.abs(selectedComponent.base_amount - overrideAmount).toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
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
          disabled={loading || !studentId || !componentId}
        >
          {loading ? 'Creating...' : 'Create Override'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
