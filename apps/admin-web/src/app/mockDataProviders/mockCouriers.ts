export interface Courier {
    id: string;
    tracking_number: string;
    recipient_name: string;
    recipient_type: 'teacher' | 'student' | 'principal' | 'admin';
    grade?: string;
    courier_company: 'BlueDart' | 'DHL' | 'DTDC' | 'Amazon' | 'Delhivery' | 'FedEx';
    received_time: string;
    delivered_time?: string;
    status: 'pending' | 'delivered' | 'returned';
    notes?: string;
    received_by: string;
    signature_url?: string;
  }

  export interface CourierStats {
    today_received: number;
    pending_delivery: number;
    delivered_today: number;
    this_week_total: number;
    total_week: number;
    avg_delivery_time: string;

  }

  const mockCouriers: Courier[] = [
    {
      id: 'COU-001',
      tracking_number: 'AWB-BD123456789',
      recipient_name: 'Mrs. Gupta (Grade 5A)',
      recipient_type: 'teacher',
      courier_company: 'BlueDart',
      received_time: '2025-11-26T09:30:00',
      status: 'pending',
      received_by: 'Front Office',
      notes: 'Educational materials',
    },
    {
      id: 'COU-002',
      tracking_number: 'AWB-DHL987654321',
      recipient_name: 'Mr. Verma (Science Lab)',
      recipient_type: 'teacher',
      courier_company: 'DHL',
      received_time: '2025-11-26T10:15:00',
      status: 'pending',
      received_by: 'Front Office',
    },
    {
      id: 'COU-003',
      tracking_number: 'AWB-AMZ555444333',
      recipient_name: 'Principal Office',
      recipient_type: 'principal',
      courier_company: 'Amazon',
      received_time: '2025-11-26T11:45:00',
      status: 'pending',
      received_by: 'Front Office',
      notes: 'Urgent - School board documents',
    },
  ];

  const mockStats: CourierStats = {
    today_received: 12,
    pending_delivery: 3,
    delivered_today: 9,
    this_week_total: 45,
    total_week: 7,
    avg_delivery_time: '21 min',
  };

  export class MockCouriersProvider {
    async getCouriers(status?: Courier['status']): Promise<Courier[]> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (status) {
        return mockCouriers.filter((c) => c.status === status);
      }
      return mockCouriers;
    }

    async getCourierStats(): Promise<CourierStats> {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockStats;
    }

    async logCourier(courier: Partial<Courier>): Promise<Courier> {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newCourier: Courier = {
        id: `COU-${String(mockCouriers.length + 1).padStart(3, '0')}`,
        tracking_number: courier.tracking_number!,
        recipient_name: courier.recipient_name!,
        recipient_type: courier.recipient_type!,
        grade: courier.grade,
        courier_company: courier.courier_company!,
        received_time: new Date().toISOString(),
        status: 'pending',
        received_by: 'Front Office',
        notes: courier.notes,
      };
      mockCouriers.push(newCourier);
      return newCourier;
    }

    async markDelivered(courierId: string, signature?: string): Promise<Courier> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const courier = mockCouriers.find((c) => c.id === courierId);
      if (courier) {
        courier.status = 'delivered';
        courier.delivered_time = new Date().toISOString();
        courier.signature_url = signature;
      }
      return courier!;
    }

    async notifyRecipient(courierId: string): Promise<{ sent: boolean; message: string }> {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return {
        sent: true,
        message: 'SMS notification sent successfully',
      };
    }
  }

  export const mockCouriersProvider = new MockCouriersProvider();
