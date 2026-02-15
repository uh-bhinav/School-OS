// apps/admin-web/src/app/components/exams/HallTicket.tsx
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { format, parseISO } from "date-fns";

interface HallTicketProps {
  student: {
    rollNo: string;
    name: string;
    fatherName: string;
    motherName: string;
    photo?: string;
  };
  school: {
    name: string;
    logo?: string;
    address: string;
  };
  examPeriod: {
    name: string;
    startDate: string;
    endDate: string;
    academicYear: string;
  };
  examCenter: {
    name: string;
    address: string;
    code: string;
  };
  subjects: Array<{
    code: string;
    name: string;
    date: string;
    startTime: string;
    duration: number;
  }>;
  hallTicketNumber: string;
  downloadDateTime: string;
  ipAddress?: string;
  className?: string;
  section?: string;
}

export default function HallTicket({
  student,
  school,
  examPeriod,
  examCenter: _examCenter,
  subjects,
  hallTicketNumber,
  downloadDateTime,
  ipAddress,
  className,
  section,
}: HallTicketProps) {
  return (
    <Paper
      sx={{
        width: "210mm",
        minHeight: "297mm",
        p: 3,
        bgcolor: "white",
        boxShadow: 3,
        position: "relative",
        overflow: "hidden",
        "@media print": {
          boxShadow: "none",
          m: 0,
          p: 2,
        },
      }}
    >
      {/* School Seal Watermark */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.04,
          fontSize: "200px",
          fontWeight: 900,
          color: "#1976d2",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 0,
        }}
      >
        {school.name.substring(0, 3).toUpperCase()}
      </Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "3px solid #1976d2",
          pb: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* School Logo Placeholder */}
          <Box
            sx={{
              width: 80,
              height: 80,
              border: "2px solid #1976d2",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f5f5f5",
            }}
          >
            {school.logo ? (
              <img src={school.logo} alt="School Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <Typography variant="caption" color="text.secondary">
                SCHOOL
                <br />
                LOGO
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {school.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {school.address}
            </Typography>
          </Box>
        </Box>

        {/* Student Photo */}
        <Box
          sx={{
            width: 100,
            height: 120,
            border: "2px solid #1976d2",
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "#f5f5f5",
          }}
        >
          {student.photo ? (
            <img src={student.photo} alt="Student" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Student
                <br />
                Photo
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Title Bar */}
      <Box
        sx={{
          bgcolor: "#424242",
          color: "white",
          p: 1.5,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Hall Ticket - {examPeriod.name}
          </Typography>
          <Typography variant="caption">Hall Ticket No: {hallTicketNumber}</Typography>
        </Box>
        <Typography variant="body2">{examPeriod.academicYear}</Typography>
      </Box>

      {/* Student Details */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 1.5, mb: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            Roll No
          </Typography>
          <Typography variant="body2">: {student.rollNo}</Typography>

          <Typography variant="body2" fontWeight="bold">
            Name
          </Typography>
          <Typography variant="body2">: {student.name}</Typography>

          <Typography variant="body2" fontWeight="bold">
            Father's Name
          </Typography>
          <Typography variant="body2">: {student.fatherName}</Typography>

          <Typography variant="body2" fontWeight="bold">
            Mother's Name
          </Typography>
          <Typography variant="body2">: {student.motherName}</Typography>

          {className && (
            <>
              <Typography variant="body2" fontWeight="bold">
                Class
              </Typography>
              <Typography variant="body2">: {className}</Typography>
            </>
          )}

          {section && (
            <>
              <Typography variant="body2" fontWeight="bold">
                Section
              </Typography>
              <Typography variant="body2">: {section}</Typography>
            </>
          )}

          <Typography variant="body2" fontWeight="bold">
            Academic Year
          </Typography>
          <Typography variant="body2">: {examPeriod.academicYear}</Typography>

          <Typography variant="body2" fontWeight="bold">
            Exam Period
          </Typography>
          <Typography variant="body2">: {examPeriod.name}</Typography>
        </Box>
      </Box>

      {/* Subject Schedule Table */}
      <TableContainer sx={{ mb: 3, border: "1px solid #e0e0e0" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}>Subject Code</TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}>Subject Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}>Date of Exam</TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #e0e0e0" }}>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ border: "1px solid #e0e0e0" }}>{subject.code}</TableCell>
                <TableCell sx={{ border: "1px solid #e0e0e0" }}>{subject.name}</TableCell>
                <TableCell sx={{ border: "1px solid #e0e0e0" }}>{format(parseISO(subject.date), "dd-MM-yyyy")}</TableCell>
                <TableCell sx={{ border: "1px solid #e0e0e0" }}>
                  {subject.startTime} ({subject.duration} mins)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Important Instructions */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Important Instructions
        </Typography>
        <Box component="ol" sx={{ pl: 2, fontSize: "0.875rem", "& li": { mb: 1 } }}>
          <li>
            For getting entry into the examination hall, candidate must bring the original Identity Card issued by the school along with the
            examination hall ticket and a valid photo identity proof like Aadhaar Card, Passport or PAN card etc.
          </li>
          <li>
            Carrying Mobile Phones, Cameras, bags, calculators or any other electronic gadgets etc. are not allowed in the examination center.
          </li>
          <li>
            Examination will be from {subjects[0]?.startTime || "9:00 AM"} to{" "}
            {subjects[0]?.startTime && subjects[0]?.duration
              ? (() => {
                  const [hours, minutes] = subjects[0].startTime.split(":");
                  const startMinutes = parseInt(hours) * 60 + parseInt(minutes.split(" ")[0]);
                  const endMinutes = startMinutes + subjects[0].duration;
                  const endHours = Math.floor(endMinutes / 60);
                  const endMins = endMinutes % 60;
                  return `${endHours}:${endMins.toString().padStart(2, "0")} ${parseInt(hours) < 12 ? "AM" : "PM"}`;
                })()
              : "12:00 PM"}
            . Candidates must report minimum 30 minutes before the commencement of the exam.
          </li>
          <li>Candidate will not be allowed to appear in the exam if he/she reports after commencement of the exam.</li>
          <li>This hall ticket must be preserved and produced during result declaration or admission to next class.</li>
        </Box>
      </Box>

      {/* Disclaimer */}
      <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1, border: "1px solid #e0e0e0" }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Disclaimer
        </Typography>
        <Typography variant="caption">
          {school.name} is not responsible for any inadvertent error that may have crept in the Hall Ticket. In case of any discrepancy, please
          contact the school administration immediately.
        </Typography>
      </Box>

      {/* Signature Box */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ width: 180, height: 40, mb: 0.5, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <Typography variant="caption" sx={{ fontStyle: "italic", color: "#666", fontFamily: "'Brush Script MT', cursive", fontSize: 18 }}>
              Principal
            </Typography>
          </Box>
          <Box sx={{ borderTop: "1px solid #000", pt: 1, width: 200 }}>
            <Typography variant="caption">Principal's Signature & Seal</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Box sx={{ borderTop: "1px solid #000", pt: 1, width: 200 }}>
            <Typography variant="caption">Student's Signature</Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 3, textAlign: "center", borderTop: "1px solid #e0e0e0", pt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Downloaded on: {downloadDateTime} {ipAddress ? `| IP: ${ipAddress}` : ""}
        </Typography>
      </Box>
    </Paper>
  );
}
