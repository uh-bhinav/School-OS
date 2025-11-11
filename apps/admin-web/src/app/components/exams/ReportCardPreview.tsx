import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { useReportCard } from "../../services/reportcard.hooks";

interface ReportCardPreviewProps {
  open: boolean;
  onClose: () => void;
  examId: number;
}

export default function ReportCardPreview({ open, onClose, examId }: ReportCardPreviewProps) {
  const { data: reportCard, isLoading, isError } = useReportCard(examId);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Simulate PDF download
      const link = document.createElement("a");
      link.href = `/v1/pdf/report_card/${examId}`;
      link.download = `report_card_${examId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: Record<string, string> = {
      "A+": "#2e7d32",
      "A": "#388e3c",
      "B+": "#1976d2",
      "B": "#1e88e5",
      "C+": "#ed6c02",
      "C": "#f57c00",
      "D": "#d32f2f",
      "F": "#c62828",
    };
    return gradeColors[grade] || "#757575";
  };

  const getResultColor = (status: string) => {
    return status === "PASS" ? "success" : status === "FAIL" ? "error" : "default";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AssessmentIcon sx={{ color: "#0B5F5A", fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Report Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reportCard?.exam_title || "Loading..."}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={downloading || isLoading}
            sx={{
              borderColor: "#0B5F5A",
              color: "#0B5F5A",
              "&:hover": {
                borderColor: "#094a46",
                bgcolor: "rgba(11, 95, 90, 0.04)",
              },
            }}
          >
            Download PDF
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Alert severity="error">
            Failed to load report card. Please try again later.
          </Alert>
        )}

        {reportCard && (
          <Box>
            {/* Summary Statistics */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Students
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {reportCard.students.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Passed
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {reportCard.students.filter((s) => s.result_status === "PASS").length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Failed
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {reportCard.students.filter((s) => s.result_status === "FAIL").length}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Student Results Table */}
            {reportCard.students.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Roll No.</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Class & Section
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Marks Obtained
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Percentage
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Grade
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Result
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportCard.students.map((student) => {
                    const percentage = (student.obtained_marks / student.total_marks) * 100;
                    return (
                      <TableRow
                        key={student.student_id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <TableCell>{student.roll_no}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {student.student_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {student.class_id}-{student.section}
                        </TableCell>
                        <TableCell align="center">
                          {student.obtained_marks}/{student.total_marks}
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              color: percentage >= 60 ? "success.main" : percentage >= 40 ? "warning.main" : "error.main",
                            }}
                          >
                            {percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={student.grade}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: getGradeColor(student.grade),
                              color: "white",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={student.result_status}
                            size="small"
                            color={getResultColor(student.result_status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No results available
                </Typography>
                <Typography variant="body2">
                  Student results have not been entered yet for this exam.
                </Typography>
              </Box>
            )}
          </Box>
        )}
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
