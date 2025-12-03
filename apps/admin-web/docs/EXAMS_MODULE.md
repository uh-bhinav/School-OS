# Exams Module - School-OS Admin Dashboard

## 📋 Overview

The **Exams Module** is a complete, production-ready feature of the School-OS Admin Dashboard that allows schools to manage exams, view performance metrics, publish results, and generate report cards. Built with React, TypeScript, Material-UI, and TanStack Query.

---

## ✨ Features

### Core Functionality
- ✅ **Exam Management** - Create, Read, Update, Delete (CRUD) operations
- ✅ **Advanced Filtering** - Filter by Academic Year, Class, Section, and Exam Type
- ✅ **KPI Dashboard** - Real-time metrics including:
  - Total Exams
  - Average Performance
  - Pass Rate
  - Pending Results
  - Published Exams Count
- ✅ **Publish/Unpublish** - Control visibility of exam results
- ✅ **Report Cards** - View detailed student-wise results with grades
- ✅ **Export Functionality** - Export data as CSV or PDF
- ✅ **Exam Details** - View comprehensive exam statistics and performance breakdown

### UI/UX Features
- 🎨 Responsive Material-UI design
- 📱 Mobile-friendly layouts
- ⚡ Loading states and skeletons
- 🚫 Empty states with helpful messages
- 🎯 Interactive tooltips explaining metrics
- 🌈 Color-coded status chips and grades
- 🔄 Smooth animations and transitions

---

## 🏗️ Architecture

### Directory Structure
```
src/
├── routes/academics/exams/
│   ├── ExamsRoute.tsx          # Role-based access guard
│   └── ExamsPage.tsx           # Main orchestrator component
│
├── components/exams/
│   ├── FiltersBar.tsx          # Filter controls
│   ├── KPICards.tsx            # Metrics dashboard
│   ├── ExamList.tsx            # Data table with actions
│   ├── ExamDetailDialog.tsx    # Exam statistics modal
│   ├── ReportCardPreview.tsx   # Student results viewer
│   ├── AddEditExamDialog.tsx   # Create/Edit form
│   ├── DeleteConfirmDialog.tsx # Deletion confirmation
│   ├── PublishBar.tsx          # Publish toggle
│   ├── ExportMenu.tsx          # CSV/PDF export
│   └── Legend.tsx              # Status/Grade legend
│
├── services/
│   ├── exams.schema.ts         # Zod schemas
│   ├── exams.api.ts            # API endpoints
│   ├── exams.hooks.ts          # React Query hooks
│   ├── reportcard.api.ts       # Report card endpoints
│   └── reportcard.hooks.ts     # Report card hooks
│
├── mocks/
│   └── exams.handlers.ts       # MSW mock handlers
│
└── stores/
    └── useExamStore.ts         # Zustand state (optional)
```

---

## 🔧 Technical Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **UI Library** | Material-UI v6 |
| **Data Fetching** | TanStack Query v5 |
| **State Management** | Zustand |
| **Validation** | Zod |
| **Routing** | React Router DOM |
| **Mocking** | MSW (Mock Service Worker) |

---

## 📊 Data Models

### Exam Schema
```typescript
{
  id: number;
  school_id: number;
  academic_year_id: number;
  class_id: number;
  section: string;
  exam_type_id: number;
  exam_type_name: string;
  title: string;
  date: string; // ISO date format
  total_marks: number;
  average_score?: number;
  highest_score?: number;
  pass_percentage?: number;
  is_published: boolean;
}
```

### ExamKPI Schema
```typescript
{
  total_exams: number;
  avg_performance: number;
  pass_rate: number;
  pending_results: number;
  published_count: number;
}
```

### ReportCard Schema
```typescript
{
  exam_id: number;
  exam_title: string;
  students: ReportCardSummary[];
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure MSW is initialized in your app:

```typescript
// src/main.tsx or similar
import { worker } from "./mocks/browser";

if (import.meta.env.DEV) {
  worker.start();
}
```

### 2. Usage
Navigate to `/academics/exams` in your application. The route is protected and only accessible to `admin` and `teacher` roles.

### 3. Mock Data
The module comes with comprehensive mock data including:
- 6 sample exams across different classes/sections
- 4 exam types (Mid-Term, Final, Unit Test, Monthly Test)
- Sample report card with student results

---

## 🔌 API Endpoints (Mock)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/exams` | Fetch exams with filters |
| `GET` | `/v1/exam_types/:school_id` | Get available exam types |
| `GET` | `/v1/exams/kpi` | Get KPI metrics |
| `POST` | `/v1/exams` | Create new exam |
| `PUT` | `/v1/exams/:id` | Update exam |
| `DELETE` | `/v1/exams/:id` | Delete exam |
| `POST` | `/v1/exams/:id/publish` | Publish/unpublish exam |
| `GET` | `/v1/report_cards/:exam_id` | Get report card |
| `GET` | `/v1/pdf/report_card/:exam_id` | Download report card PDF |

---

## 🔄 Integration with Backend

When backend is ready, follow these steps:

### Step 1: Update Base URL
```typescript
// services/http.ts
const http = axios.create({
  baseURL: process.env.VITE_API_BASE_URL, // e.g., "https://api.schoolos.com"
});
```

### Step 2: Remove MSW Handlers (Optional)
```typescript
// mocks/handlers.ts
export const handlers = [
  // Remove ...examsHandlers, when backend is live
];
```

### Step 3: Test All Flows
- ✅ Filters and data fetching
- ✅ CRUD operations
- ✅ Publish/unpublish
- ✅ Report card generation
- ✅ Export functionality

**That's it!** No code changes needed in components or hooks. The architecture is designed for seamless backend integration.

---

## 🎨 Theming

The module uses the school's primary color: `#0B5F5A`

Key style points:
- Buttons use primary accent color
- Status chips are color-coded (green for published, gray for draft)
- Grades use a color scale (green for A+, red for F)
- Hover effects and subtle animations throughout

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Filters
- [ ] Change academic year
- [ ] Change class
- [ ] Change section
- [ ] Filter by exam type
- [ ] Click "Apply Filters"

#### CRUD Operations
- [ ] Create a new exam
- [ ] Edit an existing exam
- [ ] Delete an exam (with confirmation)
- [ ] Validate required fields

#### View Operations
- [ ] View exam details
- [ ] View report card
- [ ] Check empty states

#### Publish Operations
- [ ] Publish an unpublished exam
- [ ] Unpublish a published exam

#### Export
- [ ] Export as CSV
- [ ] Verify CSV contents

---

## 🐛 Known Limitations

1. **PDF Export** - Currently shows alert. Requires backend implementation.
2. **Date Picker** - Uses native HTML5 date input (no external library to keep dependencies minimal).
3. **Report Card PDF Preview** - Mock blob data. Real implementation needs backend PDF generation.

---

## 📝 Component Props Reference

### FiltersBar
```typescript
interface FiltersBarProps {
  value: {
    academic_year_id: number;
    class_id: number;
    section: string;
    exam_type_id?: number;
  };
  onChange: (filters: Partial<...>) => void;
  classes: number[];
  sections: string[];
  examTypes?: Array<{ id: number; name: string }>;
  onApply: () => void;
}
```

### KPICards
```typescript
interface KPICardsProps {
  totalExams: number;
  avgPerformance: number;
  passRate: number;
  pendingResults: number;
  publishedCount: number;
  isLoading?: boolean;
}
```

### ExamList
```typescript
interface ExamListProps {
  exams: Exam[];
  onRefresh: () => void;
  isLoading?: boolean;
}
```

---

## 🚦 Performance Considerations

- **Pagination** - Not implemented. Add when exam lists exceed 50-100 items.
- **Virtualization** - Consider for report cards with 500+ students.
- **Debouncing** - Add for search/filter inputs if performance degrades.
- **React Query Cache** - Currently caches for default duration. Tune as needed.

---

## 🔐 Security & Access Control

- Route protected by `ExamsRoute.tsx`
- Only `admin` and `teacher` roles can access
- Module must be enabled in school configuration: `modules.subscribed` includes `"academics.exams"`

---

## 🎓 Learning Resources

- [Material-UI Docs](https://mui.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [MSW Docs](https://mswjs.io)
- [Zod Docs](https://zod.dev)

---

## 📞 Support

For issues or questions:
1. Check console for errors
2. Verify MSW handlers are registered
3. Ensure mock data matches schema
4. Review network tab for API calls

---

## 📄 License

Part of School-OS - Internal Use Only

---

**Built with ❤️ for modern school management**
