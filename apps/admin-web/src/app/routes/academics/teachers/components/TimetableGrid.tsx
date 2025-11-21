import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { getTeacherTimetable } from "@/app/services/teacher-details.api";
import type { TeacherTimetableSlot } from "@/app/mockDataProviders/mockTeacherTimetable";

interface TimetableGridProps {
  teacherId: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function TimetableGrid({ teacherId }: TimetableGridProps) {
  const [slots, setSlots] = useState<TeacherTimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTeacherTimetable(teacherId);
        setSlots(data);
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <CircularProgress />;

  const getSlot = (day: string, period: number) => {
    return slots.find((s) => s.day === day && s.period === period);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Weekly Timetable</Typography>
      <Paper sx={{ overflow: "auto" }}>
        <Box sx={{ minWidth: 800 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: `120px repeat(${DAYS.length}, 1fr)`, gap: 0.5, p: 1 }}>
            <Box sx={{ p: 1, fontWeight: "bold", textAlign: "center" }}>Period</Box>
            {DAYS.map((day) => (
              <Box key={day} sx={{ p: 1, fontWeight: "bold", textAlign: "center", bgcolor: "primary.main", color: "white" }}>{day}</Box>
            ))}
            {PERIODS.map((period) => (
              <>
                <Box key={`period-${period}`} sx={{ p: 1, fontWeight: "bold", textAlign: "center", bgcolor: "grey.100" }}>P{period}</Box>
                {DAYS.map((day) => {
                  const slot = getSlot(day, period);
                  return (
                    <Box key={`${day}-${period}`} sx={{ p: 1, minHeight: 80, bgcolor: slot?.is_free_period ? "grey.50" : "background.paper", border: 1, borderColor: "divider" }}>
                      {slot && (
                        <>
                          <Typography variant="caption" fontWeight="bold" display="block">{slot.subject_code}</Typography>
                          <Typography variant="caption" display="block">{slot.class_name} {slot.section}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">{slot.room_number}</Typography>
                        </>
                      )}
                    </Box>
                  );
                })}
              </>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
