/**
 * Teachers API Service
 * Provides teacher management functions with demo mode support
 */

import type { Teacher, TeacherKpi } from './teacher.schema';
import { MOCK_TEACHERS } from '../mockDataProviders/mockTeachers';

/**
 * Check if demo mode is enabled
 */
function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

/**
 * Convert old teacher format to new Teacher schema
 */
function convertTeacher(old: any): Teacher {
  const experienceYears = Math.floor(
    (new Date().getTime() - new Date(old.date_of_joining).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const subjects = [old.specialization || "General"];
  const numClasses = Math.floor(Math.random() * 3) + 1;
  const classes: string[] = [];
  for (let i = 0; i < numClasses; i++) {
    const classNum = Math.floor(Math.random() * 10) + 1;
    classes.push(`Class ${classNum}`);
  }

  return {
    teacher_id: old.teacher_id,
    user_id: parseInt(old.user_id.split('-')[1] || "0") + 10000,
    school_id: old.school_id,
    employee_code: old.employee_id,
    full_name: `${old.first_name} ${old.last_name}`,
    email: old.email,
    phone: old.phone,
    gender: Math.random() > 0.5 ? "Female" : "Male",
    address: `Delhi, India`,
    joining_date: old.date_of_joining,
    employment_status_id: old.is_active ? 1 : 2,
    employment_status: old.is_active ? "Active" : "On Leave",
    subjects,
    classes,
    qualifications: [old.qualification],
    experience_years: experienceYears,
    is_active: old.is_active,
    created_at: old.created_at,
  };
}

/**
 * Get all teachers
 */
export function getTeachers(): Teacher[] {
  if (isDemoMode()) {
    return MOCK_TEACHERS.map(convertTeacher);
  }
  // TODO: Add real API call when backend is ready
  throw new Error('Real API not implemented yet');
}

/**
 * Get teacher KPIs
 */
export function getTeacherKPI(): TeacherKpi {
  if (isDemoMode()) {
    const teachers = getTeachers();
    const active = teachers.filter(t => t.employment_status === 'Active');
    const onLeave = teachers.filter(t => t.employment_status === 'On Leave');
    const avgExperience = Math.round(
      teachers.reduce((sum, t) => sum + (t.experience_years || 0), 0) / teachers.length
    );
    const allSubjects = new Set(teachers.flatMap(t => t.subjects || []));

    return {
      total_teachers: teachers.length,
      active_teachers: active.length,
      on_leave: onLeave.length,
      unassigned_teachers: 0,
      avg_experience_years: avgExperience,
      subjects_covered: allSubjects.size,
    };
  }
  // TODO: Add real API call when backend is ready
  throw new Error('Real API not implemented yet');
}
