import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import type { DayOfWeek } from "../../services/timetable.schema";
import { useCheckConflict, useCreateEntry, useUpdateEntry } from "../../services/timetable.hooks";
import { useTeachers, useSubjects, useRooms } from "../../services/resources.hooks";

const DAYS: Array<{ label: string; value: DayOfWeek }> = [
  { label: "Monday", value: "MON" },
  { label: "Tuesday", value: "TUE" },
  { label: "Wednesday", value: "WED" },
  { label: "Thursday", value: "THU" },
  { label: "Friday", value: "FRI" },
  { label: "Saturday", value: "SAT" },
];

interface FormState {
  day: string;
  period_no: number;
  subject_id: number | null;
  teacher_id: number | null;
  room_id: number | null;
}

export default function PeriodFormDialog({
  open,
  onClose,
  initial,
  context,
}: {
  open: boolean;
  onClose: () => void;
  initial?: any; // existing entry to edit
  context: { academic_year_id: number; class_id: number; section: string; week_start: string };
}) {
  const [form, setForm] = useState<FormState>({
    day: initial?.day ?? "MON",
    period_no: initial?.period_no ?? 1,
    subject_id: initial?.subject_id ?? null,
    teacher_id: initial?.teacher_id ?? null,
    room_id: initial?.room_id ?? null,
  });
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch resources (using mock school_id = 1)
  const { data: teachers, isLoading: loadingTeachers } = useTeachers(1);
  const { data: subjects, isLoading: loadingSubjects } = useSubjects({ class_id: context.class_id, school_id: 1 });
  const { data: rooms, isLoading: loadingRooms } = useRooms(1);

  const checkMut = useCheckConflict();
  const createMut = useCreateEntry();
  const updateMut = useUpdateEntry();

  useEffect(() => {
    setConflictMsg(null);
    setValidationError(null);
  }, [open]);

  // Reset form when initial changes
  useEffect(() => {
    if (initial) {
      setForm({
        day: initial.day,
        period_no: initial.period_no,
        subject_id: initial.subject_id,
        teacher_id: initial.teacher_id,
        room_id: initial.room_id,
      });
    }
  }, [initial]);

  const payload = {
    ...context,
    day: form.day as any,
    period_no: Number(form.period_no),
    subject_id: form.subject_id ?? 0,
    teacher_id: form.teacher_id ?? 0,
    room_id: form.room_id ?? null,
  };

  function validate(): boolean {
    if (!form.subject_id) {
      setValidationError("Subject is required");
      return false;
    }
    if (!form.teacher_id) {
      setValidationError("Teacher is required");
      return false;
    }
    if (form.period_no < 1 || form.period_no > 10) {
      setValidationError("Period number must be between 1 and 10");
      return false;
    }
    setValidationError(null);
    return true;
  }

  async function handleSave() {
    if (!validate()) return;

    try {
      // Pre-check conflict (non-blocking warning)
      const res = await checkMut.mutateAsync(payload).catch(() => null);
      if (res && !res.ok) {
        setConflictMsg(res.conflicts?.[0]?.message ?? "Conflict detected");
        // Allow saving despite conflict (user's choice)
      }

      if (initial?.id) {
        await updateMut.mutateAsync({ id: initial.id, patch: payload as any });
      } else {
        await createMut.mutateAsync(payload as any);
      }
      onClose();
    } catch (error: any) {
      setValidationError(error?.response?.data?.message ?? "Failed to save period");
    }
  }

  const selectedSubject = subjects?.find((s) => s.id === form.subject_id);
  const selectedTeacher = teachers?.find((t) => t.id === form.teacher_id);
  const selectedRoom = rooms?.find((r) => r.id === form.room_id);

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box>
          <Typography variant="h6">{initial ? "Edit Period" : "Add Period"}</Typography>
          <Typography variant="caption" color="text.secondary">
            Class {context.class_id} • Section {context.section} • Week {context.week_start}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
        {validationError && (
          <Alert severity="error" onClose={() => setValidationError(null)}>
            {validationError}
          </Alert>
        )}
        {conflictMsg && (
          <Alert severity="warning" onClose={() => setConflictMsg(null)}>
            {conflictMsg}
          </Alert>
        )}

        <TextField
          select
          label="Day of Week"
          value={form.day}
          onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
          required
        >
          {DAYS.map((d) => (
            <MenuItem key={d.value} value={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="number"
          label="Period Number"
          value={form.period_no}
          onChange={(e) => setForm((f) => ({ ...f, period_no: Number(e.target.value) }))}
          inputProps={{ min: 1, max: 10 }}
          helperText="Enter period number (1-10)"
          required
        />

        <Autocomplete
          options={subjects ?? []}
          getOptionLabel={(option) => option.name}
          value={selectedSubject ?? null}
          onChange={(_, newValue) => setForm((f) => ({ ...f, subject_id: newValue?.id ?? null }))}
          loading={loadingSubjects}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Subject"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingSubjects && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />

        <Autocomplete
          options={teachers ?? []}
          getOptionLabel={(option) => option.name}
          value={selectedTeacher ?? null}
          onChange={(_, newValue) => setForm((f) => ({ ...f, teacher_id: newValue?.id ?? null }))}
          loading={loadingTeachers}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Teacher"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingTeachers && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />

        <Autocomplete
          options={rooms ?? []}
          getOptionLabel={(option) => `${option.name}${option.capacity ? ` (${option.capacity})` : ""}`}
          value={selectedRoom ?? null}
          onChange={(_, newValue) => setForm((f) => ({ ...f, room_id: newValue?.id ?? null }))}
          loading={loadingRooms}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Room (Optional)"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingRooms && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
