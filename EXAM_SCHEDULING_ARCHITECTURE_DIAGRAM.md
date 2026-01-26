# Exam Period Scheduling System - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │         ExamPeriodScheduler Component                         │   │
│  │                                                               │   │
│  │  Step 1: Period Setup                                        │   │
│  │  ┌─────────────────────────────────────────────────┐        │   │
│  │  │ • Exam Period Name                               │        │   │
│  │  │ • Exam Type (Mid-Term/Final/Unit Test)          │        │   │
│  │  │ • Start Date ─────────────┐                     │        │   │
│  │  │ • End Date   ─────────────┼──> Date Range       │        │   │
│  │  │ • Total Marks             │                     │        │   │
│  │  └───────────────────────────┼─────────────────────┘        │   │
│  │                               │                               │   │
│  │  Step 2: Calendar Review     │                               │   │
│  │  ┌───────────────────────────▼─────────────────────┐        │   │
│  │  │     Calendar View with Auto-Mapped Subjects      │        │   │
│  │  │                                                   │        │   │
│  │  │  Sun Mon Tue Wed Thu Fri Sat                    │        │   │
│  │  │  ─────────────────────────────                  │        │   │
│  │  │   🔴   ✅   ✅   ✅   ✅   ✅  🔴              │        │   │
│  │  │  (Holiday) (Math) (Phy) (Chem) (Bio) (Eng)      │        │   │
│  │  │                                                   │        │   │
│  │  │  Legend:                                         │        │   │
│  │  │  🔴 Holiday  ✅ Exam  🟡 Valid  ⚪ Sunday       │        │   │
│  │  └───────────────────────────────────────────────┘        │   │
│  │                                                               │   │
│  │  Step 3: Finalize & Generate Hall Tickets                   │   │
│  │  ┌─────────────────────────────────────────────────┐        │   │
│  │  │ ✅ Summary Review                                │        │   │
│  │  │ 🎫 Auto-Generate Hall Tickets                   │        │   │
│  │  └─────────────────────────────────────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           React Query Hooks (examPeriods.hooks.ts)           │   │
│  │                                                               │   │
│  │  • useCreateExamPeriod()        • useHolidays()             │   │
│  │  • useExamPeriods()             • useValidExamDates()       │   │
│  │  • useFinalizeExamPeriod()      • useGenerateHallTickets()  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (FastAPI + Python)                    │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              API Endpoints (exam_periods.py)                 │   │
│  │                                                               │   │
│  │  POST   /exam-periods/periods          Create Period        │   │
│  │  GET    /exam-periods/periods          List Periods         │   │
│  │  GET    /exam-periods/periods/{id}     Get Period           │   │
│  │  POST   /exam-periods/periods/{id}/finalize  Finalize       │   │
│  │  PUT    /exam-periods/schedules/{id}   Update Schedule      │   │
│  │  POST   /exam-periods/validate-date    Validate Date        │   │
│  │  GET    /exam-periods/valid-dates      Get Valid Dates      │   │
│  │  GET    /exam-periods/holidays         Get Holidays         │   │
│  │  POST   /exam-periods/holidays/seed    Seed Holidays        │   │
│  │  POST   /exam-periods/periods/{id}/hall-tickets  Generate   │   │
│  │  GET    /exam-periods/hall-tickets/{id}  Get Hall Ticket    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│                                ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Business Logic Services                  │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────┐        │   │
│  │  │  holiday_service.py                              │        │   │
│  │  │  • seed_indian_holidays()                        │        │   │
│  │  │  • get_holidays_in_range()                       │        │   │
│  │  │  • get_valid_exam_dates()  ◄──┐                │        │   │
│  │  │  • is_valid_exam_date()        │                │        │   │
│  │  └────────────────────────────────┼────────────────┘        │   │
│  │                                    │                          │   │
│  │  ┌─────────────────────────────────┼──────────────┐        │   │
│  │  │  exam_period_service.py         │              │        │   │
│  │  │  • create_exam_period() ────────┘              │        │   │
│  │  │  • auto_map_subjects_to_dates() ◄──────────┐  │        │   │
│  │  │    ├─ Exclude Sundays                       │  │        │   │
│  │  │    ├─ Exclude Holidays                      │  │        │   │
│  │  │    ├─ One subject per day                   │  │        │   │
│  │  │    └─ Sequential distribution               │  │        │   │
│  │  │  • update_subject_exam_date()               │  │        │   │
│  │  │  • finalize_exam_period()                   │  │        │   │
│  │  └────────────────────────────────────┼────────┘  │        │   │
│  │                                        │           │          │   │
│  │  ┌─────────────────────────────────────▼──────────┼────┐   │   │
│  │  │  hall_ticket_service.py                        │    │   │   │
│  │  │  • generate_hall_tickets_for_period() ◄────────┘    │   │   │
│  │  │    └─ Auto-triggered on finalization               │   │   │
│  │  │  • get_hall_ticket_data()                          │   │   │
│  │  │  • generate_ticket_number()                        │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│                                ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Database Models                           │   │
│  │                                                               │   │
│  │  ┌──────────────────┐  ┌──────────────────────────┐         │   │
│  │  │  ExamPeriod      │  │  SubjectExamSchedule     │         │   │
│  │  ├──────────────────┤  ├──────────────────────────┤         │   │
│  │  │ • id             │  │ • id                     │         │   │
│  │  │ • period_name    │  │ • exam_period_id  ───────┼──┐     │   │
│  │  │ • start_date     │  │ • subject_id             │  │     │   │
│  │  │ • end_date       │  │ • exam_date              │  │     │   │
│  │  │ • total_marks    │  │ • start_time             │  │     │   │
│  │  │ • status         │  │ • duration_minutes       │  │     │   │
│  │  └──────┬───────────┘  │ • max_marks              │  │     │   │
│  │         │               │ • is_auto_mapped         │  │     │   │
│  │         │               └──────────────────────────┘  │     │   │
│  │         │                                             │     │   │
│  │         │               ┌──────────────────────────┐  │     │   │
│  │         │               │  Holiday                 │  │     │   │
│  │         │               ├──────────────────────────┤  │     │   │
│  │         │               │ • id                     │  │     │   │
│  │         │               │ • name                   │  │     │   │
│  │         │               │ • date                   │  │     │   │
│  │         │               │ • holiday_type           │  │     │   │
│  │         │               │   (national/state/       │  │     │   │
│  │         │               │    school_specific)      │  │     │   │
│  │         │               └──────────────────────────┘  │     │   │
│  │         │                                             │     │   │
│  │         │               ┌──────────────────────────┐  │     │   │
│  │         └───────────────┤  HallTicket              │◄─┘     │   │
│  │                         ├──────────────────────────┤         │   │
│  │                         │ • id                     │         │   │
│  │                         │ • exam_period_id         │         │   │
│  │                         │ • student_id             │         │   │
│  │                         │ • ticket_number          │         │   │
│  │                         │ • generated_at           │         │   │
│  │                         │ • pdf_url (optional)     │         │   │
│  │                         └──────────────────────────┘         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   PostgreSQL Database  │
                    │   (via SQLAlchemy ORM) │
                    └───────────────────────┘
```

## Data Flow

### Creating an Exam Period

```
Principal Input
    │
    ▼
┌───────────────────────────────────────────────────┐
│ 1. Period Setup (Frontend)                        │
│    • Exam Period Name: "Mid-Term Exam 2026"       │
│    • Start Date: 2026-03-10                        │
│    • End Date: 2026-03-25                          │
│    • Total Marks: 500                              │
└───────────────────────┬───────────────────────────┘
                        │ POST /exam-periods/periods
                        ▼
┌───────────────────────────────────────────────────┐
│ 2. Create Exam Period (Backend)                   │
│    • Validate date range                           │
│    • Create ExamPeriod record                      │
│    • Status: "draft"                               │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│ 3. Auto-Mapping Logic                             │
│    ┌───────────────────────────────────────────┐ │
│    │ A. Get valid dates                        │ │
│    │    • Query holidays table                 │ │
│    │    • Exclude Sundays (weekday == 6)       │ │
│    │    • Exclude holidays                      │ │
│    │    Result: [Mar 10, 11, 12, 13, 14...]   │ │
│    └───────────────────────────────────────────┘ │
│    ┌───────────────────────────────────────────┐ │
│    │ B. Get subjects for class                 │ │
│    │    Query subjects table                   │ │
│    │    Result: [Math, Physics, Chem, Bio...]  │ │
│    └───────────────────────────────────────────┘ │
│    ┌───────────────────────────────────────────┐ │
│    │ C. Map subjects to dates                  │ │
│    │    For each subject:                      │ │
│    │      • Assign to next valid date          │ │
│    │      • Set start_time: 09:00              │ │
│    │      • Set duration: 60 mins              │ │
│    │      • Set marks: total_marks / n         │ │
│    │      • Create SubjectExamSchedule record  │ │
│    └───────────────────────────────────────────┘ │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│ 4. Return to Frontend                             │
│    • ExamPeriod with subject_schedules            │
│    • Display in calendar view                     │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│ 5. Principal Reviews & Finalizes                  │
│    • View calendar                                │
│    • (Optional) Edit dates                        │
│    • Click "Finalize"                             │
└───────────────────────┬───────────────────────────┘
                        │ POST /exam-periods/periods/{id}/finalize
                        ▼
┌───────────────────────────────────────────────────┐
│ 6. Finalization (Backend)                         │
│    • Update status: "draft" → "scheduled"         │
│    • Trigger hall ticket generation               │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│ 7. Hall Ticket Generation                         │
│    • Get all students in class/section            │
│    • For each student:                            │
│      • Generate unique ticket_number              │
│      • Create HallTicket record                   │
│      • (Optional) Generate PDF                    │
└───────────────────────────────────────────────────┘
                        │
                        ▼
                  ✅ Complete!
```

## Auto-Mapping Algorithm Flowchart

```
                    START
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Input:                       │
        │ • start_date                 │
        │ • end_date                   │
        │ • class_id                   │
        │ • total_marks                │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Get all dates in range      │
        │ current = start_date         │
        │ while current <= end_date:   │
        │   dates.append(current)      │
        │   current += 1 day           │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Filter valid dates          │
        │ valid_dates = []             │
        │ for date in dates:           │
        │   if NOT Sunday AND          │
        │      NOT Holiday:            │
        │     valid_dates.append(date) │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Get subjects for class      │
        │ subjects = query_subjects(   │
        │   class_id                   │
        │ )                            │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Validate                     │
        │ if len(subjects) >           │
        │    len(valid_dates):         │
        │   ERROR: Not enough dates    │
        └─────────────┬────────────────┘
                      │ OK
                      ▼
        ┌─────────────────────────────┐
        │ Calculate marks per subject │
        │ marks_per_subject =          │
        │   total_marks / len(subjects)│
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Map subjects to dates       │
        │ for idx, subject in          │
        │     enumerate(subjects):     │
        │   date = valid_dates[idx]    │
        │   create_schedule(           │
        │     subject, date,           │
        │     time="09:00",            │
        │     duration=60,             │
        │     marks=marks_per_subject  │
        │   )                          │
        └─────────────┬────────────────┘
                      │
                      ▼
                 ✅ DONE
            Return mappings
```

## Calendar View Legend

```
┌─────────────────────────────────────────────────────────┐
│              March 2026 Exam Calendar                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat         │
│  ────   ────   ────   ────   ────   ────   ────        │
│   8      9      10     11     12     13     14          │
│  🔴     ⚪     ✅     ✅     ✅     ✅     🔴         │
│        (Valid) (Math) (Phy) (Chem) (Bio)  (Holi)       │
│                                                          │
│  15     16     17     18     19     20     21           │
│  🔴     ✅     ✅     ✅     🟡     🟡     🔴         │
│ (Sun)  (Eng) (Hist) (Geo) (Valid)(Valid)(Sun)          │
│                                                          │
│  Legend:                                                │
│  🔴 Red    = Holiday/Sunday (Cannot schedule)           │
│  ✅ Green  = Exam scheduled                             │
│  🟡 Orange = Valid date (Available)                     │
│  ⚪ White  = Invalid/Already used                       │
│                                                          │
│  📊 Statistics:                                         │
│  • Total valid dates: 12                                │
│  • Subjects scheduled: 6                                │
│  • Remaining slots: 6                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Status Workflow

```
┌─────────┐    create    ┌───────────┐   finalize   ┌───────────┐
│ (None)  │ ────────────>│   draft   │ ───────────> │ scheduled │
└─────────┘              └───────────┘              └───────────┘
                              │                           │
                              │ edit                      │ start exams
                              │                           │
                              └──────────┐                ▼
                                         │         ┌─────────────┐
                                         └─────────│ in_progress │
                                                   └─────────────┘
                                                         │
                                                         │ finish
                                                         ▼
                                                   ┌───────────┐
                                                   │ completed │
                                                   └───────────┘
```

---

## Key Relationships

```
ExamPeriod (1) ──────────> (N) SubjectExamSchedule
    │                              │
    │                              │
    ▼                              ▼
AcademicYear                    Subject
Class
Section
ExamType

ExamPeriod (1) ──────────> (N) HallTicket
    │                              │
    │                              │
    ▼                              ▼
School                          Student

Holiday (N) <─────────── (1) School (optional)
    │
    │ (Used by)
    │
    ▼
exam_period_service.get_valid_exam_dates()
```

---

This visual architecture demonstrates the complete flow from principal input to automated hall ticket generation, showcasing the system's intelligence and efficiency.
