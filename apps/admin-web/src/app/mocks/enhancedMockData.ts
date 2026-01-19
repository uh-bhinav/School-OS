// Example Mock Data for Testing Enhanced Features
// Place this in your mock handlers or use for testing

export const enhancedMockData = {
  // Realistic student data with varied patterns
  students: [
    { id: 1001, name: "Alice Johnson", grade: "8A" },
    { id: 1002, name: "Bob Smith", grade: "8A" },
    { id: 1003, name: "Carol Williams", grade: "8A" },
    { id: 1004, name: "David Brown", grade: "8A" },
    { id: 1005, name: "Emma Davis", grade: "8A" },
    // ... 25 more students
  ],

  // Daily attendance with realistic distribution
  dailyAttendance: {
    items: [
      { attendance_id: 1, student_id: 1001, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "teacher@school.com", marked_at: "2025-11-08T09:00:00Z" },
      { attendance_id: 2, student_id: 1002, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "teacher@school.com", marked_at: "2025-11-08T09:00:00Z" },
      { attendance_id: 3, student_id: 1003, class_id: 101, date: "2025-11-08", status: "LATE", remarks: "Bus delay", marked_by: "teacher@school.com", marked_at: "2025-11-08T09:15:00Z" },
      { attendance_id: 4, student_id: 1004, class_id: 101, date: "2025-11-08", status: "ABSENT", remarks: "Sick", marked_by: "teacher@school.com", marked_at: "2025-11-08T09:00:00Z" },
      { attendance_id: 5, student_id: 1005, class_id: 101, date: "2025-11-08", status: "PRESENT", remarks: null, marked_by: "teacher@school.com", marked_at: "2025-11-08T09:00:00Z" },
      // ... 23 more records (total 28)
    ],
    total: 32, // 4 students unmarked
  },

  // Weekly summary showing grade-level performance
  weeklySummary: {
    class_id: 101,
    week_start: "2025-11-03",
    buckets: [
      { grade_label: "Grade 1", present_pct: 96.5 }, // Excellent
      { grade_label: "Grade 2", present_pct: 94.2 }, // Excellent
      { grade_label: "Grade 3", present_pct: 95.8 }, // Excellent
      { grade_label: "Grade 4", present_pct: 88.3 }, // Good
      { grade_label: "Grade 5", present_pct: 91.7 }, // Excellent
      { grade_label: "Grade 6", present_pct: 78.9 }, // Needs Attention
      { grade_label: "Grade 7", present_pct: 86.4 }, // Good
      { grade_label: "Grade 8", present_pct: 87.5 }, // Good
    ],
  },

  // Monthly trend showing improvement
  monthlyTrend: {
    class_id: 101,
    from: "2025-11-01",
    to: "2025-11-08",
    series: [
      { date: "2025-11-01", present_count: 24, absent_count: 4, late_count: 2 }, // Friday
      { date: "2025-11-04", present_count: 26, absent_count: 2, late_count: 2 }, // Monday
      { date: "2025-11-05", present_count: 27, absent_count: 2, late_count: 1 }, // Tuesday
      { date: "2025-11-06", present_count: 28, absent_count: 1, late_count: 1 }, // Wednesday
      { date: "2025-11-07", present_count: 27, absent_count: 1, late_count: 2 }, // Thursday
      { date: "2025-11-08", present_count: 26, absent_count: 1, late_count: 1 }, // Friday
    ],
  },

  // Student history showing patterns
  studentHistory: {
    student_id: 1001,
    records: [
      { date: "2025-11-08", status: "PRESENT", class_id: 101, remarks: null },
      { date: "2025-11-07", status: "PRESENT", class_id: 101, remarks: null },
      { date: "2025-11-06", status: "LATE", class_id: 101, remarks: "Doctor appointment" },
      { date: "2025-11-05", status: "PRESENT", class_id: 101, remarks: null },
      { date: "2025-11-04", status: "PRESENT", class_id: 101, remarks: null },
      { date: "2025-11-01", status: "ABSENT", class_id: 101, remarks: "Sick" },
      { date: "2025-10-31", status: "PRESENT", class_id: 101, remarks: null },
      { date: "2025-10-30", status: "PRESENT", class_id: 101, remarks: null },
      { date: "2025-10-29", status: "PRESENT", class_id: 101, remarks: null },
      { date: "2025-10-28", status: "LATE", class_id: 101, remarks: "Traffic" },
    ],
  },

  // Bulk upload sample CSV content
  sampleCSV: `student_id,class_id,date,status,remarks
1001,101,2025-11-08,PRESENT,
1002,101,2025-11-08,ABSENT,Sick
1003,101,2025-11-08,LATE,Bus delay
1004,101,2025-11-08,PRESENT,
1005,101,2025-11-08,EXCUSED,Medical appointment`,

  // Expected insights based on above data
  expectedInsights: [
    {
      type: "success",
      title: "Good Attendance",
      description: "Weekly average is 89.9%. Continue monitoring students below 80%.",
    },
    {
      type: "warning",
      title: "Low Consistency Detected",
      description: "Grade 6 shows 78.9% attendance — needs attention.",
    },
    {
      type: "info",
      title: "4 Students Unmarked",
      description: "Complete attendance marking for accurate tracking today.",
    },
  ],
};

// Usage in components:
// import { enhancedMockData } from './enhancedMockData';
// const { dailyAttendance, weeklySummary, monthlyTrend } = enhancedMockData;
