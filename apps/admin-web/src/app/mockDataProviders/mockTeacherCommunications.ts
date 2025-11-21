// ============================================================================
// MOCK TEACHER COMMUNICATIONS DATA PROVIDER
// ============================================================================

export interface TeacherCommunication {
  communication_id: number;
  title: string;
  content: string;
  type: "message" | "announcement" | "notice" | "circular";
  sender_id: number;
  sender_name: string;
  sender_role: "teacher" | "admin" | "principal";
  recipients: string[];
  recipient_type: "students" | "parents" | "teachers" | "all";
  created_at: string;
  is_read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  attachments?: string[];
}

export interface ConversationThread {
  thread_id: number;
  subject: string;
  participants: string[];
  message_count: number;
  last_message: string;
  last_message_at: string;
  is_active: boolean;
}

export interface AnnouncementCreated {
  announcement_id: number;
  title: string;
  content: string;
  target_audience: "students" | "parents" | "teachers" | "all";
  priority: "low" | "medium" | "high" | "urgent";
  published_at: string;
  views_count: number;
}

export interface TeacherCommunicationKpi {
  teacher_id: number;
  total_messages_sent: number;
  total_announcements_created: number;
  active_conversations: number;
  unread_messages: number;
  response_rate_percentage: number;
}

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const COMMUNICATION_TITLES = [
  "Homework Assignment Reminder",
  "Test Schedule Update",
  "Parent-Teacher Meeting Notice",
  "Project Submission Deadline",
  "Class Performance Review",
  "Important Circular",
  "Field Trip Permission",
  "Sports Day Participation",
  "Science Fair Registration",
  "Library Book Return Notice",
];

const RECIPIENTS_OPTIONS = [
  ["Class 8A Students"],
  ["Class 9B Parents"],
  ["All Mathematics Students"],
  ["Science Department Teachers"],
  ["All Class Teachers"],
  ["Selected Students"],
];

export async function getTeacherCommunications(teacherId: number): Promise<TeacherCommunication[]> {
  await simulateDelay();

  const communications: TeacherCommunication[] = [];
  const numCommunications = 10 + Math.floor(Math.random() * 15);

  const types: ("message" | "announcement" | "notice" | "circular")[] = [
    "message", "announcement", "notice", "circular"
  ];
  const priorities: ("low" | "medium" | "high" | "urgent")[] = [
    "low", "medium", "medium", "high", "urgent"
  ];
  const recipientTypes: ("students" | "parents" | "teachers" | "all")[] = [
    "students", "parents", "teachers", "all"
  ];

  for (let i = 0; i < numCommunications; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));

    const type = types[i % types.length];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const recipientType = recipientTypes[i % recipientTypes.length];

    communications.push({
      communication_id: teacherId * 1000 + i + 1,
      title: COMMUNICATION_TITLES[i % COMMUNICATION_TITLES.length],
      content: `This is a ${type} regarding important information for ${recipientType}. Please take note and respond accordingly.`,
      type,
      sender_id: teacherId,
      sender_name: `Teacher ${teacherId}`,
      sender_role: "teacher",
      recipients: RECIPIENTS_OPTIONS[i % RECIPIENTS_OPTIONS.length],
      recipient_type: recipientType,
      created_at: createdDate.toISOString(),
      is_read: Math.random() > 0.3,
      priority,
      attachments: Math.random() > 0.7 ? [`/attachments/doc-${i}.pdf`] : undefined,
    });
  }

  console.log(`[MOCK TEACHER COMMUNICATIONS] getTeacherCommunications(${teacherId}) → ${communications.length} communications`);
  return communications.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getConversationThreads(teacherId: number): Promise<ConversationThread[]> {
  await simulateDelay();

  const threads: ConversationThread[] = [];
  const numThreads = 5 + Math.floor(Math.random() * 10);

  const subjects = [
    "Student Performance Discussion",
    "Homework Queries",
    "Exam Preparation Tips",
    "Behavioral Issues",
    "Project Collaboration",
    "Parent Concern",
    "Subject Clarification",
    "Extra Classes Request",
  ];

  const participantGroups = [
    ["Parent - Rajesh Sharma", "Teacher"],
    ["Student - Aarav Kumar", "Teacher"],
    ["Principal", "Teacher"],
    ["Parent - Sunita Verma", "Teacher", "Counselor"],
    ["Student - Ananya Patel", "Parent", "Teacher"],
  ];

  for (let i = 0; i < numThreads; i++) {
    const lastMessageDate = new Date();
    lastMessageDate.setDate(lastMessageDate.getDate() - Math.floor(Math.random() * 14));

    threads.push({
      thread_id: teacherId * 100 + i + 1,
      subject: subjects[i % subjects.length],
      participants: participantGroups[i % participantGroups.length],
      message_count: 3 + Math.floor(Math.random() * 12),
      last_message: "Thank you for your response. I'll follow up on this matter.",
      last_message_at: lastMessageDate.toISOString(),
      is_active: Math.random() > 0.3,
    });
  }

  console.log(`[MOCK TEACHER COMMUNICATIONS] getConversationThreads(${teacherId}) → ${threads.length} threads`);
  return threads.sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
}

export async function getAnnouncementsCreated(teacherId: number): Promise<AnnouncementCreated[]> {
  await simulateDelay();

  const announcements: AnnouncementCreated[] = [];
  const numAnnouncements = 3 + Math.floor(Math.random() * 7);

  const announcementTitles = [
    "Mid-term Exam Schedule",
    "Science Project Deadline Extended",
    "Sports Day Preparation",
    "Library Hours Changed",
    "Parent-Teacher Meeting",
    "School Trip Notice",
    "Annual Function Participation",
    "Homework Policy Update",
  ];

  const audiences: ("students" | "parents" | "teachers" | "all")[] = [
    "students", "parents", "teachers", "all"
  ];

  for (let i = 0; i < numAnnouncements; i++) {
    const publishedDate = new Date();
    publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 45));

    announcements.push({
      announcement_id: teacherId * 50 + i + 1,
      title: announcementTitles[i % announcementTitles.length],
      content: `Important announcement regarding ${announcementTitles[i % announcementTitles.length].toLowerCase()}. All concerned are requested to take note.`,
      target_audience: audiences[i % audiences.length],
      priority: i % 3 === 0 ? "urgent" : i % 2 === 0 ? "high" : "medium",
      published_at: publishedDate.toISOString(),
      views_count: 50 + Math.floor(Math.random() * 200),
    });
  }

  console.log(`[MOCK TEACHER COMMUNICATIONS] getAnnouncementsCreated(${teacherId}) → ${announcements.length} announcements`);
  return announcements.sort((a, b) => b.published_at.localeCompare(a.published_at));
}

export async function getTeacherCommunicationKpi(teacherId: number): Promise<TeacherCommunicationKpi> {
  await simulateDelay();

  const communications = await getTeacherCommunications(teacherId);
  const threads = await getConversationThreads(teacherId);
  const announcements = await getAnnouncementsCreated(teacherId);

  const totalMessages = communications.filter(c => c.type === "message").length;
  const totalAnnouncements = announcements.length;
  const activeConversations = threads.filter(t => t.is_active).length;
  const unreadMessages = communications.filter(c => !c.is_read).length;
  const responseRate = 75 + Math.floor(Math.random() * 20);

  return {
    teacher_id: teacherId,
    total_messages_sent: totalMessages,
    total_announcements_created: totalAnnouncements,
    active_conversations: activeConversations,
    unread_messages: unreadMessages,
    response_rate_percentage: responseRate,
  };
}

export const mockTeacherCommunicationsProvider = {
  getTeacherCommunications,
  getConversationThreads,
  getAnnouncementsCreated,
  getTeacherCommunicationKpi,
};
