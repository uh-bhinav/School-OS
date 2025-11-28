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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { feeComponentService } from '../../../services/finance';
import type { FeeComponent, FeeComponentType, FeeComponentCategory } from '../../../services/finance/types';

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

interface CreateComponentDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (component: FeeComponent) => void;
}

export default function CreateComponentDialog({
  open,
  onClose,
  onCreate,
}: CreateComponentDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [type, setType] = useState<FeeComponentType>('recurring');
  const [category, setCategory] = useState<FeeComponentCategory>('Tuition');
  const [isOptional, setIsOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || baseAmount <= 0) {
      setError('Component name and valid amount are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const component = await feeComponentService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        base_amount: baseAmount,
        type,
        category,
        is_optional: isOptional,
      });

      onCreate(component);
      handleClose();
    } catch (err) {
      setError('Failed to create component. Please try again.');
      console.error('Create component error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setBaseAmount(0);
    setType('recurring');
    setCategory('Tuition');
    setIsOptional(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Create Fee Component
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define a new fee component with its properties
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
            placeholder="e.g., Tuition Fee, Transport Fee, etc."
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />

          <TextField
            label="Base Amount"
            fullWidth
            required
            type="number"
            value={baseAmount || ''}
            onChange={(e) => setBaseAmount(Number(e.target.value))}
            placeholder="0"
            helperText="Enter the base fee amount in INR"
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
            helperText="Recurring fees are charged every term/year, one-time fees are charged once"
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t === 'recurring' ? 'Recurring' : 'One-Time'}
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
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !name.trim() || baseAmount <= 0}
        >
          {loading ? 'Creating...' : 'Create Component'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
