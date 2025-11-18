// ============================================================================
// MOCK CLUBS DATA PROVIDER
// ============================================================================

import type {
  Club,
  ClubActivity,
  ClubMembership,
  ClubKpi,
} from "../services/club.schema";

import {
  ClubType,
  MeetingFrequency,
  ClubMembershipRole,
  ClubMembershipStatus,
  ClubActivityType,
  ClubActivityStatus,
} from "../services/club.schema";

let mockClubs: Club[] = [];
let mockClubActivities: ClubActivity[] = [];
let mockClubMemberships: ClubMembership[] = [];

function initializeMockClubs() {
  if (mockClubs.length > 0) return;

  const clubConfigs = [
    { name: "Science Club", desc: "Explore scientific experiments and innovation", type: ClubType.academic, objectives: ["Conduct experiments", "Science fair participation", "Lab safety training"] },
    { name: "Math Olympiad Club", desc: "Solve challenging mathematical problems", type: ClubType.academic, objectives: ["Problem solving", "Competition preparation", "Peer tutoring"] },
    { name: "Literary Club", desc: "Enjoy reading, writing, and discussions", type: ClubType.arts, objectives: ["Book discussions", "Creative writing", "Poetry sessions"] },
    { name: "Arts & Crafts Club", desc: "Express creativity through various art forms", type: ClubType.arts, objectives: ["Art exhibitions", "Craft workshops", "Community art projects"] },
    { name: "Basketball Team", desc: "School basketball team", type: ClubType.sports, objectives: ["Inter-school competitions", "Daily practice", "Team building"] },
    { name: "Drama Club", desc: "Explore theater and acting", type: ClubType.arts, objectives: ["Annual play", "Improvisation workshops", "Script writing"] },
    { name: "Robotics Club", desc: "Build and program robots", type: ClubType.technical, objectives: ["Robot competitions", "Arduino projects", "AI workshops"] },
    { name: "Eco Club", desc: "Promote environmental awareness", type: ClubType.social, objectives: ["Tree plantation", "Waste management", "Environmental campaigns"] },
    { name: "Photography Club", desc: "Capture moments through lens", type: ClubType.arts, objectives: ["Photo walks", "Exhibitions", "Photography workshops"] },
    { name: "Debate Society", desc: "Develop critical thinking and public speaking", type: ClubType.academic, objectives: ["Debate competitions", "Public speaking", "Critical analysis"] },
  ];

  const frequencies = [MeetingFrequency.weekly, MeetingFrequency.biweekly, MeetingFrequency.monthly];
  const activityTypes = [ClubActivityType.meeting, ClubActivityType.workshop, ClubActivityType.competition, ClubActivityType.event, ClubActivityType.project];
  const activityStatuses = [ClubActivityStatus.planned, ClubActivityStatus.ongoing, ClubActivityStatus.completed, ClubActivityStatus.cancelled];

  clubConfigs.forEach((clubConfig, index) => {
    const clubId = index + 1;
    const memberCount = Math.floor(Math.random() * 40) + 10;
    const maxMembers = memberCount + Math.floor(Math.random() * 20) + 10;

    mockClubs.push({
      id: clubId,
      school_id: 1,
      academic_year_id: 1,
      name: clubConfig.name,
      description: clubConfig.desc,
      club_type: clubConfig.type,
      logo_url: `/assets/clubs/club-${clubId}.png`,
      meeting_schedule: { day: "Friday", time: "15:00" },
      meeting_frequency: frequencies[index % frequencies.length],
      max_members: maxMembers,
      registration_open: Math.random() > 0.3,
      registration_start_date: "2025-04-01",
      registration_end_date: "2025-04-30",
      club_rules: "Regular attendance required, Active participation expected",
      objectives: clubConfig.objectives,
      teacher_in_charge_id: index + 1,
      assistant_teacher_id: index > 5 ? index : undefined,
      current_member_count: memberCount,
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
      updated_at: "2025-11-01T00:00:00Z",
    });

    // Generate 5-10 activities per club
    const numActivities = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numActivities; i++) {
      const activityDate = new Date(2025, 9 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1);
      const statusIndex = activityDate < new Date() ? 2 : Math.floor(Math.random() * 2); // completed if past, else planned/ongoing

      mockClubActivities.push({
        id: clubId * 100 + i,
        club_id: clubId,
        activity_name: `${clubConfig.name} - ${activityTypes[i % activityTypes.length]} ${i + 1}`,
        activity_type: activityTypes[i % activityTypes.length],
        description: `${activityTypes[i % activityTypes.length]} organized by ${clubConfig.name}`,
        scheduled_date: activityDate.toISOString().split("T")[0],
        start_time: "14:00:00",
        end_time: "16:00:00",
        venue: `Room ${100 + clubId}`,
        attendance_mandatory: Math.random() > 0.5,
        max_participants: Math.floor(memberCount * 0.8),
        budget_allocated: Math.floor(Math.random() * 5000) + 1000,
        status: activityStatuses[statusIndex],
        outcome_notes: statusIndex === 2 ? "Successfully completed with great participation" : undefined,
        media_urls: statusIndex === 2 ? [`/media/activity-${clubId}-${i}.jpg`] : [],
        organized_by_student_id: 1000 + clubId * 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Generate memberships
    const roles = [ClubMembershipRole.president, ClubMembershipRole.vice_president, ClubMembershipRole.secretary, ClubMembershipRole.treasurer, ClubMembershipRole.member];
    for (let i = 0; i < memberCount; i++) {
      const studentId = 1000 + clubId * 100 + i;
      const role = i < 4 ? roles[i] : roles[4];

      mockClubMemberships.push({
        id: clubId * 1000 + i,
        club_id: clubId,
        student_id: studentId,
        role: role,
        status: ClubMembershipStatus.active,
        contribution_score: Math.floor(Math.random() * 100),
        notes: i === 0 ? "Excellent leadership" : undefined,
        approved_by_user_id: "user-1-uuid",
        joined_date: "2025-04-15",
        attendance_count: Math.floor(Math.random() * 20) + 5,
        created_at: "2025-04-15T00:00:00Z",
        updated_at: "2025-11-01T00:00:00Z",
      });
    }
  });

  console.log(`[MOCK CLUBS] Initialized ${mockClubs.length} clubs, ${mockClubActivities.length} activities, ${mockClubMemberships.length} memberships`);
}

export async function getMockClubs(academicYearId: number, isActive = true): Promise<Club[]> {
  initializeMockClubs();
  await simulateDelay();

  return mockClubs.filter((c) => c.academic_year_id === academicYearId && c.is_active === isActive);
}

export async function getMockClubById(clubId: number): Promise<Club | null> {
  initializeMockClubs();
  await simulateDelay();

  return mockClubs.find((c) => c.id === clubId) || null;
}

export async function getMockClubActivities(clubId?: number): Promise<ClubActivity[]> {
  initializeMockClubs();
  await simulateDelay();

  if (clubId) {
    return mockClubActivities.filter((a) => a.club_id === clubId);
  }

  return mockClubActivities;
}

export async function getMockClubMemberships(clubId: number): Promise<ClubMembership[]> {
  initializeMockClubs();
  await simulateDelay();

  return mockClubMemberships.filter((m) => m.club_id === clubId);
}

export async function getMockClubKpi(): Promise<ClubKpi> {
  initializeMockClubs();
  await simulateDelay();

  const activeClubs = mockClubs.filter((c) => c.is_active);
  const totalMembers = mockClubMemberships.filter((m) => m.status === ClubMembershipStatus.active).length;

  const currentMonth = new Date().getMonth();
  const eventsThisMonth = mockClubActivities.filter((a) => {
    const activityMonth = new Date(a.scheduled_date).getMonth();
    return activityMonth === currentMonth;
  }).length;

  const avgMembers = totalMembers / activeClubs.length;

  // Find most active club (most activities)
  const clubActivityCounts = new Map<number, number>();
  mockClubActivities.forEach((a) => {
    clubActivityCounts.set(a.club_id, (clubActivityCounts.get(a.club_id) || 0) + 1);
  });

  let mostActiveClubId = 0;
  let maxActivities = 0;
  clubActivityCounts.forEach((count, clubId) => {
    if (count > maxActivities) {
      maxActivities = count;
      mostActiveClubId = clubId;
    }
  });

  const mostActiveClub = mockClubs.find((c) => c.id === mostActiveClubId);

  return {
    active_clubs: activeClubs.length,
    total_members: totalMembers,
    events_this_month: eventsThisMonth,
    avg_members_per_club: Math.round(avgMembers),
    most_active_club: mostActiveClub?.name || "N/A",
  };
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockClubProvider = {
  getClubs: getMockClubs,
  getClubById: getMockClubById,
  getClubActivities: getMockClubActivities,
  getClubMemberships: getMockClubMemberships,
  getClubKpi: getMockClubKpi,
};
