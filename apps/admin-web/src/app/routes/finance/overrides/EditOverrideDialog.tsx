import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { studentOverrideService } from '../../../services/finance';
import type { StudentFeeOverride, FeeComponent } from '../../../services/finance/types';

interface EditOverrideDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (override: StudentFeeOverride) => void;
  override: StudentFeeOverride;
  components?: FeeComponent[];
}

export default function EditOverrideDialog({
  open,
  onClose,
  onUpdate,
  override,
}: EditOverrideDialogProps) {
  const [overrideAmount, setOverrideAmount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (override) {
      setOverrideAmount(override.override_amount);
      setIsActive(override.is_active);
      setReason(override.reason || '');
    }
  }, [override]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const updated = await studentOverrideService.update(override.override_id, {
        override_amount: overrideAmount,
        is_active: isActive,
        reason: reason || undefined,
      });

      if (updated) {
        onUpdate(updated);
      }
    } catch (err) {
      setError('Failed to update override. Please try again.');
      console.error('Update override error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Edit Fee Override
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update override details for {override.student_name}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Student
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {override.student_name} - {override.roll_no}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {override.class_name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Component
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {override.component_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Original amount: ₹{override.original_amount.toLocaleString()}
            </Typography>
          </Box>

          <TextField
            label="Override Amount"
            fullWidth
            required
            type="number"
            value={overrideAmount}
            onChange={(e) => setOverrideAmount(Number(e.target.value))}
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
                <strong>Original:</strong> ₹{override.original_amount.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Override:</strong> ₹{overrideAmount.toLocaleString()}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color={
                  override.original_amount - overrideAmount > 0 ? 'success.main' : 'error.main'
                }
              >
                <strong>Adjustment:</strong>{' '}
                {override.original_amount - overrideAmount > 0 ? '-' : '+'}₹
                {Math.abs(override.original_amount - overrideAmount).toLocaleString()}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Updating...' : 'Update Override'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
