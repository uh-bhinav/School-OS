// ============================================================================
// CLUB SCHEMAS
// ============================================================================
// Type definitions matching backend endpoints for clubs

export enum ClubType {
  academic = "academic",
  sports = "sports",
  arts = "arts",
  technical = "technical",
  social = "social"
}

export enum MeetingFrequency {
  weekly = "weekly",
  biweekly = "biweekly",
  monthly = "monthly"
}

export enum ClubMembershipRole {
  member = "member",
  secretary = "secretary",
  treasurer = "treasurer",
  president = "president",
  vice_president = "vice_president"
}

export enum ClubMembershipStatus {
  active = "active",
  inactive = "inactive",
  suspended = "suspended",
  alumni = "alumni"
}

export enum ClubActivityType {
  meeting = "meeting",
  workshop = "workshop",
  competition = "competition",
  event = "event",
  project = "project"
}

export enum ClubActivityStatus {
  planned = "planned",
  ongoing = "ongoing",
  completed = "completed",
  cancelled = "cancelled"
}

export interface Club {
  id: number;
  school_id: number;
  academic_year_id: number;
  name: string;
  description?: string;
  club_type: ClubType;
  logo_url?: string;
  meeting_schedule?: any;
  meeting_frequency: MeetingFrequency;
  max_members?: number;
  registration_open: boolean;
  registration_start_date?: string;
  registration_end_date?: string;
  club_rules?: string;
  objectives?: string[];
  teacher_in_charge_id: number;
  assistant_teacher_id?: number;
  current_member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubCreate {
  name: string;
  description?: string;
  club_type: ClubType;
  logo_url?: string;
  meeting_schedule?: any;
  meeting_frequency?: MeetingFrequency;
  max_members?: number;
  registration_open?: boolean;
  registration_start_date?: string;
  registration_end_date?: string;
  club_rules?: string;
  objectives?: string[];
  teacher_in_charge_id: number;
  assistant_teacher_id?: number;
  academic_year_id: number;
}

export interface ClubUpdate {
  name?: string;
  description?: string;
  club_type?: ClubType;
  logo_url?: string;
  meeting_schedule?: any;
  meeting_frequency?: MeetingFrequency;
  max_members?: number;
  registration_open?: boolean;
  registration_start_date?: string;
  registration_end_date?: string;
  club_rules?: string;
  objectives?: string[];
  is_active?: boolean;
  teacher_in_charge_id?: number;
  assistant_teacher_id?: number;
}

export interface ClubMembership {
  id: number;
  club_id: number;
  student_id: number;
  role: ClubMembershipRole;
  status: ClubMembershipStatus;
  contribution_score: number;
  notes?: string;
  approved_by_user_id: string;
  joined_date: string;
  attendance_count: number;
  exit_date?: string;
  exit_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ClubMembershipCreate {
  student_id: number;
  club_id: number;
  role?: ClubMembershipRole;
  status?: ClubMembershipStatus;
}

export interface ClubMembershipUpdate {
  role?: ClubMembershipRole;
  status?: ClubMembershipStatus;
  contribution_score?: number;
  attendance_count?: number;
  notes?: string;
  exit_date?: string;
  exit_reason?: string;
}

export interface ClubActivity {
  id: number;
  club_id: number;
  activity_name: string;
  activity_type: ClubActivityType;
  description?: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  attendance_mandatory: boolean;
  max_participants?: number;
  budget_allocated?: number;
  status: ClubActivityStatus;
  outcome_notes?: string;
  media_urls?: string[];
  organized_by_student_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ClubActivityCreate {
  activity_name: string;
  activity_type: ClubActivityType;
  description?: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  attendance_mandatory?: boolean;
  max_participants?: number;
  budget_allocated?: number;
  status?: ClubActivityStatus;
  outcome_notes?: string;
  media_urls?: string[];
  organized_by_student_id?: number;
}

export interface ClubActivityUpdate {
  activity_name?: string;
  activity_type?: ClubActivityType;
  description?: string;
  scheduled_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  attendance_mandatory?: boolean;
  max_participants?: number;
  budget_allocated?: number;
  status?: ClubActivityStatus;
  outcome_notes?: string;
  media_urls?: string[];
  organized_by_student_id?: number;
}

export interface ClubKpi {
  active_clubs: number;
  total_members: number;
  events_this_month: number;
  avg_members_per_club: number;
  most_active_club: string;
}
