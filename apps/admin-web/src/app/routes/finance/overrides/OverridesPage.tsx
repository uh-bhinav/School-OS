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
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { studentOverrideService, feeComponentService } from '../../../services/finance';
import { useFinanceStore } from '../../../stores/finance';
import type { StudentFeeOverride, FeeComponent } from '../../../services/finance/types';
import { MOCK_CLASSES } from '../../../mockDataProviders/finance';
import CreateOverrideDialog from './CreateOverrideDialog';
import EditOverrideDialog from './EditOverrideDialog';

export default function OverridesPage() {
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<StudentFeeOverride | null>(null);
  const [components, setComponents] = useState<FeeComponent[]>([]);
  const [filterClass, setFilterClass] = useState<number | ''>('');

  const {
    studentOverrides,
    setStudentOverrides,
    addStudentOverride,
    updateStudentOverride,
    removeStudentOverride,
  } = useFinanceStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const componentsData = await feeComponentService.getAll();

      // Get all overrides
      const allOverrides: StudentFeeOverride[] = [];
      for (const classInfo of MOCK_CLASSES) {
        const classOverrides = await studentOverrideService.getByClass(classInfo.class_id);
        allOverrides.push(...classOverrides);
      }

      setStudentOverrides(allOverrides);
      setComponents(componentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOverride = (override: StudentFeeOverride) => {
    addStudentOverride(override);
    setCreateDialogOpen(false);
  };

  const handleEditOverride = (override: StudentFeeOverride) => {
    updateStudentOverride(override.override_id, override);
    setEditDialogOpen(false);
    setSelectedOverride(null);
  };

  const handleDeleteOverride = async (overrideId: number) => {
    if (!confirm('Are you sure you want to delete this override?')) {
      return;
    }

    try {
      await studentOverrideService.delete(overrideId);
      removeStudentOverride(overrideId);
    } catch (error) {
      console.error('Failed to delete override:', error);
    }
  };

  const handleEditClick = (override: StudentFeeOverride) => {
    setSelectedOverride(override);
    setEditDialogOpen(true);
  };

  const filteredOverrides = studentOverrides.filter((override) => {
    if (filterClass && override.class_id !== filterClass) return false;
    return true;
  });

  const activeOverrides = studentOverrides.filter((o) => o.is_active);
  const optOuts = studentOverrides.filter((o) => !o.is_active);
  const totalDiscount = activeOverrides.reduce(
    (sum, o) => sum + (o.original_amount - o.override_amount),
    0
  );

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
            <TrendingDownIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Student Fee Overrides
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage component-level fee adjustments and opt-outs for students
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Create Override
        </Button>
      </Box>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Overrides
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {studentOverrides.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Adjustments
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {activeOverrides.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Opt-Outs
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {optOuts.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Adjustment
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              -₹{totalDiscount.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note:</strong> Overrides allow you to adjust individual component amounts for specific
        students or opt them out completely. Active overrides will be applied during invoice generation.
      </Alert>

      {/* Filter */}
      <Box mb={3}>
        <TextField
          select
          size="small"
          label="Filter by Class"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value === '' ? '' : Number(e.target.value))}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">All Classes</MenuItem>
          {MOCK_CLASSES.map((cls) => (
            <MenuItem key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Overrides Table */}
      {filteredOverrides.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <TrendingDownIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Fee Overrides Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create overrides to adjust fee components for individual students
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Override
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Component</TableCell>
                <TableCell align="right">Original Amount</TableCell>
                <TableCell align="right">Override Amount</TableCell>
                <TableCell align="right">Adjustment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOverrides.map((override) => {
                const adjustment = override.original_amount - override.override_amount;
                return (
                  <TableRow key={override.override_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {override.student_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Roll: {override.roll_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{override.class_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{override.component_name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ₹{override.original_amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        ₹{override.override_amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={adjustment > 0 ? 'success.main' : 'error.main'}
                      >
                        {adjustment > 0 ? '-' : '+'}₹{Math.abs(adjustment).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={override.is_active ? 'ACTIVE' : 'OPT-OUT'}
                        size="small"
                        color={override.is_active ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {override.reason || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit Override">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(override)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Override">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteOverride(override.override_id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogs */}
      <CreateOverrideDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateOverride}
        components={components}
      />

      {selectedOverride && (
        <EditOverrideDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedOverride(null);
          }}
          onUpdate={handleEditOverride}
          override={selectedOverride}
          components={components}
        />
      )}
    </Box>
  );
}
