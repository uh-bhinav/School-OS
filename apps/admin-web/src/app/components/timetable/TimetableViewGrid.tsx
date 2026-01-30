import { useMemo, memo } from "react";
import { Box, Paper, Typography, alpha } from "@mui/material";
import { TimetableCell } from "./TimetableCell";
import type { TimetableEntry, Period, DayOfWeek } from "../../services/timetable.schema";
import type { ProxyAssignment } from "../../stores/useProxyStore";
import type { ViewType } from "../../stores/useTimetableViewStore";

const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_NAMES: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

// Break configuration
const RECESS_AFTER_PERIOD = 3;
const RECESS_DURATION = 20;
const LUNCH_AFTER_PERIOD = 5;
const LUNCH_DURATION = 40;
const ASSEMBLY_ENABLED = true;

interface TimetableViewGridProps {
  periods: Period[];
  entries: TimetableEntry[];
  conflicts?: Array<{ type: string; message: string; entry_ids: number[] }>;
  viewType: ViewType;
  highlightFreePeriods: boolean;
  showRoomNumbers: boolean;
  proxyAssignments: ProxyAssignment[];
  onCellClick: (entry: TimetableEntry, day: DayOfWeek, periodNo: number) => void;
  showSaturday?: boolean;
}

function TimetableViewGridComponent({
  periods,
  entries,
  conflicts = [],
  viewType,
  highlightFreePeriods,
  showRoomNumbers,
  proxyAssignments,
  onCellClick,
  showSaturday = false,
}: TimetableViewGridProps) {
  const today = new Date().toISOString().split("T")[0];

  const conflictIds = useMemo(
    () => new Set(conflicts.flatMap((c) => c.entry_ids)),
    [conflicts]
  );

  const cellLookup = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    if (entries && Array.isArray(entries)) {
      entries.forEach((entry) => {
        map.set(`${entry.day}-${entry.period_no}`, entry);
      });
    }
    return map;
  }, [entries]);

  const proxyLookup = useMemo(() => {
    const map = new Map<string, ProxyAssignment>();
    proxyAssignments.forEach((assignment) => {
      map.set(`${assignment.entryId}-${assignment.date}`, assignment);
      map.set(`${assignment.day}-${assignment.periodNo}-${assignment.date}`, assignment);
    });
    return map;
  }, [proxyAssignments]);

  const getCell = (day: DayOfWeek, periodNo: number) => {
    return cellLookup.get(`${day}-${periodNo}`);
  };

  const getProxyAssignment = (
    cell: TimetableEntry | undefined,
    day: DayOfWeek,
    periodNo: number
  ): ProxyAssignment | undefined => {
    if (!cell) return undefined;
    const byEntry = proxyLookup.get(`${cell.id}-${today}`);
    if (byEntry) return byEntry;
    return proxyLookup.get(`${day}-${periodNo}-${today}`);
  };

  const daysToShow = showSaturday ? DAYS : DAYS.filter((d) => d !== "SAT");

  // Build rows with breaks
  type RowType = { type: "assembly" | "period" | "recess" | "lunch"; period?: Period };
  const gridRows = useMemo(() => {
    const rows: RowType[] = [];
    if (ASSEMBLY_ENABLED) {
      rows.push({ type: "assembly" });
    }
    periods.forEach((period) => {
      rows.push({ type: "period", period });
      if (period.period_no === RECESS_AFTER_PERIOD) {
        rows.push({ type: "recess" });
      }
      if (period.period_no === LUNCH_AFTER_PERIOD) {
        rows.push({ type: "lunch" });
      }
    });
    return rows;
  }, [periods]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`,
      }}
    >
      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            minWidth: 900,
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          {/* Header Row - Day columns */}
          <Box component="thead" sx={{ position: "sticky", top: 0, zIndex: 20 }}>
            <Box component="tr">
              <Box
                component="th"
                sx={{
                  borderRight: "2px solid",
                  borderBottom: "2px solid",
                  borderColor: "divider",
                  bgcolor: (theme) => theme.palette.grey[100],
                  px: 2,
                  py: 1.5,
                  textAlign: "left",
                  position: "sticky",
                  left: 0,
                  zIndex: 30,
                  minWidth: 130,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", color: "text.secondary", letterSpacing: 0.5 }}>
                  Time
                </Typography>
              </Box>
              {daysToShow.map((day) => (
                <Box
                  component="th"
                  key={day}
                  sx={{
                    borderRight: "1px solid",
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    bgcolor: (theme) => theme.palette.grey[100],
                    px: 1.5,
                    py: 1.5,
                    textAlign: "center",
                    minWidth: 140,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {DAY_NAMES[day] || day}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Body - Period rows with breaks */}
          <Box component="tbody">
            {gridRows.map((row) => {
              if (row.type === "assembly") {
                return (
                  <Box component="tr" key="assembly" sx={{ bgcolor: "#f1f5f9" }}>
                    <Box
                      component="td"
                      sx={{
                        borderRight: "2px solid",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "#e2e8f0",
                        px: 2,
                        py: 1.5,
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Assembly</Typography>
                      <Typography variant="caption" color="text.secondary">Period 0</Typography>
                    </Box>
                    {daysToShow.map((day) => (
                      <Box
                        component="td"
                        key={day}
                        sx={{
                          borderRight: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          p: 1.5,
                          textAlign: "center",
                          bgcolor: "#f1f5f9",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                          🙏 Assembly / Prayer
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                );
              }

              if (row.type === "recess") {
                return (
                  <Box component="tr" key="recess" sx={{ bgcolor: "#fef3c7" }}>
                    <Box
                      component="td"
                      sx={{
                        borderRight: "2px solid",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "#fde68a",
                        px: 2,
                        py: 1.5,
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#92400e" }}>RECESS</Typography>
                      <Typography variant="caption" sx={{ color: "#b45309" }}>{RECESS_DURATION} mins</Typography>
                    </Box>
                    {daysToShow.map((day) => (
                      <Box
                        component="td"
                        key={day}
                        sx={{
                          borderRight: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          p: 1.5,
                          textAlign: "center",
                          bgcolor: "#fef3c7",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#b45309", fontWeight: 500 }}>☕ BREAK</Typography>
                      </Box>
                    ))}
                  </Box>
                );
              }

              if (row.type === "lunch") {
                return (
                  <Box component="tr" key="lunch" sx={{ bgcolor: "#dcfce7" }}>
                    <Box
                      component="td"
                      sx={{
                        borderRight: "2px solid",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "#bbf7d0",
                        px: 2,
                        py: 1.5,
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#166534" }}>LUNCH</Typography>
                      <Typography variant="caption" sx={{ color: "#15803d" }}>{LUNCH_DURATION} mins</Typography>
                    </Box>
                    {daysToShow.map((day) => (
                      <Box
                        component="td"
                        key={day}
                        sx={{
                          borderRight: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          p: 1.5,
                          textAlign: "center",
                          bgcolor: "#dcfce7",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#15803d", fontWeight: 500 }}>🍽️ LUNCH BREAK</Typography>
                      </Box>
                    ))}
                  </Box>
                );
              }

              // Academic Period Row
              const period = row.period!;
              return (
                <Box
                  component="tr"
                  key={`period-${period.period_no}`}
                  sx={{
                    transition: "background-color 0.15s ease",
                    "&:hover": { bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04) },
                  }}
                >
                  <Box
                    component="td"
                    sx={{
                      borderRight: "2px solid",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      px: 2,
                      py: 1.5,
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Period {period.period_no}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {period.start_time} - {period.end_time}
                    </Typography>
                  </Box>
                  {daysToShow.map((day) => {
                    const cell = getCell(day, period.period_no);
                    const hasConflict = cell ? conflictIds.has(cell.id) : false;
                    const proxyAssignment = getProxyAssignment(cell, day, period.period_no);
                    return (
                      <TimetableCell
                        key={`${day}-${period.period_no}`}
                        entry={cell}
                        viewType={viewType}
                        hasConflict={hasConflict}
                        proxyAssignment={proxyAssignment}
                        highlightFreePeriods={highlightFreePeriods}
                        showRoomNumbers={showRoomNumbers}
                        onCellClick={(entry) => onCellClick(entry, day, period.period_no)}
                      />
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export const TimetableViewGrid = memo(TimetableViewGridComponent);
TimetableViewGrid.displayName = "TimetableViewGrid";
