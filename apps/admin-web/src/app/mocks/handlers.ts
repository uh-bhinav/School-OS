import { http, HttpResponse } from "msw";
import { attendanceHandlers } from "./attendance.handlers";
import { timetableHandlers } from "./timetable.handlers";
import { examsHandlers } from "./exams.handlers";
import { marksHandlers } from "./marks.handlers";
import { agentHandlers } from "./agent.handlers";

// v1.0.0 config for school_id=2 (Springfield)
const springfield = {
  version: "1.0.0",
  identity: { display_name: "Widia Poorna Prajna School" },
  branding: {
    logo: { primary_url: "https://imgs.search.brave.com/J3K2RkAp-BBs-YxDW9rJMqaGTAmvFBFBNsU1xa8--5o/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbGF5/LWxoLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9SUnp5SWhRLVIw/c2gtQUlwT0J1VGZZ/eEtTWjlqOGVxa1Rf/WGVualJqNWlGZUhm/dWdDUkdQbTR1ejdm/cFZmT3cxTzh3PXcy/NDAtaDQ4MC1ydw" },
    colors: {
  primary: "#E87722",           // Orange from the main circle
  primary_contrast: "#FFFFFF",  // White text contrasts well on orange
  secondary: "#92278F",         // Purple from the lotus and text
  surface: "#FFFFFF",           // White for clean surfaces
  surface_variant: "#F8F4F1",   // Light warm tone matching the logo’s feel
  error: "#D32F2F",             // Keep standard red for errors
  success: "#2E7D32",           // Keep standard green for success
  warning: "#F57C00",           // Orange warning consistent with palette
},
    typography: { base_scale: 1.0, font_family: "Inter, system-ui" },
    layout: { density: "comfortable" as const, corner_style: "rounded" as const },
  },
  locale: {
    language: "en-IN",
    timezone: "Asia/Kolkata",
    date_format: "DD-MM-YYYY",
    time_format: "HH:mm",
    currency: "INR",
    number_format: { grouping: "lakh" as const },
  },
  modules: {
    catalog_version: "2025.11",
    subscribed: [
      "academics.attendance",
      "academics.timetable",
      "academics.exams",
      "academics.marks",
      "finance.fees",
      "media.media",
      "comms.announcements",
    ],
    available: [
      {
        key: "finance.ecommerce",
        label: "School Store",
        short_desc: "Uniforms & books",
        price_hint: "₹₹",
      },
    ],
    settings: {
      "academics.attendance": {
        marking_window_minutes: 30,
        allow_late_mark: true,
        late_threshold_minutes: 10,
      },
      "academics.timetable": {
        week_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        periods_per_day: 8,
        show_recess: true,
      },
      "academics.exams": {
        grading_scheme: "percentage",
        publish_policy: "admin_approve",
      },
      "academics.marks": {
        max_default_marks: 100,
        allow_grade_override: false,
      },
      "finance.fees": {
        payment_gateways: ["razorpay"],
        enable_partial_payments: true,
        auto_late_fee: true,
      },
      "media.media": {
        album_types_enabled: ["profile", "cultural"],
        max_upload_mb: 50,
      },
      "comms.announcements": {
        default_visibility: "school",
        allow_comments: false,
      },
    },
  },
  ui: {
    nav_order: [
      "dashboard",
      "academics.attendance",
      "academics.timetable",
      "academics.exams",
      "academics.marks",
      "finance.fees",
      "media.media",
      "comms.announcements",
      "settings",
    ],
    landing: {
      admin: "dashboard",
      teacher: "academics.attendance",
      student: "dashboard",
      parent: "dashboard",
    },
  },
  onboarding: {
    status: "in_progress" as const,
    steps: [{ key: "basic_info", weight: 10, done: true }],
    checklist_notes: "",
  },
};

// Dashboard mock data handlers
export const dashboardHandlers = [
  http.get('*/schools/:id/dashboard/metrics', () => {
    return HttpResponse.json({
      total_students: 1430,
      total_teachers: 85,
      total_classes: 42,
      pending_fees: 680000,
      announcements_count: 28,
      attendance_percentage: 93.5,
      student_growth_percentage: 12.5,
      fee_collection_percentage: 8.2,
      admission_growth_percentage: 5.8,
      announcement_growth_percentage: -2.4,
    });
  }),

  http.get('*/schools/:id/dashboard/revenue', () => {
    return HttpResponse.json([
      { month: 'Jan', fees: 450000, expenses: 320000, admissions: 380000 },
      { month: 'Feb', fees: 520000, expenses: 340000, admissions: 410000 },
      { month: 'Mar', fees: 480000, expenses: 350000, admissions: 390000 },
      { month: 'Apr', fees: 610000, expenses: 380000, admissions: 450000 },
      { month: 'May', fees: 580000, expenses: 360000, admissions: 420000 },
      { month: 'Jun', fees: 650000, expenses: 400000, admissions: 480000 },
      { month: 'Jul', fees: 720000, expenses: 420000, admissions: 510000 },
      { month: 'Aug', fees: 680000, expenses: 410000, admissions: 490000 },
    ]);
  }),

  http.get('*/schools/:id/dashboard/student-distribution', () => {
    return HttpResponse.json([
      { grade_range: 'Grade 1-5', count: 450, percentage: 31.5 },
      { grade_range: 'Grade 6-8', count: 380, percentage: 26.6 },
      { grade_range: 'Grade 9-10', count: 320, percentage: 22.4 },
      { grade_range: 'Grade 11-12', count: 280, percentage: 19.5 },
    ]);
  }),

  http.get('*/schools/:id/dashboard/attendance-by-grade', () => {
    return HttpResponse.json([
      { grade: '1st', present_percentage: 95, absent_percentage: 5, total_students: 180 },
      { grade: '2nd', present_percentage: 92, absent_percentage: 8, total_students: 175 },
      { grade: '3rd', present_percentage: 94, absent_percentage: 6, total_students: 185 },
      { grade: '4th', present_percentage: 91, absent_percentage: 9, total_students: 170 },
      { grade: '5th', present_percentage: 96, absent_percentage: 4, total_students: 190 },
      { grade: '6th', present_percentage: 93, absent_percentage: 7, total_students: 165 },
      { grade: '7th', present_percentage: 89, absent_percentage: 11, total_students: 160 },
      { grade: '8th', present_percentage: 90, absent_percentage: 10, total_students: 155 },
    ]);
  }),

  http.get('*/schools/:id/dashboard/module-usage', () => {
    return HttpResponse.json([
      { module_key: 'academics.attendance', module_name: 'Attendance', usage_percentage: 87, active_users: 74 },
      { module_key: 'academics.timetable', module_name: 'Timetable', usage_percentage: 92, active_users: 78 },
      { module_key: 'academics.exams', module_name: 'Exams', usage_percentage: 78, active_users: 66 },
      { module_key: 'finance.fees', module_name: 'Fees', usage_percentage: 95, active_users: 81 },
      { module_key: 'media.media', module_name: 'Media', usage_percentage: 65, active_users: 55 },
      { module_key: 'comms.announcements', module_name: 'Announcements', usage_percentage: 88, active_users: 75 },
    ]);
  }),
];

// Export all handlers
export const handlers = [
  http.get("*/schools/2/configuration", () => HttpResponse.json(springfield)),
  http.post("*/onboarding/principal-signup", () => HttpResponse.json({ ok: true })),
  ...dashboardHandlers,
  ...attendanceHandlers,
  ...timetableHandlers,
  ...examsHandlers,
  ...marksHandlers,
  ...agentHandlers,
];
