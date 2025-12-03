// ============================================================================
// FILE: src/app/components/teachers/TeacherFilters.tsx
// PURPOSE: Filter component for Teachers List page
// ============================================================================

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Button,
  OutlinedInput,
  Paper,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  FilterList,
  Close,
  School,
  Subject as SubjectIcon,
  Refresh,
} from "@mui/icons-material";
import { useSubjectList } from "@/app/services/teachersFilters.hooks";

// ============================================================================
// TYPES
// ============================================================================

export interface TeacherFilterState {
  subjectIds: number[];
  classTeachersOnly: boolean;
}

interface TeacherFiltersProps {
  filters: TeacherFilterState;
  onFiltersChange: (filters: TeacherFilterState) => void;
  onReset: () => void;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TeacherFilters({
  filters,
  onFiltersChange,
  onReset,
  disabled = false,
}: TeacherFiltersProps) {
  const { data: subjects, isLoading: subjectsLoading } = useSubjectList();

  // Handle subject selection change
  const handleSubjectChange = (event: any) => {
    const value = event.target.value as number[];
    onFiltersChange({
      ...filters,
      subjectIds: value,
    });
  };

  // Handle class teacher toggle
  const handleClassTeacherToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      classTeachersOnly: event.target.checked,
    });
  };

  // Remove a specific subject from filter
  const handleRemoveSubject = (subjectId: number) => {
    onFiltersChange({
      ...filters,
      subjectIds: filters.subjectIds.filter((id) => id !== subjectId),
    });
  };

  // Get subject name by ID
  const getSubjectName = (subjectId: number): string => {
    const subject = subjects?.find((s) => s.subject_id === subjectId);
    return subject?.subject_name || `Subject ${subjectId}`;
  };

  // Check if any filters are active
  const hasActiveFilters = filters.subjectIds.length > 0 || filters.classTeachersOnly;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FilterList color="action" />
        <Typography variant="subtitle1" fontWeight="medium">
          Filters
        </Typography>
        {hasActiveFilters && (
          <Chip
            label={`${filters.subjectIds.length + (filters.classTeachersOnly ? 1 : 0)} active`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Filter Controls */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {/* Subject Multi-Select */}
        <FormControl sx={{ minWidth: 280, maxWidth: 400, flex: 1 }} disabled={disabled}>
          <InputLabel id="subject-filter-label">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SubjectIcon fontSize="small" />
              Filter by Subject
            </Box>
          </InputLabel>
          <Select
            labelId="subject-filter-label"
            id="subject-filter"
            multiple
            value={filters.subjectIds}
            onChange={handleSubjectChange}
            input={<OutlinedInput label="Filter by Subject" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    All Subjects
                  </Typography>
                ) : selected.length <= 2 ? (
                  selected.map((id) => (
                    <Chip
                      key={id}
                      label={getSubjectName(id)}
                      size="small"
                      onDelete={() => handleRemoveSubject(id)}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ))
                ) : (
                  <Chip
                    label={`${selected.length} subjects selected`}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            {subjectsLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading subjects...
              </MenuItem>
            ) : (
              subjects?.map((subject) => (
                <MenuItem key={subject.subject_id} value={subject.subject_id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                    <Typography>{subject.subject_name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                      {subject.subject_code}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Class Teachers Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 56,
            px: 2,
            border: "1px solid",
            borderColor: filters.classTeachersOnly ? "primary.main" : "divider",
            borderRadius: 1,
            bgcolor: filters.classTeachersOnly ? "primary.50" : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          <Tooltip title="Show only teachers who are assigned as class teachers">
            <FormControlLabel
              control={
                <Switch
                  checked={filters.classTeachersOnly}
                  onChange={handleClassTeacherToggle}
                  disabled={disabled}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <School fontSize="small" />
                  <Typography variant="body2">Class Teachers Only</Typography>
                </Box>
              }
            />
          </Tooltip>
        </Box>

        {/* Reset Button */}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Refresh />}
          onClick={onReset}
          disabled={disabled || !hasActiveFilters}
          sx={{ height: 56 }}
        >
          Reset Filters
        </Button>
      </Box>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2, pt: 2, borderTop: "1px dashed", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1, display: "flex", alignItems: "center" }}>
            Active filters:
          </Typography>
          {filters.classTeachersOnly && (
            <Chip
              label="Class Teachers Only"
              size="small"
              color="primary"
              onDelete={() => onFiltersChange({ ...filters, classTeachersOnly: false })}
              deleteIcon={<Close fontSize="small" />}
            />
          )}
          {filters.subjectIds.map((subjectId) => (
            <Chip
              key={subjectId}
              label={getSubjectName(subjectId)}
              size="small"
              color="secondary"
              variant="outlined"
              onDelete={() => handleRemoveSubject(subjectId)}
              deleteIcon={<Close fontSize="small" />}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

// ============================================================================
// DEFAULT FILTER STATE
// ============================================================================

export const defaultTeacherFilters: TeacherFilterState = {
  subjectIds: [],
  classTeachersOnly: false,
};
