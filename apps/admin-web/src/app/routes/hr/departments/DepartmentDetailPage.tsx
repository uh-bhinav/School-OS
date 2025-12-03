import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
  Button,
  Breadcrumbs,
  Link,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useDepartmentById, useAllStaff } from "../../../services/hr.hooks";
import type { Staff } from "../../../services/hr.schema";

const getStatusColor = (status: string): "success" | "error" | "warning" | "default" => {
  switch (status) {
    case "Active":
      return "success";
    case "On Leave":
      return "warning";
    case "Inactive":
      return "error";
    default:
      return "default";
  }
};

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    Teaching: "#2196f3",
    "Non-Teaching": "#9c27b0",
    Administration: "#607d8b",
    Support: "#795548",
    Management: "#f44336",
  };
  return colors[role] || "#757575";
};

export function DepartmentDetailPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const deptId = departmentId ? parseInt(departmentId) : undefined;
  const { data: department, isLoading: deptLoading } = useDepartmentById(deptId);
  const { data: allStaff = [], isLoading: staffLoading } = useAllStaff();

  // Filter staff by department
  const departmentStaff = useMemo(() => {
    if (!deptId) return [];
    return allStaff.filter((s: Staff) => s.department_id === deptId);
  }, [allStaff, deptId]);

  // Apply filters
  const filteredStaff = useMemo(() => {
    let result = [...departmentStaff];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s: Staff) =>
          s.full_name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.designation.toLowerCase().includes(query) ||
          s.employee_id.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((s: Staff) => s.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s: Staff) => s.employment_status === statusFilter);
    }

    return result;
  }, [departmentStaff, searchQuery, roleFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = departmentStaff.filter((s: Staff) => s.employment_status === "Active").length;
    const onLeave = departmentStaff.filter((s: Staff) => s.employment_status === "On Leave").length;
    const teaching = departmentStaff.filter((s: Staff) => s.role === "Teaching").length;
    const nonTeaching = departmentStaff.filter((s: Staff) => s.role !== "Teaching").length;
    return { total: departmentStaff.length, active, onLeave, teaching, nonTeaching };
  }, [departmentStaff]);

  // Get HOD
  const hod = useMemo(() => {
    if (!department?.hod_staff_id) return null;
    return allStaff.find((s: Staff) => s.staff_id === department.hod_staff_id);
  }, [department, allStaff]);

  // Get unique roles in department
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(departmentStaff.map((s: Staff) => s.role))];
    return uniqueRoles.sort();
  }, [departmentStaff]);

  const isLoading = deptLoading || staffLoading;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!department) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Department not found
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/hr/departments")} sx={{ mt: 2 }}>
          Back to Departments
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate("/hr")}
        >
          HR
        </Link>
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate("/hr/departments")}
        >
          Departments
        </Link>
        <Typography color="text.primary">{department.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/hr/departments")}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {department.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {department.description || "No description available"}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate("/hr/departments")}
        >
          Edit Department
        </Button>
      </Box>

      {/* Department Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* HOD Section */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Head of Department
              </Typography>
              {hod ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                  onClick={() => navigate(`/hr/staff/${hod.staff_id}`)}
                >
                  <Avatar src={hod.profile_photo_url} sx={{ width: 56, height: 56 }}>
                    {hod.first_name[0]}
                    {hod.last_name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {hod.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hod.designation}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {hod.email}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: "warning.50", borderRadius: 2, border: "1px dashed", borderColor: "warning.main" }}>
                  <Typography variant="body2" color="warning.dark">
                    No HOD assigned to this department
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Stats Section */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Department Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                      <PeopleIcon color="primary" />
                      <Typography variant="h5" fontWeight="bold">
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Staff
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {stats.active}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                      <ScheduleIcon color="warning" />
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        {stats.onLeave}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        On Leave
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                      <PersonIcon color="info" />
                      <Typography variant="h5" fontWeight="bold" color="info.main">
                        {stats.teaching}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Teaching
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
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
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Staff Members ({filteredStaff.length})
      </Typography>

      <Grid container spacing={3}>
        {filteredStaff.map((staff: Staff) => (
          <Grid key={staff.staff_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate(`/hr/staff/${staff.staff_id}`)}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                  <Avatar
                    src={staff.profile_photo_url}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: getRoleColor(staff.role),
                      fontSize: "1.2rem",
                    }}
                  >
                    {staff.first_name[0]}
                    {staff.last_name[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap title={staff.full_name}>
                      {staff.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {staff.designation}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {staff.employee_id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={staff.employment_status}
                    size="small"
                    color={getStatusColor(staff.employment_status)}
                    sx={{ mr: 1, mb: 0.5 }}
                  />
                  <Chip
                    label={staff.role}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 0.5 }}
                  />
                </Box>

                {staff.subjects && staff.subjects.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Subjects: {staff.subjects.slice(0, 2).join(", ")}
                      {staff.subjects.length > 2 && ` +${staff.subjects.length - 2}`}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    pt: 2,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Tooltip title={staff.email}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${staff.email}`;
                      }}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={staff.phone}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${staff.phone}`;
                      }}
                    >
                      <PhoneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Box sx={{ flex: 1 }} />
                  <Tooltip title="View Profile">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hr/staff/${staff.staff_id}`);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <PeopleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No staff members found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No staff members in this department yet"}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default DepartmentDetailPage;
