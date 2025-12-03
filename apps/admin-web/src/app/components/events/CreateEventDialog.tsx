// ============================================================================
// FILE: src/app/components/events/CreateEventDialog.tsx
// PURPOSE: Dialog for creating a new event
// ============================================================================

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
  Stack,
  Chip,
  OutlinedInput,
  InputAdornment,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useCreateEvent } from "../../services/events.hooks";
import { EventTheme, PREDEFINED_THEMES } from "../../services/events.schema";
import type { EventCreate } from "../../services/events.schema";
import { mockTeachersProvider, mockClassesProvider } from "../../mockDataProviders";

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Teacher {
  teacher_id: number;
  first_name: string;
  last_name: string;
}

interface ClassInfo {
  class_id: number;
  class_name: string;
  section: string;
}

export default function CreateEventDialog({
  open,
  onClose,
  onSuccess,
}: CreateEventDialogProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<EventCreate>({
    title: "",
    theme: EventTheme.Cultural,
    description: "",
    date: "",
    teacherInChargeId: 0,
    hostClasses: [],
    estimatedBudget: undefined,
    budgetNote: "",
    venue: "",
    startTime: "",
    endTime: "",
  });

  const [customTheme, setCustomTheme] = useState("");
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  const createEventMutation = useCreateEvent();

  // Load teachers and classes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [teachersData, classesData] = await Promise.all([
          mockTeachersProvider.getTeachers(1),
          mockClassesProvider.getClasses({ school_id: 1 }),
        ]);
        setTeachers(teachersData);
        setClasses(classesData);
      } catch (err) {
        setError("Failed to load form data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  const handleInputChange = (field: keyof EventCreate, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === EventTheme.Custom) {
      setIsCustomTheme(true);
      handleInputChange("theme", customTheme || EventTheme.Custom);
    } else {
      setIsCustomTheme(false);
      setCustomTheme("");
      handleInputChange("theme", value);
    }
  };

  const handleClassesChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    handleInputChange("hostClasses", typeof value === "string" ? [] : value);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.teacherInChargeId || formData.hostClasses.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setError(null);
      const eventData: EventCreate = {
        ...formData,
        theme: isCustomTheme ? customTheme : formData.theme,
      };

      await createEventMutation.mutateAsync(eventData);

      // Reset form
      setFormData({
        title: "",
        theme: EventTheme.Cultural,
        description: "",
        date: "",
        teacherInChargeId: 0,
        hostClasses: [],
        estimatedBudget: undefined,
        budgetNote: "",
        venue: "",
        startTime: "",
        endTime: "",
      });
      setCustomTheme("");
      setIsCustomTheme(false);

      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Failed to create event");
      console.error(err);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth sx={{ zIndex: 10001 }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Create New Event</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Basic Info */}
            <TextField
              label="Event Title"
              required
              fullWidth
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Annual Day Celebration 2025"
            />

            <Box display="flex" gap={2}>
              <FormControl fullWidth required>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={isCustomTheme ? EventTheme.Custom : formData.theme}
                  label="Theme"
                  onChange={handleThemeChange}
                >
                  {PREDEFINED_THEMES.map((theme) => (
                    <MenuItem key={theme.value} value={theme.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: theme.color,
                          }}
                        />
                        {theme.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {isCustomTheme && (
                <TextField
                  label="Custom Theme"
                  fullWidth
                  value={customTheme}
                  onChange={(e) => {
                    setCustomTheme(e.target.value);
                    handleInputChange("theme", e.target.value);
                  }}
                  placeholder="Enter custom theme"
                />
              )}
            </Box>

            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the event..."
            />

            {/* Date and Time */}
            <Box display="flex" gap={2}>
              <TextField
                label="Event Date"
                type="date"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
              <TextField
                label="End Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </Box>

            <TextField
              label="Venue"
              fullWidth
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="e.g., School Auditorium"
            />

            {/* Teacher and Classes */}
            <FormControl fullWidth required>
              <InputLabel>Teacher In-Charge</InputLabel>
              <Select
                value={formData.teacherInChargeId || ""}
                label="Teacher In-Charge"
                onChange={(e) => handleInputChange("teacherInChargeId", e.target.value)}
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.teacher_id} value={teacher.teacher_id}>
                    {teacher.first_name} {teacher.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Host Classes</InputLabel>
              <Select
                multiple
                value={formData.hostClasses}
                onChange={handleClassesChange}
                input={<OutlinedInput label="Host Classes" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((classId) => {
                      const classInfo = classes.find((c) => c.class_id === classId);
                      return (
                        <Chip
                          key={classId}
                          label={classInfo ? `${classInfo.class_name} ${classInfo.section}` : classId}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {classes.map((classInfo) => (
                  <MenuItem key={classInfo.class_id} value={classInfo.class_id}>
                    {classInfo.class_name} {classInfo.section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Budget Section (Placeholder) */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Budget Information (Future Integration)
            </Typography>

            <Box display="flex" gap={2}>
              <TextField
                label="Estimated Budget"
                type="number"
                fullWidth
                value={formData.estimatedBudget || ""}
                onChange={(e) =>
                  handleInputChange(
                    "estimatedBudget",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              <TextField
                label="Budget Notes"
                fullWidth
                value={formData.budgetNote}
                onChange={(e) => handleInputChange("budgetNote", e.target.value)}
                placeholder="Any additional budget notes..."
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={createEventMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || createEventMutation.isPending}
        >
          {createEventMutation.isPending ? "Creating..." : "Create Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
