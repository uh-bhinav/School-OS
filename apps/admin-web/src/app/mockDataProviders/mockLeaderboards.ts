// ============================================================================
// MOCK LEADERBOARD DATA PROVIDER
// ============================================================================

import type {
  LeaderboardStudent,
  LeaderboardClub,
  LeaderboardKpi,
} from "../services/leaderboard.schema";

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================
let mockLeaderboardData: LeaderboardStudent[] = [];
let mockClubLeaderboardData: LeaderboardClub[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeMockLeaderboards() {
  if (mockLeaderboardData.length > 0) return;

  const indianFirstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Pranav", "Ayaan", "Krishna", "Ishaan",
    "Ananya", "Diya", "Saanvi", "Aadhya", "Myra", "Anika", "Navya", "Pari", "Isha", "Kavya",
    "Rohan", "Arnav", "Reyansh", "Shaurya", "Dhruv", "Atharva", "Kabir", "Shivansh", "Rudra", "Ved"];
  const indianLastNames = ["Sharma", "Verma", "Patel", "Kumar", "Singh", "Gupta", "Reddy", "Rao", "Nair", "Iyer",
    "Desai", "Joshi", "Mehta", "Shah", "Agarwal", "Mishra", "Pandey", "Pillai", "Menon", "Shetty"];

  const classIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sections = ["A", "B", "C"];

  let studentCounter = 0;

  classIds.forEach((classId) => {
    sections.forEach((section) => {
      const studentsInSection = 40;
      for (let i = 1; i <= studentsInSection; i++) {
        studentCounter++;
        const firstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
        const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
        const totalPoints = Math.floor(Math.random() * 500) + 50; // 50-550 points
        const achievementCount = Math.floor(totalPoints / 25); // Roughly 1 achievement per 25 points

        mockLeaderboardData.push({
          student_id: classId * 1000 + studentCounter,
          student_name: `${firstName} ${lastName}`,
          roll_no: String(i).padStart(3, "0"),
          class_id: classId,
          section: section,
          total_points: totalPoints,
          achievement_count: achievementCount,
          rank: 0, // Will be calculated
        });
      }
    });
  });

  // Sort by total points and assign ranks
  mockLeaderboardData.sort((a, b) => b.total_points - a.total_points);
  mockLeaderboardData.forEach((student, index) => {
    student.rank = index + 1;
  });

  // Initialize club leaderboard
  const clubNames = [
    "Science Club",
    "Math Club",
    "Literary Club",
    "Arts & Crafts Club",
    "Music Club",
    "Sports Club",
    "Drama Club",
    "Robotics Club",
    "Eco Club",
    "Photography Club"
  ];

  mockClubLeaderboardData = clubNames.map((name, index) => ({
    club_id: index + 1,
    club_name: name,
    total_points: Math.floor(Math.random() * 2000) + 500,
    member_count: Math.floor(Math.random() * 50) + 10,
    rank: 0,
  }));

  mockClubLeaderboardData.sort((a, b) => b.total_points - a.total_points);
  mockClubLeaderboardData.forEach((club, index) => {
    club.rank = index + 1;
  });

  console.log(`[MOCK LEADERBOARD] Initialized ${mockLeaderboardData.length} students and ${mockClubLeaderboardData.length} clubs`);
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getMockSchoolLeaderboard(
  _academicYearId: number
): Promise<LeaderboardStudent[]> {
  initializeMockLeaderboards();
  await simulateDelay();

  return mockLeaderboardData.slice(0, 100); // Top 100 students
}

export async function getMockClassLeaderboard(
  classId: number,
  _academicYearId: number
): Promise<LeaderboardStudent[]> {
  initializeMockLeaderboards();
  await simulateDelay();

  const classStudents = mockLeaderboardData
    .filter((s) => s.class_id === classId)
    .sort((a, b) => b.total_points - a.total_points)
    .map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

  return classStudents;
}

export async function getMockClubLeaderboard(
  _academicYearId: number
): Promise<LeaderboardClub[]> {
  initializeMockLeaderboards();
  await simulateDelay();

  return mockClubLeaderboardData;
}

export async function getMockLeaderboardKpi(
  _academicYearId: number
): Promise<LeaderboardKpi> {
  initializeMockLeaderboards();
  await simulateDelay();

  const totalStudents = mockLeaderboardData.length;
  const totalAchievements = mockLeaderboardData.reduce((sum, s) => sum + s.achievement_count, 0);
  const avgPoints = mockLeaderboardData.reduce((sum, s) => sum + s.total_points, 0) / totalStudents;

  const topStudent = mockLeaderboardData[0];

  // Calculate class averages
  const classTotals = new Map<number, { total: number; count: number }>();
  mockLeaderboardData.forEach((s) => {
    if (!classTotals.has(s.class_id)) {
      classTotals.set(s.class_id, { total: 0, count: 0 });
    }
    const stats = classTotals.get(s.class_id)!;
    stats.total += s.total_points;
    stats.count += 1;
  });

  let topClassName = "";
  let topClassAvg = 0;
  classTotals.forEach((stats, classId) => {
    const avg = stats.total / stats.count;
    if (avg > topClassAvg) {
      topClassAvg = avg;
      topClassName = `Class ${classId}`;
    }
  });

  return {
    total_students: totalStudents,
    total_achievements: totalAchievements,
    avg_points_per_student: Math.round(avgPoints),
    top_student_name: topStudent.student_name,
    top_student_points: topStudent.total_points,
    top_class_name: topClassName,
    top_class_avg_points: Math.round(topClassAvg),
  };
}

// ============================================================================
// UTILITIES
// ============================================================================
function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// EXPORTS
// ============================================================================
export const mockLeaderboardProvider = {
  getSchoolLeaderboard: getMockSchoolLeaderboard,
  getClassLeaderboard: getMockClassLeaderboard,
  getClubLeaderboard: getMockClubLeaderboard,
  getLeaderboardKpi: getMockLeaderboardKpi,
};
