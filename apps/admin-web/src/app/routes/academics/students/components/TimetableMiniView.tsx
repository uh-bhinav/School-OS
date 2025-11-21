import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";
import { mockTimetableProvider } from "@/app/mockDataProviders";

interface TimetableMiniViewProps {
  studentId: number;
  classId: number;
}

export default function TimetableMiniView({ classId }: TimetableMiniViewProps) {
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current week start (Monday)
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        const weekStart = monday.toISOString().split("T")[0];

        // Get class timetable grid
        const data = await mockTimetableProvider.getTimetableGrid({
          academic_year_id: 1,
          class_id: classId,
          section: "A",
          week_start: weekStart,
        });
        setTimetable(data);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [classId]);

  if (loading) return <CircularProgress />;
  if (!timetable || !timetable.entries || timetable.entries.length === 0) {
    return <Alert severity="info">No timetable data available</Alert>;
  }

  // Map short day names to full names
  const dayNameMap: Record<string, string> = {
    MON: "Monday",
    TUE: "Tuesday",
    WED: "Wednesday",
    THU: "Thursday",
    FRI: "Friday",
    SAT: "Saturday",
  };

  // Organize slots by day and period
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = timetable.periods || [];

  const timetableGrid: Record<string, Record<number, any>> = {};
  days.forEach((day) => {
    timetableGrid[day] = {};
    periods.forEach((period: any) => {
      timetableGrid[day][period.period_no] = null;
    });
  });

  timetable.entries.forEach((entry: any) => {
    const fullDayName = dayNameMap[entry.day];
    if (fullDayName && timetableGrid[fullDayName]) {
      timetableGrid[fullDayName][entry.period_no] = entry;
    }
  });

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Weekly Timetable
      </Typography>

      <Card>
        <CardContent>
          <Paper sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>Period</TableCell>
                  {days.map((day) => (
                    <TableCell key={day} align="center" sx={{ fontWeight: "bold", bgcolor: "grey.100" }}>
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.map((period: any) => (
                  <TableRow key={period.period_no}>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>
                      Period {period.period_no}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {period.start_time} - {period.end_time}
                      </Typography>
                    </TableCell>
                    {days.map((day) => {
                      const slot = timetableGrid[day][period.period_no];
                      return (
                        <TableCell key={`${day}-${period.period_no}`} align="center">
                          {slot ? (
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {slot.subject_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {slot.teacher_name}
                              </Typography>
                              {slot.room_name && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {slot.room_name}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}
