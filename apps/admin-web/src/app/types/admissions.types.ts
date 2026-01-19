export interface AdmissionLead {
    id: string;
    student_name: string;
    parent_name: string;
    mother_name?: string;
    contact: string;
    email: string;
    grade_applying: string;
    previous_school?: string;
    source: 'website' | 'walk_in' | 'phone' | 'referral' | 'social_media';
    score: 'hot' | 'warm' | 'cold';
    status: 'enquiry' | 'formSold' | 'assessment' | 'cleared' | 'provisional' | 'enrolled';
    created_at: string;
    notes?: string;
    father_occupation?: string;
    mother_occupation?: string;
    annual_income?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }

  export interface LeadTimeline {
    id: string;
    lead_id: string;
    event: string;
    event_type: 'success' | 'info' | 'default';
    notes?: string;
    score?: string;
    source?: string;
    created_at: string;
  }

  export interface LeadDocument {
    id: string;
    lead_id: string;
    name: string;
    status: 'uploaded' | 'pending';
    uploaded_at?: string;
  }

  export interface PaymentRecord {
    id: string;
    lead_id: string;
    amount: number;
    payment_mode: 'cash' | 'card' | 'upi' | 'online';
    receipt_number: string;
    created_at: string;
  }
