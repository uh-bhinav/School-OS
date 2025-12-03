// ============================================================================
// MOCK ACHIEVEMENTS DATA PROVIDER
// ============================================================================

import {
  AchievementPointRule,
  StudentAchievement,
  AchievementKpi,
  LeaderboardStudent,
  LeaderboardClub,
  AchievementType,
  AchievementVisibility,
} from "../services/achievement.schema";

let mockAchievementRules: AchievementPointRule[] = [];
let mockStudentAchievements: StudentAchievement[] = [];

function initializeMockAchievements() {
  if (mockAchievementRules.length > 0) return;

  // Initialize achievement rules with proper schema
  mockAchievementRules = [
    {
      id: 1,
      school_id: 1,
      achievement_type: AchievementType.academic,
      category_name: "Perfect Attendance",
      base_points: 50,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
    {
      id: 2,
      school_id: 1,
      achievement_type: AchievementType.academic,
      category_name: "Academic Excellence",
      base_points: 100,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
    {
      id: 3,
      school_id: 1,
      achievement_type: AchievementType.sports,
      category_name: "Sports Competition",
      base_points: 75,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
    {
      id: 4,
      school_id: 1,
      achievement_type: AchievementType.leadership,
      category_name: "Leadership Role",
      base_points: 40,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
    {
      id: 5,
      school_id: 1,
      achievement_type: AchievementType.cultural,
      category_name: "Cultural Performance",
      base_points: 30,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
    {
      id: 6,
      school_id: 1,
      achievement_type: AchievementType.community_service,
      category_name: "Community Volunteering",
      base_points: 25,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
    {
      id: 7,
      school_id: 1,
      achievement_type: AchievementType.academic,
      category_name: "Science Fair Winner",
      base_points: 80,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
    {
      id: 8,
      school_id: 1,
      achievement_type: AchievementType.leadership,
      category_name: "Best Disciplined Student",
      base_points: 60,
      level_multiplier: { school: 1.0, district: 1.5, state: 2.0, national: 3.0, international: 5.0 },
      is_active: true,
      created_at: "2025-04-01T00:00:00Z",
    },
  ];

  // Generate student achievements for student IDs 1-700 (matching mockStudents pattern)
  const achievementTypes = Object.values(AchievementType);
  const visibilities = Object.values(AchievementVisibility);

  for (let studentId = 1; studentId <= 700; studentId++) {
    // Each student gets 2-8 achievements
    const numAchievements = Math.floor(Math.random() * 7) + 2;

    for (let i = 0; i < numAchievements; i++) {
      const rule = mockAchievementRules[Math.floor(Math.random() * mockAchievementRules.length)];
      const isVerified = Math.random() > 0.2; // 80% verified
      const achievementType = achievementTypes[Math.floor(Math.random() * achievementTypes.length)];

      const monthOffset = Math.floor(Math.random() * 6);
      const dayOffset = Math.floor(Math.random() * 28) + 1;
      const awardedDate = `2025-${String(5 + monthOffset).padStart(2, "0")}-${String(dayOffset).padStart(2, "0")}`;

      mockStudentAchievements.push({
        id: studentId * 100 + i,
        school_id: 1,
        student_id: studentId,
        academic_year_id: 1,
        achievement_type: achievementType,
        title: `${rule.category_name} - ${achievementType}`,
        description: `Awarded for excellence in ${rule.category_name.toLowerCase()}`,
        achievement_category: rule.category_name,
        date_awarded: awardedDate,
        certificate_url: isVerified ? `/certificates/cert-${studentId}-${i}.pdf` : undefined,
        evidence_urls: isVerified ? [`/evidence/evidence-${studentId}-${i}.jpg`] : [],
        visibility: visibilities[Math.floor(Math.random() * visibilities.length)],
        awarded_by_user_id: "teacher-1-uuid",
        verified_by_user_id: isVerified ? "admin-1-uuid" : undefined,
        points_awarded: isVerified ? rule.base_points : 0,
        is_verified: isVerified,
        verified_at: isVerified ? `${awardedDate}T10:00:00Z` : undefined,
        created_at: `${awardedDate}T09:00:00Z`,
        updated_at: `${awardedDate}T${isVerified ? "10" : "09"}:00:00Z`,
      });
    }
  }

  console.log(`[MOCK ACHIEVEMENTS] Initialized ${mockAchievementRules.length} rules, ${mockStudentAchievements.length} achievements`);
}

export async function getMockAchievementRules(schoolId: number): Promise<AchievementPointRule[]> {
  initializeMockAchievements();
  await simulateDelay();

  return mockAchievementRules.filter((r) => r.school_id === schoolId && r.is_active);
}

export async function getMockStudentAchievements(
  studentId: number,
  onlyVerified = true
): Promise<StudentAchievement[]> {
  initializeMockAchievements();
  await simulateDelay();

  let achievements = mockStudentAchievements.filter((a) => a.student_id === studentId);

  if (onlyVerified) {
    achievements = achievements.filter((a) => a.is_verified);
  }

  return achievements.sort((a, b) => new Date(b.date_awarded).getTime() - new Date(a.date_awarded).getTime());
}

export async function getMockAllStudentAchievements(
  schoolId: number,
  onlyVerified = true
): Promise<StudentAchievement[]> {
  initializeMockAchievements();
  await simulateDelay();

  let achievements = mockStudentAchievements.filter((a) => a.school_id === schoolId);

  if (onlyVerified) {
    achievements = achievements.filter((a) => a.is_verified);
  }

  return achievements.sort((a, b) => new Date(b.date_awarded).getTime() - new Date(a.date_awarded).getTime());
}

export async function getMockAchievementKpi(): Promise<AchievementKpi> {
  initializeMockAchievements();
  await simulateDelay();

  const totalAchievements = mockStudentAchievements.length;
  const verifiedAchievements = mockStudentAchievements.filter((a) => a.is_verified);
  const pendingVerifications = mockStudentAchievements.filter((a) => !a.is_verified).length;

  const uniqueStudents = new Set(mockStudentAchievements.map((a) => a.student_id));
  const studentsRecognized = uniqueStudents.size;

  const totalPoints = verifiedAchievements.reduce((sum, a) => sum + a.points_awarded, 0);
  const avgPoints = studentsRecognized > 0 ? totalPoints / studentsRecognized : 0;

  return {
    total_achievements: totalAchievements,
    students_recognized: studentsRecognized,
    avg_points_per_student: Math.round(avgPoints),
    pending_verifications: pendingVerifications,
    total_points_awarded: totalPoints,
  };
}

export async function getMockSchoolLeaderboard(schoolId: number, academicYearId: number): Promise<LeaderboardStudent[]> {
  initializeMockAchievements();
  await simulateDelay();

  // Group achievements by student
  const studentMap = new Map<number, { achievement_points: number, exam_points: number, club_points: number }>();

  mockStudentAchievements
    .filter(a => a.school_id === schoolId && a.academic_year_id === academicYearId && a.is_verified)
    .forEach(achievement => {
      const existing = studentMap.get(achievement.student_id) || { achievement_points: 0, exam_points: 0, club_points: 0 };
      existing.achievement_points += achievement.points_awarded;
      studentMap.set(achievement.student_id, existing);
    });

  // Generate leaderboard
  const leaderboard: LeaderboardStudent[] = Array.from(studentMap.entries()).map(([studentId, points]) => ({
    student_id: studentId,
    student_name: `Student ${studentId}`,
    class_id: Math.floor((studentId - 1000) / 100) || 1,
    class_name: `Grade ${Math.floor((studentId - 1000) / 100) || 1} - A`,
    achievement_points: points.achievement_points,
    exam_points: Math.floor(Math.random() * 500) + 200, // Mock exam points
    club_points: Math.floor(Math.random() * 200) + 50,  // Mock club points
    total_points: points.achievement_points + points.exam_points + points.club_points,
  }));

  // Sort by total points descending
  return leaderboard.sort((a, b) => b.total_points - a.total_points).slice(0, 50);
}

export async function getMockClubLeaderboard(_schoolId: number, _academicYearId: number): Promise<LeaderboardClub[]> {
  initializeMockAchievements();
  await simulateDelay();

  // Generate mock club leaderboard
  const clubs = [
    "Science Club", "Math Olympiad Club", "Literary Club", "Arts & Crafts Club",
    "Basketball Team", "Drama Club", "Robotics Club", "Eco Club", "Photography Club", "Debate Society"
  ];

  return clubs.map((clubName, index) => ({
    club_id: index + 1,
    club_name: clubName,
    total_points: Math.floor(Math.random() * 5000) + 1000,
  })).sort((a, b) => b.total_points - a.total_points);
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAchievementProvider = {
  getAchievementRules: getMockAchievementRules,
  getStudentAchievements: getMockStudentAchievements,
  getAllStudentAchievements: getMockAllStudentAchievements,
  getAchievementKpi: getMockAchievementKpi,
  getSchoolLeaderboard: getMockSchoolLeaderboard,
  getClubLeaderboard: getMockClubLeaderboard,
};
