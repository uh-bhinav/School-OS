import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useMarksStore } from "@/app/stores/useMarksStore";

// Mock data - Replace with real API calls when backend is integrated
const ACADEMIC_YEARS = [
  { id: 2024, label: "2024-2025" },
  { id: 2025, label: "2025-2026" },
];

const CLASSES = [
  { id: 6, label: "Class 6" },
  { id: 7, label: "Class 7" },
  { id: 8, label: "Class 8" },
  { id: 9, label: "Class 9" },
  { id: 10, label: "Class 10" },
];

const SECTIONS = ["A", "B", "C", "D"];

const SUBJECTS = [
  { id: 21, name: "Mathematics" },
  { id: 22, name: "Science" },
  { id: 23, name: "English" },
  { id: 24, name: "Hindi" },
  { id: 25, name: "Social Studies" },
];

const EXAMS = [
  { id: 5, name: "Mid-Term" },
  { id: 6, name: "Final" },
  { id: 7, name: "Unit Test 1" },
  { id: 8, name: "Unit Test 2" },
];

/**
 * FiltersBar Component
 *
 * Provides filter controls for the Marks page:
 * - Academic Year
 * - Class
 * - Section
 * - Subject
 * - Exam
 *
 * Filters are connected to Zustand store and automatically trigger data refetch
 * when changed (via React Query's queryKey dependency in MarksPage).
 *
 * Integration Note: Replace mock data with API calls to fetch actual academic years,
 * classes, subjects, and exams from backend when ready.
 */
export function FiltersBar() {
  const { classId, section, examId, subjectId, setFilter } = useMarksStore();

  const handleClassChange = (event: SelectChangeEvent<number>) => {
    setFilter("classId", event.target.value as number);
  };

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    setFilter("section", event.target.value);
  };

  const handleExamChange = (event: SelectChangeEvent<number>) => {
    setFilter("examId", event.target.value as number);
  };

  const handleSubjectChange = (event: SelectChangeEvent<number>) => {
    setFilter("subjectId", event.target.value as number);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      {/* Academic Year - Placeholder for future implementation */}
      <FormControl size="small" sx={{ minWidth: 150 }} disabled>
        <InputLabel>Academic Year</InputLabel>
        <Select label="Academic Year" defaultValue={2025}>
          {ACADEMIC_YEARS.map((year) => (
            <MenuItem key={year.id} value={year.id}>
              {year.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Class Filter */}
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Class</InputLabel>
        <Select
          value={classId ?? ""}
          label="Class"
          onChange={handleClassChange}
        >
          <MenuItem value="">All Classes</MenuItem>
          {CLASSES.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Section Filter */}
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>Section</InputLabel>
        <Select
          value={section ?? ""}
          label="Section"
          onChange={handleSectionChange}
        >
          <MenuItem value="">All Sections</MenuItem>
          {SECTIONS.map((sec) => (
            <MenuItem key={sec} value={sec}>
              Section {sec}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Exam Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Exam</InputLabel>
        <Select
          value={examId ?? ""}
          label="Exam"
          onChange={handleExamChange}
        >
          <MenuItem value="">All Exams</MenuItem>
          {EXAMS.map((exam) => (
            <MenuItem key={exam.id} value={exam.id}>
              {exam.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Subject Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Subject</InputLabel>
        <Select
          value={subjectId ?? ""}
          label="Subject"
          onChange={handleSubjectChange}
        >
          <MenuItem value="">All Subjects</MenuItem>
          {SUBJECTS.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {subject.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
