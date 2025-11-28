import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { classMappingService, feeTemplateService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { ClassTemplateMapping, FeeTemplate } from '../../../services/finance/types';
import { MOCK_CLASSES } from '../../../mockDataProviders/finance';
import AssignTemplateDialog from './AssignTemplateDialog';
import BulkAssignDialog from './BulkAssignDialog';

export default function ClassMappingPage() {
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);

  const { classMappings, setClassMappings, addClassMapping, removeClassMapping } = useFinanceStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mappingsData, templatesData] = await Promise.all([
        classMappingService.getAll(),
        feeTemplateService.getAll(),
      ]);
      setClassMappings(mappingsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMapping = async (mappingId: number) => {
    if (!confirm('Are you sure you want to remove this template assignment?')) {
      return;
    }

    try {
      await classMappingService.delete(mappingId);
      removeClassMapping(mappingId);
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    }
  };

  const handleAssignTemplate = (mapping: ClassTemplateMapping) => {
    addClassMapping(mapping);
    setAssignDialogOpen(false);
  };

  const handleBulkAssign = (mappings: ClassTemplateMapping[]) => {
    mappings.forEach((m) => addClassMapping(m));
    setBulkDialogOpen(false);
  };

  const mappedClasses = new Set(classMappings.map((m) => m.class_id));
  const unmappedClasses = MOCK_CLASSES.filter((c) => !mappedClasses.has(c.class_id));
  const totalStudents = classMappings.reduce((sum, m) => sum + m.student_count, 0);

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
            <LinkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Class-Template Mapping
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Assign fee templates to classes for invoice generation
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={() => setBulkDialogOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Bulk Assign
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAssignDialogOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Assign Template
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mapped Classes
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {classMappings.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Students
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {totalStudents}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Unmapped Classes
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={unmappedClasses.length > 0 ? 'warning.main' : 'success.main'}>
              {unmappedClasses.length}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Alerts */}
      {unmappedClasses.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>{unmappedClasses.length} classes</strong> do not have fee templates assigned yet.
          Invoices cannot be generated for these classes.
        </Alert>
      )}

      {/* Mappings Table */}
      {classMappings.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <LinkIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Class-Template Mappings Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by assigning fee templates to classes to enable invoice generation
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAssignDialogOpen(true)}
          >
            Assign Template
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Grade Level</TableCell>
                <TableCell>Template Assigned</TableCell>
                <TableCell align="center">Students</TableCell>
                <TableCell align="right">Template Amount</TableCell>
                <TableCell>Assigned Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classMappings.map((mapping) => (
                <TableRow key={mapping.mapping_id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight={600}>
                      {mapping.class_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Section {mapping.section}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`Grade ${mapping.grade_level}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {mapping.template_name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={mapping.student_count}
                      size="small"
                      color="info"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600}>
                      ₹{mapping.total_amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(mapping.assigned_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Remove Assignment">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteMapping(mapping.mapping_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogs */}
      <AssignTemplateDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        onAssign={handleAssignTemplate}
        templates={templates.filter((t) => t.status === 'active')}
        classes={MOCK_CLASSES}
      />

      <BulkAssignDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onAssign={handleBulkAssign}
        templates={templates.filter((t) => t.status === 'active')}
        classes={unmappedClasses}
      />
    </Box>
  );
}
