# Teacher Workflow: Outcome-Based Evaluation in School OS

This document describes the complete teacher workflow for Outcome-Based Evaluation (OBE) and marks entry in School OS.

---

## Overview

School OS supports a modern, outcome-based evaluation system where:
1. **Subjects** are defined by the principal/admin
2. **Course Outcomes (COs)** are defined per subject
3. **Exams** are created with associated question papers
4. **Questions** are mapped to specific COs
5. **Teachers enter marks per question** (not aggregate totals)
6. **CO Attainment is automatically calculated** from question-wise marks

This approach provides granular insight into which learning outcomes students have achieved.

---

## Workflow Steps

### 1. Subject Setup (Admin/Principal)

**Location:** `Academics → Subjects`

- Principal defines subjects for the school
- Each subject has:
  - Name (e.g., "Mathematics")
  - Code (e.g., "MATH-101")
  - Grade level
  - Assigned teacher

### 2. Course Outcome (CO) Definition (Teacher/Admin)

**Location:** `Academics → Subjects → [Subject] → Course Outcomes`

For each subject, the assigned teacher (or admin) defines Course Outcomes:

| CO Code | Description | Target Attainment |
|---------|-------------|-------------------|
| CO1 | Understand basic algebraic concepts | 70% |
| CO2 | Apply formulas to solve problems | 65% |
| CO3 | Analyze and interpret graphs | 60% |

Each CO has:
- **Code**: Short identifier (e.g., CO1, CO2)
- **Description**: What the student should learn
- **Target Attainment**: Minimum percentage to consider CO "achieved"

### 3. Exam Creation (Admin)

**Location:** `Academics → Exams`

Admin creates exams with:
- Exam name (e.g., "Mid-Term Examination")
- Exam type (Unit Test, Mid-Term, Final)
- Start and end dates
- Academic year
- Associated classes

### 4. Question Paper Setup (Teacher)

**Location:** `Academics → Exams → [Exam] → Subjects → [Subject] → Question-CO Mapping`

For each subject in an exam, the teacher:

1. **Adds Questions**: Define each question in the paper
2. **Maps Questions to COs**: Link each question to a Course Outcome
3. **Sets Max Marks**: Define maximum marks per question

Example question paper structure:

| Question | Description | Max Marks | Mapped CO |
|----------|-------------|-----------|-----------|
| Q1 | Define algebra and give examples | 5 | CO1 |
| Q2 | Solve quadratic equation: x² + 5x + 6 = 0 | 10 | CO2 |
| Q3 | Plot the graph of y = 2x + 3 | 10 | CO3 |
| Q4 | Interpret the slope of a linear graph | 5 | CO3 |
| Q5 | Apply formula to find roots | 10 | CO2 |

### 5. Question-wise Marks Entry (Teacher)

**Location:** `Academics → Exams → [Exam] → Subjects → [Subject] → Marks Entry`

After the exam is conducted:

1. Teacher selects the exam and subject
2. System displays a grid with:
   - **Rows**: Students in the class
   - **Columns**: Questions (with CO tags and max marks)
3. Teacher enters marks obtained per question per student
4. System shows:
   - **Row totals**: Student's total marks
   - **CO-wise preview**: Real-time CO attainment calculation

**UI Features:**
- Color-coded questions by CO
- Dirty state indicator (unsaved changes highlighted)
- Auto-save or explicit Save button
- Percentage and grade calculation

### 6. CO Attainment Calculation (Automatic)

**Location:** `Academics → CO Attainment`

The system automatically calculates CO attainment based on:

```
CO Attainment % = (Sum of marks obtained in questions mapped to CO) / (Sum of max marks for those questions) × 100
```

**Example:**
- CO2 has Q2 (10 marks) and Q5 (10 marks) = 20 max marks
- Student A scored: Q2 = 8, Q5 = 9 → CO2 Attainment = 17/20 = 85%

The CO Attainment page shows:
- Class-level attainment per CO
- Individual student attainment
- Trend analysis across exams
- Gap analysis (COs below target)

---

## Page Navigation

| Action | Navigation Path |
|--------|-----------------|
| View/Add Subjects | Academics → Subjects |
| Define COs for Subject | Academics → Subjects → [Subject] → Course Outcomes |
| Create Exam | Academics → Exams → Add Exam |
| Map Questions to COs | Academics → Exams → [Exam] → Subjects → [Subject] → Question-CO Mapping |
| Enter Question-wise Marks | Academics → Exams → [Exam] → Subjects → [Subject] → Marks Entry |
| View CO Attainment | Academics → CO Attainment |

---

## Alternative: Legacy Marks Entry

**Location:** `Academics → Marks`

For schools not using OBE, the legacy marks page allows:
- Direct total marks entry per student per subject
- No CO mapping required
- Simpler workflow but less insight

**Note:** The banner on this page recommends using the OBE workflow for better assessment insights.

---

## Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Subject   │────▶│    COs      │     │    Exam     │
│  (Admin)    │     │ (Teacher)   │     │  (Admin)    │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                          │                    │
                          ▼                    ▼
                   ┌─────────────────────────────────┐
                   │   Exam-Subject Question Paper   │
                   │  (Questions mapped to COs)      │
                   │         (Teacher)               │
                   └─────────────┬───────────────────┘
                                 │
                                 ▼
                   ┌─────────────────────────────────┐
                   │   Question-wise Marks Entry     │
                   │         (Teacher)               │
                   └─────────────┬───────────────────┘
                                 │
                                 ▼
                   ┌─────────────────────────────────┐
                   │   Auto CO Attainment Calc       │
                   │         (System)                │
                   └─────────────────────────────────┘
```

---

## Key Files (For Developers)

| File | Purpose |
|------|---------|
| `routes/academics/subjects/SubjectsPage.tsx` | Subject listing and management |
| `routes/academics/obe/COAttainmentPage.tsx` | CO Attainment dashboard |
| `routes/academics/exams/subjects/QuestionCOMappingPage.tsx` | Question-CO mapping UI |
| `routes/academics/exams/subjects/QuestionMarksEntryPage.tsx` | Question-wise marks entry grid |
| `services/obe.hooks.ts` | OBE data fetching hooks |
| `services/obe.api.ts` | OBE API endpoints |
| `mockDataProviders/mockSubjects.ts` | Mock subject data |
| `mockDataProviders/mockCOAttainment.ts` | Mock CO attainment data |
| `mocks/obe.handlers.ts` | MSW handlers for OBE endpoints |

---

## MSW Mock Data (Development)

In development mode, MSW intercepts OBE-related API calls and returns mock data:

- **Subjects**: Mathematics, Physics, Chemistry, English, Biology
- **COs**: 3-4 COs per subject with realistic descriptions
- **Questions**: Sample question papers with CO mappings
- **Marks**: Pre-filled marks for demo students

This allows the UI to be fully demonstrated without backend connectivity.

---

## Best Practices

1. **Define COs before exams**: Ensure Course Outcomes are set up for each subject before creating question papers
2. **Consistent CO granularity**: Keep COs at a consistent level of detail (not too broad, not too narrow)
3. **Map all questions**: Every question should be mapped to exactly one CO
4. **Review attainment regularly**: Use CO Attainment reports to identify learning gaps
5. **Use question-wise entry**: Prefer the OBE workflow over legacy marks entry for better insights

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Subjects page shows 404 | Ensure MSW is running (check console for "MSW Ready") |
| CO Attainment shows no data | Ensure marks are entered via question-wise entry |
| Marks not saving | Check network tab for API errors; ensure valid session |
| Question-CO mapping empty | Add questions first via the mapping page |

---

*Last Updated: January 2025*
