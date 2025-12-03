import { Box, Card, CardContent, Typography } from "@mui/material";
import { useClassById } from "@/app/services/classes.hooks";

interface ClassOverviewTabProps {
  classId: number;
}

export default function ClassOverviewTab({ classId }: ClassOverviewTabProps) {
  const { data: classDetail } = useClassById(classId);

  if (!classDetail) return null;

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Class Information
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Class Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {classDetail.class_name} - {classDetail.section}
              </Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Grade
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {classDetail.grade}
              </Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Academic Year
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {classDetail.academic_year}
              </Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Status
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {classDetail.is_active ? "Active" : "Inactive"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Academic Highlights
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              • Class average performance increased by 5% this term
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 3 students achieved perfect attendance this month
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Class won the inter-class science quiz competition
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
