import { useMemo, useState } from "react";
import { Box, Paper, Typography, Button, Alert, IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import FiltersBar from "../../../components/timetable/FiltersBar";
import KPICards from "../../../components/timetable/KPICards";
import Legend from "../../../components/timetable/Legend";
import GridView from "../../../components/timetable/GridView";
import PublishBar from "../../../components/timetable/PublishBar";
import SwapDialog from "../../../components/timetable/SwapDialog";
import ExportDialog from "../../../components/timetable/ExportDialog";
import GenerateDialog from "../../../components/timetable/GenerateDialog";
import HowToUsePopover from "../../../components/timetable/HowToUsePopover";
import TimetableErrorBoundary from "../../../components/timetable/TimetableErrorBoundary";

import { useTimetableGrid, useTimetableKPIs, useGenerateTimetable } from "../../../services/timetable.hooks";

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

/**
 * Add/subtract weeks from a Monday date
 */
function addWeeks(mondayISO: string, weeks: number): string {
  const date = new Date(mondayISO);
  date.setDate(date.getDate() + weeks * 7);
  return toMondayISO(date);
}

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];

export default function TimetablePage() {
  const [filters, setFilters] = useState({
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    week_start: toMondayISO(new Date()),
  });

  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const {
    data: grid,
    isLoading,
    isError,
    refetch,
  } = useTimetableGrid(filters);
  const { data: kpis } = useTimetableKPIs(filters);
  const genMut = useGenerateTimetable();

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
      ],
    [grid]
  );

  function navigateWeek(direction: number) {
    setFilters((f) => ({
      ...f,
      week_start: addWeeks(f.week_start, direction),
    }));
  }

  async function handleGenerate() {
    await genMut.mutateAsync({
      academic_year_id: filters.academic_year_id,
      class_id: filters.class_id,
      section: filters.section,
    });
    refetch();
  }

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

        {/* Publish Status */}
        <PublishBar filters={filters} isPublished={Boolean(grid?.entries?.[0]?.is_published)} />

        {/* KPI Cards */}
        <KPICards
          coveragePct={kpis?.coverage_pct ?? 0}
          conflictsCount={kpis?.conflicts_count ?? 0}
          freePeriods={kpis?.free_periods ?? 0}
          roomUtilPct={kpis?.room_util_pct ?? 0}
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
          {/* Week Navigation Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Previous week">
                <IconButton onClick={() => navigateWeek(-1)} size="small">
                  <NavigateBeforeIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="h6" fontWeight={600}>
                Week of {filters.week_start}
              </Typography>
              <Tooltip title="Next week">
                <IconButton onClick={() => navigateWeek(1)} size="small">
                  <NavigateNextIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Tooltip title="AI-powered timetable generation">
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setShowGenerateDialog(true)}
                  disabled={genMut.isPending}
                  color="primary"
                >
                  Generate
                </Button>
              </Tooltip>
              <Tooltip title="Swap two periods">
                <Button
                  variant="outlined"
                  startIcon={<SwapHorizIcon />}
                  onClick={() => setShowSwapDialog(true)}
                >
                  Swap
                </Button>
              </Tooltip>
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
            <GridView
              periods={periods}
              entries={grid?.entries ?? []}
              filters={filters}
              conflicts={grid?.conflicts}
            />
          )}
        </Paper>

        {/* Dialogs */}
        <SwapDialog open={showSwapDialog} onClose={() => setShowSwapDialog(false)} />
        <ExportDialog
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          filters={filters}
          entries={grid?.entries ?? []}
          periods={periods}
        />
        <GenerateDialog
          open={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          onConfirm={handleGenerate}
          filters={filters}
        />

        {/* Floating Help Button */}
        <HowToUsePopover />
      </Box>
    </TimetableErrorBoundary>
  );
}
