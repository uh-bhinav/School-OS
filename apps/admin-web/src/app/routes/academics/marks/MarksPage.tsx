import { useState } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { Add as AddIcon, Upload as UploadIcon } from "@mui/icons-material";
import { MarksFilterBar } from "@/app/components/marks/MarksFilterBar";
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

  // KPI requires both class_id and exam_id
  const kpiFilters = classId && examId ? { class_id: classId, exam_id: examId } : undefined;
  const { data: kpi, isLoading: kpiLoading } = useMarksKpi(kpiFilters || { class_id: 0, exam_id: 0 });

  // Class performance requires both class_id and exam_id
  const { data: classPerformance } = useClassPerformance(
    classId || 0,
    examId || 0
  );

  // Student progress - use first student from marks data if available
  const firstStudentId = marks && marks.length > 0 ? marks[0].student_id : 0;
  const { data: studentProgress } = useStudentProgress(
    firstStudentId,
    subjectId || 0
  );

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

  const handleMarkSubmit = async (data: {
    student_id: number;
    subject_id: number;
    exam_id: number;
    marks_obtained: number;
    max_marks: number;
    remarks?: string;
  }) => {
    try {
      if (selectedMark) {
        // Only send marks_obtained and remarks for updates
        await updateMark.mutateAsync({
          id: selectedMark.id,
          payload: {
            marks_obtained: data.marks_obtained,
            remarks: data.remarks
          }
        });
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
      await bulkUpload.mutateAsync(file);
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
    const headers = ["Student", "Roll No", "Subject", "Exam", "Marks", "Grade", "Percentage"];
    const rows = marks.map((m: Mark) => [
      m.student_name,
      m.roll_no || "",
      m.subject_name,
      m.exam_name,
      `${m.marks_obtained}/${m.max_marks}`,
      m.grade || "",
      m.percentage ? `${m.percentage}%` : "",
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

  // Calculate summary stats from real data
  const totalMarksCount = marks?.length || 0;
  // Since backend doesn't have is_published, we show total in all three cards
  // Or we can compute based on whether entered_by_teacher_id exists
  const publishedCount = marks?.filter((m: Mark) => m.entered_by_teacher_id !== null).length || 0;
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
        <MarksFilterBar />
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
