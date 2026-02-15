import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Button, Dialog, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { Download, Visibility } from "@mui/icons-material";
import { getStudentReportCards } from "@/app/services/student-details.api";
import type { ReportCard } from "@/app/mockDataProviders/mockStudentReportCard";

interface ReportCardPanelProps {
  studentId: number;
  studentName?: string;
  motherName?: string;
  fatherName?: string;
  rollNo?: string;
  admissionNo?: string;
  dateOfBirth?: string;
  address?: string;
}

export default function ReportCardPanel({ studentId, studentName, motherName, fatherName, rollNo, admissionNo, dateOfBirth, address }: ReportCardPanelProps) {
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
        <DialogContent sx={{ p: 0 }}>
          {selectedCard && (
            <Box sx={{ p: 4, bgcolor: "white" }}>
              {/* School Header */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #1976d2", pb: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {/* School Logo Placeholder */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      border: "2px solid #1976d2",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#f5f5f5",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      SCHOOL
                      <br />
                      LOGO
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      DEMO SCHOOL NAME
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Affiliated To: CBSE Board / Affiliation No: 1234567890
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ph +91 1234567890, Email: info@yourschool.com
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visit us: www.yourschoolwebsite.com
                    </Typography>
                  </Box>
                </Box>

                {/* Student Photo Placeholder */}
                <Box
                  sx={{
                    width: 80,
                    height: 100,
                    border: "2px solid #1976d2",
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    Student
                    <br />
                    Photo
                  </Typography>
                </Box>
              </Box>

              {/* Report Title */}
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Academic Report
                </Typography>
                <Typography variant="body2">
                  Academic Session: 2025-2026
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedCard.class_name} - {selectedCard.section}
                </Typography>
              </Box>

              {/* Student Details */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Box>
                  <Typography variant="body2">
                    <strong>Name of Student:</strong> {studentName || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Mother's Name:</strong> {motherName || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Father's Name:</strong> {fatherName || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {address || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>Roll No.:</strong> {rollNo || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Admission No:</strong> {admissionNo || "—"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date of Birth:</strong> {dateOfBirth || "—"}
                  </Typography>
                </Box>
              </Box>

              {/* Subject-wise Marks Table */}
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Scholastic Areas - {selectedCard.term}
              </Typography>
              <Table size="small" sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Subject</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Half Yearly</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Total</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Overall</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCard.subjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ border: "1px solid #e0e0e0" }}>{subject.subject_name}</TableCell>
                      <TableCell align="center" sx={{ border: "1px solid #e0e0e0" }}>{subject.marks_obtained}</TableCell>
                      <TableCell align="center" sx={{ border: "1px solid #e0e0e0" }}>{subject.marks_obtained}</TableCell>
                      <TableCell align="center" sx={{ border: "1px solid #e0e0e0" }}>{subject.marks_obtained}</TableCell>
                      <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>{subject.grade}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: "#ffecb3" }}>
                    <TableCell sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Attendance</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0" }}>
                      {selectedCard.attendance_summary.present_days}/{selectedCard.attendance_summary.total_days}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Total Marks</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0" }}>
                      {selectedCard.subjects.reduce((sum, s) => sum + s.marks_obtained, 0)}/{selectedCard.subjects.reduce((sum, s) => sum + s.max_marks, 0)}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Percentage</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>{selectedCard.overall_percentage}%</TableCell>
                    <TableCell sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Grade</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>{selectedCard.overall_grade}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Co-Scholastic Activities */}
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                CO-SCHOLASTIC: (3 POINT GRADING SCALE A,B,C)
              </Typography>
              <Table size="small" sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                    <TableCell sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Activity</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Term-I</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>Term-II</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCard.co_scholastic.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ border: "1px solid #e0e0e0" }}>{activity.category}</TableCell>
                      <TableCell align="center" sx={{ border: "1px solid #e0e0e0", fontWeight: "bold" }}>{activity.grade}</TableCell>
                      <TableCell align="center" sx={{ border: "1px solid #e0e0e0" }}></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Signatures */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ borderTop: "1px solid #000", pt: 1, width: 150, mt: 8 }}>
                    <Typography variant="caption">Sign. of Class Teacher</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ borderTop: "1px solid #000", pt: 1, width: 150, mt: 8 }}>
                    <Typography variant="caption">Sign. Of Principal</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ borderTop: "1px solid #000", pt: 1, width: 150, mt: 8 }}>
                    <Typography variant="caption">Sign. of Manager</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Grading Scale */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold">
                  Grading scale for scholastic areas: Grades are awarded on a 8-point grading scale as follows:
                </Typography>
                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: "0.7rem", p: 0.5 }}>Marks Range (%)</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>91-100</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>81-90</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>71-80</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>61-70</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>51-60</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>41-50</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>32-40</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontSize: "0.7rem", p: 0.5 }}>Grade</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>A+</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>A</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>B+</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>B</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>C+</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>C</TableCell>
                      <TableCell align="center" sx={{ fontSize: "0.7rem", p: 0.5 }}>D</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              {/* Download Buttons */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleCloseDialog}>
                  Close
                </Button>
                <Button variant="contained" startIcon={<Download />}>
                  Download PDF
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
