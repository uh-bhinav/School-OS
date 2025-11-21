import { Box, Card, CardContent, Typography, Avatar, Chip } from "@mui/material";
import { Person, Email, Phone, School } from "@mui/icons-material";
import type { StudentDetail } from "@/app/mockDataProviders/mockStudentDetails";

interface MentorPanelProps {
  student: StudentDetail;
}

export default function MentorPanel({ student }: MentorPanelProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: number) => {
    const colors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a"];
    return colors[id % colors.length];
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Class & Mentor Information
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {/* Class Teacher */}
        {student.class_teacher_name && (
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Class Teacher
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: getAvatarColor(student.class_teacher_id || 0),
                  }}
                >
                  {getInitials(student.class_teacher_name)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {student.class_teacher_name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <School sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {student.class_name} - {student.section}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Mentor */}
        {student.mentor_name && (
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Mentor
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: getAvatarColor(student.mentor_id || 0),
                  }}
                >
                  {getInitials(student.mentor_name)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {student.mentor_name}
                  </Typography>
                  <Chip label="Academic Mentor" size="small" color="primary" sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Parent Information */}
        <Card sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Parent/Guardian Information
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              {/* Father */}
              {student.father_name && (
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Father
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Person sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2">{student.father_name}</Typography>
                  </Box>
                  {student.father_phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Phone sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2">{student.father_phone}</Typography>
                    </Box>
                  )}
                  {student.father_email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Email sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2">{student.father_email}</Typography>
                    </Box>
                  )}
                  {student.father_occupation && (
                    <Typography variant="body2" color="text.secondary">
                      Occupation: {student.father_occupation}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Mother */}
              {student.mother_name && (
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Mother
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Person sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2">{student.mother_name}</Typography>
                  </Box>
                  {student.mother_phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Phone sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2">{student.mother_phone}</Typography>
                    </Box>
                  )}
                  {student.mother_email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Email sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2">{student.mother_email}</Typography>
                    </Box>
                  )}
                  {student.mother_occupation && (
                    <Typography variant="body2" color="text.secondary">
                      Occupation: {student.mother_occupation}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Guardian (if applicable) */}
              {student.guardian_name && (
                <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    Guardian ({student.guardian_relation})
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Person sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2">{student.guardian_name}</Typography>
                  </Box>
                  {student.guardian_phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Phone sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2">{student.guardian_phone}</Typography>
                    </Box>
                  )}
                  {student.guardian_email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Email sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2">{student.guardian_email}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Medical Information */}
        {((student.medical_conditions && student.medical_conditions.length > 0) ||
          (student.allergies && student.allergies.length > 0) ||
          student.special_needs) && (
          <Card sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Medical Information
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
                {student.medical_conditions && student.medical_conditions.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Medical Conditions
                    </Typography>
                    {student.medical_conditions.map((condition, index) => (
                      <Chip key={index} label={condition} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
                {student.allergies && student.allergies.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Allergies
                    </Typography>
                    {student.allergies.map((allergy, index) => (
                      <Chip key={index} label={allergy} size="small" color="warning" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
                {student.special_needs && (
                  <Box>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Special Needs
                    </Typography>
                    <Typography variant="body2">{student.special_needs}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
