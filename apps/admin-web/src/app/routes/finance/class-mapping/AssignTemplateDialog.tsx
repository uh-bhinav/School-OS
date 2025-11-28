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
import { classMappingService } from '../../../services/finance';
import type { ClassTemplateMapping, FeeTemplate } from '../../../services/finance/types';

interface AssignTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (mapping: ClassTemplateMapping) => void;
  templates: FeeTemplate[];
  classes: Array<{
    class_id: number;
    class_name: string;
    grade_level: number;
    section: string;
    student_count: number;
  }>;
}

export default function AssignTemplateDialog({
  open,
  onClose,
  onAssign,
  templates,
  classes,
}: AssignTemplateDialogProps) {
  const [classId, setClassId] = useState<number>(0);
  const [templateId, setTemplateId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedTemplate = templates.find((t) => t.template_id === templateId);
  const selectedClass = classes.find((c) => c.class_id === classId);

  const handleSubmit = async () => {
    if (!classId || !templateId) {
      setError('Please select both a class and a template');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const mapping = await classMappingService.create({
        class_id: classId,
        template_id: templateId,
        academic_year_id: 1,
      });

      onAssign(mapping);
      handleClose();
    } catch (err) {
      setError('Failed to assign template. Please try again.');
      console.error('Assign template error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClassId(0);
    setTemplateId(0);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Assign Fee Template to Class
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a class and the fee template to apply
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
            label="Select Class"
            fullWidth
            required
            select
            value={classId}
            onChange={(e) => setClassId(Number(e.target.value))}
          >
            <MenuItem value={0} disabled>
              -- Select a class --
            </MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls.class_id} value={cls.class_id}>
                {cls.class_name} - Section {cls.section} ({cls.student_count} students)
              </MenuItem>
            ))}
          </TextField>

          {classes.length === 0 && (
            <Alert severity="info">
              All classes have been assigned fee templates. Use Bulk Assign to reassign if needed.
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

          {selectedClass && selectedTemplate && (
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
                  <strong>Class:</strong> {selectedClass.class_name} (Grade {selectedClass.grade_level})
                </Typography>
                <Typography variant="body2">
                  <strong>Template:</strong> {selectedTemplate.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Fee Amount:</strong> ₹{selectedTemplate.total_amount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Affected Students:</strong> {selectedClass.student_count}
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
          disabled={loading || !classId || !templateId || classes.length === 0 || templates.length === 0}
        >
          {loading ? 'Assigning...' : 'Assign Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
