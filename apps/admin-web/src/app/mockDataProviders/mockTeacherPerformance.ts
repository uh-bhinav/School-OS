// ============================================================================
// MOCK TEACHER PERFORMANCE DATA PROVIDER
// ============================================================================

export interface TeacherPerformanceKpi {
  teacher_id: number;
  average_student_score: number;
  pass_rate: number;
  highest_score: number;
  lowest_score: number;
  total_students_taught: number;
  classes_taught: number;
  subjects_taught: number;
}

export interface ClassWisePerformance {
  class_name: string;
  section: string;
  subject: string;
  average_score: number;
  pass_rate: number;
  total_students: number;
  highest_score: number;
  lowest_score: number;
}

export interface SubjectWisePerformance {
  subject_name: string;
  average_score: number;
  pass_rate: number;
  total_students: number;
  total_classes: number;
}

export interface StudentProgressData {
  exam_name: string;
  exam_date: string;
  class_average: number;
  pass_rate: number;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTeacherPerformanceKpi(teacherId: number): Promise<TeacherPerformanceKpi> {
  await simulateDelay();

  const baseScore = 65 + (teacherId % 20);
  const variance = teacherId % 10;

  return {
    teacher_id: teacherId,
    average_student_score: baseScore,
    pass_rate: Math.min(95, 75 + (teacherId % 20)),
    highest_score: Math.min(100, baseScore + 25 + variance),
    lowest_score: Math.max(35, baseScore - 30 + variance),
    total_students_taught: 120 + (teacherId * 10) % 80,
    classes_taught: 3 + (teacherId % 3),
    subjects_taught: 2 + (teacherId % 2),
  };
}

export async function getClassWisePerformance(teacherId: number): Promise<ClassWisePerformance[]> {
  await simulateDelay();

  const classes = ["Class 8", "Class 9", "Class 10"];
  const sections = ["A", "B", "C"];
  const subjects = ["Mathematics", "Science", "English", "Social Studies"];

  const numClasses = 3 + (teacherId % 2);
  const performances: ClassWisePerformance[] = [];

  for (let i = 0; i < numClasses; i++) {
    const className = classes[i % classes.length];
    const section = sections[(teacherId + i) % sections.length];
    const subject = subjects[(teacherId + i) % subjects.length];
    const avgScore = 60 + Math.floor(Math.random() * 25);

    performances.push({
      class_name: className,
      section,
      subject,
      average_score: avgScore,
      pass_rate: 75 + Math.floor(Math.random() * 20),
      total_students: 35 + Math.floor(Math.random() * 10),
      highest_score: Math.min(100, avgScore + 20 + Math.floor(Math.random() * 15)),
      lowest_score: Math.max(30, avgScore - 25 - Math.floor(Math.random() * 10)),
    });
  }

  console.log(`[MOCK TEACHER PERFORMANCE] getClassWisePerformance(${teacherId}) → ${performances.length} classes`);
  return performances;
}

export async function getSubjectWisePerformance(teacherId: number): Promise<SubjectWisePerformance[]> {
  await simulateDelay();

  const subjects = ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English"];
  const numSubjects = 2 + (teacherId % 2);
  const performances: SubjectWisePerformance[] = [];

  for (let i = 0; i < numSubjects; i++) {
    const subject = subjects[(teacherId + i) % subjects.length];
    const avgScore = 65 + Math.floor(Math.random() * 20);

    performances.push({
      subject_name: subject,
      average_score: avgScore,
      pass_rate: 78 + Math.floor(Math.random() * 18),
      total_students: 100 + Math.floor(Math.random() * 50),
      total_classes: 3 + Math.floor(Math.random() * 2),
    });
  }

  console.log(`[MOCK TEACHER PERFORMANCE] getSubjectWisePerformance(${teacherId}) → ${performances.length} subjects`);
  return performances;
}

export async function getStudentProgressOverTime(teacherId: number): Promise<StudentProgressData[]> {
  await simulateDelay();

  const exams = [
    { name: "Unit Test 1", month: 4 },
    { name: "Mid Term", month: 7 },
    { name: "Unit Test 2", month: 9 },
    { name: "Pre-Final", month: 11 },
    { name: "Final Exam", month: 12 },
  ];

  const progressData: StudentProgressData[] = exams.map((exam, index) => {
    const baseAverage = 60 + (teacherId % 10);
    const improvement = index * 2; // Students improve over time

    return {
      exam_name: exam.name,
      exam_date: `2025-${String(exam.month).padStart(2, "0")}-15`,
      class_average: Math.min(95, baseAverage + improvement + Math.floor(Math.random() * 5)),
      pass_rate: Math.min(98, 75 + improvement * 2 + Math.floor(Math.random() * 5)),
    };
  });

  console.log(`[MOCK TEACHER PERFORMANCE] getStudentProgressOverTime(${teacherId}) → ${progressData.length} exams`);
  return progressData;
}

export const mockTeacherPerformanceProvider = {
  getTeacherPerformanceKpi,
  getClassWisePerformance,
  getSubjectWisePerformance,
  getStudentProgressOverTime,
};
