// ============================================================================
// SUBJECT HEADER CARD
// ============================================================================
// Header card displaying subject overview info

import { Box, Paper, Typography, Chip, Avatar } from "@mui/material";
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { SubjectDetail } from "@/app/services/obe.schema";

interface SubjectHeaderCardProps {
  subject: SubjectDetail;
}

export default function SubjectHeaderCard({ subject }: SubjectHeaderCardProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {/* Subject Icon */}
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: "primary.main",
            fontSize: 24,
          }}
        >
          <SchoolIcon fontSize="large" />
        </Avatar>

        {/* Subject Info */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="h5" fontWeight="bold">
              {subject.subject_name}
            </Typography>
            <Chip label={subject.subject_code} size="small" color="primary" variant="outlined" />
            {subject.is_included_in_exams ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Exam Subject"
                size="small"
                color="success"
                variant="outlined"
              />
            ) : (
              <Chip
                icon={<CancelIcon />}
                label="Non-Exam"
                size="small"
                color="default"
                variant="outlined"
              />
            )}
          </Box>

          {subject.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subject.description}
            </Typography>
          )}

          {/* Stats Row */}
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {subject.total_classes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Classes
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {subject.total_teachers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Teachers
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {subject.cos_approved_count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Approved COs
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {subject.cos_defined_count - subject.cos_approved_count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Draft COs
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                {subject.grades_taught.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Grades
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
