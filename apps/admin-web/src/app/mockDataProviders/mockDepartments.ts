// ============================================================================
// MOCK DEPARTMENTS DATA PROVIDER
// ============================================================================

import type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
} from "../services/hr.schema";

export const MOCK_DEPARTMENTS: Department[] = [
  {
    department_id: 1,
    school_id: 1,
    name: "Administration",
    code: "ADM",
    description: "Administration and Management Department",
    hod_staff_id: 1,
    hod_name: "Rajesh Kumar",
    total_staff: 2,
    present_today: 2,
    on_leave_today: 0,
    absent_today: 0,
    created_at: "2020-01-01T00:00:00Z",
  },
  {
    department_id: 2,
    school_id: 1,
    name: "Mathematics & Science",
    code: "MS",
    description: "Mathematics and Science Department",
    hod_staff_id: 2,
    hod_name: "Priya Sharma",
    total_staff: 3,
    present_today: 2,
    on_leave_today: 1,
    absent_today: 0,
    created_at: "2020-01-02T00:00:00Z",
  },
  {
    department_id: 3,
    school_id: 1,
    name: "Science",
    code: "SCI",
    description: "Science Department - Physics, Chemistry, Biology",
    hod_staff_id: 4,
    hod_name: "Vikram Singh",
    total_staff: 2,
    present_today: 2,
    on_leave_today: 0,
    absent_today: 0,
    created_at: "2020-01-03T00:00:00Z",
  },
  {
    department_id: 4,
    school_id: 1,
    name: "IT & Technology",
    code: "IT",
    description: "Information Technology and Computer Science",
    hod_staff_id: 5,
    hod_name: "Deepa Verma",
    total_staff: 2,
    present_today: 2,
    on_leave_today: 0,
    absent_today: 0,
    created_at: "2020-01-04T00:00:00Z",
  },
  {
    department_id: 5,
    school_id: 1,
    name: "Support Services",
    code: "SUP",
    description: "Support and Administrative Services",
    total_staff: 1,
    present_today: 1,
    on_leave_today: 0,
    absent_today: 0,
    created_at: "2020-01-05T00:00:00Z",
  },
  {
    department_id: 6,
    school_id: 1,
    name: "Languages",
    code: "LANG",
    description: "Languages Department - English, Hindi, Regional Languages",
    total_staff: 1,
    present_today: 1,
    on_leave_today: 0,
    absent_today: 0,
    created_at: "2020-01-06T00:00:00Z",
  },
];

/**
 * Mock Departments Data Provider
 */
export const mockDepartmentsProvider = {
  async getAll(): Promise<Department[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_DEPARTMENTS]), 500);
    });
  },

  async getById(departmentId: number): Promise<Department | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dept = MOCK_DEPARTMENTS.find((d) => d.department_id === departmentId);
        resolve(dept || null);
      }, 300);
    });
  },

  async create(payload: DepartmentCreate): Promise<Department> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDept: Department = {
          department_id: Math.max(...MOCK_DEPARTMENTS.map((d) => d.department_id), 0) + 1,
          school_id: 1,
          total_staff: 0,
          present_today: 0,
          on_leave_today: 0,
          absent_today: 0,
          created_at: new Date().toISOString(),
          ...payload,
        };
        MOCK_DEPARTMENTS.push(newDept);
        resolve(newDept);
      }, 400);
    });
  },

  async update(departmentId: number, payload: DepartmentUpdate): Promise<Department> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_DEPARTMENTS.findIndex((d) => d.department_id === departmentId);
        if (idx < 0) throw new Error("Department not found");
        MOCK_DEPARTMENTS[idx] = {
          ...MOCK_DEPARTMENTS[idx],
          ...payload,
          updated_at: new Date().toISOString(),
        };
        resolve(MOCK_DEPARTMENTS[idx]);
      }, 400);
    });
  },

  async delete(departmentId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_DEPARTMENTS.findIndex((d) => d.department_id === departmentId);
        if (idx >= 0) {
          MOCK_DEPARTMENTS.splice(idx, 1);
        }
        resolve();
      }, 300);
    });
  },

  async assignHOD(departmentId: number, staffId: number): Promise<Department> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dept = MOCK_DEPARTMENTS.find((d) => d.department_id === departmentId);
        if (!dept) throw new Error("Department not found");
        dept.hod_staff_id = staffId;
        dept.updated_at = new Date().toISOString();
        resolve(dept);
      }, 300);
    });
  },
};
