import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useClassTimetable } from "@/app/services/classes.hooks";

interface ClassTimetableTabProps {
  classId: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ClassTimetableTab({ classId }: ClassTimetableTabProps) {
  const { data: timetable, isLoading, error } = useClassTimetable(classId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load timetable: {error.message}</Alert>;
  }

  // Group timetable by day and period
  const timetableByDay = DAYS.map((day) => ({
    day,
    slots: timetable?.filter((slot) => slot.day === day).sort((a, b) => a.period - b.period) || [],
  }));

  const maxPeriods = Math.max(...(timetable?.map((slot) => slot.period) || [0]));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Class Timetable
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Periods/Day
              </Typography>
              <Typography variant="h6">{maxPeriods}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Working Days
              </Typography>
              <Typography variant="h6">{DAYS.length}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Day / Period</TableCell>
              {Array.from({ length: maxPeriods }, (_, i) => (
                <TableCell key={i} align="center" sx={{ fontWeight: "bold" }}>
                  Period {i + 1}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timetableByDay.map((dayData) => (
              <TableRow key={dayData.day}>
                <TableCell sx={{ fontWeight: "medium" }}>{dayData.day}</TableCell>
                {Array.from({ length: maxPeriods }, (_, periodIndex) => {
                  const slot = dayData.slots.find((s) => s.period === periodIndex + 1);
                  return (
                    <TableCell key={periodIndex} align="center">
                      {slot ? (
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {slot.subject_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {slot.teacher_name}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {slot.start_time} - {slot.end_time}
                          </Typography>
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
      </TableContainer>
    </Box>
  );
}
