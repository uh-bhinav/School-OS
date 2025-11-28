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
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { feeComponentService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { FeeComponent } from '../../../services/finance/types';
import CreateComponentDialog from './CreateComponentDialog';
import EditComponentDialog from './EditComponentDialog';

const CATEGORY_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  Tuition: 'primary',
  Transport: 'warning',
  Lab: 'secondary',
  Library: 'info',
  Sports: 'success',
  Uniform: 'default',
  Books: 'info',
  Activity: 'success',
  Exam: 'error',
  Other: 'default',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'default'> = {
  active: 'success',
  inactive: 'warning',
  archived: 'default',
};

export default function FeeComponentsPage() {
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<FeeComponent | null>(null);

  const { feeComponents, setFeeComponents, addFeeComponent, updateFeeComponent, removeFeeComponent } =
    useFinanceStore();

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const data = await feeComponentService.getAll();
      setFeeComponents(data);
    } catch (error) {
      console.error('Failed to load fee components:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComponent = (component: FeeComponent) => {
    addFeeComponent(component);
    setCreateDialogOpen(false);
  };

  const handleUpdateComponent = (component: FeeComponent) => {
    updateFeeComponent(component.component_id, component);
    setEditDialogOpen(false);
    setSelectedComponent(null);
  };

  const handleDeleteComponent = async (componentId: number) => {
    if (!confirm('Are you sure you want to delete this fee component? This action cannot be undone.')) {
      return;
    }

    try {
      await feeComponentService.delete(componentId);
      removeFeeComponent(componentId);
    } catch (error) {
      console.error('Failed to delete component:', error);
    }
  };

  const handleEditClick = (component: FeeComponent) => {
    setSelectedComponent(component);
    setEditDialogOpen(true);
  };

  const activeComponents = feeComponents.filter((c) => c.status === 'active');
  const totalValue = feeComponents.reduce((sum, c) => sum + c.base_amount, 0);
  const categories = new Set(feeComponents.map((c) => c.category)).size;

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
            <CategoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Fee Components
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Define individual fee components that make up your fee structures
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Create Component
        </Button>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Components
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {feeComponents.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Components
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {activeComponents.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Categories
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {categories}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Base Value
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
              ₹{totalValue.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note:</strong> Fee components are the building blocks of your fee structures. They can
        be grouped into templates and assigned to classes. Mark components as optional if they should
        not be mandatory for all students.
      </Alert>

      {/* Components Table */}
      {feeComponents.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <CategoryIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Fee Components Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first fee component to start building fee structures
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Component
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Component Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Base Amount</TableCell>
                <TableCell>Requirement</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeComponents.map((component) => (
                <TableRow key={component.component_id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight={600}>
                      {component.name}
                    </Typography>
                    {component.description && (
                      <Typography variant="caption" color="text.secondary">
                        {component.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={component.category}
                      size="small"
                      color={CATEGORY_COLORS[component.category] || 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={component.type === 'recurring' ? 'Recurring' : 'One-Time'}
                      size="small"
                      color={component.type === 'recurring' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600}>
                      ₹{component.base_amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={component.is_optional ? 'Optional' : 'Mandatory'}
                      size="small"
                      color={component.is_optional ? 'default' : 'primary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={component.status.toUpperCase()}
                      size="small"
                      color={STATUS_COLORS[component.status]}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit Component">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(component)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Component">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteComponent(component.component_id)}
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
      <CreateComponentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateComponent}
      />

      {selectedComponent && (
        <EditComponentDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedComponent(null);
          }}
          onUpdate={handleUpdateComponent}
          component={selectedComponent}
        />
      )}
    </Box>
  );
}
