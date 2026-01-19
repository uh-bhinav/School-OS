export interface AdmissionLead {
    id: string;
    student_name: string;
    parent_name: string;
    contact: string;
    email?: string;
    grade_applying: string;
    source: 'walk_in' | 'phone' | 'website' | 'referral' | 'event';
    status: 'new' | 'contacted' | 'scheduled' | 'visited' | 'enrolled' | 'lost';
    score: 'hot' | 'warm' | 'cold';
    created_at: string;
    last_contact?: string;
    next_follow_up?: string;
    notes?: string;
    assigned_to?: string;
    interaction_history: InteractionLog[];
  }

  export interface InteractionLog {
    id: string;
    type: 'call' | 'visit' | 'email' | 'sms';
    date: string;
    summary: string;
    outcome?: string;
    by: string;
  }

  export interface LeadStats {
    total_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    conversion_rate: number;
    follow_ups_due_today: number;
  }

  const mockLeads: AdmissionLead[] = [
    {
      id: 'LEAD-001',
      student_name: 'Aarav Patel',
      parent_name: 'Mr. Rajesh Patel',
      contact: '+91 98765 11111',
      email: 'rajesh.patel@email.com',
      grade_applying: 'Grade 10',
      source: 'walk_in',
      status: 'visited',
      score: 'hot',
      created_at: '2025-11-23T10:00:00',
      last_contact: '2025-11-25T14:30:00',
      next_follow_up: '2025-11-27T10:00:00',
      notes: 'Very interested. Moving from another city. Needs admission urgently.',
      assigned_to: 'Sarah Johnson',
      interaction_history: [
        {
          id: 'INT-001',
          type: 'visit',
          date: '2025-11-23T10:00:00',
          summary: 'Initial visit. Showed campus. Explained curriculum.',
          outcome: 'Positive - will visit again with spouse',
          by: 'Sarah Johnson',
        },
        {
          id: 'INT-002',
          type: 'call',
          date: '2025-11-25T14:30:00',
          summary: 'Follow-up call. Answered fee structure questions.',
          outcome: 'Very interested. Scheduled second visit.',
          by: 'Sarah Johnson',
        },
      ],
    },
    {
      id: 'LEAD-002',
      student_name: 'Diya Sharma',
      parent_name: 'Mrs. Priya Sharma',
      contact: '+91 98765 22222',
      grade_applying: 'Grade 5',
      source: 'phone',
      status: 'contacted',
      score: 'warm',
      created_at: '2025-11-24T11:30:00',
      last_contact: '2025-11-24T11:45:00',
      next_follow_up: '2025-11-26T15:00:00',
      notes: 'Comparing with 2 other schools. Price sensitive.',
      assigned_to: 'Sarah Johnson',
      interaction_history: [
        {
          id: 'INT-003',
          type: 'call',
          date: '2025-11-24T11:45:00',
          summary: 'Initial enquiry call. Explained admission process.',
          outcome: 'Interested but needs to discuss with husband',
          by: 'Sarah Johnson',
        },
      ],
    },
  ];

  const mockStats: LeadStats = {
    total_leads: 24,
    hot_leads: 7,
    warm_leads: 12,
    cold_leads: 5,
    conversion_rate: 28.5,
    follow_ups_due_today: 3,
  };

  export class MockAdmissionsProvider {
    async getLeads(filters?: { status?: string; score?: string }): Promise<AdmissionLead[]> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = mockLeads;
      if (filters?.status) {
        filtered = filtered.filter((l) => l.status === filters.status);
      }
      if (filters?.score) {
        filtered = filtered.filter((l) => l.score === filters.score);
      }
      return filtered;
    }

    async getLeadStats(): Promise<LeadStats> {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockStats;
    }

    async captureLead(lead: Partial<AdmissionLead>): Promise<AdmissionLead> {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newLead: AdmissionLead = {
        id: `LEAD-${String(mockLeads.length + 1).padStart(3, '0')}`,
        student_name: lead.student_name!,
        parent_name: lead.parent_name!,
        contact: lead.contact!,
        email: lead.email,
        grade_applying: lead.grade_applying!,
        source: lead.source!,
        status: 'new',
        score: 'warm',
        created_at: new Date().toISOString(),
        notes: lead.notes,
        assigned_to: 'Sarah Johnson',
        interaction_history: [],
      };
      mockLeads.push(newLead);
      return newLead;
    }

    async updateLeadScore(leadId: string, score: AdmissionLead['score']): Promise<AdmissionLead> {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const lead = mockLeads.find((l) => l.id === leadId);
      if (lead) {
        lead.score = score;
      }
      return lead!;
    }

    async addInteraction(leadId: string, interaction: Partial<InteractionLog>): Promise<AdmissionLead> {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const lead = mockLeads.find((l) => l.id === leadId);
      if (lead) {
        const newInteraction: InteractionLog = {
          id: `INT-${String(lead.interaction_history.length + 1).padStart(3, '0')}`,
          type: interaction.type!,
          date: new Date().toISOString(),
          summary: interaction.summary!,
          outcome: interaction.outcome,
          by: 'Sarah Johnson',
        };
        lead.interaction_history.push(newInteraction);
        lead.last_contact = new Date().toISOString();
      }
      return lead!;
    }
  }

  export const mockAdmissionsProvider = new MockAdmissionsProvider();
