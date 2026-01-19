import { Box, Card, CardContent, Typography, Avatar, Chip } from "@mui/material";
import { Person, Badge, School, CalendarToday, CheckCircle, Cancel, Phone, Email } from "@mui/icons-material";
import type { TeacherDetail } from "@/app/mockDataProviders/mockTeacherDetails";

interface TeacherHeaderProps {
  teacher: TeacherDetail;
}

export default function TeacherHeader({ teacher }: TeacherHeaderProps) {
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
            <Avatar sx={{ width: 120, height: 120, fontSize: "2.5rem", bgcolor: getAvatarColor(teacher.teacher_id), mb: 2 }}>
              {getInitials(teacher.first_name, teacher.last_name)}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              {teacher.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {teacher.employee_id}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip
                icon={teacher.is_active ? <CheckCircle /> : <Cancel />}
                label={teacher.employment_status}
                color={teacher.is_active ? "success" : "default"}
                size="small"
              />
            </Box>
          </Box>
          <Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <School sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Department</Typography>
                  <Typography variant="body1" fontWeight="500">{teacher.department}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Badge sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Specialization</Typography>
                  <Typography variant="body1" fontWeight="500">{teacher.specialization}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Experience</Typography>
                  <Typography variant="body1" fontWeight="500">{teacher.experience_years} years</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Joining Date</Typography>
                  <Typography variant="body1" fontWeight="500">{new Date(teacher.date_of_joining).toLocaleDateString()}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Phone sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
                  <Typography variant="body1" fontWeight="500">{teacher.phone}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Email sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                  <Typography variant="body1" fontWeight="500" sx={{ wordBreak: "break-all" }}>{teacher.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Person sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Qualification</Typography>
                  <Typography variant="body1" fontWeight="500">{teacher.qualification}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <School sx={{ mr: 1, color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Office Location</Typography>
                  <Typography variant="body1" fontWeight="500">{teacher.office_location || "N/A"}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
