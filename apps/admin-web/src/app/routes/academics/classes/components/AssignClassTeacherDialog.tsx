import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  Box,
} from "@mui/material";
import { useAssignClassTeacher } from "@/app/services/classes.hooks";
import { MOCK_TEACHERS } from "@/app/mockDataProviders/mockTeachers";

interface AssignClassTeacherDialogProps {
  open: boolean;
  classId: number;
  onClose: () => void;
}

export default function AssignClassTeacherDialog({
  open,
  classId,
  onClose,
}: AssignClassTeacherDialogProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const assignMutation = useAssignClassTeacher();

  const handleAssign = async () => {
    if (selectedTeacherId === "") {
      return;
    }

    try {
      await assignMutation.mutateAsync({
        classId,
        teacherId: selectedTeacherId as number,
      });
      onClose();
    } catch (error) {
      console.error("Failed to assign teacher:", error);
    }
  };

  const filteredTeachers = MOCK_TEACHERS.filter(
    (teacher) =>
      teacher.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Class Teacher</DialogTitle>
      <DialogContent>
        {assignMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to assign teacher. Please try again.
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Search Teacher"
            placeholder="Search by name or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Select Teacher</InputLabel>
            <Select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value as number)}
              label="Select Teacher"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {filteredTeachers.map((teacher) => (
                <MenuItem key={teacher.teacher_id} value={teacher.teacher_id}>
                  {teacher.first_name} {teacher.last_name} ({teacher.employee_id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={assignMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={selectedTeacherId === "" || assignMutation.isPending}
        >
          {assignMutation.isPending ? <CircularProgress size={24} /> : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
