// ============================================================================
// MOCK TEACHERS DATA PROVIDER
// ============================================================================

import type {
  Teacher,
  TeacherKpi,
  TeacherQualification,
  TeacherSubjectAssignment,
} from "../services/teacher.schema";

export interface TeacherData {
  teacher_id: number;
  school_id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  date_of_joining: string;
  qualification: string;
  specialization: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface SubjectData {
  subject_id: number;
  school_id: number;
  subject_name: string;
  subject_code: string;
  grade_level?: number;
  description?: string;
  created_at: string;
}

export interface RoomData {
  room_id: number;
  school_id: number;
  room_number: string;
  room_name: string;
  room_type: "classroom" | "lab" | "library" | "auditorium" | "sports" | "other";
  capacity: number;
  floor: number;
  is_available: boolean;
}

export const MOCK_TEACHERS: TeacherData[] = [
  {
    teacher_id: 1,
    school_id: 1,
    user_id: "teacher-1-uuid",
    first_name: "Priya",
    last_name: "Sharma",
    employee_id: "EMP001",
    date_of_joining: "2020-06-01",
    qualification: "M.A. in English",
    specialization: "English Literature",
    phone: "+91-9876543210",
    email: "priya.sharma@school.com",
    is_active: true,
    created_at: "2020-06-01T00:00:00Z",
  },
  {
    teacher_id: 2,
    school_id: 1,
    user_id: "teacher-2-uuid",
    first_name: "Anjali",
    last_name: "Patel",
    employee_id: "EMP002",
    date_of_joining: "2019-07-15",
    qualification: "M.Sc. in Mathematics",
    specialization: "Mathematics",
    phone: "+91-9876543211",
    email: "anjali.patel@school.com",
    is_active: true,
    created_at: "2019-07-15T00:00:00Z",
  },
  {
    teacher_id: 3,
    school_id: 1,
    user_id: "teacher-3-uuid",
    first_name: "Rajesh",
    last_name: "Singh",
    employee_id: "EMP003",
    date_of_joining: "2021-04-10",
    qualification: "M.Sc. in Physics",
    specialization: "Physics",
    phone: "+91-9876543212",
    email: "rajesh.singh@school.com",
    is_active: true,
    created_at: "2021-04-10T00:00:00Z",
  },
  {
    teacher_id: 4,
    school_id: 1,
    user_id: "teacher-4-uuid",
    first_name: "Kavita",
    last_name: "Verma",
    employee_id: "EMP004",
    date_of_joining: "2018-08-20",
    qualification: "M.Sc. in Chemistry",
    specialization: "Chemistry",
    phone: "+91-9876543213",
    email: "kavita.verma@school.com",
    is_active: true,
    created_at: "2018-08-20T00:00:00Z",
  },
  {
    teacher_id: 5,
    school_id: 1,
    user_id: "teacher-5-uuid",
    first_name: "Amit",
    last_name: "Gupta",
    employee_id: "EMP005",
    date_of_joining: "2020-01-05",
    qualification: "M.A. in History",
    specialization: "History",
    phone: "+91-9876543214",
    email: "amit.gupta@school.com",
    is_active: true,
    created_at: "2020-01-05T00:00:00Z",
  },
  {
    teacher_id: 6,
    school_id: 1,
    user_id: "teacher-6-uuid",
    first_name: "Sneha",
    last_name: "Reddy",
    employee_id: "EMP006",
    date_of_joining: "2019-09-12",
    qualification: "M.A. in Geography",
    specialization: "Geography",
    phone: "+91-9876543215",
    email: "sneha.reddy@school.com",
    is_active: true,
    created_at: "2019-09-12T00:00:00Z",
  },
  {
    teacher_id: 7,
    school_id: 1,
    user_id: "teacher-7-uuid",
    first_name: "Fatima",
    last_name: "Khan",
    employee_id: "EMP007",
    date_of_joining: "2021-06-18",
    qualification: "M.Sc. in Biology",
    specialization: "Biology",
    phone: "+91-9876543216",
    email: "fatima.khan@school.com",
    is_active: true,
    created_at: "2021-06-18T00:00:00Z",
  },
  {
    teacher_id: 8,
    school_id: 1,
    user_id: "teacher-8-uuid",
    first_name: "Vikram",
    last_name: "Desai",
    employee_id: "EMP008",
    date_of_joining: "2020-03-22",
    qualification: "M.A. in Hindi",
    specialization: "Hindi",
    phone: "+91-9876543217",
    email: "vikram.desai@school.com",
    is_active: true,
    created_at: "2020-03-22T00:00:00Z",
  },
  {
    teacher_id: 9,
    school_id: 1,
    user_id: "teacher-9-uuid",
    first_name: "Meera",
    last_name: "Joshi",
    employee_id: "EMP009",
    date_of_joining: "2019-05-30",
    qualification: "M.A. in Sanskrit",
    specialization: "Sanskrit",
    phone: "+91-9876543218",
    email: "meera.joshi@school.com",
    is_active: true,
    created_at: "2019-05-30T00:00:00Z",
  },
  {
    teacher_id: 10,
    school_id: 1,
    user_id: "teacher-10-uuid",
    first_name: "Suresh",
    last_name: "Nair",
    employee_id: "EMP010",
    date_of_joining: "2021-02-14",
    qualification: "M.P.Ed.",
    specialization: "Physical Education",
    phone: "+91-9876543219",
    email: "suresh.nair@school.com",
    is_active: true,
    created_at: "2021-02-14T00:00:00Z",
  },
  {
    teacher_id: 11,
    school_id: 1,
    user_id: "teacher-11-uuid",
    first_name: "Lakshmi",
    last_name: "Iyer",
    employee_id: "EMP011",
    date_of_joining: "2020-07-08",
    qualification: "M.A. in Economics",
    specialization: "Economics",
    phone: "+91-9876543220",
    email: "lakshmi.iyer@school.com",
    is_active: true,
    created_at: "2020-07-08T00:00:00Z",
  },
  {
    teacher_id: 12,
    school_id: 1,
    user_id: "teacher-12-uuid",
    first_name: "Ravi",
    last_name: "Menon",
    employee_id: "EMP012",
    date_of_joining: "2019-11-25",
    qualification: "M.Com.",
    specialization: "Commerce",
    phone: "+91-9876543221",
    email: "ravi.menon@school.com",
    is_active: true,
    created_at: "2019-11-25T00:00:00Z",
  },
  {
    teacher_id: 13,
    school_id: 1,
    user_id: "teacher-13-uuid",
    first_name: "Sunita",
    last_name: "Rao",
    employee_id: "EMP013",
    date_of_joining: "2021-01-10",
    qualification: "M.C.A.",
    specialization: "Computer Science",
    phone: "+91-9876543222",
    email: "sunita.rao@school.com",
    is_active: true,
    created_at: "2021-01-10T00:00:00Z",
  },
  {
    teacher_id: 14,
    school_id: 1,
    user_id: "teacher-14-uuid",
    first_name: "Manoj",
    last_name: "Pandey",
    employee_id: "EMP014",
    date_of_joining: "2020-09-05",
    qualification: "M.A. in Political Science",
    specialization: "Political Science",
    phone: "+91-9876543223",
    email: "manoj.pandey@school.com",
    is_active: true,
    created_at: "2020-09-05T00:00:00Z",
  },
  {
    teacher_id: 15,
    school_id: 1,
    user_id: "teacher-15-uuid",
    first_name: "Pooja",
    last_name: "Kapoor",
    employee_id: "EMP015",
    date_of_joining: "2019-12-18",
    qualification: "M.F.A.",
    specialization: "Arts & Crafts",
    phone: "+91-9876543224",
    email: "pooja.kapoor@school.com",
    is_active: true,
    created_at: "2019-12-18T00:00:00Z",
  },
  {
    teacher_id: 16,
    school_id: 1,
    user_id: "teacher-16-uuid",
    first_name: "Arun",
    last_name: "Malik",
    employee_id: "EMP016",
    date_of_joining: "2021-03-28",
    qualification: "B.Mus.",
    specialization: "Music",
    phone: "+91-9876543225",
    email: "arun.malik@school.com",
    is_active: true,
    created_at: "2021-03-28T00:00:00Z",
  },
  {
    teacher_id: 17,
    school_id: 1,
    user_id: "teacher-17-uuid",
    first_name: "Divya",
    last_name: "Pillai",
    employee_id: "EMP017",
    date_of_joining: "2020-05-15",
    qualification: "M.Sc. in Environmental Science",
    specialization: "Environmental Science",
    phone: "+91-9876543226",
    email: "divya.pillai@school.com",
    is_active: true,
    created_at: "2020-05-15T00:00:00Z",
  },
  {
    teacher_id: 18,
    school_id: 1,
    user_id: "teacher-18-uuid",
    first_name: "Subhash",
    last_name: "Bose",
    employee_id: "EMP018",
    date_of_joining: "2019-10-20",
    qualification: "M.A. in Sociology",
    specialization: "Sociology",
    phone: "+91-9876543227",
    email: "subhash.bose@school.com",
    is_active: true,
    created_at: "2019-10-20T00:00:00Z",
  },
  {
    teacher_id: 19,
    school_id: 1,
    user_id: "teacher-19-uuid",
    first_name: "Nandini",
    last_name: "Das",
    employee_id: "EMP019",
    date_of_joining: "2021-07-02",
    qualification: "M.A. in Psychology",
    specialization: "Psychology",
    phone: "+91-9876543228",
    email: "nandini.das@school.com",
    is_active: true,
    created_at: "2021-07-02T00:00:00Z",
  },
  {
    teacher_id: 20,
    school_id: 1,
    user_id: "teacher-20-uuid",
    first_name: "Rahul",
    last_name: "Saxena",
    employee_id: "EMP020",
    date_of_joining: "2020-08-12",
    qualification: "M.B.A.",
    specialization: "Business Studies",
    phone: "+91-9876543229",
    email: "rahul.saxena@school.com",
    is_active: true,
    created_at: "2020-08-12T00:00:00Z",
  },
];

const MOCK_SUBJECTS: SubjectData[] = [
  { subject_id: 1, school_id: 1, subject_name: "English", subject_code: "ENG", created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 2, school_id: 1, subject_name: "Mathematics", subject_code: "MATH", created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 3, school_id: 1, subject_name: "Science", subject_code: "SCI", created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 4, school_id: 1, subject_name: "Social Studies", subject_code: "SST", created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 5, school_id: 1, subject_name: "Hindi", subject_code: "HIN", created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 6, school_id: 1, subject_name: "Physics", subject_code: "PHY", grade_level: 9, created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 7, school_id: 1, subject_name: "Chemistry", subject_code: "CHEM", grade_level: 9, created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 8, school_id: 1, subject_name: "Biology", subject_code: "BIO", grade_level: 9, created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 9, school_id: 1, subject_name: "Computer Science", subject_code: "CS", created_at: "2025-04-01T00:00:00Z" },
  { subject_id: 10, school_id: 1, subject_name: "Physical Education", subject_code: "PE", created_at: "2025-04-01T00:00:00Z" },
];

const MOCK_ROOMS: RoomData[] = [
  { room_id: 1, school_id: 1, room_number: "101", room_name: "Classroom 1A", room_type: "classroom", capacity: 40, floor: 1, is_available: true },
  { room_id: 2, school_id: 1, room_number: "102", room_name: "Classroom 1B", room_type: "classroom", capacity: 40, floor: 1, is_available: true },
  { room_id: 3, school_id: 1, room_number: "201", room_name: "Classroom 2A", room_type: "classroom", capacity: 40, floor: 2, is_available: true },
  { room_id: 4, school_id: 1, room_number: "202", room_name: "Classroom 2B", room_type: "classroom", capacity: 40, floor: 2, is_available: true },
  { room_id: 5, school_id: 1, room_number: "301", room_name: "Physics Lab", room_type: "lab", capacity: 30, floor: 3, is_available: true },
  { room_id: 6, school_id: 1, room_number: "302", room_name: "Chemistry Lab", room_type: "lab", capacity: 30, floor: 3, is_available: true },
  { room_id: 7, school_id: 1, room_number: "303", room_name: "Biology Lab", room_type: "lab", capacity: 30, floor: 3, is_available: true },
  { room_id: 8, school_id: 1, room_number: "304", room_name: "Computer Lab", room_type: "lab", capacity: 40, floor: 3, is_available: true },
  { room_id: 9, school_id: 1, room_number: "401", room_name: "Library", room_type: "library", capacity: 100, floor: 4, is_available: true },
  { room_id: 10, school_id: 1, room_number: "G01", room_name: "Auditorium", room_type: "auditorium", capacity: 300, floor: 0, is_available: true },
];

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTeachers(schoolId?: number): Promise<TeacherData[]> {
  await simulateDelay(250);

  let filtered = [...MOCK_TEACHERS];

  if (schoolId) {
    filtered = filtered.filter(t => t.school_id === schoolId);
  }

  console.log(`[MOCK TEACHERS] getTeachers → ${filtered.length} teachers`);
  return filtered;
}

export async function getSubjects(params?: { school_id?: number; class_id?: number }): Promise<SubjectData[]> {
  await simulateDelay(200);

  let filtered = [...MOCK_SUBJECTS];

  if (params?.school_id) {
    filtered = filtered.filter(s => s.school_id === params.school_id);
  }

  console.log(`[MOCK SUBJECTS] getSubjects → ${filtered.length} subjects`);
  return filtered;
}

export async function getRooms(schoolId?: number): Promise<RoomData[]> {
  await simulateDelay(200);

  let filtered = [...MOCK_ROOMS];

  if (schoolId) {
    filtered = filtered.filter(r => r.school_id === schoolId);
  }

  console.log(`[MOCK ROOMS] getRooms → ${filtered.length} rooms`);
  return filtered;
}

export const mockTeachersProvider = {
  getTeachers,
  allTeachers: MOCK_TEACHERS,
};

export const mockSubjectsProvider = {
  getSubjects,
  allSubjects: MOCK_SUBJECTS,
};

export const mockRoomsProvider = {
  getRooms,
  allRooms: MOCK_ROOMS,
};

// ============================================================================
// NEW TEACHER API FUNCTIONS (Enhanced Schema)
// ============================================================================

let enhancedTeacherCache: Teacher[] | null = null;
let teacherAssignmentsCache: TeacherSubjectAssignment[] | null = null;

function convertToEnhancedTeacher(oldTeacher: TeacherData): Teacher {
  const experienceYears = Math.floor(
    (new Date().getTime() - new Date(oldTeacher.date_of_joining).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  // Map old teacher to subject assignments
  const subjectName = oldTeacher.specialization || "General";
  const subjects = [subjectName];

  // Generate realistic class assignments (1-3 classes per teacher)
  const numClasses = Math.floor(Math.random() * 3) + 1;
  const classes: string[] = [];
  for (let i = 0; i < numClasses; i++) {
    const classNum = Math.floor(Math.random() * 10) + 1;
    classes.push(`Class ${classNum}`);
  }

  return {
    teacher_id: oldTeacher.teacher_id,
    user_id: parseInt(oldTeacher.user_id.split('-')[1] || "0") + 10000,
    school_id: oldTeacher.school_id,
    employee_code: oldTeacher.employee_id,
    full_name: `${oldTeacher.first_name} ${oldTeacher.last_name}`,
    email: oldTeacher.email,
    phone: oldTeacher.phone,
    gender: Math.random() > 0.5 ? "Female" : "Male",
    address: `Delhi, India`,
    joining_date: oldTeacher.date_of_joining,
    employment_status_id: oldTeacher.is_active ? 1 : 2,
    employment_status: oldTeacher.is_active ? "Active" : "On Leave",
    subjects,
    classes,
    qualifications: [oldTeacher.qualification],
    experience_years: experienceYears,
    is_active: oldTeacher.is_active,
    created_at: oldTeacher.created_at,
  };
}

function initializeEnhancedTeachers() {
  if (enhancedTeacherCache) return;

  enhancedTeacherCache = MOCK_TEACHERS.map(convertToEnhancedTeacher);

  // Generate teacher assignments
  teacherAssignmentsCache = [];
  enhancedTeacherCache.forEach((teacher) => {
    teacher.subjects?.forEach((subject, subIdx) => {
      teacher.classes?.forEach((className, classIdx) => {
        const classId = parseInt(className.replace("Class ", ""));
        const subjectId = MOCK_SUBJECTS.findIndex((s) => s.subject_name === subject) + 1;

        teacherAssignmentsCache!.push({
          assignment_id: teacher.teacher_id * 100 + subIdx * 10 + classIdx,
          teacher_id: teacher.teacher_id,
          teacher_name: teacher.full_name,
          subject_id: subjectId || 1,
          subject_name: subject,
          class_id: classId,
          class_name: className,
          section: ["A", "B", "C"][Math.floor(Math.random() * 3)],
          academic_year_id: 1,
        });
      });
    });
  });

  console.log(`[MOCK TEACHERS] Enhanced: ${enhancedTeacherCache.length} teachers, ${teacherAssignmentsCache.length} assignments`);
}

export async function getMockEnhancedTeachers(schoolId: number): Promise<Teacher[]> {
  initializeEnhancedTeachers();
  await simulateDelay();

  return enhancedTeacherCache!.filter((t) => t.school_id === schoolId);
}

export async function getMockTeacherById(teacherId: number): Promise<Teacher | null> {
  initializeEnhancedTeachers();
  await simulateDelay();

  return enhancedTeacherCache!.find((t) => t.teacher_id === teacherId) || null;
}

export async function getMockTeacherQualifications(
  teacherId: number
): Promise<TeacherQualification | null> {
  initializeEnhancedTeachers();
  await simulateDelay();

  const teacher = enhancedTeacherCache!.find((t) => t.teacher_id === teacherId);
  if (!teacher) return null;

  return {
    teacher_id: teacherId,
    qualifications: teacher.qualifications || [],
    certifications: ["CTET", "State TET"],
    experience_years: teacher.experience_years,
    specializations: teacher.subjects,
    previous_institutions: ["Delhi Public School", "Modern School"],
  };
}

export async function getMockTeacherAssignments(
  teacherId?: number
): Promise<TeacherSubjectAssignment[]> {
  initializeEnhancedTeachers();
  await simulateDelay();

  if (teacherId) {
    return teacherAssignmentsCache!.filter((a) => a.teacher_id === teacherId);
  }

  return teacherAssignmentsCache!;
}

export async function getMockTeacherKpi(schoolId: number): Promise<TeacherKpi> {
  initializeEnhancedTeachers();
  await simulateDelay();

  const teachers = enhancedTeacherCache!.filter((t) => t.school_id === schoolId);
  const activeTeachers = teachers.filter((t) => t.is_active && t.employment_status === "Active");
  const onLeave = teachers.filter((t) => t.employment_status === "On Leave");
  const unassigned = teachers.filter((t) => {
    const assignments = teacherAssignmentsCache!.filter((a) => a.teacher_id === t.teacher_id);
    return assignments.length === 0;
  });

  const avgExperience = teachers.reduce((sum, t) => sum + (t.experience_years || 0), 0) / teachers.length;
  const allSubjects = new Set<string>();
  teachers.forEach((t) => {
    t.subjects?.forEach((s) => allSubjects.add(s));
  });

  return {
    total_teachers: teachers.length,
    active_teachers: activeTeachers.length,
    on_leave: onLeave.length,
    unassigned_teachers: unassigned.length,
    avg_experience_years: Math.round(avgExperience),
    subjects_covered: allSubjects.size,
  };
}

export const mockTeacherProvider = {
  getTeachers: getMockEnhancedTeachers,
  getTeacherById: getMockTeacherById,
  getTeacherQualifications: getMockTeacherQualifications,
  getTeacherAssignments: getMockTeacherAssignments,
  getTeacherKpi: getMockTeacherKpi,
};
