import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { Exam } from "../../services/exams.schema";

interface ExamDetailDialogProps {
  open: boolean;
  onClose: () => void;
  exam: Exam;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ExamDetailDialog({ open, onClose, exam }: ExamDetailDialogProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AssessmentIcon sx={{ color: "#0B5F5A", fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {exam.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exam Details & Performance Summary
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "grid", gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Exam Type
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={exam.exam_type_name}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={exam.is_published ? "Published" : "Draft"}
                    size="small"
                    color={exam.is_published ? "success" : "default"}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatDate(exam.date)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Class & Section
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  Class {exam.class_id} - Section {exam.section}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Academic Year
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {exam.academic_year_id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Marks
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {exam.total_marks}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Performance Metrics */}
          {exam.is_published && (exam.average_score ?? 0) > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Performance Metrics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                <StatCard
                  title="Average Score"
                  value={`${(exam.average_score ?? 0).toFixed(1)}%`}
                  icon={<TrendingUpIcon />}
                  color="#1976d2"
                />
                <StatCard
                  title="Highest Score"
                  value={`${exam.highest_score ?? 0}/${exam.total_marks}`}
                  icon={<SchoolIcon />}
                  color="#2e7d32"
                />
                <StatCard
                  title="Pass Rate"
                  value={`${(exam.pass_percentage ?? 0).toFixed(0)}%`}
                  icon={<CheckCircleIcon />}
                  color="#9c27b0"
                />
              </Box>
            </Box>
          )}

          {/* Unpublished Notice */}
          {!exam.is_published && (
            <Box
              sx={{
                p: 2,
                bgcolor: "warning.lighter",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "warning.main",
              }}
            >
              <Typography variant="body2" color="warning.dark" fontWeight={500}>
                ⚠️ This exam has not been published yet. Performance metrics will be
                available once results are published.
              </Typography>
            </Box>
          )}

          {/* Additional Information */}
          <Box
            sx={{
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 Tip: You can view the complete report card with individual student
              scores by clicking "View Report Card" from the exams list.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{
          bgcolor: "#0B5F5A",
          "&:hover": { bgcolor: "#094a46" },
        }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
