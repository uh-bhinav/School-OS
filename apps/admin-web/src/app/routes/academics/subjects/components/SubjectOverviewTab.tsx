// ============================================================================
// SUBJECT OVERVIEW TAB
// ============================================================================
// Overview tab showing subject summary information

import { Box, Paper, Typography, Grid, LinearProgress, Chip } from "@mui/material";
import { SubjectDetail } from "@/app/services/obe.schema";

interface SubjectOverviewTabProps {
  subject: SubjectDetail;
}

export default function SubjectOverviewTab({ subject }: SubjectOverviewTabProps) {
  const coCompletionRate =
    subject.cos_defined_count > 0
      ? Math.round((subject.cos_approved_count / subject.cos_defined_count) * 100)
      : 0;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* CO Status Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Course Outcomes Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Approval Progress</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {subject.cos_approved_count}/{subject.cos_defined_count} COs Approved
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={coCompletionRate}
                sx={{ height: 8, borderRadius: 4 }}
                color={coCompletionRate === 100 ? "success" : "primary"}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {coCompletionRate === 100
                ? "All course outcomes are approved and ready for exam mapping."
                : `${subject.cos_defined_count - subject.cos_approved_count} course outcomes pending approval.`}
            </Typography>
          </Paper>
        </Grid>

        {/* Grades Taught Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Grades Taught
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {subject.grades_taught.map((grade) => (
                <Chip key={grade} label={`Grade ${grade}`} variant="outlined" />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              This subject is taught across {subject.grades_taught.length} grade levels.
            </Typography>
          </Paper>
        </Grid>

        {/* Subject Details Card */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subject Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Subject Code
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {subject.subject_code}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Included in Exams
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {subject.is_included_in_exams ? "Yes" : "No"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Classes
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {subject.total_classes}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Teachers
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {subject.total_teachers}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Tips Card */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, bgcolor: "info.50", borderLeft: 4, borderColor: "info.main" }}>
            <Typography variant="subtitle1" fontWeight="bold" color="info.dark" gutterBottom>
              💡 Quick Tips
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Define Course Outcomes (COs) in the <strong>COs Tab</strong> for each grade level
              <br />
              • Only <strong>Approved</strong> COs can be mapped to exam questions
              <br />
              • Use the <strong>Classes Tab</strong> to see which classes this subject is taught in
              <br />
              • Check the <strong>Exams Tab</strong> to view upcoming exams for this subject
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
