import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { feeTemplateService, feeComponentService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { FeeTemplate, FeeComponent } from '../../../services/finance/types';
import CreateTemplateDialog from './CreateTemplateDialog';
import EditTemplateDialog from './EditTemplateDialog';

const TERM_LABELS: Record<string, string> = {
  Annual: 'Annual',
  Term1: 'Term 1',
  Term2: 'Term 2',
  Term3: 'Term 3',
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  active: 'success',
  inactive: 'warning',
  draft: 'default',
};

export default function FeeTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FeeTemplate | null>(null);
  const [components, setComponents] = useState<FeeComponent[]>([]);

  const { feeTemplates, setFeeTemplates, removeFeeTemplate, addFeeTemplate, updateFeeTemplate } = useFinanceStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, componentsData] = await Promise.all([
        feeTemplateService.getAll(),
        feeComponentService.getAll(),
      ]);
      setFeeTemplates(templatesData);
      setComponents(componentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = (template: FeeTemplate) => {
    addFeeTemplate(template);
    setCreateDialogOpen(false);
  };

  const handleEditTemplate = (template: FeeTemplate) => {
    updateFeeTemplate(template.template_id, template);
    setEditDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      await feeTemplateService.delete(templateId);
      removeFeeTemplate(templateId);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleEditClick = (template: FeeTemplate) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  const activeTemplates = feeTemplates.filter((t) => t.status === 'active');
  const totalComponentsUsed = new Set(
    feeTemplates.flatMap((t) => t.components.map((c) => c.component_id))
  ).size;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Fee Templates
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Create and manage fee structure templates for different class groups
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Create Template
        </Button>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Templates
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {feeTemplates.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Templates
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {activeTemplates.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Components Used
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {totalComponentsUsed}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Tip:</strong> Templates define the fee structure for different class groups. Components
        can be added or removed from templates, and the total is calculated automatically.
      </Alert>

      {/* Templates Table */}
      {feeTemplates.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Fee Templates Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first fee template to define fee structures for classes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Template
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Template Name</TableCell>
                <TableCell>Term</TableCell>
                <TableCell align="center">Components</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeTemplates.map((template) => (
                <TableRow key={template.template_id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight={500}>
                      {template.name}
                    </Typography>
                    {template.description && (
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={TERM_LABELS[template.term]} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${template.components.length} items`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600}>
                      ₹{template.total_amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.status.toUpperCase()}
                      size="small"
                      color={STATUS_COLORS[template.status]}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit Template">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(template)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Template">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTemplate(template.template_id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogs */}
      <CreateTemplateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateTemplate}
        components={components}
      />

      {selectedTemplate && (
        <EditTemplateDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedTemplate(null);
          }}
          onUpdate={handleEditTemplate}
          template={selectedTemplate}
          components={components}
        />
      )}
    </Box>
  );
}
