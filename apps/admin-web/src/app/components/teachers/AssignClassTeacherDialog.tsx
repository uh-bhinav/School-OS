// ============================================================================
// FILE: src/app/components/teachers/AssignClassTeacherDialog.tsx
// PURPOSE: Modal dialog for assigning a teacher as class teacher
// ============================================================================

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Autocomplete,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  School,
  Person,
  Class as ClassIcon,
  Check,
  Warning,
} from "@mui/icons-material";
import {
  useAllClasses,
  useAssignClassTeacher,
  useClassForTeacher,
} from "@/app/services/teachersFilters.hooks";
import type { ClassInfo } from "@/app/services/teachersFilters.api";

// ============================================================================
// TYPES
// ============================================================================

interface AssignClassTeacherDialogProps {
  open: boolean;
  onClose: () => void;
  teacherId: number;
  teacherName: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AssignClassTeacherDialog({
  open,
  onClose,
  teacherId,
  teacherName,
}: AssignClassTeacherDialogProps) {
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const { data: allClasses, isLoading: classesLoading } = useAllClasses();
  const { data: currentAssignment, isLoading: assignmentLoading } = useClassForTeacher(teacherId);
  const assignMutation = useAssignClassTeacher();

  // Group classes by grade for better UX
  const groupedClasses = useMemo(() => {
    if (!allClasses) return [];

    // Sort by grade level, then section
    return [...allClasses].sort((a, b) => {
      if (a.grade_level !== b.grade_level) return a.grade_level - b.grade_level;
      return a.section.localeCompare(b.section);
    });
  }, [allClasses]);

  // Handle assignment
  const handleAssign = async () => {
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    setError(null);

    try {
      const result = await assignMutation.mutateAsync({
        teacher_id: teacherId,
        class_id: selectedClass.class_id,
        class_name: selectedClass.class_name,
        section: selectedClass.section,
        grade_level: selectedClass.grade_level,
      });

      if (result.success) {
        handleClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign class teacher");
    }
  };

  // Handle close with cleanup
  const handleClose = () => {
    setSelectedClass(null);
    setError(null);
    onClose();
  };

  const isLoading = classesLoading || assignmentLoading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <School color="primary" />
          <Typography variant="h6">Assign as Class Teacher</Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Teacher Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Person sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {teacherName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Teacher ID: {teacherId}
            </Typography>
          </Box>
        </Box>

        {/* Current Assignment Warning */}
        {currentAssignment && (
          <Alert severity="info" sx={{ mb: 3 }} icon={<Warning />}>
            <Typography variant="body2">
              This teacher is currently assigned as class teacher for{" "}
              <strong>
                {currentAssignment.class_name} {currentAssignment.section}
              </strong>
              . Assigning to a new class will remove the current assignment.
            </Typography>
          </Alert>
        )}

        {/* Class Selection */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <ClassIcon fontSize="small" />
            Select Class
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading classes...
              </Typography>
            </Box>
          ) : (
            <Autocomplete
              options={groupedClasses}
              value={selectedClass}
              onChange={(_, newValue) => {
                setSelectedClass(newValue);
                setError(null);
              }}
              getOptionLabel={(option) => `${option.class_name} ${option.section}`}
              groupBy={(option) => `Grade ${option.grade_level}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for a class..."
                  variant="outlined"
                  fullWidth
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={option.class_id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ClassIcon fontSize="small" color="action" />
                    <Typography>
                      {option.class_name} {option.section}
                    </Typography>
                  </Box>
                  {option.has_teacher ? (
                    <Chip
                      label={option.teacher_name || "Assigned"}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  ) : (
                    <Chip label="Available" size="small" color="success" variant="outlined" />
                  )}
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.class_id === value.class_id}
            />
          )}
        </Box>

        {/* Selected Class Warning */}
        {selectedClass?.has_teacher && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This class currently has{" "}
              <strong>{selectedClass.teacher_name}</strong> assigned as class
              teacher. They will be unassigned if you proceed.
            </Typography>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={assignMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          color="primary"
          disabled={!selectedClass || assignMutation.isPending}
          startIcon={
            assignMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Check />
            )
          }
        >
          {assignMutation.isPending ? "Assigning..." : "Assign Class Teacher"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
