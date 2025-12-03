import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Phone,
  Email,
  CalendarToday,
  Business,
  School,
  Badge,
  LocationOn,
  AccountBalance,
  ContactPhone,
} from "@mui/icons-material";
import {
  useStaffById,
  useAllDepartments,
  useStaffAttendanceForStaff,
  useLeaveRequestsByStaff,
} from "../../../services/hr.hooks";
import type { StaffRole, EmploymentStatus, StaffAttendance, LeaveRequest } from "../../../services/hr.schema";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const statusColors: Record<EmploymentStatus, "success" | "warning" | "error" | "default" | "info"> = {
  Active: "success",
  "On Leave": "warning",
  Inactive: "error",
  Contract: "info",
  Retired: "default",
};

const roleColors: Record<StaffRole, string> = {
  Teaching: "#2563eb",
  "Non-Teaching": "#8b5cf6",
  Administration: "#10b981",
  Support: "#f59e0b",
  Management: "#ef4444",
};

export function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const staffId = id ? parseInt(id) : undefined;

  const { data: staff, isLoading: staffLoading } = useStaffById(staffId);
  const { data: departments = [] } = useAllDepartments();
  const { data: attendanceRecords = [] } = useStaffAttendanceForStaff(staffId);
  const { data: leaveRequests = [] } = useLeaveRequestsByStaff(staffId);

  const getDepartmentName = (deptId?: number): string => {
    if (!deptId) return "-";
    const dept = departments.find(d => d.department_id === deptId);
    return dept?.name || "-";
  };

  if (staffLoading || !staff) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={300} height={40} />
        </Box>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/hr/staff")}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">{staff.full_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {staff.designation} • {staff.employee_id}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => navigate(`/hr/staff/${staff.staff_id}/edit`)}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar
                  src={staff.profile_photo_url}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: roleColors[staff.role] || "#757575",
                    fontSize: "2.5rem",
                  }}
                >
                  {staff.first_name[0]}{staff.last_name[0]}
                </Avatar>
                <Chip
                  label={staff.employment_status}
                  color={statusColors[staff.employment_status]}
                  sx={{ mb: 1 }}
                />
                <Chip
                  label={staff.role}
                  variant="outlined"
                  sx={{ borderColor: roleColors[staff.role], color: roleColors[staff.role] }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Email color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body2">{staff.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Phone color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2">{staff.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Business color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Department</Typography>
                      <Typography variant="body2">{getDepartmentName(staff.department_id)}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Joining Date</Typography>
                      <Typography variant="body2">
                        {new Date(staff.joining_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {staff.subjects && staff.subjects.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <School color="action" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Subjects</Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                          {staff.subjects.map((subject) => (
                            <Chip key={subject} label={subject} size="small" />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label="Profile Details" />
          <Tab label="Attendance" />
          <Tab label="Leave History" />
          <Tab label="Professional Log" />
          <Tab label="Tasks" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={4}>
              {/* Personal Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Badge color="primary" /> Personal Details
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Full Name</Typography>
                        <Typography variant="body2">{staff.full_name}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Gender</Typography>
                        <Typography variant="body2">{staff.gender || "-"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                        <Typography variant="body2">
                          {staff.date_of_birth ? new Date(staff.date_of_birth).toLocaleDateString() : "-"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                        <Typography variant="body2">{staff.employee_id}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contact Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <ContactPhone color="primary" /> Contact Details
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body2">{staff.email}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="body2">{staff.phone}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">Emergency Contact</Typography>
                        <Typography variant="body2">
                          {staff.emergency_contact_name || "-"}
                          {staff.emergency_contact_phone && ` (${staff.emergency_contact_phone})`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Address */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOn color="primary" /> Address
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2">
                      {staff.address || "-"}
                      {staff.city && `, ${staff.city}`}
                      {staff.state && `, ${staff.state}`}
                      {staff.pincode && ` - ${staff.pincode}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Bank Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountBalance color="primary" /> Bank Details
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Bank Name</Typography>
                        <Typography variant="body2">{staff.bank_name || "-"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">Account Number</Typography>
                        <Typography variant="body2">{staff.account_number ? "****" + staff.account_number.slice(-4) : "-"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">IFSC Code</Typography>
                        <Typography variant="body2">{staff.ifsc_code || "-"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary">PAN</Typography>
                        <Typography variant="body2">{staff.pan ? "****" + staff.pan.slice(-4) : "-"}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Attendance</Typography>
            {attendanceRecords.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.slice(0, 10).map((record: StaffAttendance) => (
                    <TableRow key={record.attendance_id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          size="small"
                          color={record.status === "Present" ? "success" : record.status === "Absent" ? "error" : "warning"}
                        />
                      </TableCell>
                      <TableCell>{record.check_in_time || "-"}</TableCell>
                      <TableCell>{record.check_out_time || "-"}</TableCell>
                      <TableCell>{record.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No attendance records found.
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Leave History Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Leave History</Typography>
            {leaveRequests.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests.map((leave: LeaveRequest) => (
                    <TableRow key={leave.leave_id}>
                      <TableCell>{leave.leave_type}</TableCell>
                      <TableCell>{new Date(leave.from_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.to_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          size="small"
                          color={
                            leave.status === "Approved" ? "success" :
                            leave.status === "Rejected" ? "error" :
                            leave.status === "Pending" ? "warning" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{leave.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No leave requests found.
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Professional Log Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Professional Log</Typography>
            <Typography variant="body2" color="text.secondary">
              Professional development logs, trainings, and certifications will be displayed here.
            </Typography>
            {staff.qualification && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Qualification</Typography>
                <Typography variant="body2">{staff.qualification}</Typography>
              </Box>
            )}
            {staff.certifications && staff.certifications.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Certifications</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {staff.certifications.map((cert, i) => (
                    <Chip key={i} label={cert} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
            {staff.experience_years !== undefined && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Experience</Typography>
                <Typography variant="body2">{staff.experience_years} years</Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Tasks Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Assigned Tasks</Typography>
            <Typography variant="body2" color="text.secondary">
              Tasks assigned to this staff member will be displayed here.
            </Typography>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
}

export default StaffDetailPage;
