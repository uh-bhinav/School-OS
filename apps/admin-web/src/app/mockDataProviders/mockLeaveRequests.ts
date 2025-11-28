// ============================================================================
// MOCK LEAVE REQUESTS DATA PROVIDER
// ============================================================================

import type {
  LeaveRequest,
  LeaveRequestCreate,
  LeaveStatus,
} from "../services/hr.schema";
import { MOCK_STAFF } from "./mockStaff";

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    leave_id: 1,
    staff_id: 2,
    employee_id: "EMP002",
    staff_name: "Priya Sharma",
    leave_type: "Casual Leave",
    from_date: "2025-12-01",
    to_date: "2025-12-03",
    reason: "Family event",
    status: "Approved",
    approved_by: "Rajesh Kumar",
    approved_at: "2025-11-20T10:30:00Z",
    created_at: "2025-11-19T09:00:00Z",
  },
  {
    leave_id: 2,
    staff_id: 7,
    employee_id: "EMP007",
    staff_name: "Meera Desai",
    leave_type: "Sick Leave",
    from_date: "2025-11-25",
    to_date: "2025-11-27",
    reason: "Health issues",
    status: "Approved",
    approved_by: "Rajesh Kumar",
    approved_at: "2025-11-21T14:00:00Z",
    created_at: "2025-11-21T08:30:00Z",
  },
  {
    leave_id: 3,
    staff_id: 3,
    employee_id: "EMP003",
    staff_name: "Anjali Patel",
    leave_type: "Earned Leave",
    from_date: "2025-12-10",
    to_date: "2025-12-17",
    reason: "Vacation",
    status: "Pending",
    created_at: "2025-11-22T11:00:00Z",
  },
  {
    leave_id: 4,
    staff_id: 4,
    employee_id: "EMP004",
    staff_name: "Vikram Singh",
    leave_type: "Casual Leave",
    from_date: "2025-11-28",
    to_date: "2025-11-28",
    reason: "Personal work",
    status: "Rejected",
    rejection_reason: "Already two leaves in the month",
    created_at: "2025-11-20T10:00:00Z",
  },
  {
    leave_id: 5,
    staff_id: 5,
    employee_id: "EMP005",
    staff_name: "Deepa Verma",
    leave_type: "Casual Leave",
    from_date: "2025-11-30",
    to_date: "2025-11-30",
    reason: "Medical appointment",
    status: "Pending",
    created_at: "2025-11-22T15:30:00Z",
  },
];

/**
 * Mock Leave Requests Data Provider
 */
export const mockLeaveRequestsProvider = {
  async getAll(): Promise<LeaveRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_LEAVE_REQUESTS]), 500);
    });
  },

  async getById(leaveId: number): Promise<LeaveRequest | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const leave = MOCK_LEAVE_REQUESTS.find((l) => l.leave_id === leaveId);
        resolve(leave || null);
      }, 300);
    });
  },

  async getByStaff(staffId: number): Promise<LeaveRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const leaves = MOCK_LEAVE_REQUESTS.filter((l) => l.staff_id === staffId);
        resolve(leaves);
      }, 400);
    });
  },

  async getByStatus(status: LeaveStatus): Promise<LeaveRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const leaves = MOCK_LEAVE_REQUESTS.filter((l) => l.status === status);
        resolve(leaves);
      }, 400);
    });
  },

  async create(payload: LeaveRequestCreate): Promise<LeaveRequest> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const staff = MOCK_STAFF.find((s) => s.staff_id === payload.staff_id);
        if (!staff) throw new Error("Staff not found");

        const newLeave: LeaveRequest = {
          leave_id: Math.max(...MOCK_LEAVE_REQUESTS.map((l) => l.leave_id), 0) + 1,
          employee_id: staff.employee_id,
          staff_name: staff.full_name,
          status: "Pending",
          created_at: new Date().toISOString(),
          ...payload,
        };
        MOCK_LEAVE_REQUESTS.push(newLeave);
        resolve(newLeave);
      }, 400);
    });
  },

  async approve(leaveId: number, approvedBy: string): Promise<LeaveRequest> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const leave = MOCK_LEAVE_REQUESTS.find((l) => l.leave_id === leaveId);
        if (!leave) throw new Error("Leave request not found");
        leave.status = "Approved";
        leave.approved_by = approvedBy;
        leave.approved_at = new Date().toISOString();
        resolve(leave);
      }, 300);
    });
  },

  async reject(leaveId: number, rejectionReason: string): Promise<LeaveRequest> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const leave = MOCK_LEAVE_REQUESTS.find((l) => l.leave_id === leaveId);
        if (!leave) throw new Error("Leave request not found");
        leave.status = "Rejected";
        leave.rejection_reason = rejectionReason;
        resolve(leave);
      }, 300);
    });
  },

  async getPending(): Promise<LeaveRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const pending = MOCK_LEAVE_REQUESTS.filter((l) => l.status === "Pending");
        resolve(pending);
      }, 300);
    });
  },
};
