import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import { TimetableEntry, Period } from "../../services/timetable.schema";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  filters: {
    academic_year_id: number;
    class_id: number;
    section: string;
    week_start: string;
  };
  entries: TimetableEntry[];
  periods: Period[];
}

type ExportFormat = "csv" | "print";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

/**
 * Dialog for exporting timetable in CSV or print format
 */
export default function ExportDialog({
  open,
  onClose,
  filters,
  entries,
  periods,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [loading, setLoading] = useState(false);

  const generateCSV = () => {
    setLoading(true);
    try {
      // Header row
      const headers = ["Period", ...DAYS];
      const rows = [headers.join(",")];

      // Data rows
      periods.forEach((period) => {
        const row = [
          `P${period.period_no} (${period.start_time}-${period.end_time})`,
        ];
        DAYS.forEach((day) => {
          const entry = entries.find(
            (e) => e.day === day && e.period_no === period.period_no
          );
          const cellText = entry
            ? `${entry.subject_name} | ${entry.teacher_name}${
                entry.room_name ? " | " + entry.room_name : ""
              }`
            : "Free";
          row.push(`"${cellText}"`);
        });
        rows.push(row.join(","));
      });

      const csv = rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `timetable_class${filters.class_id}${filters.section}_${filters.week_start}.csv`
      );
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const generatePrint = () => {
    setLoading(true);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print");
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Timetable - Class ${filters.class_id}${filters.section}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 10px; }
            .meta { text-align: center; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .period-label { font-weight: bold; background-color: #fafafa; }
            .subject { font-weight: 600; }
            .teacher { color: #666; font-size: 0.9em; }
            .room { color: #999; font-size: 0.85em; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Timetable</h1>
          <div class="meta">
            Class ${filters.class_id}${filters.section} | Academic Year ${filters.academic_year_id} | Week of ${filters.week_start}
          </div>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                ${DAYS.map((d) => `<th>${d}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${periods
                .map(
                  (period) => `
                <tr>
                  <td class="period-label">P${period.period_no}<br/><small>${period.start_time}-${period.end_time}</small></td>
                  ${DAYS.map((day) => {
                    const entry = entries.find(
                      (e) => e.day === day && e.period_no === period.period_no
                    );
                    return entry
                      ? `<td>
                          <div class="subject">${entry.subject_name}</div>
                          <div class="teacher">${entry.teacher_name}</div>
                          ${entry.room_name ? `<div class="room">${entry.room_name}</div>` : ""}
                        </td>`
                      : `<td style="background-color: #f9f9f9;">Free</td>`;
                  }).join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error("Print failed:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleExport = () => {
    if (format === "csv") {
      generateCSV();
    } else {
      generatePrint();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Timetable</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Export the current timetable for Class {filters.class_id}
          {filters.section} (Week of {filters.week_start})
        </Alert>

        <Typography variant="subtitle2" gutterBottom>
          Select Format:
        </Typography>
        <RadioGroup value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
          <FormControlLabel value="csv" control={<Radio />} label="CSV (Excel-compatible)" />
          <FormControlLabel value="print" control={<Radio />} label="Print / PDF" />
        </RadioGroup>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={format === "csv" ? <DownloadIcon /> : <PrintIcon />}
        >
          {format === "csv" ? "Download CSV" : "Print"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
