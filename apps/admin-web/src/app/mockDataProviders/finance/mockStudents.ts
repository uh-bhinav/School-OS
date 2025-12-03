// ============================================================================
// MOCK STUDENTS DATA FOR FINANCE MODULE
// ============================================================================

import type { StudentInfo } from '../../services/finance/types';
import { MOCK_CLASSES } from './mockClasses';

// Generate realistic Indian names
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharva', 'Advait', 'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Pranav', 'Arnav', 'Rudra',
  'Ananya', 'Aadhya', 'Saanvi', 'Aanya', 'Pari', 'Diya', 'Myra', 'Sara', 'Isha', 'Kavya',
  'Navya', 'Anika', 'Pihu', 'Avni', 'Riya', 'Shreya', 'Tanvi', 'Nisha', 'Priya', 'Kiara',
  'Rohan', 'Vikram', 'Karan', 'Amit', 'Rahul', 'Nikhil', 'Mohit', 'Sahil', 'Varun', 'Ankit',
  'Pooja', 'Neha', 'Anjali', 'Deepika', 'Kritika', 'Mansi', 'Divya', 'Kriti', 'Sneha', 'Aditi'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Reddy', 'Iyer', 'Nair', 'Menon',
  'Rao', 'Joshi', 'Das', 'Pillai', 'Kapoor', 'Malhotra', 'Saxena', 'Bose', 'Chatterjee', 'Mukherjee',
  'Deshmukh', 'Kulkarni', 'Jain', 'Agarwal', 'Bansal', 'Mehta', 'Shah', 'Thakur', 'Dubey', 'Pandey'
];

// Generate students for all classes
function generateStudents(): StudentInfo[] {
  const students: StudentInfo[] = [];
  let studentId = 1001;

  MOCK_CLASSES.forEach((classInfo) => {
    for (let i = 0; i < classInfo.student_count; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const rollNo = String(i + 1).padStart(2, '0');

      students.push({
        student_id: studentId,
        student_name: `${firstName} ${lastName}`,
        roll_no: rollNo,
        class_id: classInfo.class_id,
        class_name: classInfo.class_name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentId}@school.edu`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      });

      studentId++;
    }
  });

  return students;
}

export const MOCK_STUDENTS: StudentInfo[] = generateStudents();

export function getStudentById(studentId: number): StudentInfo | undefined {
  return MOCK_STUDENTS.find(s => s.student_id === studentId);
}

export function getStudentsByClass(classId: number): StudentInfo[] {
  return MOCK_STUDENTS.filter(s => s.class_id === classId);
}

export function searchStudents(query: string): StudentInfo[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_STUDENTS.filter(s =>
    s.student_name.toLowerCase().includes(lowerQuery) ||
    s.roll_no.includes(query) ||
    s.student_id.toString().includes(query)
  ).slice(0, 50);
}

export function getAllStudents(): StudentInfo[] {
  return [...MOCK_STUDENTS];
}

console.log(`[MOCK FINANCE STUDENTS] Generated ${MOCK_STUDENTS.length} students`);
