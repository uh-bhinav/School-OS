// mocks/attendance.handlers.ts
import { http, HttpResponse } from "msw";

export const attendanceHandlers = [
  http.get("*/v1/attendance/", () => {
    // Generate realistic attendance data with ~90% present rate
    const items = Array.from({ length: 28 }).map((_,i)=>({
      attendance_id: i+1,
      student_id: 1000+i,
      class_id: 101,
      date: "2025-11-08",
      // 90%+ present: only 2 late, 1 absent out of 28
      status: i === 5 ? "LATE" : i === 15 ? "LATE" : i === 20 ? "ABSENT" : "PRESENT",
      remarks: i === 20 ? "Sick" : null,
      marked_by: "admin@school",
      marked_at: new Date().toISOString()
    }));
    return HttpResponse.json({ items, total: 32 });
  }),

  http.get("*/v1/attendance/class/:classId/summary", ({ params }) => {
    const buckets = ["Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"]
      .map((g,i)=>({ grade_label:g, present_pct: 88 + (i%3)*3 }));
    return HttpResponse.json({ class_id:Number(params.classId), week_start:"2025-11-03", buckets });
  }),

  http.get("*/v1/attendance/class/:classId/range", ({ params }) => {
    const series = ["2025-11-01","2025-11-02","2025-11-03","2025-11-04","2025-11-05"].map((d,i)=>({
      date:d, present_count:24+(i%3), absent_count:3-(i%2), late_count:1+(i%2)
    }));
    return HttpResponse.json({ class_id:Number(params.classId), from:"2025-11-01", to:"2025-11-05", series });
  }),

  http.get("*/v1/attendance/students/:sid", ({ params }) => {
    const records = Array.from({ length: 10 }).map((_,i)=>({
      date: `2025-10-${10+i}`, status: i%7===0 ? "ABSENT":"PRESENT", class_id:101, remarks:null
    }));
    return HttpResponse.json({ student_id:Number(params.sid), records });
  }),
];
