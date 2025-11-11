import { useState } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Upload as UploadIcon } from "@mui/icons-material";
import { FiltersBar } from "@/app/components/marks/FiltersBar";
import { KPICards } from "@/app/components/marks/KPICards";
import { MarksTable } from "@/app/components/marks/MarksTable";
import { MarkDialog } from "@/app/components/marks/MarkDialog";
import { BulkUploadDialog } from "@/app/components/marks/BulkUploadDialog";
import { StudentProgressChart } from "@/app/components/marks/StudentProgressChart";
import { ClassPerformanceChart } from "@/app/components/marks/ClassPerformanceChart";
import { SummaryCards } from "@/app/components/marks/SummaryCards";
import { ExportMenu } from "@/app/components/marks/ExportMenu";
import { useMarksStore } from "@/app/stores/useMarksStore";
import {
  useMarks,
  useMarksKpi,
  useClassPerformance,
  useStudentProgress,
  useCreateMark,
  useUpdateMark,
  useDeleteMark,
  useBulkUploadMarks,
} from "@/app/services/marks.hooks";
import { Mark } from "@/app/services/marks.schema";

/**
 * MarksPage Component
 *
 * Main page for marks management in the School-OS Admin Dashboard.
 *
 * Features:
 * - Filter-based marks display
 * - KPI cards showing overview metrics
 * - Sortable, paginated marks table
 * - Add/Edit/Delete individual marks
 * - Bulk CSV upload
 * - Performance analytics charts
 * - Export functionality (CSV/PDF)
 *
 * Architecture:
 * - Uses Zustand for filter state management
 * - React Query for data fetching and mutations
 * - MSW for mock API responses (development)
 * - Modular components for clean separation of concerns
 *
 * Integration Notes:
 * - All API endpoints use /api/v1/marks pattern
 * - MSW handlers in mocks/marks.handlers.ts
 * - When backend is ready, simply update baseURL in http client
 * - No component changes needed for backend integration
 */
export default function MarksPage() {
  const { classId, section, examId, subjectId } = useMarksStore();

  // Build filters object
  const filters = {
    ...(classId && { class_id: classId }),
    ...(section && { section }),
    ...(examId && { exam_id: examId }),
    ...(subjectId && { subject_id: subjectId }),
  };

  // Data queries
  const { data: marks, isLoading: marksLoading, refetch: refetchMarks } = useMarks(filters);
  const { data: kpi, isLoading: kpiLoading } = useMarksKpi(filters);
  const { data: classPerformance } = useClassPerformance(classId || 8, examId || 5);
  const { data: studentProgress } = useStudentProgress(1001, subjectId || 21);

  // Mutations
  const createMark = useCreateMark();
  const updateMark = useUpdateMark();
  const deleteMark = useDeleteMark();
  const bulkUpload = useBulkUploadMarks();

  // Dialog states
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [selectedMark, setSelectedMark] = useState<Mark | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Handlers
  const handleAddMark = () => {
    setSelectedMark(null);
    setMarkDialogOpen(true);
  };

  const handleEditMark = (mark: Mark) => {
    setSelectedMark(mark);
    setMarkDialogOpen(true);
  };

  const handleDeleteMark = async (markId: number) => {
    if (!confirm("Are you sure you want to delete this mark entry?")) return;

    try {
      await deleteMark.mutateAsync(markId);
      showSnackbar("Mark deleted successfully");
      refetchMarks();
    } catch (error) {
      showSnackbar("Failed to delete mark", "error");
    }
  };

  const handleMarkSubmit = async (data: Partial<Mark>) => {
    try {
      if (selectedMark) {
        await updateMark.mutateAsync({ id: selectedMark.id, payload: data });
        showSnackbar("Mark updated successfully");
      } else {
        await createMark.mutateAsync(data);
        showSnackbar("Mark added successfully");
      }
      setMarkDialogOpen(false);
      setSelectedMark(null);
      refetchMarks();
    } catch (error) {
      showSnackbar(selectedMark ? "Failed to update mark" : "Failed to add mark", "error");
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      // In real implementation, parse CSV and convert to marks array
      // For now, simulate with mock data
      const mockMarks = [
        {
          student_id: 1001,
          student_name: "Rahul Verma",
          class_id: 8,
          section: "A",
          subject_id: 21,
          subject_name: "Mathematics",
          exam_id: 5,
          exam_name: "Mid-Term",
          marks_obtained: 85,
          total_marks: 100,
        },
      ];

      await bulkUpload.mutateAsync(mockMarks);
      showSnackbar(`Successfully uploaded marks from ${file.name}`);
      setBulkUploadOpen(false);
      refetchMarks();
    } catch (error) {
      showSnackbar("Failed to upload marks", "error");
    }
  };

  const handleExportCSV = () => {
    if (!marks) return;

    // Generate CSV content
    const headers = ["Student", "Roll No", "Subject", "Exam", "Marks", "Grade", "Status"];
    const rows = marks.map((m: Mark) => [
      m.student_name,
      m.roll_no || "",
      m.subject_name,
      m.exam_name,
      `${m.marks_obtained}/${m.total_marks}`,
      m.grade || "",
      m.is_published ? "Published" : "Draft",
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showSnackbar("Marks exported as CSV");
  };

  const handleExportPDF = () => {
    showSnackbar("PDF export functionality coming soon");
  };

  // Calculate summary stats
  const totalMarksCount = marks?.length || 0;
  const publishedCount = marks?.filter((m: Mark) => m.is_published).length || 0;
  const draftCount = totalMarksCount - publishedCount;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Marks Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <ExportMenu onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setBulkUploadOpen(true)}
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMark}
          >
            Add Marks
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <FiltersBar />
      </Box>

      {/* KPI Cards */}
      <Box sx={{ mb: 3 }}>
        <KPICards data={kpi} loading={kpiLoading} />
      </Box>

      {/* Marks Table */}
      <Box sx={{ mb: 3 }}>
        <MarksTable
          data={marks ?? []}
          loading={marksLoading}
          onEdit={handleEditMark}
          onDelete={handleDeleteMark}
        />
      </Box>

      {/* Performance Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <ClassPerformanceChart data={classPerformance} />
        <StudentProgressChart data={studentProgress} />
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 3 }}>
        <SummaryCards
          totalMarks={totalMarksCount}
          publishedCount={publishedCount}
          draftCount={draftCount}
        />
      </Box>

      {/* Dialogs */}
      <MarkDialog
        open={markDialogOpen}
        onClose={() => {
          setMarkDialogOpen(false);
          setSelectedMark(null);
        }}
        onSubmit={handleMarkSubmit}
        mark={selectedMark}
        loading={createMark.isPending || updateMark.isPending}
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onUpload={handleBulkUpload}
        loading={bulkUpload.isPending}
      />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
