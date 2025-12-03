// ============================================================================
// MOCK TEACHER ACHIEVEMENTS DATA PROVIDER
// Focus: Teacher's personal achievements, awards, certifications, and recognition
// ============================================================================

export interface TeacherAchievement {
  achievement_id: number;
  title: string;
  description: string;
  category: "award" | "certification" | "publication" | "recognition" | "training" | "other";
  achievement_date: string;
  issuing_authority: string;
  certificate_url?: string;
  validity_period?: string; // For certifications
  verification_url?: string;
}

export interface TeacherAchievementKpi {
  teacher_id: number;
  total_achievements: number;
  total_awards: number;
  total_certifications: number;
  category_breakdown: {
    category: string;
    count: number;
  }[];
  recent_achievements_count: number; // Last 12 months
  years_of_excellence: number; // Years with at least one achievement
}

export interface AchievementBadge {
  badge_id: number;
  badge_name: string;
  badge_description: string;
  icon_url: string;
  awarded_date: string;
  issuing_body: string;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ACHIEVEMENT_TEMPLATES = [
  {
    title: "Best Teacher Award",
    category: "award" as const,
    desc: "Recognized for outstanding teaching excellence and student engagement",
    authority: "State Education Board"
  },
  {
    title: "Google Certified Educator Level 2",
    category: "certification" as const,
    desc: "Advanced certification in Google Workspace for Education",
    authority: "Google for Education",
    validity: "3 years"
  },
  {
    title: "Research Paper Publication",
    category: "publication" as const,
    desc: "Published research on innovative teaching methodologies in secondary education",
    authority: "International Journal of Education"
  },
  {
    title: "Principal's Excellence Award",
    category: "recognition" as const,
    desc: "Recognized for exceptional contribution to school improvement",
    authority: "School Administration"
  },
  {
    title: "Advanced Classroom Management",
    category: "training" as const,
    desc: "Completed intensive training program on modern classroom management techniques",
    authority: "National Teaching Institute"
  },
  {
    title: "National Merit Teacher",
    category: "award" as const,
    desc: "Selected as one of the top 100 teachers nationally",
    authority: "Ministry of Education"
  },
  {
    title: "Cambridge CELTA Certification",
    category: "certification" as const,
    desc: "Certificate in Teaching English to Speakers of Other Languages",
    authority: "Cambridge Assessment",
    validity: "Lifetime"
  },
  {
    title: "Educational Innovation Award",
    category: "award" as const,
    desc: "Awarded for implementing innovative teaching tools and methodologies",
    authority: "Education Technology Council"
  },
  {
    title: "Microsoft Innovative Educator",
    category: "certification" as const,
    desc: "Certified for excellence in using Microsoft tools in education",
    authority: "Microsoft Education",
    validity: "1 year"
  },
  {
    title: "Curriculum Development Workshop",
    category: "training" as const,
    desc: "Participated in advanced workshop on curriculum design and assessment",
    authority: "Central Board of Secondary Education"
  },
  {
    title: "Teacher of the Year",
    category: "award" as const,
    desc: "Voted as Teacher of the Year by students and peers",
    authority: "School Board"
  },
  {
    title: "Research Article: Digital Pedagogy",
    category: "publication" as const,
    desc: "Published article on the impact of digital tools on student learning outcomes",
    authority: "Journal of Educational Research"
  },
  {
    title: "STEM Education Specialist",
    category: "certification" as const,
    desc: "Specialized certification in STEM teaching methodologies",
    authority: "National STEM Education Center",
    validity: "5 years"
  },
  {
    title: "Outstanding Mentor Award",
    category: "recognition" as const,
    desc: "Recognized for exceptional mentoring of junior teachers and student teachers",
    authority: "Teacher Development Council"
  },
  {
    title: "Child Psychology Workshop",
    category: "training" as const,
    desc: "Completed workshop on understanding and addressing student psychological needs",
    authority: "Child Development Institute"
  },
];

export async function getTeacherAchievements(teacherId: number): Promise<TeacherAchievement[]> {
  await simulateDelay();

  const achievements: TeacherAchievement[] = [];
  const numAchievements = 10 + Math.floor(Math.random() * 10);

  for (let i = 0; i < numAchievements; i++) {
    const template = ACHIEVEMENT_TEMPLATES[i % ACHIEVEMENT_TEMPLATES.length];

    const achievementDate = new Date();
    // Spread achievements over the past 5 years
    achievementDate.setFullYear(achievementDate.getFullYear() - Math.floor(Math.random() * 5));
    achievementDate.setMonth(Math.floor(Math.random() * 12));

    achievements.push({
      achievement_id: teacherId * 1000 + i + 1,
      title: template.title,
      description: template.desc,
      category: template.category,
      achievement_date: achievementDate.toISOString().split("T")[0],
      issuing_authority: template.authority,
      certificate_url: Math.random() > 0.3 ? `/certificates/teacher-${teacherId}-cert-${i}.pdf` : undefined,
      validity_period: template.validity,
      verification_url: Math.random() > 0.5 ? `https://verify.example.com/${teacherId}-${i}` : undefined,
    });
  }

  console.log(`[MOCK TEACHER ACHIEVEMENTS] getTeacherAchievements(${teacherId}) → ${achievements.length} achievements`);
  return achievements.sort((a, b) => b.achievement_date.localeCompare(a.achievement_date));
}

export async function getTeacherAchievementKpi(teacherId: number): Promise<TeacherAchievementKpi> {
  await simulateDelay();

  const achievements = await getTeacherAchievements(teacherId);
  const totalAchievements = achievements.length;
  const totalAwards = achievements.filter(a => a.category === "award").length;
  const totalCertifications = achievements.filter(a => a.category === "certification").length;

  // Category breakdown
  const categoryMap = new Map<string, number>();
  achievements.forEach(a => {
    categoryMap.set(a.category, (categoryMap.get(a.category) || 0) + 1);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  // Recent achievements (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const recentCount = achievements.filter(a => new Date(a.achievement_date) >= twelveMonthsAgo).length;

  // Years of excellence - count unique years with achievements
  const yearsSet = new Set(achievements.map(a => new Date(a.achievement_date).getFullYear()));
  const yearsOfExcellence = yearsSet.size;

  return {
    teacher_id: teacherId,
    total_achievements: totalAchievements,
    total_awards: totalAwards,
    total_certifications: totalCertifications,
    category_breakdown: categoryBreakdown,
    recent_achievements_count: recentCount,
    years_of_excellence: yearsOfExcellence,
  };
}

export async function getAchievementBadges(teacherId: number): Promise<AchievementBadge[]> {
  await simulateDelay();

  const currentYear = new Date().getFullYear();
  const badges: AchievementBadge[] = [
    {
      badge_id: 1,
      badge_name: "Master Educator",
      badge_description: "Achieved 10+ certifications in teaching excellence",
      icon_url: "/badges/master-educator.svg",
      awarded_date: `${currentYear - 1}-06-15`,
      issuing_body: "National Education Board",
    },
    {
      badge_id: 2,
      badge_name: "Innovation Champion",
      badge_description: "Pioneered innovative teaching methodologies",
      icon_url: "/badges/innovation.svg",
      awarded_date: `${currentYear - 2}-03-20`,
      issuing_body: "Education Innovation Council",
    },
    {
      badge_id: 3,
      badge_name: "Research Scholar",
      badge_description: "Published 3+ research papers in education journals",
      icon_url: "/badges/scholar.svg",
      awarded_date: `${currentYear - 1}-09-10`,
      issuing_body: "Academic Research Board",
    },
    {
      badge_id: 4,
      badge_name: "Mentor of Excellence",
      badge_description: "Mentored 50+ teachers and student-teachers successfully",
      icon_url: "/badges/mentor.svg",
      awarded_date: `${currentYear}-01-25`,
      issuing_body: "Teacher Development Authority",
    },
    {
      badge_id: 5,
      badge_name: "Lifetime Achievement",
      badge_description: "15+ years of outstanding contribution to education",
      icon_url: "/badges/lifetime.svg",
      awarded_date: `${currentYear - 3}-12-01`,
      issuing_body: "Ministry of Education",
    },
  ];

  // Return 3-5 badges based on teacherId
  const numBadges = 3 + (teacherId % 3);
  console.log(`[MOCK TEACHER ACHIEVEMENTS] getAchievementBadges(${teacherId}) → ${numBadges} badges`);
  return badges.slice(0, numBadges);
}

export const mockTeacherAchievementsProvider = {
  getTeacherAchievements,
  getTeacherAchievementKpi,
  getAchievementBadges,
};
