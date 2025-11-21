# Timetable Custom Constraints - UI Guide

## Visual Overview

### Before (Original Dialog)
```
┌─────────────────────────────────────────────┐
│ ✨ AI Timetable Generation                  │
├─────────────────────────────────────────────┤
│                                             │
│ ⚠️  This will replace current timetable     │
│                                             │
│ What the AI will do:                        │
│ ✓ Optimize teacher availability             │
│ ✓ Prevent room conflicts                    │
│ ✓ Balance subject distribution              │
│ ✓ Minimize teacher idle time                │
│                                             │
│ ℹ️  Tip: You can edit afterwards            │
│                                             │
├─────────────────────────────────────────────┤
│           [Cancel]  [✨ Generate]           │
└─────────────────────────────────────────────┘
```

### After (Enhanced with Constraints)
```
┌─────────────────────────────────────────────────────────────┐
│ ✨ AI Timetable Generation                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚠️  This will replace current timetable                     │
│                                                             │
│ What the AI will do:                                        │
│ ✓ Optimize teacher availability                             │
│ ✓ Prevent room conflicts                                    │
│ ✓ Balance subject distribution                              │
│ ✓ Minimize teacher idle time                                │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ 🎛️ ▼ Custom Constraints (3)                               │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │                                                       │   │
│ │ Teacher Workload Limits                               │   │
│ │                                                       │   │
│ │ [Max Classes Per Day: 6    ] [Max/Week: 30    ]     │   │
│ │ [Min Classes Per Day: 2    ] [Min/Week: 10    ]     │   │
│ │                                                       │   │
│ │ ☑ Prioritize core subjects in morning slots          │   │
│ │                                                       │   │
│ │ ─────────────────────────────────────────────────── │   │
│ │                                                       │   │
│ │ Additional Constraints                                │   │
│ │ Add specific rules (e.g., "No PE before 11 AM")      │   │
│ │                                                       │   │
│ │ [Enter constraint...        ] [Priority ▼] [+]       │   │
│ │                                                       │   │
│ │ 🔴 [High] No lab classes on Mondays             [×]  │   │
│ │ 🟠 [Medium] Math classes 1-day gap minimum      [×]  │   │
│ │ ⚪ [Low] Prefer theory in morning               [×]  │   │
│ │                                                       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ℹ️  Tip: You can edit the timetable afterwards             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    [Cancel]  [✨ Generate]                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Expandable Section Header
```tsx
┌────────────────────────────────────┐
│ 🎛️ ▼ Custom Constraints (3)      │  ← Click to expand/collapse
└────────────────────────────────────┘
```

**Behavior:**
- Shows count of active custom text constraints
- Arrow indicates expand/collapse state
- Collapsed by default for clean first impression

---

### 2. Teacher Workload Grid (2×2 Layout)
```tsx
┌─────────────────────────────────────────────┐
│ Teacher Workload Limits                     │
├────────────────────┬────────────────────────┤
│ Max Classes/Day: 6 │ Max Classes/Week: 30   │
├────────────────────┼────────────────────────┤
│ Min Classes/Day: 2 │ Min Classes/Week: 10   │
└────────────────────┴────────────────────────┘
```

**Input Specifications:**
- **Max Classes Per Day**: 1-10 range, default 6
- **Max Classes Per Week**: 1-50 range, default 30
- **Min Classes Per Day**: 0-10 range, default 2
- **Min Classes Per Week**: 0-50 range, default 10

**Validation:**
- Client-side range enforcement
- Numbers only
- Invalid values show red outline

---

### 3. Core Subjects Toggle
```tsx
☑ Prioritize core subjects in morning slots
```

**Behavior:**
- Default: ON (checked)
- When enabled: Math, Science, Physics, Chemistry, Biology scheduled before lunch
- When disabled: No preference given to core subjects

---

### 4. Custom Constraint Input Bar
```tsx
┌──────────────────────────────────────────────────┐
│ [Enter constraint description...] [Priority ▼] [+] │
└──────────────────────────────────────────────────┘
```

**Features:**
- **Text Field**: Free-form constraint description
- **Priority Dropdown**: High (1) / Medium (2) / Low (3)
- **Add Button**: Disabled until text is entered
- **Keyboard Shortcut**: Press Enter to add quickly

**Examples:**
```
"No PE classes before 11:00 AM"
"Mathematics should have at least 1-day gap between classes"
"Avoid same teacher for consecutive periods"
"Schedule lab subjects in afternoon only"
"Reserve Friday last period for extra-curricular"
```

---

### 5. Constraint Chips Display
```tsx
🔴 [High] No lab classes on Mondays                    [×]
🟠 [Medium] Math classes 1-day gap minimum             [×]
⚪ [Low] Prefer theory subjects in morning slots       [×]
```

**Visual Encoding:**
| Priority | Color  | Icon | When to Use |
|----------|--------|------|-------------|
| High     | Red    | 🔴   | MUST enforce (hard constraint) |
| Medium   | Orange | 🟠   | SHOULD satisfy (soft constraint) |
| Low      | Gray   | ⚪   | Nice to have (preference) |

**Interaction:**
- Click **[×]** to remove constraint
- Chips wrap to multiple lines if needed
- Auto-scroll if list exceeds container height

---

## User Interaction Flow

### Quick Generate (No Constraints)
1. Click "Generate" button on main timetable page
2. Dialog appears with default constraints
3. Click "Generate" immediately
4. AI uses default settings only

### Custom Generate (With Constraints)
1. Click "Generate" button on main timetable page
2. Dialog appears
3. Click "🎛️ Custom Constraints" to expand
4. **Adjust Teacher Limits:**
   - Reduce max classes per day to 5
   - Increase min classes per week to 15
5. **Add Custom Rules:**
   - Type: "No PE before lunch"
   - Select: Priority → High
   - Click [+] or press Enter
6. **Add Another Rule:**
   - Type: "Chemistry needs consecutive periods"
   - Select: Priority → High
   - Click [+]
7. Review all constraints as chips
8. Click "Generate"
9. Wait for progress bar (0% → 100%)
10. Success message appears
11. Dialog auto-closes
12. Grid refreshes with new timetable

---

## State Management

### Component State
```typescript
// Collapse state
showConstraints: boolean = false

// Custom text constraints
customConstraints: CustomConstraint[] = []
newConstraintText: string = ""
newConstraintPriority: 1 | 2 | 3 = 2

// Teacher workload
teacherConstraints: TeacherConstraints = {
  maxClassesPerDay: 6,
  maxClassesPerWeek: 30,
  minClassesPerDay: 2,
  minClassesPerWeek: 10,
  prioritizeCoreSubjects: true,
  coreSubjectNames: ["Mathematics", "Science", ...]
}

// Generation status
status: "idle" | "generating" | "success" | "error"
progress: 0-100
```

### Reset Behavior
When dialog closes:
- ✅ All constraints are cleared
- ✅ Teacher limits reset to defaults
- ✅ Custom constraint list emptied
- ✅ Section collapses back to hidden
- ✅ Status returns to idle

---

## Responsive Design

### Desktop (≥1024px)
- Full dialog width: 900px
- Teacher grid: 2 columns
- Constraint chips: Multiple per row
- All controls visible

### Tablet (768px-1023px)
- Dialog width: 90% viewport
- Teacher grid: 2 columns (stacked if tight)
- Constraint chips: 2-3 per row
- Input bar stacks vertically

### Mobile (<768px)
- Dialog: Full width with padding
- Teacher grid: 1 column (stacked)
- Constraint chips: 1 per row
- Priority dropdown moves below text field

---

## Accessibility

### Keyboard Navigation
- **Tab**: Move between inputs
- **Enter**: Add constraint (when in text field)
- **Escape**: Close dialog
- **Space**: Toggle switch/checkbox

### Screen Reader Support
- All inputs have proper labels
- Priority levels announced
- Constraint count announced in header
- Success/error messages announced

### ARIA Labels
```tsx
<TextField
  label="Max Classes Per Day"
  aria-label="Maximum classes a teacher can have per day"
  inputProps={{
    min: 1,
    max: 10,
    'aria-describedby': 'max-day-help'
  }}
/>
```

---

## Error Handling

### Invalid Input
```tsx
❌ Max Classes Per Day: 15  ← Exceeds max (10)
   Red outline + error text below
```

### Constraint Conflicts
```tsx
⚠️  Warning: "No classes on Friday" conflicts with
    "5 working days required"
```

### Generation Failure
```tsx
┌─────────────────────────────────────────┐
│ ❌ Generation failed.                   │
│ Please check constraints and try again  │
│ or contact support.                     │
│                                         │
│ Conflicts detected:                     │
│ • Teacher X already has 7 classes/day   │
│ • Not enough slots for all subjects     │
└─────────────────────────────────────────┘
```

---

## Integration Points

### Frontend → Backend Mapping
```typescript
// Frontend sends:
{
  academic_year_id: 2,
  class_id: 19,
  section: "A",
  constraints: [
    { id: "1", description: "No PE before 11 AM", priority: 1 },
    { id: "2", description: "Math 1-day gap", priority: 2 }
  ],
  teacher_constraints: {
    maxClassesPerDay: 5,
    maxClassesPerWeek: 25,
    minClassesPerDay: 2,
    minClassesPerWeek: 10,
    prioritizeCoreSubjects: true,
    coreSubjectNames: ["Mathematics", "Science"]
  }
}

// Backend processes:
// 1. Parse teacher_constraints → TimetableConstraint
// 2. Parse constraints → List[ConstraintRule]
// 3. Run scheduling algorithm with constraints
// 4. Return success/failure + generated entries
```

---

## Testing Scenarios

### Scenario 1: Default Generation
- Open dialog
- Don't expand constraints
- Click Generate
- ✅ Should use system defaults

### Scenario 2: Teacher Overload Prevention
- Set max classes/day = 3
- Add 10 subjects (50 periods total)
- ⚠️ Should fail with "Not enough slots" error

### Scenario 3: Core Subject Priority
- Enable "Prioritize core subjects"
- Generate timetable
- ✅ Math/Science should appear in periods 1-4

### Scenario 4: Custom Time Restrictions
- Add: "No PE before period 5" (High)
- Generate
- ✅ All PE classes should be in periods 5-8

### Scenario 5: Multiple Constraints
- Add 5 different constraints (mix of priorities)
- Generate
- ✅ High priority constraints must be satisfied
- ⚠️ Medium/Low can generate warnings if violated

---

## Performance Considerations

- **Constraint validation**: Client-side only (no API calls)
- **Dialog render**: Lazy-loaded, no performance impact when closed
- **Chip rendering**: Virtual scrolling if >20 constraints (unlikely)
- **Generation time**: Depends on backend (typically 2-5 seconds)

---

## Future Enhancements (V2)

1. **Constraint Templates**
   ```
   📋 Load Template ▼
   ├─ Strict Schedule (max 5/day)
   ├─ Balanced (default)
   └─ Flexible (max 8/day)
   ```

2. **Conflict Preview**
   ```
   ⚠️ Potential Issues:
   • Teacher A: Will exceed 6 classes on Monday
   • PE: Only 2 afternoon slots available (need 3)
   ```

3. **Natural Language Processing**
   ```
   Instead of: "No PE before period 5"
   Type: "Schedule PE in afternoon"
   AI interprets → period 5-8
   ```

4. **Constraint Validation Score**
   ```
   Constraint Quality: 85/100
   ✓ All constraints are achievable
   ⚠️ "Same teacher consecutive" may be hard (95% confidence)
   ```
