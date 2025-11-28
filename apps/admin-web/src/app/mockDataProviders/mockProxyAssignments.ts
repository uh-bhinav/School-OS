// ============================================================================
// MOCK PROXY ASSIGNMENTS DATA PROVIDER
// ============================================================================

import type {
  ProxyAssignment,
  ProxyAssignmentCreate,
} from "../services/hr.schema";
import { MOCK_STAFF } from "./mockStaff";

export const MOCK_PROXY_ASSIGNMENTS: ProxyAssignment[] = [
  {
    proxy_id: 1,
    leave_request_id: 1,
    absent_staff_id: 2,
    absent_staff_name: "Priya Sharma",
    proxy_staff_id: 3,
    proxy_staff_name: "Anjali Patel",
    from_date: "2025-12-01",
    to_date: "2025-12-03",
    periods: ["1", "2", "3"],
    status: "Accepted",
    remarks: "Covering Mathematics classes",
    created_at: "2025-11-20T10:30:00Z",
  },
  {
    proxy_id: 2,
    leave_request_id: 2,
    absent_staff_id: 7,
    absent_staff_name: "Meera Desai",
    proxy_staff_id: 1,
    proxy_staff_name: "Rajesh Kumar",
    from_date: "2025-11-25",
    to_date: "2025-11-27",
    periods: ["1", "2"],
    status: "Pending",
    remarks: "Coordination role",
    created_at: "2025-11-21T14:00:00Z",
  },
];

/**
 * Mock Proxy Assignments Data Provider
 */
export const mockProxyAssignmentsProvider = {
  async getAll(): Promise<ProxyAssignment[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_PROXY_ASSIGNMENTS]), 500);
    });
  },

  async getById(proxyId: number): Promise<ProxyAssignment | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const proxy = MOCK_PROXY_ASSIGNMENTS.find((p) => p.proxy_id === proxyId);
        resolve(proxy || null);
      }, 300);
    });
  },

  async getByLeaveRequest(leaveRequestId: number): Promise<ProxyAssignment[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const proxies = MOCK_PROXY_ASSIGNMENTS.filter(
          (p) => p.leave_request_id === leaveRequestId
        );
        resolve(proxies);
      }, 400);
    });
  },

  async getByStaff(staffId: number): Promise<ProxyAssignment[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const proxies = MOCK_PROXY_ASSIGNMENTS.filter(
          (p) => p.proxy_staff_id === staffId || p.absent_staff_id === staffId
        );
        resolve(proxies);
      }, 400);
    });
  },

  async create(payload: ProxyAssignmentCreate): Promise<ProxyAssignment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const absentStaff = MOCK_STAFF.find((s) => s.staff_id === payload.absent_staff_id);
        const proxyStaff = MOCK_STAFF.find((s) => s.staff_id === payload.proxy_staff_id);

        if (!absentStaff || !proxyStaff) throw new Error("Staff not found");

        // For demo, generate dates from leave request data
        const today = new Date();
        const fromDate = today.toISOString().split("T")[0];
        const toDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const newProxy: ProxyAssignment = {
          proxy_id: Math.max(...MOCK_PROXY_ASSIGNMENTS.map((p) => p.proxy_id), 0) + 1,
          absent_staff_name: absentStaff.full_name,
          proxy_staff_name: proxyStaff.full_name,
          from_date: fromDate,
          to_date: toDate,
          status: "Pending",
          created_at: new Date().toISOString(),
          ...payload,
        };
        MOCK_PROXY_ASSIGNMENTS.push(newProxy);
        resolve(newProxy);
      }, 400);
    });
  },

  async update(proxyId: number, patch: Partial<ProxyAssignmentCreate>): Promise<ProxyAssignment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const proxy = MOCK_PROXY_ASSIGNMENTS.find((p) => p.proxy_id === proxyId);
        if (!proxy) throw new Error("Proxy assignment not found");
        Object.assign(proxy, patch);
        resolve(proxy);
      }, 300);
    });
  },

  async accept(proxyId: number): Promise<ProxyAssignment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const proxy = MOCK_PROXY_ASSIGNMENTS.find((p) => p.proxy_id === proxyId);
        if (!proxy) throw new Error("Proxy assignment not found");
        proxy.status = "Accepted";
        resolve(proxy);
      }, 300);
    });
  },

  async decline(proxyId: number): Promise<ProxyAssignment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const proxy = MOCK_PROXY_ASSIGNMENTS.find((p) => p.proxy_id === proxyId);
        if (!proxy) throw new Error("Proxy assignment not found");
        proxy.status = "Declined";
        resolve(proxy);
      }, 300);
    });
  },

  async delete(proxyId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_PROXY_ASSIGNMENTS.findIndex((p) => p.proxy_id === proxyId);
        if (idx >= 0) {
          MOCK_PROXY_ASSIGNMENTS.splice(idx, 1);
        }
        resolve();
      }, 300);
    });
  },

  /**
   * Get suggestions for proxy teachers for a given absent staff
   */
  async getProxySuggestions(
    absentStaffId: number,
    fromDate: string,
    toDate: string
  ): Promise<ProxyAssignment[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo, suggest all active teachers of the same department
        const absentStaff = MOCK_STAFF.find((s) => s.staff_id === absentStaffId);
        if (!absentStaff) throw new Error("Staff not found");

        const suggestions = MOCK_PROXY_ASSIGNMENTS.filter(
          (p) =>
            p.absent_staff_id === absentStaffId &&
            p.from_date === fromDate &&
            p.to_date === toDate
        );

        resolve(suggestions);
      }, 400);
    });
  },
};
