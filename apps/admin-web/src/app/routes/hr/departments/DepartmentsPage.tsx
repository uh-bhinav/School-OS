import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAllDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useAllStaff,
} from "../../../services/hr.hooks";
import type { Department, DepartmentCreate, Staff } from "../../../services/hr.schema";

export function DepartmentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    hod_staff_id: "",
  });

  const { data: departments = [], isLoading: departmentsLoading } = useAllDepartments();
  const { data: allStaff = [] } = useAllStaff();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  // Filter departments by search query
  const filteredDepartments = departments.filter((dept: Department) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get staff count by department
  const getStaffCount = (departmentId: number) => {
    return allStaff.filter((staff: Staff) => staff.department_id === departmentId).length;
  };

  // Get HOD name
  const getHodName = (hodId?: number) => {
    if (!hodId) return null;
    const hod = allStaff.find((s: Staff) => s.staff_id === hodId);
    return hod ? `${hod.first_name} ${hod.last_name}` : null;
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description || "",
        hod_staff_id: department.hod_staff_id?.toString() || "",
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        hod_staff_id: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      hod_staff_id: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) return;

    const data: DepartmentCreate = {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      hod_staff_id: formData.hod_staff_id ? parseInt(formData.hod_staff_id) : undefined,
    };

    try {
      if (editingDepartment) {
        await updateMutation.mutateAsync({
          deptId: editingDepartment.department_id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save department:", error);
    }
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteMutation.mutateAsync(departmentToDelete.department_id);
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    } catch (error) {
      console.error("Failed to delete department:", error);
    }
  };

  const getDepartmentColor = (name: string) => {
    const colors: Record<string, string> = {
      Science: "#4caf50",
      Mathematics: "#2196f3",
      Languages: "#9c27b0",
      "Information Technology": "#ff9800",
      Administration: "#607d8b",
      "Support Services": "#795548",
      Management: "#f44336",
    };
    return colors[name] || "#757575";
  };

  if (departmentsLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4">Departments</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage school departments and their heads
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Department
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {filteredDepartments.map((department: Department) => {
          const staffCount = getStaffCount(department.department_id);
          const hodName = getHodName(department.hod_staff_id);
          const departmentColor = getDepartmentColor(department.name);

          return (
            <Grid key={department.department_id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  borderTop: 4,
                  borderColor: departmentColor,
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/hr/departments/${department.department_id}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{department.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {department.description || "No description"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(department);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(department);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PeopleIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {department.total_staff ?? staffCount} staff members
                      </Typography>
                    </Box>
                  </Box>

                  {hodName || department.hod_name ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "action.hover", p: 1, borderRadius: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: departmentColor }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Head of Department
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {hodName || department.hod_name}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Chip
                      label="No HOD Assigned"
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <PeopleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {searchQuery ? "No departments found" : "No departments yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first department to get started"}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Department
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Department Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDepartment ? "Edit Department" : "Add New Department"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              label="Department Code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              required
              helperText="e.g., SCI, MATH, LANG"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Head of Department</InputLabel>
              <Select
                value={formData.hod_staff_id}
                label="Head of Department"
                onChange={(e) => setFormData(prev => ({ ...prev, hod_staff_id: e.target.value }))}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {allStaff
                  .filter((s: Staff) => s.is_active)
                  .map((staff: Staff) => (
                    <MenuItem key={staff.staff_id} value={staff.staff_id.toString()}>
                      {staff.first_name} {staff.last_name} - {staff.designation}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.code.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {editingDepartment ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the department "{departmentToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone. Staff members in this department will need to be reassigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DepartmentsPage;
