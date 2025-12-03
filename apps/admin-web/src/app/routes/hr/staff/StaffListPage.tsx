import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  InputAdornment,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAllStaff, useAllDepartments } from "../../../services/hr.hooks";
import type { Staff, Department, StaffRole, EmploymentStatus } from "../../../services/hr.schema";

const staffRoles: StaffRole[] = ["Teaching", "Non-Teaching", "Administration", "Support", "Management"];
const employmentStatuses: EmploymentStatus[] = ["Active", "On Leave", "Inactive", "Contract", "Retired"];

const getStatusColor = (status: EmploymentStatus): "success" | "warning" | "error" | "default" | "info" => {
  switch (status) {
    case "Active":
      return "success";
    case "On Leave":
      return "warning";
    case "Inactive":
    case "Retired":
      return "error";
    case "Contract":
      return "info";
    default:
      return "default";
  }
};

export function StaffListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: staff = [], isLoading: staffLoading } = useAllStaff();
  const { data: departments = [] } = useAllDepartments();

  // Filter staff based on search and filters
  const filteredStaff = useMemo(() => {
    let result = [...staff];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s: Staff) =>
        s.full_name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.employee_id.toLowerCase().includes(query) ||
        s.designation.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartment !== "all") {
      result = result.filter((s: Staff) => s.department_id?.toString() === selectedDepartment);
    }

    // Role filter
    if (selectedRole !== "all") {
      result = result.filter((s: Staff) => s.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter((s: Staff) => s.employment_status === selectedStatus);
    }

    return result;
  }, [staff, searchQuery, selectedDepartment, selectedRole, selectedStatus]);

  // Get department name by ID
  const getDepartmentName = (deptId?: number): string => {
    if (!deptId) return "-";
    const dept = departments.find((d: Department) => d.department_id === deptId);
    return dept?.name || "-";
  };

  if (staffLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4">Staff Directory</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all staff members ({staff.length} total)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/hr/staff/new")}
        >
          Add Staff
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search staff..."
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Department"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map((dept: Department) => (
                    <MenuItem key={dept.department_id} value={dept.department_id.toString()}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  {staffRoles.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {employmentStatuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((staffMember: Staff) => (
                <TableRow
                  key={staffMember.staff_id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/hr/staff/${staffMember.staff_id}`)}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={staffMember.profile_photo_url}
                        sx={{ width: 40, height: 40 }}
                      >
                        {staffMember.first_name[0]}{staffMember.last_name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {staffMember.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {staffMember.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{staffMember.employee_id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getDepartmentName(staffMember.department_id)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{staffMember.designation}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.role}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.employment_status}
                      size="small"
                      color={getStatusColor(staffMember.employment_status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{staffMember.phone}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Profile">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hr/staff/${staffMember.staff_id}`);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hr/staff/${staffMember.staff_id}/edit`);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Empty State */}
        {filteredStaff.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No staff members found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery || selectedDepartment !== "all" || selectedRole !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Add your first staff member to get started"}
            </Typography>
            {!searchQuery && selectedDepartment === "all" && selectedRole === "all" && selectedStatus === "all" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/hr/staff/new")}
              >
                Add Staff
              </Button>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default StaffListPage;
