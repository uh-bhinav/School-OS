import { useState } from "react";
import { Box, Typography, Button, Alert, Paper } from "@mui/material";
import FiltersBar from "../../../components/exams/FiltersBar";
import KPICards from "../../../components/exams/KPICards";
import ExamList from "../../../components/exams/ExamList";
import AddEditExamDialog from "../../../components/exams/AddEditExamDialog";
import ExportMenu from "../../../components/exams/ExportMenu";
import Legend from "../../../components/exams/Legend";
import { useExams, useExamKPI, useExamTypes } from "../../../services/exams.hooks";

const CLASSES = Array.from({ length: 10 }).map((_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];

export default function ExamsPage() {
  const [filters, setFilters] = useState({
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    exam_type_id: undefined as number | undefined,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: exams, isLoading, isError, refetch } = useExams(filters);
  const { data: kpi, isLoading: kpiLoading } = useExamKPI(filters);
  const { data: examTypes } = useExamTypes(1); // school_id = 1

  const handleExportCSV = () => {
    if (!exams || exams.length === 0) {
      alert("No data to export");
      return;
    }

    // Create CSV content
    const headers = ["Exam Title", "Type", "Date", "Total Marks", "Avg Score", "Pass Rate", "Status"];
    const rows = exams.map((exam) => [
      exam.title,
      exam.exam_type_name,
      exam.date,
      exam.total_marks.toString(),
      exam.average_score ? `${exam.average_score.toFixed(1)}%` : "-",
      exam.pass_percentage ? `${exam.pass_percentage.toFixed(0)}%` : "-",
      exam.is_published ? "Published" : "Draft",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exams_class_${filters.class_id}_section_${filters.section}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    alert("PDF export functionality will be implemented with backend integration");
  };

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" fontWeight={700}>
          Exams Overview
        </Typography>
        <ExportMenu onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </Box>

      <FiltersBar
        value={filters}
        onChange={(v) => setFilters((s) => ({ ...s, ...v }))}
        classes={CLASSES}
        sections={SECTIONS}
        examTypes={examTypes}
        onApply={() => refetch()}
      />

      {isError && <Alert severity="error">Failed to load exams. Please retry.</Alert>}

      <KPICards
        totalExams={kpi?.total_exams ?? 0}
        avgPerformance={kpi?.avg_performance ?? 0}
        passRate={kpi?.pass_rate ?? 0}
        pendingResults={kpi?.pending_results ?? 0}
        publishedCount={kpi?.published_count ?? 0}
        isLoading={kpiLoading}
      />

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">Exams List</Typography>
          <Button variant="contained" onClick={() => setDialogOpen(true)} sx={{
            bgcolor: "#0B5F5A",
            "&:hover": { bgcolor: "#094a46" },
          }}>
            Add Exam
          </Button>
        </Box>

        <ExamList exams={exams ?? []} onRefresh={refetch} isLoading={isLoading} />
      </Paper>

      <Legend />

      <AddEditExamDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        filters={filters}
        onSuccess={refetch}
      />
    </Box>
  );
}
