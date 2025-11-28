import { useState } from "react";
import { Box, Card, CardContent, Typography, Button, Chip, Avatar } from "@mui/material";
import { Email, Phone, Room, Person } from "@mui/icons-material";
import type { ClassDetail } from "@/app/services/classes.schema";
import AssignClassTeacherDialog from "./AssignClassTeacherDialog";

interface ClassHeaderCardProps {
  classDetail: ClassDetail;
}

export default function ClassHeaderCard({ classDetail }: ClassHeaderCardProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {classDetail.class_name} - Section {classDetail.section}
              </Typography>
              <Chip
                label={classDetail.is_active ? "Active" : "Inactive"}
                color={classDetail.is_active ? "success" : "default"}
                size="small"
              />
            </Box>
            <Button variant="outlined" onClick={() => setAssignDialogOpen(true)}>
              {classDetail.class_teacher_name ? "Change Class Teacher" : "Assign Class Teacher"}
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {/* Class Teacher Info */}
            <Box sx={{ flex: "1 1 400px" }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person /> Class Teacher
                  </Typography>
                  {classDetail.class_teacher_name ? (
                    <>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 56, height: 56 }}>
                          {classDetail.class_teacher_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{classDetail.class_teacher_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Employee ID: {classDetail.class_teacher_id}
                          </Typography>
                        </Box>
                      </Box>
                      {classDetail.class_teacher_email && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <Email fontSize="small" />
                          <Typography variant="body2">{classDetail.class_teacher_email}</Typography>
                        </Box>
                      )}
                      {classDetail.class_teacher_phone && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Phone fontSize="small" />
                          <Typography variant="body2">{classDetail.class_teacher_phone}</Typography>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography color="text.secondary">No class teacher assigned</Typography>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Class Stats */}
            <Box sx={{ flex: "1 1 400px" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Total Students
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {classDetail.total_students}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Total Subjects
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {classDetail.total_subjects}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Avg Performance
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {classDetail.average_performance}%
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Attendance
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {classDetail.attendance_percentage}%
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Room Info */}
            {classDetail.room_name && (
              <Box sx={{ flex: "1 1 400px" }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Room /> Classroom
                    </Typography>
                    <Typography>
                      {classDetail.room_name}
                      {classDetail.floor && ` - Floor ${classDetail.floor}`}
                    </Typography>
                    {classDetail.capacity && (
                      <Typography variant="body2" color="text.secondary">
                        Capacity: {classDetail.capacity} students
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Assign Teacher Dialog */}
      <AssignClassTeacherDialog
        open={assignDialogOpen}
        classId={classDetail.class_id}
        onClose={() => setAssignDialogOpen(false)}
      />
    </>
  );
}
