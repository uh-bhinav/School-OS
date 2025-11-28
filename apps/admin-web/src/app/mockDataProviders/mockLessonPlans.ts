// ============================================================================
// MOCK LESSON PLANS DATA PROVIDER
// ============================================================================

import { MOCK_TEACHERS } from "./mockTeachers";

export interface LessonPlan {
  plan_id: string;
  teacher_id: number;
  teacher_name: string;
  subject_id: number;
  subject_name: string;
  week: number;
  academic_year: string;
  start_date: string;
  end_date: string;
  topics: string[];
  objectives: string[];
  resources: string[];
  attachments: LessonPlanAttachment[];
  status: "draft" | "approved" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface LessonPlanAttachment {
  attachment_id: string;
  file_name: string;
  file_type: "pdf" | "doc" | "ppt" | "image" | "video";
  file_url: string;
  file_size: string;
}

// Topic banks by subject for realistic data
const TOPIC_BANKS: Record<string, string[]> = {
  "English": [
    "Shakespeare's Sonnets",
    "Active and Passive Voice",
    "Essay Writing Techniques",
    "Reading Comprehension Strategies",
    "Parts of Speech Review",
    "Narrative Writing",
    "Poetry Analysis",
    "Grammar: Tenses",
    "Creative Writing Workshop",
    "Letter and Email Writing"
  ],
  "Mathematics": [
    "Algebraic Expressions",
    "Linear Equations",
    "Geometry: Triangles",
    "Quadratic Equations",
    "Statistics and Probability",
    "Trigonometry Basics",
    "Coordinate Geometry",
    "Number Systems",
    "Polynomials",
    "Mensuration"
  ],
  "Physics": [
    "Laws of Motion",
    "Work, Energy and Power",
    "Thermodynamics",
    "Wave Motion",
    "Electricity and Magnetism",
    "Optics: Reflection and Refraction",
    "Modern Physics",
    "Gravitation",
    "Sound Waves",
    "Mechanical Properties of Solids"
  ],
  "Chemistry": [
    "Atomic Structure",
    "Chemical Bonding",
    "Periodic Table",
    "Acids, Bases and Salts",
    "Organic Chemistry Basics",
    "Chemical Reactions",
    "States of Matter",
    "Electrochemistry",
    "Polymers",
    "Environmental Chemistry"
  ],
  "Biology": [
    "Cell Structure and Function",
    "Genetics and Heredity",
    "Human Physiology",
    "Plant Kingdom",
    "Animal Kingdom",
    "Ecology and Environment",
    "Evolution",
    "Biotechnology",
    "Microorganisms",
    "Reproductive System"
  ],
  "History": [
    "Ancient Civilizations",
    "Medieval India",
    "Modern India",
    "World Wars",
    "Indian Freedom Movement",
    "Renaissance Period",
    "Industrial Revolution",
    "Constitutional Development",
    "Post-Independence India",
    "World History Overview"
  ],
  "Geography": [
    "Physical Geography of India",
    "Climate and Weather",
    "Natural Resources",
    "Population Studies",
    "Map Reading Skills",
    "Economic Geography",
    "Environmental Issues",
    "Agricultural Practices",
    "Industries and Trade",
    "Transport and Communication"
  ],
  "default": [
    "Introduction and Overview",
    "Core Concepts",
    "Practical Applications",
    "Problem Solving Techniques",
    "Review and Assessment",
    "Advanced Topics",
    "Case Studies",
    "Project Work",
    "Revision Session",
    "Final Assessment"
  ]
};

const OBJECTIVE_TEMPLATES: string[] = [
  "Students will be able to understand %TOPIC%",
  "Develop critical thinking skills through %TOPIC%",
  "Apply concepts of %TOPIC% to real-world scenarios",
  "Analyze and evaluate %TOPIC%",
  "Create solutions using %TOPIC%",
  "Demonstrate proficiency in %TOPIC%",
  "Compare and contrast aspects of %TOPIC%",
  "Synthesize information related to %TOPIC%"
];

const RESOURCE_TEMPLATES: string[] = [
  "Textbook Chapter %NUM%",
  "NCERT Reference Guide",
  "Online Learning Portal",
  "Interactive Whiteboard Presentation",
  "Practice Worksheets",
  "Video Lectures",
  "Laboratory Equipment",
  "Educational Software"
];

function generateLessonPlansForTeacher(teacherId: number): LessonPlan[] {
  const teacher = MOCK_TEACHERS.find((t) => t.teacher_id === teacherId);
  if (!teacher) return [];

  const teacherName = `${teacher.first_name} ${teacher.last_name}`;
  const subjectName = teacher.specialization || "General";
  const subjectId = teacherId; // Simplified mapping

  const plans: LessonPlan[] = [];
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  // Generate 8-12 weeks of lesson plans
  const numWeeks = 8 + Math.floor(Math.random() * 5);
  const topics = TOPIC_BANKS[subjectName] || TOPIC_BANKS["default"];

  for (let week = 1; week <= numWeeks; week++) {
    const startDate = new Date(currentYear, 3, 1 + (week - 1) * 7); // Starting from April
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Pick 1-2 topics for the week
    const numTopics = 1 + Math.floor(Math.random() * 2);
    const weekTopics: string[] = [];
    for (let i = 0; i < numTopics; i++) {
      const topicIndex = ((week - 1) * numTopics + i) % topics.length;
      weekTopics.push(topics[topicIndex]);
    }

    // Generate objectives based on topics
    const objectives: string[] = weekTopics.map((topic) => {
      const template = OBJECTIVE_TEMPLATES[Math.floor(Math.random() * OBJECTIVE_TEMPLATES.length)];
      return template.replace("%TOPIC%", topic.toLowerCase());
    });

    // Generate resources
    const numResources = 2 + Math.floor(Math.random() * 3);
    const resources: string[] = [];
    for (let i = 0; i < numResources; i++) {
      const template = RESOURCE_TEMPLATES[i % RESOURCE_TEMPLATES.length];
      resources.push(template.replace("%NUM%", String(week + i)));
    }

    // Generate attachments (not all weeks have attachments)
    const attachments: LessonPlanAttachment[] = [];
    if (week % 2 === 0) {
      attachments.push({
        attachment_id: `att-${teacherId}-${week}-1`,
        file_name: `Week${week}_LessonPlan.pdf`,
        file_type: "pdf",
        file_url: `https://example.com/lesson-plans/teacher-${teacherId}/week-${week}.pdf`,
        file_size: `${150 + Math.floor(Math.random() * 200)} KB`,
      });
    }
    if (week % 3 === 0) {
      attachments.push({
        attachment_id: `att-${teacherId}-${week}-2`,
        file_name: `Week${week}_Presentation.ppt`,
        file_type: "ppt",
        file_url: `https://example.com/lesson-plans/teacher-${teacherId}/week-${week}-ppt.pptx`,
        file_size: `${1 + Math.floor(Math.random() * 3)} MB`,
      });
    }

    // Determine status based on week
    let status: LessonPlan["status"] = "draft";
    if (week <= 4) {
      status = "completed";
    } else if (week <= 6) {
      status = "in_progress";
    } else if (week <= 8) {
      status = "approved";
    }

    plans.push({
      plan_id: `lp-${teacherId}-${week}`,
      teacher_id: teacherId,
      teacher_name: teacherName,
      subject_id: subjectId,
      subject_name: subjectName,
      week: week,
      academic_year: academicYear,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      topics: weekTopics,
      objectives: objectives,
      resources: resources,
      attachments: attachments,
      status: status,
      created_at: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return plans;
}

// Cache for lesson plans
const lessonPlansCache = new Map<number, LessonPlan[]>();

async function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get lesson plans for a specific teacher
 */
export async function getLessonPlansByTeacher(teacherId: number): Promise<LessonPlan[]> {
  await simulateDelay(300);

  if (!lessonPlansCache.has(teacherId)) {
    const plans = generateLessonPlansForTeacher(teacherId);
    lessonPlansCache.set(teacherId, plans);
  }

  const plans = lessonPlansCache.get(teacherId) || [];
  console.log(`[MOCK LESSON PLANS] getLessonPlansByTeacher(${teacherId}) → ${plans.length} plans`);
  return plans;
}

/**
 * Get a specific lesson plan by ID
 */
export async function getLessonPlanById(planId: string): Promise<LessonPlan | null> {
  await simulateDelay(150);

  // Parse teacher ID from plan ID
  const parts = planId.split("-");
  if (parts.length < 3) return null;

  const teacherId = parseInt(parts[1]);
  const plans = await getLessonPlansByTeacher(teacherId);
  const plan = plans.find((p) => p.plan_id === planId);

  console.log(`[MOCK LESSON PLANS] getLessonPlanById(${planId}) → ${plan ? "found" : "not found"}`);
  return plan || null;
}

/**
 * Get lesson plans by subject
 */
export async function getLessonPlansBySubject(subjectId: number): Promise<LessonPlan[]> {
  await simulateDelay(300);

  const allPlans: LessonPlan[] = [];

  // Get all teachers and their plans
  for (const teacher of MOCK_TEACHERS) {
    const teacherPlans = await getLessonPlansByTeacher(teacher.teacher_id);
    allPlans.push(...teacherPlans.filter((p) => p.subject_id === subjectId));
  }

  console.log(`[MOCK LESSON PLANS] getLessonPlansBySubject(${subjectId}) → ${allPlans.length} plans`);
  return allPlans;
}

/**
 * Get lesson plan statistics for a teacher
 */
export async function getLessonPlanStats(teacherId: number): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  approved: number;
  draft: number;
}> {
  await simulateDelay(150);

  const plans = await getLessonPlansByTeacher(teacherId);

  return {
    total: plans.length,
    completed: plans.filter((p) => p.status === "completed").length,
    inProgress: plans.filter((p) => p.status === "in_progress").length,
    approved: plans.filter((p) => p.status === "approved").length,
    draft: plans.filter((p) => p.status === "draft").length,
  };
}

export const mockLessonPlansProvider = {
  getLessonPlansByTeacher,
  getLessonPlanById,
  getLessonPlansBySubject,
  getLessonPlanStats,
};
