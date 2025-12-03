import { http, HttpResponse } from "msw";
const BASE = "*/v1/timetable";
const GEN  = "*/v1/timetable_generation";

// Mock data for resources
const MOCK_TEACHERS = [
  { id: 51, name: "Mr. Rao", email: "rao@school.com", subjects: [11, 12] },
  { id: 52, name: "Ms. Priya", email: "priya@school.com", subjects: [12, 13] },
  { id: 53, name: "Dr. Kumar", email: "kumar@school.com", subjects: [14] },
  { id: 54, name: "Mrs. Sharma", email: "sharma@school.com", subjects: [15] },
  { id: 55, name: "Mr. Singh", email: "singh@school.com", subjects: [11, 16] },
];

const MOCK_SUBJECTS = [
  { id: 11, name: "Mathematics", code: "MATH", class_id: 8 },
  { id: 12, name: "English", code: "ENG", class_id: 8 },
  { id: 13, name: "Science", code: "SCI", class_id: 8 },
  { id: 14, name: "History", code: "HIST", class_id: 8 },
  { id: 15, name: "Geography", code: "GEO", class_id: 8 },
  { id: 16, name: "Computer Science", code: "CS", class_id: 8 },
];

const MOCK_ROOMS = [
  { id: 201, name: "R-201", capacity: 40 },
  { id: 202, name: "R-202", capacity: 35 },
  { id: 203, name: "R-203", capacity: 30 },
  { id: 204, name: "Lab-1", capacity: 25 },
];

export const timetableHandlers = [
  // Grid endpoint
  http.get(`${BASE}/grid`, ({ request }) => {
    const url = new URL(request.url);
    const class_id = Number(url.searchParams.get("class_id") || 8);
    const section = String(url.searchParams.get("section") || "A");
    const week_start = String(url.searchParams.get("week_start") || "2025-11-03");

    const periods = Array.from({ length: 7 }).map((_,i)=>({
      period_no: i+1,
      start_time: `${9 + Math.floor(i/2)}:${i%2? "50":"00"}`,
      end_time: `${9 + Math.floor(i/2)}:${i%2? "35":"45"}`
    }));

    const entries = [
      { id:1, academic_year_id:2025, school_id:1, class_id, section, week_start,
        day:"MON", period_no:1, subject_id:11, subject_name:"Mathematics", teacher_id:51, teacher_name:"Mr. Rao",
        room_id:201, room_name:"R-201", is_published:false, is_editable:true },
      { id:2, academic_year_id:2025, school_id:1, class_id, section, week_start,
        day:"MON", period_no:2, subject_id:12, subject_name:"English", teacher_id:52, teacher_name:"Ms. Priya",
        room_id:202, room_name:"R-202", is_published:false, is_editable:true },
      { id:3, academic_year_id:2025, school_id:1, class_id, section, week_start,
        day:"TUE", period_no:1, subject_id:13, subject_name:"Science", teacher_id:53, teacher_name:"Dr. Kumar",
        room_id:204, room_name:"Lab-1", is_published:false, is_editable:true },
      { id:4, academic_year_id:2025, school_id:1, class_id, section, week_start,
        day:"TUE", period_no:2, subject_id:11, subject_name:"Mathematics", teacher_id:51, teacher_name:"Mr. Rao",
        room_id:201, room_name:"R-201", is_published:false, is_editable:true },
      { id:5, academic_year_id:2025, school_id:1, class_id, section, week_start,
        day:"WED", period_no:1, subject_id:14, subject_name:"History", teacher_id:54, teacher_name:"Mrs. Sharma",
        room_id:null, room_name:null, is_published:false, is_editable:true },
    ];

    const conflicts = [
      { type:"TEACHER", message:"Teacher double-booked Tue P3", entry_ids:[2,99] }
    ];

    return HttpResponse.json({ academic_year_id:2025, class_id, section, week_start, periods, entries, conflicts });
  }),

  // KPIs endpoint
  http.get(`${BASE}/kpis`, () => HttpResponse.json({
    coverage_pct: 86.5, conflicts_count: 1, free_periods: 9, room_util_pct: 72.3
  })),

  // Create entry
  http.post(`${BASE}`, async ({ request }) => {
    const body: any = await request.json();
    const teacher = MOCK_TEACHERS.find(t => t.id === body.teacher_id);
    const subject = MOCK_SUBJECTS.find(s => s.id === body.subject_id);
    const room = MOCK_ROOMS.find(r => r.id === body.room_id);

    return HttpResponse.json({
      id: Math.floor(Math.random()*10000),
      ...body,
      subject_name: subject?.name ?? "Unknown Subject",
      teacher_name: teacher?.name ?? "Unknown Teacher",
      room_name: room?.name ?? null,
      is_published: false,
      is_editable: true,
    });
  }),

  // Update entry
  http.put(`${BASE}/:id`, async ({ params, request }) => {
    const body: any = await request.json();
    const teacher = MOCK_TEACHERS.find(t => t.id === body.teacher_id);
    const subject = MOCK_SUBJECTS.find(s => s.id === body.subject_id);
    const room = MOCK_ROOMS.find(r => r.id === body.room_id);

    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      subject_name: subject?.name ?? "Unknown Subject",
      teacher_name: teacher?.name ?? "Unknown Teacher",
      room_name: room?.name ?? null,
    });
  }),

  // Delete entry
  http.delete(`${BASE}/:id`, () => HttpResponse.json({ ok:true })),

  // Publish/unpublish
  http.post(`${BASE}/publish`, async ({ request }) => {
    const body: any = await request.json();
    return HttpResponse.json({ is_published: body.publish });
  }),

  // Swap entries
  http.post(`${GEN}/swap`, async () => HttpResponse.json({ ok:true })),

  // Check conflict
  http.post(`${GEN}/check-conflict`, async () =>
    HttpResponse.json({ ok:true, conflicts: [] })
  ),

  // Generate timetable
  http.post(`${GEN}/generate`, async () => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return HttpResponse.json({ entries: [], job_id: "mock-job-12345" });
  }),

  // Resource endpoints
  http.get("*/v1/schools/:schoolId/teachers", () =>
    HttpResponse.json(MOCK_TEACHERS)
  ),

  http.get("*/v1/subjects", () =>
    HttpResponse.json(MOCK_SUBJECTS)
  ),

  http.get("*/v1/schools/:schoolId/rooms", () =>
    HttpResponse.json(MOCK_ROOMS)
  ),
];
