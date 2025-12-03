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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { classMappingService } from '../../../services/finance';
import type { ClassTemplateMapping, FeeTemplate } from '../../../services/finance/types';

interface BulkAssignDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (mappings: ClassTemplateMapping[]) => void;
  templates: FeeTemplate[];
  classes: Array<{
    class_id: number;
    class_name: string;
    grade_level: number;
    section: string;
    student_count: number;
  }>;
}

export default function BulkAssignDialog({
  open,
  onClose,
  onAssign,
  templates,
  classes,
}: BulkAssignDialogProps) {
  const [templateId, setTemplateId] = useState<number>(0);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedTemplate = templates.find((t) => t.template_id === templateId);
  const totalStudents = classes
    .filter((c) => selectedClassIds.includes(c.class_id))
    .reduce((sum, c) => sum + c.student_count, 0);

  const handleToggleClass = (classId: number) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter((id) => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map((c) => c.class_id));
    }
  };

  const handleSubmit = async () => {
    if (!templateId || selectedClassIds.length === 0) {
      setError('Please select a template and at least one class');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const mappings = await classMappingService.bulkAssign(selectedClassIds, templateId, 1);

      onAssign(mappings);
      handleClose();
    } catch (err) {
      setError('Failed to assign template. Please try again.');
      console.error('Bulk assign error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTemplateId(0);
    setSelectedClassIds([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Bulk Assign Fee Template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Assign the same template to multiple classes at once
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
            label="Select Fee Template"
            fullWidth
            required
            select
            value={templateId}
            onChange={(e) => setTemplateId(Number(e.target.value))}
          >
            <MenuItem value={0} disabled>
              -- Select a template --
            </MenuItem>
            {templates.map((template) => (
              <MenuItem key={template.template_id} value={template.template_id}>
                {template.name}
                <Chip
                  label={template.term}
                  size="small"
                  sx={{ ml: 1 }}
                  variant="outlined"
                />
                <Chip
                  label={`₹${template.total_amount.toLocaleString()}`}
                  size="small"
                  sx={{ ml: 1 }}
                  color="primary"
                />
              </MenuItem>
            ))}
          </TextField>

          {templates.length === 0 && (
            <Alert severity="warning">
              No active fee templates found. Create a template first before assigning.
            </Alert>
          )}

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Select Classes ({selectedClassIds.length} selected)
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedClassIds.length === classes.length && classes.length > 0}
                    indeterminate={
                      selectedClassIds.length > 0 && selectedClassIds.length < classes.length
                    }
                    onChange={handleSelectAll}
                  />
                }
                label="Select All"
              />
            </Box>

            {classes.length === 0 ? (
              <Alert severity="info">
                All classes have been assigned fee templates already.
              </Alert>
            ) : (
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
                {classes.map((cls) => (
                  <ListItem
                    key={cls.class_id}
                    onClick={() => handleToggleClass(cls.class_id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedClassIds.includes(cls.class_id)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={cls.class_name}
                      secondary={`Grade ${cls.grade_level} - Section ${cls.section} (${cls.student_count} students)`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {selectedTemplate && selectedClassIds.length > 0 && (
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
                  <strong>Template:</strong> {selectedTemplate.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Classes:</strong> {selectedClassIds.length} selected
                </Typography>
                <Typography variant="body2">
                  <strong>Total Students:</strong> {totalStudents}
                </Typography>
                <Typography variant="body2">
                  <strong>Fee Amount per Student:</strong> ₹
                  {selectedTemplate.total_amount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  <strong>Total Expected Revenue:</strong> ₹
                  {(selectedTemplate.total_amount * totalStudents).toLocaleString()}
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
          disabled={loading || !templateId || selectedClassIds.length === 0}
        >
          {loading ? 'Assigning...' : `Assign to ${selectedClassIds.length} Classes`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
