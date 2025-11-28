import { useState, useMemo, memo } from "react";
import { Box, Paper, Typography, IconButton, Tooltip, alpha, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeriodFormDialog from "./PeriodFormDialog";
import { useDeleteEntry } from "../../services/timetable.hooks";
import { useProxyStore, type ProxyAssignment } from "../../stores/useProxyStore";
import type { TimetableEntry, Period, DayOfWeek } from "../../services/timetable.schema";

const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface CellProps {
  cell: TimetableEntry | undefined;
  onEdit: (cell?: TimetableEntry) => void;
  onDelete: (id: number) => void;
  isPublished: boolean;
  hasConflict: boolean;
  proxyAssignment?: ProxyAssignment;
}

/**
 * Memoized cell component for performance optimization
 */
const GridCell = memo(({ cell, onEdit, onDelete, isPublished, hasConflict, proxyAssignment }: CellProps) => {
  const isEditable = !isPublished || cell?.is_editable !== false;
  const hasSubstitute = !!proxyAssignment;

  return (
    <Box
      sx={{
        p: 1,
        borderTop: 1,
        borderRight: 1,
        borderColor: "divider",
        minHeight: 80,
        position: "relative",
        bgcolor: cell
          ? hasSubstitute
            ? alpha("#2196f3", 0.08) // Blue tint for substitute assigned
            : hasConflict
              ? alpha("#f44336", 0.08)
              : isPublished
                ? alpha("#4caf50", 0.04)
                : "action.hover"
          : "transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: cell
            ? hasSubstitute
              ? alpha("#2196f3", 0.12)
              : hasConflict
                ? alpha("#f44336", 0.12)
                : isPublished
                  ? alpha("#4caf50", 0.08)
                  : "action.selected"
            : "action.hover",
        },
        ...(hasConflict && {
          outline: (theme) => `2px solid ${theme.palette.error.main}`,
          outlineOffset: -2,
        }),
        ...(hasSubstitute && {
          outline: (theme) => `2px solid ${theme.palette.info.main}`,
          outlineOffset: -2,
        }),
        ...(!cell && {
          borderStyle: "dashed",
          borderWidth: 1,
        }),
      }}
    >
      {cell ? (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            height: "100%",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            position: "relative",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          }}
        >
          {/* Substitute Teacher Badge - Top Priority */}
          {hasSubstitute && (
            <Chip
              icon={<PersonAddIcon sx={{ fontSize: 14 }} />}
              label={`Sub: ${proxyAssignment.substituteTeacherName.split(" ")[0]}`}
              color="info"
              size="small"
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                height: 22,
                fontSize: "0.65rem",
                fontWeight: 600,
                "& .MuiChip-icon": { marginLeft: "4px" },
              }}
            />
          )}
          {/* Conflict Badge */}
          {hasConflict && !hasSubstitute && (
            <Chip
              icon={<WarningIcon />}
              label="Conflict"
              color="error"
              size="small"
              sx={{ position: "absolute", top: 4, right: 4, height: 20, fontSize: "0.7rem" }}
            />
          )}
          {/* Published Badge */}
          {isPublished && !hasConflict && !hasSubstitute && (
            <Chip
              label="✓"
              color="success"
              size="small"
              sx={{ position: "absolute", top: 4, right: 4, height: 18, width: 18, fontSize: "0.7rem" }}
            />
          )}
          <Typography
            variant="subtitle2"
            fontWeight={600}
            noWrap
            sx={{ pr: isPublished || hasConflict || hasSubstitute ? 5 : 0 }}
          >
            {cell.subject_name}
          </Typography>
          <Typography
            variant="caption"
            color={hasSubstitute ? "text.disabled" : "text.secondary"}
            display="block"
            noWrap
            sx={hasSubstitute ? { textDecoration: "line-through" } : undefined}
          >
            {cell.teacher_name}
          </Typography>
          {/* Show substitute teacher name below original if assigned */}
          {hasSubstitute && (
            <Typography
              variant="caption"
              color="info.main"
              fontWeight={600}
              display="block"
              noWrap
            >
              → {proxyAssignment.substituteTeacherName}
            </Typography>
          )}
          {cell.room_name && (
            <Typography variant="caption" color="text.disabled" display="block" noWrap>
              📍 {cell.room_name}
            </Typography>
          )}
          {isEditable && (
            <Box sx={{ position: "absolute", right: 6, bottom: 6, display: "flex", gap: 0.5 }}>
              <Tooltip title="Edit period">
                <IconButton size="small" onClick={() => onEdit(cell)} sx={{ bgcolor: "background.paper" }}>
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete period">
                <IconButton size="small" onClick={() => onDelete(cell.id)} sx={{ bgcolor: "background.paper" }}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Paper>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            opacity: 0.5,
            transition: "opacity 0.2s ease",
            "&:hover": { opacity: 1 },
          }}
        >
          <Tooltip title="Add period">
            <IconButton
              onClick={() => onEdit(undefined)}
              sx={{
                border: (theme) => `2px dashed ${theme.palette.divider}`,
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha("#1976d2", 0.04),
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
});

GridCell.displayName = "GridCell";

export default function GridView({
  periods,
  entries,
  filters,
  conflicts = [],
}: {
  periods: Period[];
  entries: TimetableEntry[];
  filters: { academic_year_id: number; class_id: number; section: string; week_start: string };
  conflicts?: Array<{ type: string; message: string; entry_ids: number[] }>;
}) {
  const delMut = useDeleteEntry();
  const [editor, setEditor] = useState<{ open: boolean; initial?: TimetableEntry; day?: string; periodNo?: number }>({
    open: false,
  });

  // Get proxy assignments from store
  const { assignments } = useProxyStore();

  // Get today's date for checking assignments
  const today = new Date().toISOString().split("T")[0];

  const isPublished = useMemo(() => Boolean(entries[0]?.is_published), [entries]);

  const conflictIds = useMemo(() => new Set(conflicts.flatMap((c) => c.entry_ids)), [conflicts]);

  const cellLookup = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    // ✅ FIX: Handle undefined or null entries
    if (entries && Array.isArray(entries)) {
      entries.forEach((entry) => {
        map.set(`${entry.day}-${entry.period_no}`, entry);
      });
    }
    return map;
  }, [entries]);

  // Create a lookup for proxy assignments by entry ID and date
  const proxyLookup = useMemo(() => {
    const map = new Map<string, ProxyAssignment>();
    assignments.forEach((assignment) => {
      // Key by entryId and date for precise matching
      map.set(`${assignment.entryId}-${assignment.date}`, assignment);
      // Also key by day and period for matching with current view
      map.set(`${assignment.day}-${assignment.periodNo}-${assignment.date}`, assignment);
    });
    return map;
  }, [assignments]);

  function getCell(day: string, period_no: number) {
    return cellLookup.get(`${day}-${period_no}`);
  }

  function getProxyAssignment(cell: TimetableEntry | undefined, day: string, periodNo: number): ProxyAssignment | undefined {
    if (!cell) return undefined;
    // First try to match by entryId and date
    const byEntry = proxyLookup.get(`${cell.id}-${today}`);
    if (byEntry) return byEntry;
    // Fallback to match by day, period, and date
    return proxyLookup.get(`${day}-${periodNo}-${today}`);
  }

  function handleEdit(cell?: TimetableEntry, day?: string, periodNo?: number) {
    setEditor({ open: true, initial: cell, day, periodNo });
  }

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `180px repeat(${DAYS.length}, 1fr)`,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        }}
      >
        {/* Header Row */}
        <Box sx={{ p: 1.5, borderRight: 1, borderColor: "divider", bgcolor: "grey.50" }} />
        {DAYS.map((d) => (
          <Box key={d} sx={{ p: 1.5, borderRight: 1, borderColor: "divider", bgcolor: "grey.50" }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {d}
            </Typography>
          </Box>
        ))}

        {/* Rows */}
        {periods.map((p) => (
          <Box key={`row-${p.period_no}`} sx={{ display: "contents" }}>
            <Box
              sx={{
                p: 1.5,
                borderTop: 1,
                borderRight: 1,
                borderColor: "divider",
                bgcolor: "grey.50",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Period {p.period_no}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {p.start_time} - {p.end_time}
              </Typography>
            </Box>
            {DAYS.map((day) => {
              const cell = getCell(day, p.period_no);
              const hasConflict = cell ? conflictIds.has(cell.id) : false;
              const proxyAssignment = getProxyAssignment(cell, day, p.period_no);
              return (
                <GridCell
                  key={`c-${day}-${p.period_no}`}
                  cell={cell}
                  onEdit={(c) => handleEdit(c, day, p.period_no)}
                  onDelete={(id) => delMut.mutate(id)}
                  isPublished={isPublished}
                  hasConflict={hasConflict}
                  proxyAssignment={proxyAssignment}
                />
              );
            })}
          </Box>
        ))}
      </Box>

      <PeriodFormDialog
        open={editor.open}
        onClose={() => setEditor({ open: false })}
        initial={editor.initial}
        context={filters}
      />
    </>
  );
}
