# Custom Constraints Feature for AI Timetable Generation

## Overview
Enhanced the AI Timetable Generation dialog to allow administrators to input custom constraints with priority levels, giving them fine-grained control over the scheduling algorithm.

## What Was Changed

### 1. **Enhanced GenerateDialog Component** (`components/timetable/GenerateDialog.tsx`)

#### New Features:
- ✅ **Collapsible Constraints Section** - Users can expand/collapse the constraints form
- ✅ **Teacher Workload Limits**:
  - Max/Min Classes Per Day (1-10 range)
  - Max/Min Classes Per Week (1-50 range)
  - Prioritize Core Subjects toggle
- ✅ **Custom Text Constraints**:
  - Add free-form constraint descriptions
  - Assign priority level (High/Medium/Low)
  - Visual chips showing all added constraints
  - Easy removal with delete button

#### UI Components:
```typescript
// Teacher Workload Constraints
- TextField: Max Classes Per Day
- TextField: Max Classes Per Week
- TextField: Min Classes Per Day
- TextField: Min Classes Per Week
- Switch: Prioritize Core Subjects

// Custom Constraints
- TextField: Constraint description
- Select: Priority level (High/Medium/Low)
- IconButton: Add constraint
- Chip List: Display added constraints with delete option
```

#### Priority System:
1. **High Priority (Red)** - Must be enforced
2. **Medium Priority (Orange)** - Should be satisfied when possible
3. **Low Priority (Gray)** - Nice to have

### 2. **Updated Type Definitions** (`services/timetable.schema.ts`)

Added new Zod schemas:
```typescript
// Custom constraint with priority
CustomConstraint {
  id: string
  description: string
  priority: 1 | 2 | 3  // 1=High, 2=Medium, 3=Low
}

// Teacher workload limits
TeacherConstraints {
  maxClassesPerDay: number (1-10)
  maxClassesPerWeek: number (1-50)
  minClassesPerDay: number (0-10)
  minClassesPerWeek: number (0-50)
  prioritizeCoreSubjects: boolean
  coreSubjectNames: string[]
}

// Complete request schema
TimetableGenerateRequest {
  academic_year_id: number
  class_id: number
  section: string
  week_start?: string
  constraints?: CustomConstraint[]
  teacher_constraints?: TeacherConstraints
}
```

### 3. **Updated TimetablePage Handler** (`routes/academics/timetable/TimetablePage.tsx`)

Modified `handleGenerate` to accept and pass constraints to the backend:
```typescript
async function handleGenerate(constraints?: {
  customConstraints: CustomConstraint[];
  teacherConstraints: TeacherConstraints;
}) {
  await genMut.mutateAsync({
    academic_year_id: filters.academic_year_id,
    class_id: filters.class_id,
    section: filters.section,
    week_start: filters.week_start,
    constraints: constraints?.customConstraints,
    teacher_constraints: constraints?.teacherConstraints,
  });
}
```

### 4. **Updated API Layer** (`services/timetable.api.ts`)

- Changed `generateTimetable` function signature to use `TimetableGenerateRequest` type
- Ensures type safety throughout the request flow

## How Constraints Map to Backend

The constraints align with the backend's `TimetableGenerationService` as defined in:
- `backend/app/api/v1/endpoints/timetable_generation.py`
- `backend/app/services/timetable_generation_service.py`
- `backend/app/schemas/timetable_schema.py`

### Backend Constraint Handling:

1. **Teacher Workload Constraints** (`TimetableConstraint` in backend):
   - `max_classes_per_day` - Hard constraint (MUST enforce)
   - `max_classes_per_week` - Hard constraint (MUST enforce)
   - `min_classes_per_day` - Soft constraint (generates warning if violated)
   - `min_classes_per_week` - Soft constraint (generates warning if violated)
   - `prioritize_core_subjects` - Schedules Math/Science in morning slots
   - `core_subject_names` - List of subjects considered "core"

2. **Custom Text Constraints** (`ConstraintRule` in backend):
   - `rule_type` - Type of constraint
   - `target_type` - 'teacher', 'subject', or 'class'
   - `target_id` - ID of the entity
   - `parameters` - Rule-specific configuration
   - `priority` - 1=High, 2=Medium, 3=Low

## Example Usage

### Scenario 1: Strict Teacher Limits
```
Max Classes Per Day: 5
Max Classes Per Week: 25
Min Classes Per Day: 2
Prioritize Core Subjects: ON
```

### Scenario 2: PE Time Restrictions
```
Custom Constraint: "Schedule PE only in last 2 periods of the day"
Priority: High
```

### Scenario 3: Subject Gap Requirement
```
Custom Constraint: "Maintain at least 1-day gap between Mathematics classes"
Priority: Medium
```

### Scenario 4: Combined Constraints
```
Teacher Constraints:
- Max 6 classes/day
- Max 30 classes/week
- Core subjects in morning: ON

Custom Constraints:
1. [High] "No lab classes on Mondays"
2. [Medium] "Avoid scheduling the same teacher for consecutive periods"
3. [Low] "Prefer morning slots for theory subjects"
```

## UI/UX Features

### Visual Feedback:
- **Expandable Section**: Keeps the dialog clean by default
- **Color-Coded Priorities**: Red (High), Orange (Medium), Gray (Low)
- **Constraint Chips**: Easy-to-read display of all added constraints
- **Validation**: Min/max values enforced on number inputs
- **Keyboard Support**: Press Enter to add constraint quickly

### User Flow:
1. Click "Generate" button on Timetable page
2. Dialog opens with default AI features listed
3. Click "Custom Constraints" to expand form
4. Set teacher workload limits (optional)
5. Add custom text constraints with priorities (optional)
6. Review all constraints as chips
7. Click "Generate" to create timetable

## Integration Status

✅ **Frontend Complete**: All UI components and type definitions ready
⏳ **Backend Integration**: Constraints are being passed to API, backend needs to:
   - Parse `constraints` array
   - Parse `teacher_constraints` object
   - Apply constraints in `TimetableGenerationService`
   - Return validation results in response

## Future Enhancements

1. **Constraint Templates**: Save/load commonly used constraint sets
2. **Validation Preview**: Show which constraints might conflict before generation
3. **Smart Suggestions**: AI-powered constraint recommendations based on school data
4. **Constraint History**: Track which constraints produced best results
5. **Visual Constraint Builder**: Dropdown-based UI for structured constraints instead of free text

## Files Modified

```
apps/admin-web/src/app/
├── components/timetable/
│   └── GenerateDialog.tsx          ✅ Enhanced with constraints UI
├── routes/academics/timetable/
│   └── TimetablePage.tsx           ✅ Updated handler
├── services/
│   ├── timetable.api.ts            ✅ Updated API signature
│   └── timetable.schema.ts         ✅ Added new types
└── docs/
    └── TIMETABLE_CONSTRAINTS_FEATURE.md  ✅ This documentation
```

## Testing Checklist

- [ ] Open timetable page
- [ ] Click "Generate" button
- [ ] Expand "Custom Constraints" section
- [ ] Modify teacher workload limits
- [ ] Add custom constraint with High priority
- [ ] Add custom constraint with Medium priority
- [ ] Add custom constraint with Low priority
- [ ] Verify constraints display as chips with correct colors
- [ ] Remove a constraint using delete icon
- [ ] Submit form and verify constraints are passed to API
- [ ] Check network request includes `constraints` and `teacher_constraints`

## Notes

- All constraints are **optional** - users can generate without any custom constraints
- Default values are pre-filled for teacher constraints (max 6/day, 30/week)
- Core subjects are pre-configured: Mathematics, Science, Physics, Chemistry, Biology
- The dialog remembers state during session but resets on close
- Constraints are validated client-side (min/max ranges) before submission
