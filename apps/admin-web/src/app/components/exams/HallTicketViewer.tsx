// apps/admin-web/src/app/components/exams/HallTicketViewer.tsx
import { Dialog, DialogContent, DialogActions, Button, Box } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import HallTicket from "./HallTicket";

interface HallTicketViewerProps {
  open: boolean;
  onClose: () => void;
  hallTicketData: {
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
  };
}

export default function HallTicketViewer({ open, onClose, hallTicketData }: HallTicketViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Convert to PDF or trigger download
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <HallTicket {...hallTicketData} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
          Download PDF
        </Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: "#0B5F5A", "&:hover": { bgcolor: "#094a46" } }}>
          Print
        </Button>
      </DialogActions>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .MuiDialog-root, .MuiDialog-root * {
              visibility: visible;
            }
            .MuiDialogActions-root {
              display: none !important;
            }
            .MuiDialog-container {
              position: static;
            }
            .MuiDialog-paper {
              box-shadow: none;
              margin: 0;
              max-width: 100%;
            }
          }
        `}
      </style>
    </Dialog>
  );
}
