import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Skeleton,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAllDepartments, useAllStaff } from "../../../services/hr.hooks";
import type { Department, Staff } from "../../../services/hr.schema";

function a11yProps(index: number) {
  return {
    id: `department-tab-${index}`,
    "aria-controls": `department-tabpanel-${index}`,
  };
}

const getDepartmentColor = (name: string): string => {
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

export function StaffWallPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: departments = [], isLoading: deptLoading } = useAllDepartments();
  const { data: allStaff = [], isLoading: staffLoading } = useAllStaff();

  // Add "All Staff" as first tab option
  const tabOptions = useMemo(() => [
    { id: "all", name: "All Staff", color: "#1976d2" },
    ...departments.map((d: Department) => ({
      id: d.department_id.toString(),
      name: d.name,
      color: getDepartmentColor(d.name),
    })),
  ], [departments]);

  // Filter staff based on selected tab and search
  const filteredStaff = useMemo(() => {
    let result = [...allStaff];

    // Filter by department
    if (activeTab > 0 && departments.length > 0) {
      const selectedDept = departments[activeTab - 1];
      if (selectedDept) {
        result = result.filter((s: Staff) => s.department_id === selectedDept.department_id);
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s: Staff) =>
        s.full_name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.designation.toLowerCase().includes(query) ||
        s.employee_id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allStaff, departments, activeTab, searchQuery]);

  // Calculate department stats
  const departmentStats = useMemo(() => {
    if (activeTab === 0) {
      // All staff stats
      const active = allStaff.filter((s: Staff) => s.employment_status === "Active").length;
      const onLeave = allStaff.filter((s: Staff) => s.employment_status === "On Leave").length;
      return {
        total: allStaff.length,
        active,
        onLeave,
        present: active,
      };
    }

    const selectedDept = departments[activeTab - 1];
    if (!selectedDept) return { total: 0, active: 0, onLeave: 0, present: 0 };

    const deptStaff = allStaff.filter((s: Staff) => s.department_id === selectedDept.department_id);
    const active = deptStaff.filter((s: Staff) => s.employment_status === "Active").length;
    const onLeave = deptStaff.filter((s: Staff) => s.employment_status === "On Leave").length;

    return {
      total: deptStaff.length,
      active,
      onLeave,
      present: active,
    };
  }, [allStaff, departments, activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchQuery("");
  };

  const isLoading = deptLoading || staffLoading;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={48} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Staff Wall</Typography>
        <Typography variant="body2" color="text.secondary">
          View staff organized by department segments
        </Typography>
      </Box>

      {/* Department Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="department tabs"
          >
            {tabOptions.map((tab, index) => (
              <Tab
                key={tab.id}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: tab.color,
                      }}
                    />
                    {tab.name}
                  </Box>
                }
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </Box>

        {/* Stats Bar */}
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={3} alignItems="center">
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
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: "flex", gap: 3, justifyContent: { xs: "flex-start", md: "flex-end" }, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PeopleIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>{departmentStats.total}</strong> Total
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2">
                    <strong>{departmentStats.active}</strong> Active
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ScheduleIcon color="warning" fontSize="small" />
                  <Typography variant="body2">
                    <strong>{departmentStats.onLeave}</strong> On Leave
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Staff Cards Grid */}
      <Grid container spacing={3}>
        {filteredStaff.map((staff: Staff) => {
          const department = departments.find((d: Department) => d.department_id === staff.department_id);
          const deptColor = department ? getDepartmentColor(department.name) : "#757575";

          return (
            <Grid key={staff.staff_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: "100%",
                  borderTop: 3,
                  borderColor: deptColor,
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
                        bgcolor: deptColor,
                        fontSize: "1.2rem",
                      }}
                    >
                      {staff.first_name[0]}{staff.last_name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        noWrap
                        title={staff.full_name}
                      >
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

                  {department && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: deptColor,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {department.name}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mt: 2,
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
          );
        })}
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
              {searchQuery
                ? "Try adjusting your search query"
                : "No staff members in this department yet"}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default StaffWallPage;
