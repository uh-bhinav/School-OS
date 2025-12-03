// ============================================================================
// MOCK STAFF ATTENDANCE DATA PROVIDER
// ============================================================================

import type { StaffAttendance, StaffAttendanceCreate } from "../services/hr.schema";
import { MOCK_STAFF } from "./mockStaff";

// Helper to generate attendance for multiple days
function generateAttendanceHistory(): StaffAttendance[] {
  const attendance: StaffAttendance[] = [];
  const today = new Date();
  let id = 1;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    MOCK_STAFF.forEach((staff) => {
      // Skip weekends (Saturday=6, Sunday=0)
      if (date.getDay() === 0 || date.getDay() === 6) return;

      // Simulate different attendance scenarios
      const rand = Math.random();
      let status: "Present" | "Absent" | "Half Day" | "Late Arrival" | "Early Departure" | "On Leave";

      if (rand < 0.7) {
        status = "Present";
      } else if (rand < 0.8) {
        status = "Absent";
      } else if (rand < 0.85) {
        status = "Half Day";
      } else if (rand < 0.9) {
        status = "Late Arrival";
      } else if (rand < 0.95) {
        status = "Early Departure";
      } else {
        status = "On Leave";
      }

      attendance.push({
        attendance_id: id++,
        staff_id: staff.staff_id,
        employee_id: staff.employee_id,
        staff_name: staff.full_name,
        date: dateStr,
        status,
        check_in_time:
          status === "Present" || status === "Late Arrival"
            ? `${9 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)
                .toString()
                .padStart(2, "0")}`
            : undefined,
        check_out_time:
          status === "Present" || status === "Early Departure"
            ? `${17 + Math.floor(Math.random() * 1)}:${Math.floor(Math.random() * 60)
                .toString()
                .padStart(2, "0")}`
            : undefined,
        remarks: status === "On Leave" ? "Annual Leave" : status === "Absent" ? "Sick" : undefined,
        department_id: staff.department_id,
        marked_by: "System",
        marked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    });
  }

  return attendance;
}

let MOCK_ATTENDANCE: StaffAttendance[] = generateAttendanceHistory();

/**
 * Mock Staff Attendance Data Provider
 */
export const mockStaffAttendanceProvider = {
  async getAll(): Promise<StaffAttendance[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_ATTENDANCE]), 500);
    });
  },

  async getForDate(date: string): Promise<StaffAttendance[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = MOCK_ATTENDANCE.filter((a) => a.date === date);
        resolve(records);
      }, 400);
    });
  },

  async getForStaff(staffId: number, fromDate?: string, toDate?: string): Promise<StaffAttendance[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let records = MOCK_ATTENDANCE.filter((a) => a.staff_id === staffId);
        if (fromDate) {
          records = records.filter((a) => a.date >= fromDate);
        }
        if (toDate) {
          records = records.filter((a) => a.date <= toDate);
        }
        resolve(records);
      }, 400);
    });
  },

  async getForDepartment(departmentId: number, date: string): Promise<StaffAttendance[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = MOCK_ATTENDANCE.filter((a) => a.date === date && a.department_id === departmentId);
        resolve(records);
      }, 400);
    });
  },

  async create(payload: StaffAttendanceCreate): Promise<StaffAttendance> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const staff = MOCK_STAFF.find((s) => s.staff_id === payload.staff_id);
        if (!staff) throw new Error("Staff not found");

        const newAttendance: StaffAttendance = {
          attendance_id: Math.max(...MOCK_ATTENDANCE.map((a) => a.attendance_id), 0) + 1,
          employee_id: staff.employee_id,
          staff_name: staff.full_name,
          department_id: staff.department_id,
          marked_by: "Admin",
          marked_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          ...payload,
        };
        MOCK_ATTENDANCE.push(newAttendance);
        resolve(newAttendance);
      }, 400);
    });
  },

  async update(attendanceId: number, patch: Partial<StaffAttendanceCreate>): Promise<StaffAttendance> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_ATTENDANCE.findIndex((a) => a.attendance_id === attendanceId);
        if (idx < 0) throw new Error("Attendance record not found");
        MOCK_ATTENDANCE[idx] = {
          ...MOCK_ATTENDANCE[idx],
          ...patch,
        };
        resolve(MOCK_ATTENDANCE[idx]);
      }, 300);
    });
  },

  async delete(attendanceId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_ATTENDANCE.findIndex((a) => a.attendance_id === attendanceId);
        if (idx >= 0) {
          MOCK_ATTENDANCE.splice(idx, 1);
        }
        resolve();
      }, 300);
    });
  },

  async getStats(date: string): Promise<{
    total: number;
    present: number;
    absent: number;
    half_day: number;
    on_leave: number;
    late_arrival: number;
    early_departure: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const records = MOCK_ATTENDANCE.filter((a) => a.date === date);
        resolve({
          total: records.length,
          present: records.filter((a) => a.status === "Present").length,
          absent: records.filter((a) => a.status === "Absent").length,
          half_day: records.filter((a) => a.status === "Half Day").length,
          on_leave: records.filter((a) => a.status === "On Leave").length,
          late_arrival: records.filter((a) => a.status === "Late Arrival").length,
          early_departure: records.filter((a) => a.status === "Early Departure").length,
        });
      }, 300);
    });
  },
};
