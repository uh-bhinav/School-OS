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
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { feeTemplateService } from '../../../services/finance';
import type { FeeComponent, FeeTerm, FeeTemplate } from '../../../services/finance/types';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (template: FeeTemplate) => void;
  components: FeeComponent[];
}

const TERMS: FeeTerm[] = ['Annual', 'Term1', 'Term2', 'Term3', 'Monthly', 'Quarterly'];

export default function CreateTemplateDialog({
  open,
  onClose,
  onCreate,
  components,
}: CreateTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState<FeeTerm>('Annual');
  const [selectedComponentIds, setSelectedComponentIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeComponents = components.filter((c) => c.status === 'active');
  const selectedComponents = activeComponents.filter((c) =>
    selectedComponentIds.includes(c.component_id)
  );
  const totalAmount = selectedComponents.reduce((sum, c) => sum + c.base_amount, 0);

  const handleAddComponent = (componentId: number) => {
    if (!selectedComponentIds.includes(componentId)) {
      setSelectedComponentIds([...selectedComponentIds, componentId]);
    }
  };

  const handleRemoveComponent = (componentId: number) => {
    setSelectedComponentIds(selectedComponentIds.filter((id) => id !== componentId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (selectedComponentIds.length === 0) {
      setError('Please select at least one fee component');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const template = await feeTemplateService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        academic_year_id: 1,
        term,
        component_ids: selectedComponentIds,
      });

      onCreate(template);
      handleClose();
    } catch (err) {
      setError('Failed to create template. Please try again.');
      console.error('Create template error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setTerm('Annual');
    setSelectedComponentIds([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Create Fee Template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Build a template by selecting fee components
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
            label="Template Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Primary Classes (1-5) - Annual Fee"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for this template"
          />

          <TextField
            label="Fee Term"
            fullWidth
            required
            select
            value={term}
            onChange={(e) => setTerm(e.target.value as FeeTerm)}
          >
            {TERMS.map((t) => (
              <MenuItem key={t} value={t}>
                {t.replace(/(\d)/, ' $1')}
              </MenuItem>
            ))}
          </TextField>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Select Fee Components
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Choose components to include in this template
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value=""
              onChange={(e) => handleAddComponent(Number(e.target.value))}
              disabled={activeComponents.length === selectedComponentIds.length}
              placeholder="Add component..."
              sx={{ mt: 1 }}
            >
              <MenuItem value="" disabled>
                -- Select a component --
              </MenuItem>
              {activeComponents
                .filter((c) => !selectedComponentIds.includes(c.component_id))
                .map((component) => (
                  <MenuItem key={component.component_id} value={component.component_id}>
                    {component.name} - ₹{component.base_amount.toLocaleString()}
                    <Chip
                      label={component.category}
                      size="small"
                      sx={{ ml: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  </MenuItem>
                ))}
            </TextField>
          </Box>

          {selectedComponents.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Selected Components ({selectedComponents.length})
              </Typography>
              <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                {selectedComponents.map((component) => (
                  <ListItem key={component.component_id}>
                    <ListItemText
                      primary={component.name}
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={component.category} size="small" />
                          <Typography variant="caption">
                            {component.is_optional ? 'Optional' : 'Mandatory'}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          ₹{component.base_amount.toLocaleString()}
                        </Typography>
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          onClick={() => handleRemoveComponent(component.component_id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'primary.50',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Total Template Amount
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  ₹{totalAmount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}

          {selectedComponents.length === 0 && (
            <Alert severity="warning">
              Please add at least one fee component to this template
            </Alert>
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
          disabled={loading || selectedComponentIds.length === 0 || !name.trim()}
        >
          {loading ? 'Creating...' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
