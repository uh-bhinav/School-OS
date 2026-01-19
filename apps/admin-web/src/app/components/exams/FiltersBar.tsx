import { Box, Paper, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { FilterList as FilterIcon } from "@mui/icons-material";

interface FiltersBarProps {
  value: {
    academic_year_id: number;
    class_id: number;
    section: string;
    exam_type_id?: number;
  };
  onChange: (filters: Partial<FiltersBarProps["value"]>) => void;
  classes: number[];
  sections: string[];
  examTypes?: Array<{ id: number; name: string }>;
  onApply: () => void;
}

export default function FiltersBar({
  value,
  onChange,
  classes,
  sections,
  examTypes = [],
  onApply,
}: FiltersBarProps) {
  const academicYears = [2023, 2024, 2025, 2026];

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 2,
          alignItems: "end",
        }}
      >
        {/* Academic Year */}
        <FormControl fullWidth size="small">
          <InputLabel>Academic Year</InputLabel>
          <Select
            value={value.academic_year_id}
            label="Academic Year"
            onChange={(e) => onChange({ academic_year_id: Number(e.target.value) })}
          >
            {academicYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Class */}
        <FormControl fullWidth size="small">
          <InputLabel>Class</InputLabel>
          <Select
            value={value.class_id}
            label="Class"
            onChange={(e) => onChange({ class_id: Number(e.target.value) })}
          >
            {classes.map((cls) => (
              <MenuItem key={cls} value={cls}>
                Class {cls}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Section */}
        <FormControl fullWidth size="small">
          <InputLabel>Section</InputLabel>
          <Select
            value={value.section}
            label="Section"
            onChange={(e) => onChange({ section: e.target.value })}
          >
            <MenuItem value="">All Sections</MenuItem>
            {sections.map((sec) => (
              <MenuItem key={sec} value={sec}>
                Section {sec}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Exam Type (Optional Filter) */}
        <FormControl fullWidth size="small">
          <InputLabel>Exam Type</InputLabel>
          <Select
            value={value.exam_type_id || ""}
            label="Exam Type"
            onChange={(e) => onChange({ exam_type_id: e.target.value ? Number(e.target.value) : undefined })}
          >
            <MenuItem value="">All Types</MenuItem>
            {examTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Apply Button */}
        <Button
          variant="contained"
          startIcon={<FilterIcon />}
          onClick={onApply}
          sx={{
            bgcolor: "#0B5F5A",
            "&:hover": { bgcolor: "#094a46" },
            height: "40px",
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
}
