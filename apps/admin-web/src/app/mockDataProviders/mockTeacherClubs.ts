// ============================================================================
// MOCK TEACHER CLUBS DATA PROVIDER
// ============================================================================

export interface TeacherClub {
  club_id: number;
  club_name: string;
  club_type: "academic" | "sports" | "arts" | "technical" | "social";
  role: "Incharge" | "Co-Sponsor" | "Advisor";
  member_count: number;
  meeting_frequency: "weekly" | "biweekly" | "monthly";
  next_meeting_date?: string;
  description: string;
  is_active: boolean;
}

export interface ClubActivity {
  activity_id: number;
  club_id: number;
  club_name: string;
  activity_name: string;
  activity_type: "meeting" | "workshop" | "competition" | "event" | "project";
  scheduled_date: string;
  venue: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  participant_count?: number;
  description: string;
}

export interface ClubParticipationLog {
  log_id: number;
  student_name: string;
  student_id: number;
  club_name: string;
  activity_name: string;
  date: string;
  attendance: "present" | "absent" | "excused";
  contribution_score: number;
}

export interface TeacherClubKpi {
  teacher_id: number;
  total_clubs: number;
  active_clubs: number;
  total_members_across_clubs: number;
  upcoming_events: number;
  events_this_month: number;
  student_participation_rate: number;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CLUB_CONFIGS = [
  { name: "Science Club", type: "academic" as const, desc: "Explore scientific experiments and innovation" },
  { name: "Math Olympiad", type: "academic" as const, desc: "Solve challenging mathematical problems" },
  { name: "Literary Club", type: "arts" as const, desc: "Reading, writing, and discussions" },
  { name: "Drama Club", type: "arts" as const, desc: "Theater and acting" },
  { name: "Basketball Team", type: "sports" as const, desc: "School basketball team" },
  { name: "Robotics Club", type: "technical" as const, desc: "Build and program robots" },
  { name: "Eco Club", type: "social" as const, desc: "Environmental awareness" },
  { name: "Photography Club", type: "arts" as const, desc: "Capture moments through lens" },
  { name: "Debate Society", type: "academic" as const, desc: "Critical thinking and public speaking" },
  { name: "Music Club", type: "arts" as const, desc: "Explore musical talents" },
];

export async function getTeacherClubs(teacherId: number): Promise<TeacherClub[]> {
  await simulateDelay();

  // Each teacher sponsors 1-2 clubs
  const numClubs = 1 + (teacherId % 2);
  const clubs: TeacherClub[] = [];

  for (let i = 0; i < numClubs; i++) {
    const clubConfig = CLUB_CONFIGS[(teacherId + i) % CLUB_CONFIGS.length];
    const role = i === 0 ? "Incharge" : "Co-Sponsor";
    const memberCount = 15 + Math.floor(Math.random() * 35);
    const meetingFrequencies: ("weekly" | "biweekly" | "monthly")[] = ["weekly", "biweekly", "monthly"];

    const nextMeetingDate = new Date();
    nextMeetingDate.setDate(nextMeetingDate.getDate() + 3 + i * 7);

    clubs.push({
      club_id: teacherId * 10 + i + 1,
      club_name: clubConfig.name,
      club_type: clubConfig.type,
      role,
      member_count: memberCount,
      meeting_frequency: meetingFrequencies[teacherId % 3],
      next_meeting_date: nextMeetingDate.toISOString().split("T")[0],
      description: clubConfig.desc,
      is_active: true,
    });
  }

  console.log(`[MOCK TEACHER CLUBS] getTeacherClubs(${teacherId}) → ${clubs.length} clubs`);
  return clubs;
}

export async function getTeacherClubActivities(teacherId: number): Promise<ClubActivity[]> {
  await simulateDelay();

  const clubs = await getTeacherClubs(teacherId);
  const activities: ClubActivity[] = [];
  let activityId = teacherId * 100;

  const activityTypes: ("meeting" | "workshop" | "competition" | "event" | "project")[] = [
    "meeting", "workshop", "competition", "event", "project"
  ];
  const statuses: ("planned" | "ongoing" | "completed" | "cancelled")[] = [
    "planned", "ongoing", "completed", "cancelled"
  ];

  clubs.forEach((club) => {
    // 3-5 activities per club
    const numActivities = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numActivities; i++) {
      const activityType = activityTypes[i % activityTypes.length];
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - 30 + i * 15); // Activities spread over 2 months

      const isPast = scheduledDate < new Date();
      const status = isPast ? "completed" : statuses[Math.floor(Math.random() * 2)]; // planned or ongoing for future

      activities.push({
        activity_id: ++activityId,
        club_id: club.club_id,
        club_name: club.club_name,
        activity_name: `${club.club_name} ${activityType} ${i + 1}`,
        activity_type: activityType,
        scheduled_date: scheduledDate.toISOString().split("T")[0],
        venue: `Room ${100 + Math.floor(Math.random() * 50)}`,
        status: status as typeof statuses[number],
        participant_count: status === "completed" ? Math.floor(club.member_count * (0.7 + Math.random() * 0.3)) : undefined,
        description: `${activityType} organized by ${club.club_name}`,
      });
    }
  });

  console.log(`[MOCK TEACHER CLUBS] getTeacherClubActivities(${teacherId}) → ${activities.length} activities`);
  return activities;
}

export async function getClubParticipationLogs(teacherId: number, limit: number = 20): Promise<ClubParticipationLog[]> {
  await simulateDelay();

  const clubs = await getTeacherClubs(teacherId);
  const logs: ClubParticipationLog[] = [];
  let logId = teacherId * 1000;

  const studentNames = [
    "Aarav Sharma", "Ananya Patel", "Vivaan Singh", "Anika Reddy", "Aditya Kumar",
    "Diya Gupta", "Vihaan Joshi", "Sara Verma", "Arjun Nair", "Kiara Iyer"
  ];

  const attendanceOptions: ("present" | "absent" | "excused")[] = ["present", "present", "present", "absent", "excused"];

  clubs.forEach((club) => {
    const logsPerClub = Math.min(Math.floor(limit / clubs.length), 10);

    for (let i = 0; i < logsPerClub; i++) {
      const studentName = studentNames[i % studentNames.length];
      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() - 7 * i);
      const attendance = attendanceOptions[Math.floor(Math.random() * attendanceOptions.length)];

      logs.push({
        log_id: ++logId,
        student_name: studentName,
        student_id: teacherId * 100 + i + 1,
        club_name: club.club_name,
        activity_name: `${club.club_name} Session ${i + 1}`,
        date: activityDate.toISOString().split("T")[0],
        attendance,
        contribution_score: attendance === "present" ? 70 + Math.floor(Math.random() * 30) : 0,
      });
    }
  });

  console.log(`[MOCK TEACHER CLUBS] getClubParticipationLogs(${teacherId}) → ${logs.length} logs`);
  return logs.slice(0, limit);
}

export async function getTeacherClubKpi(teacherId: number): Promise<TeacherClubKpi> {
  await simulateDelay();

  const clubs = await getTeacherClubs(teacherId);
  const activities = await getTeacherClubActivities(teacherId);

  const activeClubs = clubs.filter(c => c.is_active).length;
  const totalMembers = clubs.reduce((sum, c) => sum + c.member_count, 0);

  const now = new Date();
  const upcomingEvents = activities.filter(a =>
    new Date(a.scheduled_date) > now && a.status !== "cancelled"
  ).length;

  const currentMonth = now.getMonth();
  const eventsThisMonth = activities.filter(a => {
    const activityDate = new Date(a.scheduled_date);
    return activityDate.getMonth() === currentMonth;
  }).length;

  const participationRate = 75 + Math.floor(Math.random() * 20);

  return {
    teacher_id: teacherId,
    total_clubs: clubs.length,
    active_clubs: activeClubs,
    total_members_across_clubs: totalMembers,
    upcoming_events: upcomingEvents,
    events_this_month: eventsThisMonth,
    student_participation_rate: participationRate,
  };
}

export const mockTeacherClubsProvider = {
  getTeacherClubs,
  getTeacherClubActivities,
  getClubParticipationLogs,
  getTeacherClubKpi,
};
