export interface Visitor {
    id: string;
    name: string;
    purpose: 'admission_enquiry' | 'parent_meeting' | 'maintenance' | 'vendor' | 'other';
    contact: string;
    student_name?: string;
    grade?: string;
    check_in_time: string;
    check_out_time?: string;
    staff_met?: string;
    badge_number?: string;
    photo_url?: string;
    notes?: string;
    status: 'checked_in' | 'checked_out' | 'waiting';
  }

  export interface VisitorStats {
    today_total: number;
    currently_live: number;
    waiting_approval: number;
    checked_out_today: number;
    avg_visit_duration: string;
    average_wait_time: number; // minutes
    peak_hours: string[];
  }

  // Mock data for today's visitors
  const mockVisitors: Visitor[] = [
    {
      id: 'VIS-001',
      name: 'Rajesh Kumar',
      purpose: 'admission_enquiry',
      contact: '+91 98765 43210',
      check_in_time: '2025-11-26T09:45:00',
      status: 'checked_in',
      badge_number: 'B-08',
      notes: 'Interested in Grade 5 admission',
    },
    {
      id: 'VIS-002',
      name: 'Priya Sharma',
      purpose: 'parent_meeting',
      contact: '+91 98765 43211',
      student_name: 'Rohan Sharma',
      grade: 'Grade 8A',
      check_in_time: '2025-11-26T10:20:00',
      status: 'checked_in',
      staff_met: 'Ms. Gupta (Class Teacher)',
      badge_number: 'B-12',
    },
    {
      id: 'VIS-003',
      name: 'David Wilson',
      purpose: 'maintenance',
      contact: '+91 98765 43212',
      check_in_time: '2025-11-26T11:00:00',
      status: 'checked_in',
      badge_number: 'B-15',
      notes: 'AC repair in science lab',
    },
  ];

  const mockStats: VisitorStats = {
    today_total: 8,
    currently_live: 3,
    waiting_approval: 0,
    checked_out_today: 2,
    avg_visit_duration: '20 mins',
    average_wait_time: 12,
    peak_hours: ['10:00 AM', '02:00 PM'],
  };

  export class MockVisitorsProvider {
    async getVisitors(status?: Visitor['status']): Promise<Visitor[]> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (status) {
        return mockVisitors.filter((v) => v.status === status);
      }
      return mockVisitors;
    }

    async getVisitorStats(): Promise<VisitorStats> {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockStats;
    }

    async checkIn(visitor: Partial<Visitor>): Promise<Visitor> {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newVisitor: Visitor = {
        id: `VIS-${String(mockVisitors.length + 1).padStart(3, '0')}`,
        name: visitor.name!,
        purpose: visitor.purpose!,
        contact: visitor.contact!,
        student_name: visitor.student_name,
        grade: visitor.grade,
        check_in_time: new Date().toISOString(),
        status: 'checked_in',
        badge_number: `B-${String(mockVisitors.length + 8).padStart(2, '0')}`,
        notes: visitor.notes,
      };
      mockVisitors.push(newVisitor);
      return newVisitor;
    }

    async checkOut(visitorId: string): Promise<Visitor> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const visitor = mockVisitors.find((v) => v.id === visitorId);
      if (visitor) {
        visitor.status = 'checked_out';
        visitor.check_out_time = new Date().toISOString();
      }
      return visitor!;
    }

    async issueGatePass(visitorId: string): Promise<{ qrCode: string; passUrl: string }> {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=VISITOR-${visitorId}&size=200x200`,
        passUrl: `/visitors/${visitorId}/pass`,
      };
    }
  }

  export const mockVisitorsProvider = new MockVisitorsProvider();
