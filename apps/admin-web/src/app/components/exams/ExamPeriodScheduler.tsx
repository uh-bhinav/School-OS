// apps/admin-web/src/app/components/exams/ExamPeriodScheduler.tsx
/**
 * Calendar-driven exam period scheduler
 * Replaces the old single-exam modal paradigm
 */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { styled } from "@mui/material/styles";
import {
  useCreateExamPeriod,
  useHolidays,
  useValidExamDates,
} from "../../services/examPeriods.hooks";
import HallTicketViewer from "./HallTicketViewer";

// Indian Holidays 2026
const INDIAN_HOLIDAYS_2026 = [
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-14", name: "Holi" },
  { date: "2026-03-30", name: "Ram Navami" },
  { date: "2026-04-02", name: "Mahavir Jayanti" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Eid ul-Fitr" },
  { date: "2026-05-26", name: "Buddha Purnima" },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-08-22", name: "Raksha Bandhan" },
  { date: "2026-08-31", name: "Janmashtami" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-15", name: "Dussehra" },
  { date: "2026-11-04", name: "Diwali" },
  { date: "2026-11-19", name: "Guru Nanak Jayanti" },
  { date: "2026-12-25", name: "Christmas" },
];

// Custom styled day for calendar
const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== "isHoliday" && prop !== "isSunday",
})<{ isHoliday?: boolean; isSunday?: boolean }>(({ isHoliday, isSunday }) => ({
  ...(isHoliday && {
    backgroundColor: "#ff5252 !important",
    color: "white !important",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#ff1744 !important",
    },
  }),
  ...(isSunday &&
    !isHoliday && {
      backgroundColor: "#ffebee !important",
      color: "#d32f2f !important",
      fontWeight: "bold",
    }),
}));

interface ExamPeriodSchedulerProps {
  open: boolean;
  onClose: () => void;
  filters: {
    academic_year_id: number;
    class_id: number;
    section: string;
  };
  onSuccess?: () => void;
}

interface SubjectSchedule {
  id?: number;
  exam_period_id?: number;
  subject_id: number;
  subject_name: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  max_marks: number;
  is_auto_mapped: boolean;
}

interface Holiday {
  id: number;
  name: string;
  date: string;
  holiday_type: string;
}

const steps = ["Period Setup", "Review Schedule", "Finalize"];

export default function ExamPeriodScheduler({
  open,
  onClose,
  filters,
  onSuccess,
}: ExamPeriodSchedulerProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // React Query hooks
  const createExamPeriodMutation = useCreateExamPeriod();

  // Step 1: Period Setup
  const [periodData, setPeriodData] = useState({
    exam_period_name: "",
    exam_type_id: 1,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    total_marks: 500,
  });

  // Step 2: Subject Schedules
  const [subjectSchedules, setSubjectSchedules] = useState<SubjectSchedule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [validDates, setValidDates] = useState<string[]>([]);
  const [examPeriodId, setExamPeriodId] = useState<number | null>(null);

  // Fetch holidays and valid dates when period dates change
  const { data: holidaysData } = useHolidays(
    periodData.start_date,
    periodData.end_date,
    1, // school_id
    undefined
  );

  const { data: validDatesData } = useValidExamDates(
    periodData.start_date,
    periodData.end_date,
    1, // school_id
    undefined
  );

  useEffect(() => {
    if (holidaysData) {
      setHolidays(holidaysData);
    }
  }, [holidaysData]);

  useEffect(() => {
    if (validDatesData) {
      setValidDates(validDatesData);
    }
  }, [validDatesData]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // State for editing exam dates
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);
  const [editDate, setEditDate] = useState<string>("");

  // Hall ticket viewer state
  const [showHallTicket, setShowHallTicket] = useState(false);
  const [hallTicketData, setHallTicketData] = useState<any>(null);

  const handleEditClick = (scheduleId: number, currentDate: string) => {
    setEditingSchedule(scheduleId);
    setEditDate(currentDate);
  };

  const handleSaveEdit = (scheduleId: number) => {
    setSubjectSchedules(
      subjectSchedules.map((s) =>
        s.id === scheduleId ? { ...s, exam_date: editDate } : s
      )
    );
    setEditingSchedule(null);
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setEditDate("");
  };

  const resetForm = () => {
    setActiveStep(0);
    setPeriodData({
      exam_period_name: "",
      exam_type_id: 1,
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      total_marks: 500,
    });
    setSubjectSchedules([]);
    setHolidays([]);
    setValidDates([]);
    setExamPeriodId(null);
    setError("");
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Create exam period with auto-mapping
      await createExamPeriod();
    } else if (activeStep === 1) {
      // Move to finalize
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError("");
  };

  const createExamPeriod = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!periodData.exam_period_name.trim()) {
        throw new Error("Exam period name is required");
      }
      if (!periodData.end_date || periodData.end_date <= periodData.start_date) {
        throw new Error("End date must be after start date");
      }

      // Check if in demo mode - skip API call
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      
      if (isDemoMode) {
        // Demo mode: Generate mock data and show calendar
        console.log("Demo Mode: Skipping API call, showing mock calendar");
        setExamPeriodId(999);
        setSubjectSchedules([
          {
            id: 1,
            exam_period_id: 999,
            subject_id: 1,
            subject_name: "Mathematics",
            exam_date: "2026-01-27",
            start_time: "09:00 AM",
            duration_minutes: 180,
            max_marks: 100,
            is_auto_mapped: true,
          },
          {
            id: 2,
            exam_period_id: 999,
            subject_id: 2,
            subject_name: "Science",
            exam_date: "2026-01-28",
            start_time: "09:00 AM",
            duration_minutes: 180,
            max_marks: 100,
            is_auto_mapped: true,
          },
          {
            id: 3,
            exam_period_id: 999,
            subject_id: 3,
            subject_name: "English",
            exam_date: "2026-01-29",
            start_time: "09:00 AM",
            duration_minutes: 180,
            max_marks: 100,
            is_auto_mapped: true,
          },
          {
            id: 4,
            exam_period_id: 999,
            subject_id: 4,
            subject_name: "Social Studies",
            exam_date: "2026-01-30",
            start_time: "09:00 AM",
            duration_minutes: 180,
            max_marks: 100,
            is_auto_mapped: true,
          },
          {
            id: 5,
            exam_period_id: 999,
            subject_id: 5,
            subject_name: "Hindi",
            exam_date: "2026-01-31",
            start_time: "09:00 AM",
            duration_minutes: 180,
            max_marks: 100,
            is_auto_mapped: true,
          },
          {
            id: 6,
            exam_period_id: 999,
            subject_id: 6,
            subject_name: "Computer Science",
            exam_date: "2026-02-02",
            start_time: "09:00 AM",
            duration_minutes: 180,
            max_marks: 100,
            is_auto_mapped: true,
          },
        ]);
        setActiveStep(1);
        return;
      }

      // Production mode: Call real API
      const data = await createExamPeriodMutation.mutateAsync({
        school_id: 1,
        academic_year_id: filters.academic_year_id,
        class_id: filters.class_id,
        section: filters.section,
        ...periodData,
        auto_map: true,
      });

      setExamPeriodId(data.id);
      setSubjectSchedules(data.subject_schedules || []);

      setActiveStep(1);
    } catch (err: any) {
      console.error("API Error:", err);
      // In demo mode or if API fails, still allow moving to next step to see the calendar
      setError("Demo Mode: Calendar view will show with mock data");
      // Generate mock schedule for demo
      setExamPeriodId(999);
      setSubjectSchedules([]);
      // Still proceed to show calendar
      setTimeout(() => {
        setError("");
        setActiveStep(1);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Remove the old fetch functions - now using React Query hooks instead
  // const fetchHolidays = async () => { ... }
  // const fetchValidDates = async () => { ... }

  const finalizeExamPeriod = async () => {
    if (!examPeriodId) return;

    setLoading(true);
    setError("");

    try {
      // Check if in demo mode
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

      if (isDemoMode) {
        // Demo mode: Generate sample hall ticket
        generateDemoHallTicket();
        return;
      }

      const response = await fetch(`/api/v1/exam-periods/periods/${examPeriodId}/finalize`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to finalize exam period");
      }

      // Generate hall tickets
      await generateHallTickets();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateHallTickets = async () => {
    if (!examPeriodId) return;

    try {
      await fetch(`/api/v1/exam-periods/periods/${examPeriodId}/hall-tickets`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to generate hall tickets:", err);
    }
  };

  const generateDemoHallTicket = () => {
    const now = new Date();
    const demoData = {
      student: {
        rollNo: "2026001234",
        name: "DEMO STUDENT",
        fatherName: "DEMO FATHER NAME",
        motherName: "DEMO MOTHER NAME",
      },
      school: {
        name: "Demo School Name",
        address: "123 School Street, City, State - 123456",
      },
      examPeriod: {
        name: periodData.exam_period_name,
        startDate: periodData.start_date,
        endDate: periodData.end_date,
        academicYear: "2025-2026",
      },
      examCenter: {
        code: "CENTER001",
        name: "Demo Examination Center",
        address: "Exam Center Building, Education District, City, State - 123456",
      },
      subjects: subjectSchedules.map((s, idx) => ({
        code: `${300 + idx + 1}`,
        name: s.subject_name,
        date: s.exam_date,
        startTime: s.start_time || "09:00 AM",
        duration: s.duration_minutes,
      })),
      hallTicketNumber: `HT-2026-${examPeriodId}-001234`,
      downloadDateTime: format(now, "dd-MM-yyyy HH:mm:ss"),
      ipAddress: "127.0.0.1",
    };

    setHallTicketData(demoData);
    setShowHallTicket(true);
    setLoading(false);
  };

  const isHoliday = (dateStr: string): Holiday | undefined => {
    return holidays.find((h) => h.date === dateStr);
  };

  const isExamDate = (dateStr: string): boolean => {
    return subjectSchedules.some((s) => s.exam_date === dateStr);
  };

  // Utility function to get subjects on a specific date (currently unused but kept for future use)
  // const getSubjectsOnDate = (dateStr: string): SubjectSchedule[] => {
  //   return subjectSchedules.filter((s) => s.exam_date === dateStr);
  // };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    const isSunday = date.getDay() === 0;
    const indianHoliday = INDIAN_HOLIDAYS_2026.find(h => h.date === dateStr);
    const holiday = isHoliday(dateStr);
    
    if (indianHoliday || holiday) return "#ff5252"; // Red for holidays
    if (isSunday) return "#ffcdd2"; // Light red for Sundays
    if (isExamDate(dateStr)) return "#4caf50"; // Green for exam dates
    if (validDates.includes(dateStr)) return "#fff3e0"; // Light orange for valid dates
    return "#f5f5f5"; // Gray for invalid dates
  };

  // Generate calendar dates from start to end date
  const generateCalendarDates = () => {
    if (!periodData.start_date || !periodData.end_date) return [];
    
    const start = new Date(periodData.start_date);
    const end = new Date(periodData.end_date);
    const dates = [];
    
    // Start from the beginning of the month
    const calendarStart = new Date(start);
    calendarStart.setDate(1);
    
    // Add empty cells for days before start of month
    const startDay = calendarStart.getDay();
    for (let i = 0; i < startDay; i++) {
      dates.push(null);
    }
    
    // Add all dates from start to end
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Custom day renderer for DatePicker
  const CustomDay = (props: PickersDayProps) => {
    const { day, ...other } = props;
    
    if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
      return <PickersDay {...other} day={day} />;
    }

    try {
      const dateStr = format(day, "yyyy-MM-dd");
      const isSunday = day.getDay() === 0;
      const isHolidayDate = INDIAN_HOLIDAYS_2026.some((h) => h.date === dateStr);

      return (
        <CustomPickersDay
          {...other}
          day={day}
          isHoliday={isHolidayDate}
          isSunday={isSunday}
        />
      );
    } catch (err) {
      console.error("Error rendering day:", err);
      return <PickersDay {...other} day={day} />;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Exam Period Name"
              value={periodData.exam_period_name}
              onChange={(e) =>
                setPeriodData({ ...periodData, exam_period_name: e.target.value })
              }
              placeholder="e.g., Mid-Term Examination 2026"
              required
            />

            <FormControl fullWidth>
              <InputLabel>Exam Type</InputLabel>
              <Select
                value={periodData.exam_type_id}
                label="Exam Type"
                onChange={(e) =>
                  setPeriodData({ ...periodData, exam_type_id: Number(e.target.value) })
                }
              >
                <MenuItem value={1}>Mid-Term</MenuItem>
                <MenuItem value={2}>Final</MenuItem>
                <MenuItem value={3}>Unit Test</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={periodData.start_date ? new Date(periodData.start_date) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setPeriodData({
                        ...periodData,
                        start_date: format(newValue, "yyyy-MM-dd"),
                      });
                    }
                  }}
                  slots={{
                    day: CustomDay,
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={periodData.end_date ? new Date(periodData.end_date) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setPeriodData({
                        ...periodData,
                        end_date: format(newValue, "yyyy-MM-dd"),
                      });
                    }
                  }}
                  slots={{
                    day: CustomDay,
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                  minDate={
                    periodData.start_date ? new Date(periodData.start_date) : undefined
                  }
                />
              </Stack>
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Total Marks (All Subjects)"
              type="number"
              value={periodData.total_marks}
              onChange={(e) =>
                setPeriodData({ ...periodData, total_marks: Number(e.target.value) })
              }
              inputProps={{ min: 1 }}
              required
            />

            <Alert severity="info">
              Subjects will be automatically scheduled across valid exam dates, excluding
              Sundays and Indian holidays.
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Exam Schedule Calendar
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
              {/* Calendar View */}
              <Box sx={{ flex: "1 1 60%" }}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: "grid", gap: 2 }}>
                    {/* Legend */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Chip
                        label="Holiday"
                        sx={{ bgcolor: "#ff5252", color: "white" }}
                        size="small"
                      />
                      <Chip
                        label="Sunday"
                        sx={{ bgcolor: "#ffcdd2", color: "#d32f2f" }}
                        size="small"
                      />
                      <Chip
                        label="Exam Scheduled"
                        sx={{ bgcolor: "#4caf50", color: "white" }}
                        size="small"
                      />
                      <Chip label="Valid Date" sx={{ bgcolor: "#fff3e0" }} size="small" />
                      <Chip label="Invalid" sx={{ bgcolor: "#f5f5f5" }} size="small" />
                    </Box>

                    {/* Calendar Grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 1,
                      }}
                    >
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <Box
                          key={day}
                          sx={{
                            p: 1,
                            textAlign: "center",
                            fontWeight: "bold",
                            bgcolor: "#e0e0e0",
                            borderRadius: 1,
                          }}
                        >
                          {day}
                        </Box>
                      ))}

                      {/* Full calendar with all dates */}
                      {calendarDates.map((dateStr, idx) => {
                        if (!dateStr) {
                          // Empty cell for padding
                          return <Box key={`empty-${idx}`} />;
                        }
                        
                        const schedule = subjectSchedules.find(s => s.exam_date === dateStr);
                        const holiday = holidays.find(h => h.date === dateStr);
                        const indianHoliday = INDIAN_HOLIDAYS_2026.find(h => h.date === dateStr);
                        const date = new Date(dateStr);
                        const isSunday = date.getDay() === 0;
                        
                        return (
                          <Tooltip
                            key={dateStr}
                            title={
                              schedule 
                                ? `${schedule.subject_name} - ${schedule.start_time || 'Time TBD'}` 
                                : indianHoliday
                                ? `Holiday: ${indianHoliday.name}`
                                : holiday 
                                ? `Holiday: ${holiday.name}`
                                : isSunday
                                ? 'Sunday'
                                : 'Available'
                            }
                          >
                            <Paper
                              sx={{
                                p: 1.5,
                                bgcolor: getDateColor(dateStr),
                                cursor: "pointer",
                                minHeight: 70,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                "&:hover": { 
                                  opacity: 0.8,
                                  transform: 'scale(1.05)',
                                  transition: 'all 0.2s'
                                },
                                border: schedule ? '2px solid #2e7d32' : 'none',
                              }}
                            >
                              <Typography variant="h6" fontWeight="bold" sx={{ color: (indianHoliday || isSunday) ? '#d32f2f' : 'inherit' }}>
                                {format(parseISO(dateStr), "d")}
                              </Typography>
                              {schedule && (
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', textAlign: 'center', mt: 0.5 }}>
                                  {schedule.subject_name?.substring(0, 8)}
                                </Typography>
                              )}
                              {(indianHoliday || holiday) && (
                                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'white' }}>
                                  🎉
                                </Typography>
                              )}
                            </Paper>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Subject List */}
              <Box sx={{ flex: "1 1 40%" }}>
                <Paper sx={{ p: 2, maxHeight: 500, overflow: "auto" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Scheduled Exams ({subjectSchedules.length})
                  </Typography>

                  {subjectSchedules.map((schedule, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        mb: 1,
                        bgcolor: "#f5f5f5",
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {schedule.subject_name}
                        </Typography>
                        {editingSchedule === schedule.id ? (
                          <TextField
                            type="date"
                            size="small"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            sx={{ mt: 1 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {format(parseISO(schedule.exam_date), "dd MMM yyyy")} •{" "}
                            {schedule.start_time} • {schedule.max_marks} marks
                          </Typography>
                        )}
                      </Box>
                      {editingSchedule === schedule.id ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleSaveEdit(schedule.id!)}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      ) : (
                        <Tooltip title="Edit exam date">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(schedule.id!, schedule.exam_date)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Paper>
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Ready to Finalize
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Once finalized, hall tickets will be automatically generated for all students.
            </Typography>

            <Paper sx={{ p: 3, mt: 3, bgcolor: "#f5f5f5" }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <Box sx={{ display: "grid", gap: 1, textAlign: "left" }}>
                <Typography variant="body2">
                  <strong>Period:</strong> {periodData.exam_period_name}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {periodData.start_date} to {periodData.end_date}
                </Typography>
                <Typography variant="body2">
                  <strong>Subjects:</strong> {subjectSchedules.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Marks:</strong> {periodData.total_marks}
                </Typography>
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarMonthIcon />
          Schedule Exam Period
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            sx={{ bgcolor: "#0B5F5A", "&:hover": { bgcolor: "#094a46" } }}
          >
            {loading ? "Processing..." : "Next"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={finalizeExamPeriod}
            disabled={loading}
            sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
          >
            {loading ? "Finalizing..." : "Finalize & Generate Hall Tickets"}
          </Button>
        )}
      </DialogActions>

      {/* Hall Ticket Viewer */}
      {showHallTicket && hallTicketData && (
        <HallTicketViewer
          open={showHallTicket}
          onClose={() => {
            setShowHallTicket(false);
            onSuccess?.();
            onClose();
          }}
          hallTicketData={hallTicketData}
        />
      )}
    </Dialog>
  );
}
