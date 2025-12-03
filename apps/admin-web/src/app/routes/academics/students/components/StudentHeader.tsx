import { Box, Card, CardContent, Typography, Avatar, Chip } from "@mui/material";
import {
  Person,
  Badge,
  School,
  CalendarToday,
  CheckCircle,
  Cancel,
  Phone,
  Email,
  Home,
  Cake,
  Wc,
} from "@mui/icons-material";
import type { StudentDetail } from "@/app/mockDataProviders/mockStudentDetails";

interface StudentHeaderProps {
  student: StudentDetail;
}

export default function StudentHeader({ student }: StudentHeaderProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (id: number) => {
    const colors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a"];
    return colors[id % colors.length];
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" }, gap: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: "2.5rem",
                bgcolor: getAvatarColor(student.student_id),
                mb: 2,
              }}
            >
              {getInitials(student.first_name, student.last_name)}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              {student.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {student.admission_no}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Roll No: {student.roll_number}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip
                icon={student.is_active ? <CheckCircle /> : <Cancel />}
                label={student.enrollment_status}
                color={student.is_active ? "success" : "default"}
                size="small"
              />
            </Box>
            {student.house && (
              <Box sx={{ mt: 1 }}>
                <Chip label={student.house} color="primary" variant="outlined" size="small" />
              </Box>
            )}
          </Box>
          <Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <School sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Class
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {student.class_name} - {student.section}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Cake sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {new Date(student.date_of_birth).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Wc sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Gender
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {student.gender}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Badge sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Blood Group
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {student.blood_group || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Admission Date
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {new Date(student.admission_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Person sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Parent Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {student.parent_name || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Phone sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Parent Phone
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {student.parent_phone || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Email sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Parent Email
                  </Typography>
                  <Typography variant="body1" fontWeight="500" sx={{ wordBreak: "break-all" }}>
                    {student.parent_email || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "start", gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <Home sx={{ mr: 1, color: "text.secondary", mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Address
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {student.address}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
