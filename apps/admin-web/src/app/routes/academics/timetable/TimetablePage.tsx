import { useMemo, useState } from "react";
import { Box, Paper, Typography, Button, Alert, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

import FiltersBar from "../../../components/timetable/FiltersBar";
import KPICards from "../../../components/timetable/KPICards";
import Legend from "../../../components/timetable/Legend";
import ViewSelector from "../../../components/timetable/ViewSelector";
import { TimetableViewGrid } from "../../../components/timetable/TimetableViewGrid";
import CellDetailsModal from "../../../components/timetable/CellDetailsModal";
import PublishBar from "../../../components/timetable/PublishBar";
import ExportDialog from "../../../components/timetable/ExportDialog";
import HowToUsePopover from "../../../components/timetable/HowToUsePopover";
import TimetableErrorBoundary from "../../../components/timetable/TimetableErrorBoundary";
import TeacherAbsenceBanner from "../../../components/timetable/TeacherAbsenceBanner";
import TeacherAbsentModal from "../../../components/timetable/TeacherAbsentModal";

import { useTimetableGrid, useTimetableKPIs } from "../../../services/timetable.hooks";
import { useAbsentTeachers } from "../../../services/proxy.hooks";
import { useTimetableViewStore } from "../../../stores/useTimetableViewStore";
import { useProxyStore } from "../../../stores/useProxyStore";
import type { AbsentTeacher } from "../../../services/proxy.api";
import type { TimetableEntry, Period, DayOfWeek } from "../../../services/timetable.schema";

/**
 * Normalizes any date to the Monday of its week (ISO format YYYY-MM-DD)
 */
function toMondayISO(d: string | Date): string {
  try {
    const date = new Date(d ?? new Date());
    if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
    const day = date.getDay(); // 0..6 (Sun=0)
    const diff = day === 0 ? -6 : 1 - day; // Shift to Monday
    const mon = new Date(date);
    mon.setDate(date.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return mon.toISOString().slice(0, 10);
  } catch {
    // Fallback to current week's Monday
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    now.setDate(now.getDate() + diff);
    now.setHours(0, 0, 0, 0);
    return now.toISOString().slice(0, 10);
  }
}

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];

export default function TimetablePage() {
  const [filters, setFilters] = useState({
    academic_year_id: 1,
    class_id: 8,
    section: "A",
    week_start: toMondayISO(new Date()),
  });

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<AbsentTeacher | null>(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Cell details modal state
  const [cellDetailsOpen, setCellDetailsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  // Get view state from store
  const {
    currentView,
    highlightFreePeriods,
    showRoomNumbers,
  } = useTimetableViewStore();

  // Get proxy assignments from store
  const { assignments: proxyAssignments } = useProxyStore();

  // Get today's date for absence check
  const today = new Date().toISOString().split("T")[0];

  // Fetch absent teachers for current class/section
  const { data: absentTeachers = [] } = useAbsentTeachers({
    classId: filters.class_id,
    section: filters.section,
    date: today,
    weekStart: filters.week_start,
  });

  // Handle opening the absent teacher modal
  const handleAssignSubstitute = (absence: AbsentTeacher) => {
    setSelectedAbsence(absence);
    setShowAbsentModal(true);
  };

  // Handle closing the modal
  const handleCloseAbsentModal = () => {
    setShowAbsentModal(false);
    setSelectedAbsence(null);
  };

  const {
    data: grid,
    isLoading,
    isError,
    refetch,
  } = useTimetableGrid(filters);
  const { data: kpis } = useTimetableKPIs(filters);

  const periods = useMemo(
    () =>
      grid?.periods ?? [
        { period_no: 1, start_time: "09:00", end_time: "09:45" },
        { period_no: 2, start_time: "09:50", end_time: "10:35" },
        { period_no: 3, start_time: "10:40", end_time: "11:25" },
        { period_no: 4, start_time: "11:35", end_time: "12:20" },
        { period_no: 5, start_time: "13:00", end_time: "13:45" },
        { period_no: 6, start_time: "13:50", end_time: "14:35" },
        { period_no: 7, start_time: "14:40", end_time: "15:25" },
        { period_no: 8, start_time: "15:30", end_time: "16:15" },
      ],
    [grid]
  );

  // Build class list for ViewSelector
  const classOptions = useMemo(() => {
    return CLASSES.map((c) => ({ id: String(c), name: `Class ${c}` }));
  }, []);

  // Build teacher list from entries
  const teacherOptions = useMemo(() => {
    if (!grid?.entries) return [];
    const teachers = new Map<number, { id: string; name: string; subject?: string }>();
    grid.entries.forEach((entry) => {
      if (!teachers.has(entry.teacher_id)) {
        teachers.set(entry.teacher_id, {
          id: String(entry.teacher_id),
          name: entry.teacher_name,
          subject: entry.subject_name,
        });
      }
    });
    return Array.from(teachers.values());
  }, [grid?.entries]);

  // Build resource list from entries (rooms)
  const resourceOptions = useMemo(() => {
    if (!grid?.entries) return [];
    const resources = new Map<number, { id: string; name: string; type?: string }>();
    grid.entries.forEach((entry) => {
      if (entry.room_id && entry.room_name && !resources.has(entry.room_id)) {
        resources.set(entry.room_id, {
          id: String(entry.room_id),
          name: entry.room_name,
          type: "Room",
        });
      }
    });
    return Array.from(resources.values());
  }, [grid?.entries]);

  // Handle cell click to show details
  const handleCellClick = (entry: TimetableEntry, day: DayOfWeek, periodNo: number) => {
    setSelectedEntry(entry);
    setSelectedDay(day);
    const period = periods.find((p) => p.period_no === periodNo) || null;
    setSelectedPeriod(period);
    setCellDetailsOpen(true);
  };

  // Handle assigning substitute from cell details modal
  const handleAssignSubstituteFromModal = (entry: TimetableEntry) => {
    setCellDetailsOpen(false);
    // Find the period time
    const periodObj = periods.find((p) => p.period_no === entry.period_no);
    const periodTime = periodObj ? `${periodObj.start_time} - ${periodObj.end_time}` : "";

    // Create an absence object for the modal
    const absence: AbsentTeacher = {
      teacherId: entry.teacher_id,
      teacherName: entry.teacher_name,
      subject: entry.subject_name,
      subjectId: entry.subject_id,
      classId: entry.class_id,
      section: entry.section,
      date: today,
      day: entry.day,
      periodNo: entry.period_no,
      periodTime,
      entryId: entry.id,
      reason: "",
    };
    setSelectedAbsence(absence);
    setShowAbsentModal(true);
  };

  // Get proxy assignment for selected entry
  const getSelectedProxyAssignment = () => {
    if (!selectedEntry) return undefined;
    return proxyAssignments.find(
      (a) => a.entryId === selectedEntry.id && a.date === today
    );
  };

  // Check if selected entry has conflict
  const hasSelectedConflict = useMemo(() => {
    if (!selectedEntry || !grid?.conflicts) return false;
    return grid.conflicts.some((c) => c.entry_ids.includes(selectedEntry.id));
  }, [selectedEntry, grid?.conflicts]);

  return (
    <TimetableErrorBoundary>
      <Box sx={{ display: "grid", gap: 3, pb: 4 }}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            📚 Timetable Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and publish weekly timetables for classes
          </Typography>
        </Box>

        {/* Filters */}
        <FiltersBar
          value={filters}
          onChange={(v) =>
            setFilters((s) => ({
              ...s,
              ...v,
              week_start: v.week_start ? toMondayISO(v.week_start) : s.week_start,
            }))
          }
          classes={CLASSES}
          sections={SECTIONS}
          onApply={() => refetch()}
        />

        {/* Error Alert */}
        {isError && (
          <Alert severity="error" onClose={() => refetch()}>
            Failed to load timetable. Click Refresh or try again.
          </Alert>
        )}

        {/* Teacher Absence Banner */}
        {!dismissedBanner && absentTeachers.length > 0 && (
          <TeacherAbsenceBanner
            absentTeachers={absentTeachers}
            onAssignSubstitute={handleAssignSubstitute}
            onDismiss={() => setDismissedBanner(true)}
          />
        )}

        {/* Publish Status */}
        <PublishBar filters={filters} isPublished={Boolean(grid?.entries?.[0]?.is_published)} />

        {/* KPI Cards */}
        <KPICards
          coveragePct={kpis?.coverage_pct ?? 0}
          conflictsCount={kpis?.conflicts_count ?? 0}
          freePeriods={kpis?.free_periods ?? 0}
          roomUtilPct={kpis?.room_util_pct ?? 0}
        />

        {/* View Selector */}
        <ViewSelector
          classes={classOptions}
          sections={SECTIONS}
          teachers={teacherOptions}
          resources={resourceOptions}
          onEntityChange={() => refetch()}
        />

        {/* Main Grid */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header with Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mb: 2,
              gap: 1,
            }}
          >
            <Tooltip title="Export or print timetable">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setShowExportDialog(true)}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Refresh data">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
                Refresh
              </Button>
            </Tooltip>
          </Box>

          {/* Legend */}
          <Legend />

          {/* Loading/Grid */}
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Loading timetable...
              </Typography>
            </Box>
          ) : (
            <TimetableViewGrid
              periods={periods}
              entries={grid?.entries ?? []}
              conflicts={grid?.conflicts}
              viewType={currentView}
              highlightFreePeriods={highlightFreePeriods}
              showRoomNumbers={showRoomNumbers}
              proxyAssignments={proxyAssignments}
              onCellClick={handleCellClick}
              showSaturday={false}
            />
          )}
        </Paper>

        {/* Dialogs */}
        <ExportDialog
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          filters={filters}
          entries={grid?.entries ?? []}
          periods={periods}
        />
        <TeacherAbsentModal
          open={showAbsentModal}
          onClose={handleCloseAbsentModal}
          absence={selectedAbsence}
        />

        {/* Cell Details Modal */}
        <CellDetailsModal
          open={cellDetailsOpen}
          onClose={() => setCellDetailsOpen(false)}
          entry={selectedEntry}
          day={selectedDay}
          period={selectedPeriod}
          proxyAssignment={getSelectedProxyAssignment()}
          hasConflict={hasSelectedConflict}
          onAssignSubstitute={handleAssignSubstituteFromModal}
        />

        {/* Floating Help Button */}
        <HowToUsePopover />
      </Box>
    </TimetableErrorBoundary>
  );
}
