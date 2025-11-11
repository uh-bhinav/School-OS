import { useState, useMemo, memo } from "react";
import { Box, Paper, Typography, IconButton, Tooltip, alpha, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import PeriodFormDialog from "./PeriodFormDialog";
import { useDeleteEntry } from "../../services/timetable.hooks";
import type { TimetableEntry, Period } from "../../services/timetable.schema";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface CellProps {
  cell: TimetableEntry | undefined;
  onEdit: (cell?: TimetableEntry) => void;
  onDelete: (id: number) => void;
  isPublished: boolean;
  hasConflict: boolean;
}

/**
 * Memoized cell component for performance optimization
 */
const GridCell = memo(({ cell, onEdit, onDelete, isPublished, hasConflict }: CellProps) => {
  const isEditable = !isPublished || cell?.is_editable !== false;

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
          ? hasConflict
            ? alpha("#f44336", 0.08)
            : isPublished
              ? alpha("#4caf50", 0.04)
              : "action.hover"
          : "transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: cell
            ? hasConflict
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
          {hasConflict && (
            <Chip
              icon={<WarningIcon />}
              label="Conflict"
              color="error"
              size="small"
              sx={{ position: "absolute", top: 4, right: 4, height: 20, fontSize: "0.7rem" }}
            />
          )}
          {isPublished && !hasConflict && (
            <Chip
              label="✓"
              color="success"
              size="small"
              sx={{ position: "absolute", top: 4, right: 4, height: 18, width: 18, fontSize: "0.7rem" }}
            />
          )}
          <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ pr: isPublished || hasConflict ? 5 : 0 }}>
            {cell.subject_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {cell.teacher_name}
          </Typography>
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

  const isPublished = useMemo(() => Boolean(entries[0]?.is_published), [entries]);

  const conflictIds = useMemo(() => new Set(conflicts.flatMap((c) => c.entry_ids)), [conflicts]);

  const cellLookup = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    entries.forEach((entry) => {
      map.set(`${entry.day}-${entry.period_no}`, entry);
    });
    return map;
  }, [entries]);

  function getCell(day: string, period_no: number) {
    return cellLookup.get(`${day}-${period_no}`);
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
              return (
                <GridCell
                  key={`c-${day}-${p.period_no}`}
                  cell={cell}
                  onEdit={(c) => handleEdit(c, day, p.period_no)}
                  onDelete={(id) => delMut.mutate(id)}
                  isPublished={isPublished}
                  hasConflict={hasConflict}
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
