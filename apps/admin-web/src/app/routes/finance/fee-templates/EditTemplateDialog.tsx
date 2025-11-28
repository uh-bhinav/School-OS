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

interface EditTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (template: FeeTemplate) => void;
  template: FeeTemplate;
  components: FeeComponent[];
}

const TERMS: FeeTerm[] = ['Annual', 'Term1', 'Term2', 'Term3', 'Monthly', 'Quarterly'];

export default function EditTemplateDialog({
  open,
  onClose,
  onUpdate,
  template,
  components,
}: EditTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState<FeeTerm>('Annual');
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('active');
  const [selectedComponentIds, setSelectedComponentIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setTerm(template.term);
      setStatus(template.status);
      setSelectedComponentIds(template.components.map((c) => c.component_id));
    }
  }, [template]);

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

      const updated = await feeTemplateService.update(template.template_id, {
        name: name.trim(),
        description: description.trim() || undefined,
        term,
        status,
        component_ids: selectedComponentIds,
      });

      if (updated) {
        onUpdate(updated);
      }
    } catch (err) {
      setError('Failed to update template. Please try again.');
      console.error('Update template error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Edit Fee Template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update template details and components
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

          <TextField
            label="Status"
            fullWidth
            required
            select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </TextField>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Fee Components
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Add or remove components from this template
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value=""
              onChange={(e) => handleAddComponent(Number(e.target.value))}
              disabled={activeComponents.length === selectedComponentIds.length}
              sx={{ mt: 1 }}
            >
              <MenuItem value="" disabled>
                -- Add a component --
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
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || selectedComponentIds.length === 0 || !name.trim()}
        >
          {loading ? 'Updating...' : 'Update Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
