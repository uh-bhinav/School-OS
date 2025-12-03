import { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { feeComponentService } from '../../../services/finance';
import type { FeeComponent, FeeComponentType, FeeComponentCategory, FeeComponentStatus } from '../../../services/finance/types';

const CATEGORIES: FeeComponentCategory[] = [
  'Tuition',
  'Transport',
  'Lab',
  'Library',
  'Sports',
  'Uniform',
  'Books',
  'Activity',
  'Exam',
  'Other',
];

const TYPES: FeeComponentType[] = ['recurring', 'one-time'];
const STATUSES: FeeComponentStatus[] = ['active', 'inactive', 'archived'];

interface EditComponentDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (component: FeeComponent) => void;
  component: FeeComponent;
}

export default function EditComponentDialog({
  open,
  onClose,
  onUpdate,
  component,
}: EditComponentDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [type, setType] = useState<FeeComponentType>('recurring');
  const [category, setCategory] = useState<FeeComponentCategory>('Tuition');
  const [status, setStatus] = useState<FeeComponentStatus>('active');
  const [isOptional, setIsOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (component) {
      setName(component.name);
      setDescription(component.description || '');
      setBaseAmount(component.base_amount);
      setType(component.type);
      setCategory(component.category);
      setStatus(component.status);
      setIsOptional(component.is_optional);
    }
  }, [component]);

  const handleSubmit = async () => {
    if (!name.trim() || baseAmount <= 0) {
      setError('Component name and valid amount are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const updated = await feeComponentService.update(component.component_id, {
        name: name.trim(),
        description: description.trim() || undefined,
        base_amount: baseAmount,
        type,
        category,
        status,
        is_optional: isOptional,
      });

      if (updated) {
        onUpdate(updated);
      }
    } catch (err) {
      setError('Failed to update component. Please try again.');
      console.error('Update component error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Edit Fee Component
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update component properties
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
            label="Component Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            label="Base Amount"
            fullWidth
            required
            type="number"
            value={baseAmount || ''}
            onChange={(e) => setBaseAmount(Number(e.target.value))}
          />

          <TextField
            label="Category"
            fullWidth
            required
            select
            value={category}
            onChange={(e) => setCategory(e.target.value as FeeComponentCategory)}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Type"
            fullWidth
            required
            select
            value={type}
            onChange={(e) => setType(e.target.value as FeeComponentType)}
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t === 'recurring' ? 'Recurring' : 'One-Time'}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Status"
            fullWidth
            required
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as FeeComponentStatus)}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={isOptional}
                onChange={(e) => setIsOptional(e.target.checked)}
              />
            }
            label="Optional (Students can opt-out)"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !name.trim() || baseAmount <= 0}
        >
          {loading ? 'Updating...' : 'Update Component'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
