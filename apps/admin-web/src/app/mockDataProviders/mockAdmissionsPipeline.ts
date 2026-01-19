import type { AdmissionLead, LeadTimeline, LeadDocument, PaymentRecord } from '../types/admissions.types';

let mockLeads: AdmissionLead[] = [
  {
    id: '1',
    student_name: 'Aarav Patel',
    parent_name: 'Mr. Rajesh Patel',
    mother_name: 'Mrs. Priya Patel',
    contact: '+91 98765 43210',
    email: 'rajesh.patel@email.com',
    grade_applying: 'Grade 5',
    previous_school: 'Delhi Public School',
    source: 'website',
    score: 'hot',
    status: 'enquiry',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    father_occupation: 'Software Engineer',
    mother_occupation: 'Teacher',
    annual_income: '15-20',
  },
  {
    id: '2',
    student_name: 'Diya Sharma',
    parent_name: 'Mrs. Sunita Sharma',
    contact: '+91 98765 43211',
    email: 'sunita.sharma@email.com',
    grade_applying: 'Grade 3',
    source: 'walk_in',
    score: 'warm',
    status: 'enquiry',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    student_name: 'Rohan Kumar',
    parent_name: 'Mr. Amit Kumar',
    contact: '+91 98765 43212',
    email: 'amit.kumar@email.com',
    grade_applying: 'Grade 7',
    source: 'phone',
    score: 'hot',
    status: 'enquiry',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    student_name: 'Ananya Singh',
    parent_name: 'Mrs. Vikram Singh',
    contact: '+91 98765 43213',
    email: 'vikram.singh@email.com',
    grade_applying: 'Grade 1',
    source: 'referral',
    score: 'cold',
    status: 'formSold',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    student_name: 'Arjun Reddy',
    parent_name: 'Mr. Reddy',
    contact: '+91 98765 43214',
    email: 'reddy@email.com',
    grade_applying: 'Grade 6',
    source: 'website',
    score: 'warm',
    status: 'formSold',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    student_name: 'Isha Gupta',
    parent_name: 'Mrs. Ravi Gupta',
    contact: '+91 98765 43215',
    email: 'ravi.gupta@email.com',
    grade_applying: 'Grade 4',
    source: 'walk_in',
    score: 'hot',
    status: 'assessment',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    student_name: 'Vivaan Mehta',
    parent_name: 'Mr. Mehta',
    contact: '+91 98765 43216',
    email: 'mehta@email.com',
    grade_applying: 'Grade 2',
    source: 'social_media',
    score: 'warm',
    status: 'assessment',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    student_name: 'Anika Verma',
    parent_name: 'Mrs. Verma',
    contact: '+91 98765 43217',
    email: 'verma@email.com',
    grade_applying: 'Grade 8',
    source: 'referral',
    score: 'hot',
    status: 'cleared',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    student_name: 'Kabir Joshi',
    parent_name: 'Mr. Joshi',
    contact: '+91 98765 43218',
    email: 'joshi@email.com',
    grade_applying: 'Grade 5',
    source: 'website',
    score: 'warm',
    status: 'provisional',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    student_name: 'Sara Khan',
    parent_name: 'Mrs. Khan',
    contact: '+91 98765 43219',
    email: 'khan@email.com',
    grade_applying: 'Grade 3',
    source: 'walk_in',
    score: 'hot',
    status: 'provisional',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let mockTimelines: LeadTimeline[] = [
  {
    id: '1',
    lead_id: '1',
    event: 'Enquiry Received',
    event_type: 'default',
    source: 'Website Form',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    lead_id: '1',
    event: 'Welcome SMS Sent',
    event_type: 'info',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let mockDocuments: LeadDocument[] = [
  { id: '1', lead_id: '1', name: 'Birth Certificate', status: 'uploaded', uploaded_at: new Date().toISOString() },
  { id: '2', lead_id: '1', name: 'Previous School TC', status: 'pending' },
  { id: '3', lead_id: '1', name: 'Medical Records', status: 'uploaded', uploaded_at: new Date().toISOString() },
];

export const mockAdmissionsPipelineProvider = {
  getLeads(): AdmissionLead[] {
    return [...mockLeads].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getLead(id: string): AdmissionLead | undefined {
    return mockLeads.find(lead => lead.id === id);
  },

  updateLeadStatus(leadId: string, status: AdmissionLead['status']): AdmissionLead {
    const leadIndex = mockLeads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) throw new Error('Lead not found');

    mockLeads[leadIndex] = { ...mockLeads[leadIndex], status };

    // Add timeline entry
    mockTimelines.push({
      id: `timeline-${Date.now()}`,
      lead_id: leadId,
      event: `Moved to ${status}`,
      event_type: 'info',
      created_at: new Date().toISOString(),
    });

    return mockLeads[leadIndex];
  },

  getLeadTimeline(leadId: string): LeadTimeline[] {
    return mockTimelines
      .filter(t => t.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getLeadDocuments(leadId: string): LeadDocument[] {
    return mockDocuments.filter(d => d.lead_id === leadId);
  },

  recordPayment(data: Omit<PaymentRecord, 'id' | 'created_at'>): PaymentRecord {
    const payment: PaymentRecord = {
      ...data,
      id: `payment-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Update lead status to formSold
    this.updateLeadStatus(data.lead_id, 'formSold');

    return payment;
  },

  createLead(data: Partial<AdmissionLead>): AdmissionLead {
    const newLead: AdmissionLead = {
      id: `lead-${Date.now()}`,
      student_name: data.student_name || '',
      parent_name: data.parent_name || '',
      contact: data.contact || '',
      email: data.email || '',
      grade_applying: data.grade_applying || '',
      source: data.source || 'website',
      score: data.score || 'warm',
      status: 'enquiry',
      created_at: new Date().toISOString(),
      ...data,
    };

    mockLeads = [newLead, ...mockLeads];

    // Add timeline entry
    mockTimelines.push({
      id: `timeline-${Date.now()}`,
      lead_id: newLead.id,
      event: 'Enquiry Received',
      event_type: 'default',
      source: newLead.source,
      created_at: new Date().toISOString(),
    });

    return newLead;
  },
};
