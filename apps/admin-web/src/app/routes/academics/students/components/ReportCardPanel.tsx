import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { Download, Visibility } from "@mui/icons-material";
import { getStudentReportCards } from "@/app/services/student-details.api";
import type { ReportCard } from "@/app/mockDataProviders/mockStudentReportCard";

interface ReportCardPanelProps {
  studentId: number;
}

export default function ReportCardPanel({ studentId }: ReportCardPanelProps) {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<ReportCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getStudentReportCards(studentId);
        setReportCards(data);
      } catch (error) {
        console.error("Error fetching report cards:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  const handleViewCard = (card: ReportCard) => {
    setSelectedCard(card);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCard(null);
  };

  if (loading) return <CircularProgress />;
  if (!reportCards || reportCards.length === 0) {
    return <Alert severity="info">No report cards available</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Report Cards
      </Typography>

      {/* Report Cards List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {reportCards.map((card) => (
          <Card key={card.id}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {card.exam_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.term} - {card.class_name} {card.section}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Typography variant="body2">
                      Overall: <strong>{card.overall_percentage}%</strong>
                    </Typography>
                    <Typography variant="body2">
                      Grade: <strong>{card.overall_grade}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Rank: <strong>{card.rank}/{card.total_students}</strong>
                    </Typography>
                    <Chip
                      label={card.promotion_status}
                      color={card.promotion_status === "Promoted" ? "success" : card.promotion_status === "Detained" ? "error" : "warning"}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => handleViewCard(card)}
                  >
                    View
                  </Button>
                  <Button variant="contained" startIcon={<Download />}>
                    Download
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Report Card Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCard?.exam_name} - Report Card
        </DialogTitle>
        <DialogContent>
          {selectedCard && (
            <Box>
              {/* Header Info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Class:</strong> {selectedCard.class_name} - {selectedCard.section}
                </Typography>
                <Typography variant="body2">
                  <strong>Term:</strong> {selectedCard.term}
                </Typography>
                <Typography variant="body2">
                  <strong>Generated On:</strong> {new Date(selectedCard.generated_date).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Subject-wise Marks */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Subject-wise Performance
              </Typography>
              <Table size="small" sx={{ mb: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell align="right">Marks</TableCell>
                    <TableCell align="right">Max Marks</TableCell>
                    <TableCell align="right">%</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Teacher</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCard.subjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell>{subject.subject_name}</TableCell>
                      <TableCell align="right">{subject.marks_obtained}</TableCell>
                      <TableCell align="right">{subject.max_marks}</TableCell>
                      <TableCell align="right">{subject.percentage}%</TableCell>
                      <TableCell>{subject.grade}</TableCell>
                      <TableCell>{subject.teacher_name}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{selectedCard.subjects.reduce((sum, s) => sum + s.marks_obtained, 0)}</strong></TableCell>
                    <TableCell align="right"><strong>{selectedCard.subjects.reduce((sum, s) => sum + s.max_marks, 0)}</strong></TableCell>
                    <TableCell align="right"><strong>{selectedCard.overall_percentage}%</strong></TableCell>
                    <TableCell><strong>{selectedCard.overall_grade}</strong></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Co-Scholastic Grades */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Co-Scholastic Activities
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, mb: 3 }}>
                {selectedCard.co_scholastic.map((activity, index) => (
                  <Box key={index} sx={{ p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{activity.category}</Typography>
                    <Typography variant="body2" color="primary">Grade: {activity.grade}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Attendance Summary */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Attendance Summary
              </Typography>
              <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2">
                  Total Days: <strong>{selectedCard.attendance_summary.total_days}</strong>
                </Typography>
                <Typography variant="body2">
                  Present: <strong>{selectedCard.attendance_summary.present_days}</strong>
                </Typography>
                <Typography variant="body2">
                  Absent: <strong>{selectedCard.attendance_summary.absent_days}</strong>
                </Typography>
                <Typography variant="body2">
                  Percentage: <strong>{selectedCard.attendance_summary.percentage}%</strong>
                </Typography>
              </Box>

              {/* Remarks */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Remarks
              </Typography>
              <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Class Teacher:</strong> {selectedCard.teacher_remarks}
                </Typography>
                {selectedCard.principal_remarks && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Principal:</strong> {selectedCard.principal_remarks}
                  </Typography>
                )}
              </Box>

              {/* Promotion Status */}
              <Box sx={{ p: 2, bgcolor: selectedCard.promotion_status === "Promoted" ? "success.light" : "warning.light", borderRadius: 1 }}>
                <Typography variant="body1" fontWeight="bold">
                  Status: {selectedCard.promotion_status}
                </Typography>
                {selectedCard.next_class && (
                  <Typography variant="body2">
                    Promoted to: {selectedCard.next_class}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
