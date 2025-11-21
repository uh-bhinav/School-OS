// ============================================================================
// MOCK STUDENTS DATA PROVIDER
// ============================================================================

export interface StudentData {
  student_id: number;
  school_id: number;
  class_id: number;
  user_id: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  admission_date: string;
  enrollment_date: string;
  section: string;
  class_name: string;
  email: string;
  phone: string;
  address: string;
  blood_group?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  parent_relation?: string;
  is_active: boolean;
  created_at: string;
}

// Generate realistic student names
const firstNames = {
  Male: [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharva", "Advik", "Pranav", "Reyansh", "Rohan", "Kabir", "Advait", "Ved", "Dhruv",
    "Yug", "Viraj", "Laksh", "Rudra", "Shiv", "Harsh", "Dev", "Aryan", "Kian", "Raghav",
    "Naman", "Shivansh", "Aarush", "Ritvik", "Tejas", "Amit", "Rahul", "Karan", "Vijay", "Raj"
  ],
  Female: [
    "Aadhya", "Ananya", "Pari", "Anika", "Ira", "Diya", "Navya", "Myra", "Sara", "Kiara",
    "Aditi", "Zara", "Anvi", "Riya", "Avni", "Saanvi", "Kavya", "Prisha", "Aarohi", "Shanaya",
    "Tara", "Mishka", "Vanya", "Mira", "Ishita", "Priya", "Sneha", "Pooja", "Neha", "Shreya",
    "Divya", "Anjali", "Meera", "Radha", "Geeta", "Seema", "Maya", "Lata", "Rita", "Nisha"
  ],
};

const lastNames = [
  "Sharma", "Verma", "Patel", "Singh", "Kumar", "Reddy", "Rao", "Joshi", "Nair", "Iyer",
  "Gupta", "Agarwal", "Shah", "Mehta", "Malhotra", "Kapoor", "Chopra", "Bose", "Ghosh", "Sen",
  "Das", "Mukherjee", "Chatterjee", "Banerjee", "Roy", "Dutta", "Sinha", "Jain", "Chawla", "Sethi",
  "Khanna", "Arora", "Bhatia", "Sood", "Tiwari", "Pandey", "Mishra", "Dubey", "Saxena", "Trivedi",
  "Desai", "Thakur", "Kulkarni", "Deshpande", "Patil", "Jadhav", "Naik", "Sawant", "Pillai", "Menon"
];

const parentFirstNames = [
  "Rajesh", "Suresh", "Ramesh", "Mahesh", "Dinesh", "Mukesh", "Prakash", "Ashok", "Vinod", "Manoj",
  "Sunita", "Meena", "Kamala", "Lakshmi", "Savita", "Renuka", "Smita", "Kavita", "Geeta", "Anita",
  "Ravi", "Anil", "Sanjay", "Vijay", "Ajay", "Rakesh", "Deepak", "Naveen", "Pankaj", "Sanjeev"
];

const cities = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Ahmedabad"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function generateStudents(): StudentData[] {
  const students: StudentData[] = [];
  let studentId = 1;

  // Generate students for classes 1-10, sections A and B
  for (let grade = 1; grade <= 10; grade++) {
    for (const section of ["A", "B"]) {
      const classId = (grade - 1) * 2 + (section === "A" ? 1 : 2);
      const numStudents = 35 + Math.floor(Math.random() * 6); // 35-40 students per class

      for (let i = 0; i < numStudents; i++) {
        const gender: "Male" | "Female" = Math.random() > 0.5 ? "Male" : "Female";
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const rollNumber = `${String(i + 1).padStart(2, "0")}`;

        // Generate realistic dates
        const currentYear = 2025;
        const studentAge = 5 + grade; // Class 1 = ~6 years old
        const birthYear = currentYear - studentAge;
        const birthMonth = (studentId % 12) + 1;
        const birthDay = (studentId % 28) + 1;
        const enrollmentYear = birthYear + 5 + (studentId % 3);

        const parentFirstName = parentFirstNames[studentId % parentFirstNames.length];
        const parentRelation = gender === "Male" ? "Father" : "Mother";
        const city = cities[studentId % cities.length];

        students.push({
          student_id: studentId,
          school_id: 1,
          class_id: classId,
          user_id: `student-${studentId}-uuid`,
          admission_no: `ADM${String(studentId).padStart(4, '0')}`,
          first_name: firstName,
          last_name: lastName,
          roll_number: rollNumber,
          date_of_birth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
          gender,
          admission_date: `${enrollmentYear}-04-01`,
          enrollment_date: `${enrollmentYear}-04-01`,
          section,
          class_name: `Grade ${grade}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentId}@school.com`,
          phone: `+91-${9800000000 + studentId}`,
          address: `${studentId}, Model Town, ${city}, India`,
          blood_group: bloodGroups[studentId % bloodGroups.length],
          parent_name: `${parentFirstName} ${lastName}`,
          parent_phone: `+91-${9900000000 + studentId}`,
          parent_email: `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}@parent.com`,
          parent_relation: parentRelation,
          is_active: studentId % 50 !== 0, // ~98% active
          created_at: `${enrollmentYear}-04-01T00:00:00Z`,
        });

        studentId++;
      }
    }
  }

  return students;
}

export const MOCK_STUDENTS = generateStudents();

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStudents(params?: {
  school_id?: number;
  class_id?: number;
  section?: string;
  is_active?: boolean;
}): Promise<StudentData[]> {
  await simulateDelay(300);

  let filtered = [...MOCK_STUDENTS];

  if (params?.school_id) {
    filtered = filtered.filter(s => s.school_id === params.school_id);
  }

  if (params?.class_id) {
    filtered = filtered.filter(s => s.class_id === params.class_id);
  }

  if (params?.section) {
    filtered = filtered.filter(s => s.section === params.section);
  }

  if (params?.is_active !== undefined) {
    filtered = filtered.filter(s => s.is_active === params.is_active);
  }

  console.log(`[MOCK STUDENTS] getStudents → ${filtered.length} students`);
  return filtered;
}

export async function getStudentById(studentId: number): Promise<StudentData | null> {
  await simulateDelay(150);

  const found = MOCK_STUDENTS.find(s => s.student_id === studentId);
  console.log(`[MOCK STUDENTS] getStudentById(${studentId}) →`, found ? "found" : "not found");
  return found || null;
}

export async function getStudentsByClass(classId: number): Promise<StudentData[]> {
  return getStudents({ class_id: classId });
}

export const mockStudentsProvider = {
  getStudents,
  getStudentById,
  getStudentsByClass,
  allStudents: MOCK_STUDENTS,
};
