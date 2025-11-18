import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Chip, Button } from "@mui/material";
import { ClearAll as ClearAllIcon } from "@mui/icons-material";
import { useMarksStore } from "@/app/stores/useMarksStore";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { useClasses, useStudents, useSubjects, useExams, SECTIONS } from "@/app/services/marks.hooks";

/**
 * MarksFilterBar Component - INTEGRATED WITH BACKEND
 *
 * Provides filter controls for the Marks page with REAL backend data:
 * - Class (from /api/v1/classes/school/{school_id})
 * - Section (static A-F)
 * - Subject (from class.subjects)
 * - Exam (from /api/v1/exams/all/{school_id})
 * - Student (from /api/v1/classes/{class_id}/students)
 *
 * All filters automatically use schoolId from useAuthStore
 * Filters are connected to Zustand store and automatically trigger data refetch
 */
export function MarksFilterBar() {
  const { classId, section, examId, subjectId, studentId, setFilter, clearFilters } = useMarksStore();
  const currentAcademicYearId = useAuthStore((state) => state.currentAcademicYearId);

  // Fetch dropdown data from backend
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: students = [], isLoading: studentsLoading } = useStudents(classId || undefined);
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects(classId || undefined);
  const { data: exams = [], isLoading: examsLoading } = useExams(currentAcademicYearId, classId || undefined);

  const handleClassChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    setFilter("classId", value === "" ? null : Number(value));
    // Clear dependent filters
    setFilter("studentId", null);
    setFilter("subjectId", null);
  };

  const handleSectionChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFilter("section", value === "" ? null : value);
  };

  const handleExamChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    setFilter("examId", value === "" ? null : Number(value));
  };

  const handleSubjectChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    setFilter("subjectId", value === "" ? null : Number(value));
  };

  const handleStudentChange = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    setFilter("studentId", value === "" ? null : Number(value));
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  // Count active filters
  const activeFiltersCount = [classId, section, examId, subjectId, studentId].filter(Boolean).length;

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
      {/* Class Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }} disabled={classesLoading}>
        <InputLabel>Class</InputLabel>
        <Select
          value={classId ?? ""}
          label="Class"
          onChange={handleClassChange}
        >
          <MenuItem value="">All Classes</MenuItem>
          {classes.map((cls: any) => (
            <MenuItem key={cls.class_id} value={cls.class_id}>
              Class {cls.grade_level} {cls.section}
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

      {/* Subject Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }} disabled={subjectsLoading}>
        <InputLabel>Subject</InputLabel>
        <Select
          value={subjectId ?? ""}
          label="Subject"
          onChange={handleSubjectChange}
        >
          <MenuItem value="">All Subjects</MenuItem>
          {subjects.map((subject: any) => (
            <MenuItem key={subject.subject_id} value={subject.subject_id}>
              {subject.subject_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Exam Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }} disabled={examsLoading}>
        <InputLabel>Exam</InputLabel>
        <Select
          value={examId ?? ""}
          label="Exam"
          onChange={handleExamChange}
        >
          <MenuItem value="">All Exams</MenuItem>
          {exams.map((exam: any) => (
            <MenuItem key={exam.exam_id} value={exam.exam_id}>
              {exam.exam_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Student Filter - Only shown when class is selected */}
      {classId && (
        <FormControl size="small" sx={{ minWidth: 180 }} disabled={studentsLoading}>
          <InputLabel>Student</InputLabel>
          <Select
            value={studentId ?? ""}
            label="Student"
            onChange={handleStudentChange}
          >
            <MenuItem value="">All Students</MenuItem>
            {students.map((student: any) => (
              <MenuItem key={student.student_id} value={student.student_id}>
                {student.profile?.first_name} {student.profile?.last_name} ({student.roll_number})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Active Filters Indicator */}
      {activeFiltersCount > 0 && (
        <Chip
          label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
          color="primary"
          size="small"
        />
      )}

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <Button
          size="small"
          startIcon={<ClearAllIcon />}
          onClick={handleClearFilters}
          sx={{ ml: "auto" }}
        >
          Clear All
        </Button>
      )}
    </Box>
  );
}
