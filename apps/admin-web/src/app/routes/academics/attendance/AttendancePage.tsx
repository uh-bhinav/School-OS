// routes/academics/attendance/AttendancePage.tsx
import { useMemo, useState } from "react";
import { Box, Button, Paper, Typography, Stack, Fade, CircularProgress, Alert } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RefreshIcon from "@mui/icons-material/Refresh";
import FiltersBar from "../../../components/attendance/FiltersBar";
import SummaryCards from "../../../components/attendance/SummaryCards";
import TopInsights from "../../../components/attendance/TopInsights";
import AttendanceTable from "../../../components/attendance/AttendanceTable";
import WeeklyChart from "../../../components/attendance/WeeklyChart";
import RangeChart from "../../../components/attendance/RangeChart";
import MarkDialog from "../../../components/attendance/MarkDialog";
import BulkUploadDialog from "../../../components/attendance/BulkUploadDialog";
import StudentHistoryDrawer from "./StudentHistoryDrawer";
import {
  useAttendanceList, useUpdateAttendance, useStudentHistory,
  useWeeklySummary, useClassRange, useBulkAttendance
} from "../../../services/attendance.hooks";

export default function AttendancePage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const [filters, setFiltersState] = useState({
    academic_year_id: undefined as number|undefined,
    class_id: 8 as number|undefined,
    section_id: undefined as number|undefined,
    date: todayStr,
    date_from: undefined as string|undefined,
    date_to: undefined as string|undefined,
    month: undefined as string|undefined,
    filter_mode: "date" as "date"|"month"|"range",
  });
  const setFilters = (p: any) => setFiltersState(s => ({ ...s, ...p }));

  // Safe date helpers that won't crash on invalid input
  const safeDate = (d: string): string => {
    try {
      if (!d) return todayStr;
      const parts = d.split("-");
      if (parts.length !== 3) return todayStr;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!year || year < 2000 || year > 2099 || !month || month < 1 || month > 12 || !day || day < 1 || day > 31) return todayStr;
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) return todayStr;
      return d;
    } catch { return todayStr; }
  };

  const validDate = safeDate(filters.date);

  const { data: list, isLoading, error, refetch } = useAttendanceList({ class_id: filters.class_id, date: validDate, page:1, page_size:300 });
  const { data: weekly } = useWeeklySummary(filters.class_id ?? 0, undefined);
  const { data: range } = useClassRange(filters.class_id ?? 0, safeGetMonthStart(validDate), validDate);

  const [editRow, setEditRow] = useState<any|null>(null);
  const updateMut = useUpdateAttendance();

  const [historyId, setHistoryId] = useState<number|undefined>();
  const { data: history } = useStudentHistory(historyId);

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const bulkMut = useBulkAttendance();

  const rows = useMemo(()=> (list?.items ?? []).map((r, idx) => ({
    id: r.attendance_id, sl_no: idx + 1, student_id: r.student_id,
    enrollment_no: resolveEnrollment(r.student_id),
    student_name: resolveName(r.student_id),
    father_name: resolveFatherName(r.student_id),
    status: r.status, remarks: r.remarks ?? "",
    date: r.date
  })), [list]);

  const presentPct = useMemo(()=>{
    const items = list?.items ?? [];
    if (!items.length) return 0;
    return 100 * (items.filter(i=>i.status==="PRESENT").length / items.length);
  }, [list]);
  const latePct = useMemo(()=>{
    const items = list?.items ?? [];
    if (!items.length) return 0;
    return 100 * (items.filter(i=>i.status==="LATE").length / items.length);
  }, [list]);
  const unmarked = useMemo(()=> Math.max(0, (list?.total ?? 0) - (list?.items?.length ?? 0)), [list]);

  const handleBulkMark = async (ids: number[], status: string) => {
    for (const id of ids) {
      await updateMut.mutateAsync({ attendance_id: id, patch: { status } });
    }
  };

  const handleBulkUpload = async (rows: any[]) => {
    await bulkMut.mutateAsync(rows);
  };

  const handleExport = () => {
    if (!list?.items.length) return;
    // Build Excel-compatible CSV with the SATS-like format
    const header = ["Sl.No", "Enrollment Number", "Student Name", "Father Name", "Status", "Present Days", "Date"].join(",");
    const dataRows = list.items.map((r, idx) => [
      idx + 1,
      resolveEnrollment(r.student_id),
      resolveName(r.student_id),
      resolveFatherName(r.student_id),
      r.status,
      r.status === "PRESENT" || r.status === "LATE" ? 1 : 0,
      r.date
    ].join(","));
    const csv = [header, ...dataRows].join("\n");
    // Use Excel-compatible format with BOM for proper Excel opening
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${filters.date}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock data (replace with real data from API/context)
  const academicYears = [{ id: 1, name: "2024-2025" }, { id: 2, name: "2023-2024" }];
  const classes = [
    { id: 6, name: "Grade 6" },
    { id: 7, name: "Grade 7" },
    { id: 8, name: "Grade 8" },
    { id: 9, name: "Grade 9" },
    { id: 10, name: "Grade 10" },
  ];
  const sections = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
    { id: 3, name: "C" },
    { id: 4, name: "D" },
  ];

  return (
    <Fade in timeout={600}>
      <Box sx={{ display:"grid", gap:4, pb:4, px: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color:"text.primary", mb: 0.5 }}>
              📋 Attendance Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track, analyze, and manage student attendance efficiently
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon/>}
              onClick={()=>setBulkDialogOpen(true)}
              sx={{ borderRadius:3, textTransform: "none", px: 3 }}
            >
              Bulk Upload
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon/>}
              onClick={()=>refetch()}
              sx={{ borderRadius:3, textTransform: "none", px: 3 }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          onRefresh={()=>refetch()}
          academicYears={academicYears}
          classes={classes}
          sections={sections}
        />

        {error && (
          <Alert
            severity="error"
            onClose={()=>refetch()}
            sx={{ borderRadius: 3 }}
          >
            Failed to load attendance data. Please try again.
          </Alert>
        )}

        {/* Summary Cards */}
        {!isLoading && <SummaryCards presentPct={presentPct} latePct={latePct} unmarked={unmarked} />}

        {/* Top Insights */}
        {!isLoading && <TopInsights currentData={list} weeklySummary={weekly} />}

        {/* Charts Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p:3,
              borderRadius:3,
              border: "1px solid",
              borderColor: "divider",
              transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover":{
                boxShadow: 4,
                borderColor: "primary.main",
              }
            }}
          >
            {weekly && weekly.buckets.length > 0 ? (
              <WeeklyChart data={weekly.buckets} />
            ) : (
              <Box sx={{ textAlign:"center", py:8, color:"text.secondary" }}>
                <CircularProgress size={32} sx={{ mb:2, color: "primary.main" }}/>
                <Typography variant="body1" fontWeight={500}>Loading weekly data...</Typography>
              </Box>
            )}
          </Paper>
          <Paper
            elevation={0}
            sx={{
              p:3,
              borderRadius:3,
              border: "1px solid",
              borderColor: "divider",
              transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover":{
                boxShadow: 4,
                borderColor: "primary.main",
              }
            }}
          >
            {range && range.series.length > 0 ? (
              <RangeChart data={range.series} />
            ) : (
              <Box sx={{ textAlign:"center", py:8, color:"text.secondary" }}>
                <CircularProgress size={32} sx={{ mb:2, color: "primary.main" }}/>
                <Typography variant="body1" fontWeight={500}>Loading trend data...</Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Attendance Table */}
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb:3, display: "flex", alignItems: "center", gap: 1 }}>
            👥 Daily Attendance Records
          </Typography>
          <AttendanceTable
            rows={rows}
            onEdit={(row)=>setEditRow(row)}
            onHistory={(sid)=>setHistoryId(sid)}
            onBulkMark={handleBulkMark}
            onExport={handleExport}
            loading={isLoading}
          />
        </Box>

        {/* Dialogs */}
        <MarkDialog
          open={!!editRow}
          initial={{ status: editRow?.status ?? "PRESENT", remarks: editRow?.remarks ?? "" }}
          onClose={()=>setEditRow(null)}
          onSave={(patch)=>{ updateMut.mutate({ attendance_id: editRow.id, patch }); setEditRow(null); }}
        />

        <BulkUploadDialog open={bulkDialogOpen} onClose={()=>setBulkDialogOpen(false)} onUpload={handleBulkUpload} />

        <StudentHistoryDrawer open={!!historyId} onClose={()=>setHistoryId(undefined)} history={history}/>
      </Box>
    </Fade>
  );
}

// Helpers (replace with your real resolvers)
function resolveName(student_id:number){ return `Student ${student_id}`; }
function resolveFatherName(student_id:number){ return `Parent of Student ${student_id}`; }
function resolveEnrollment(student_id:number){ return `ENR${String(student_id).padStart(6, '0')}`; }
function safeGetMonthStart(d:string){
  try {
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (!year || year < 2000 || year > 2099 || !month || month < 1 || month > 12) return d;
    return `${year}-${String(month).padStart(2,'0')}-01`;
  } catch {
    return d;
  }
}
