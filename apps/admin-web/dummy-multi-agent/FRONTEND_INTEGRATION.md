# Frontend Integration Guide — SchoolOS Multi-Agent Enhancements

> This document details all API contract changes and frontend wiring needed to integrate the 5 new backend enhancements.

---

## Table of Contents

1. [Enhancement 0 — Response Formatting](#enhancement-0--response-formatting)
2. [Enhancement 1 — Email Draft Approval Workflow](#enhancement-1--email-draft-approval-workflow)
3. [Enhancement 2 — CSV/Excel Exports](#enhancement-2--csvexcel-exports)
4. [Enhancement 3 — Exam Scheduling Agent](#enhancement-3--exam-scheduling-agent)
5. [Enhancement 4 — Context Chips](#enhancement-4--context-chips)
6. [API Reference](#api-reference)

---

## Enhancement 0 — Response Formatting

### What Changed

The backend system prompt now instructs Gemini to produce **properly formatted markdown** with:
- `###` section headings
- Real blank lines between paragraphs
- `**bold**` only for names/values — not entire sentences
- Tables for structured multi-column data
- Bullet points with one item per line

### Frontend Action Required

**`MarkdownRenderer.tsx`** — The existing ReactMarkdown + `remarkGfm` setup should already handle this correctly. Verify:

```tsx
// Ensure these are active in MarkdownRenderer:
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// The newline normalization should preserve \n\n as paragraph breaks:
const normalized = text.replace(/\\n/g, '\n');
```

**Test**: Send "show attendance for all students" — response should now have clear section headers, tables, and readable paragraphs instead of a wall of bold text.

---

## Enhancement 1 — Email Draft Approval Workflow

### How It Works

1. User says: "email the parents of Aarav Sharma about low attendance"
2. Backend creates a **draft** (not sent yet) and returns it for review
3. User can **approve**, **edit**, or **reject** the draft
4. Only approved drafts are sent via SMTP

### API Changes

#### `POST /api/chat/send` — New Response Fields

```typescript
interface ChatResponse {
  // ... existing fields ...
  email_draft?: {
    draft_id: string;
    to: string;
    subject: string;
    body: string;
    status: 'draft_pending' | 'approved' | 'editing' | 'rejected' | 'sent' | 'failed';
    created_at: string;
  };
  awaiting_approval?: boolean; // true when a draft needs user action
}
```

#### Draft Action Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/drafts/{draft_id}/approve` | `{}` | Approve and send |
| `POST` | `/api/drafts/{draft_id}/reject` | `{}` | Discard draft |
| `POST` | `/api/drafts/{draft_id}/edit` | `{ edited_subject?, edited_body?, edited_to? }` | Modify then re-review |
| `GET` | `/api/drafts/{draft_id}` | — | Get current draft state |

### Frontend Implementation

#### 1. Update `useChatStore.ts` — Add to Message type

```typescript
interface Message {
  // ... existing fields ...
  email_draft?: {
    draft_id: string;
    to: string;
    subject: string;
    body: string;
    status: string;
    created_at: string;
  };
  awaiting_approval?: boolean;
}
```

#### 2. Update `chatService.ts` — Map new fields

```typescript
// In sendMessageToBackend(), add to the response mapping:
email_draft: data.email_draft || undefined,
awaiting_approval: data.awaiting_approval || false,
```

#### 3. Create `EmailDraftCard.tsx` — Draft approval UI

```tsx
// Key component showing the draft with Approve/Edit/Reject buttons
interface EmailDraftCardProps {
  draft: {
    draft_id: string;
    to: string;
    subject: string;
    body: string;
    status: string;
  };
  onApprove: (draftId: string) => void;
  onReject: (draftId: string) => void;
  onEdit: (draftId: string, edits: object) => void;
}
```

Visual layout:
```
┌─────────────────────────────────────┐
│ 📧 Email Draft — Review & Approve  │
├─────────────────────────────────────┤
│ To: parent@email.com                │
│ Subject: Attendance Alert — Aarav   │
│                                     │
│ Dear Parent/Guardian,               │
│ This is regarding the attendance... │
│                                     │
│ [✅ Approve & Send] [✏️ Edit] [❌]  │
└─────────────────────────────────────┘
```

#### 4. Update `MessageList.tsx` — Render draft cards

```tsx
// After the existing report download button logic, add:
{msg.email_draft && (
  <EmailDraftCard
    draft={msg.email_draft}
    onApprove={handleApproveDraft}
    onReject={handleRejectDraft}
    onEdit={handleEditDraft}
  />
)}
```

#### 5. Text-based approval (already works)

Users can also approve/reject via chat text:
- "approve" / "send it" / "looks good" → Approves
- "reject" / "cancel" / "don't send" → Rejects
- "change the subject to ..." → Edits

---

## Enhancement 2 — CSV/Excel Exports

### How It Works

When a fees-related query contains words like "unpaid", "defaulters", "export", "download", "csv", the backend:
1. Generates a CSV file in `generated_exports/`
2. Returns export metadata in the response

### API Changes

#### `POST /api/chat/send` — New Response Field

```typescript
interface ChatResponse {
  // ... existing fields ...
  export?: {
    file_name: string;   // e.g., "unpaid_invoices_20250101_120000.csv"
    file_path: string;
    row_count: number;
    format: 'csv' | 'xlsx';
  };
}
```

#### Export Download Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/exports/download/{file_name}` | Download the export file |
| `GET` | `/api/exports/list` | List all available exports |

### Frontend Implementation

#### 1. Update `MessageList.tsx` — Add download button

```tsx
// After the report download button, add export button:
{msg.export && (
  <button
    onClick={() => downloadExport(msg.export.file_name)}
    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700
               rounded-lg hover:bg-green-100 transition-colors mt-2"
  >
    <TableCellsIcon className="w-4 h-4" />
    📥 Download {msg.export.format.toUpperCase()} ({msg.export.row_count} rows)
  </button>
)}
```

#### 2. Download function in `chatService.ts`

```typescript
export async function downloadExport(fileName: string): Promise<void> {
  const url = `${API_BASE}/api/exports/download/${encodeURIComponent(fileName)}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}
```

---

## Enhancement 3 — Exam Scheduling Agent

### How It Works

Multi-turn conversational workflow:
1. User says: "Schedule final exams for Grade 10"
2. Agent asks for missing info (date range, subjects, duration, halls, etc.)
3. User provides details across multiple messages
4. Agent generates a conflict-free schedule and returns it for review

### API Changes

No new endpoints — the exam scheduler is fully integrated into `/api/chat/send`. The response `message` contains the scheduling conversation and final schedule.

### Frontend Behavior

The exam scheduling is entirely text-based in the chat. No special UI components needed. The agent will:
- Show progress with `✅ Collected` / `❓ Still needed` markers
- Display the final schedule as a formatted markdown table
- Ask for confirmation: "approve" / "regenerate"

Example conversation flow:
```
User: Schedule final exams for grade 10
Agent: I'll help schedule exams. I need some details:
       ✅ Grades: Grade 10
       ❓ Date range: (e.g., "Dec 1-15")
       ❓ Subjects: (e.g., "Math, Science, English")
       ...

User: Dec 1 to Dec 15, Math Science English Hindi
Agent: ✅ Grades: Grade 10
       ✅ Dates: Dec 1-15
       ✅ Subjects: Math, Science, English, Hindi
       ❓ Exam duration: (e.g., "2 hours")
       ...

User: 2 hours each, 3 halls available
Agent: Here's the proposed schedule:
       | Date   | Subject | Time        | Hall |
       |--------|---------|-------------|------|
       | Dec 1  | Math    | 9:00-11:00  | H1   |
       ...
       Type "approve" to confirm or "regenerate" for changes.
```

---

## Enhancement 4 — Context Chips (Cmd/Ctrl+Click)

### How It Works

1. User Cmd/Ctrl+Clicks on a dashboard KPI, chart, or student card
2. Frontend captures the context via `data-*` attributes (existing `contextCapture.ts`)
3. Context chips appear above the input bar (existing `ContextChips.tsx`)
4. When user sends a message, chips are sent as `context_chips` in the request
5. Backend enriches the user query with the chip context before processing

### API Changes

#### `POST /api/chat/send` — New Request Field

```typescript
interface ChatRequest {
  message: string;
  session_id?: string;
  role: 'principal' | 'super_admin';
  context_chips?: ContextChip[];  // NEW
}

interface ContextChip {
  type: 'kpi' | 'metric_insight' | 'entity' | 'student' | 'chart_point'
        | 'chart_datapoint' | 'class';
  label: string;
  value?: string | number;
  metadata?: Record<string, any>;
}
```

### Frontend Implementation

#### 1. Update `chatService.ts` — Send chips with message

```typescript
export async function sendMessageToBackend(
  message: string,
  sessionId: string,
  role: string,
  contextChips?: ContextChip[]  // ADD THIS PARAM
): Promise<...> {
  const response = await fetch(`${API_BASE}/api/chat/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      role,
      context_chips: contextChips?.length ? contextChips : undefined,  // NEW
    }),
  });
  // ...
}
```

#### 2. Update `InputBar.tsx` — Pass chips on send

```typescript
// In handleSendInternal():
const chips = useChatStore.getState().contextChips;

await sendMessageToBackend(
  trimmedMessage,
  sessionId,
  role,
  chips.length > 0 ? chips : undefined  // Pass context chips
);

// Clear chips after sending
useChatStore.getState().clearChips();
```

#### 3. Dashboard Elements — Add `data-*` attributes

The existing `contextCapture.ts` already listens for Cmd/Ctrl+Click. Just ensure dashboard elements have the right attributes:

```html
<!-- KPI Card -->
<div data-kpi="attendance_rate" data-value="87.5">
  Attendance Rate: 87.5%
</div>

<!-- Student Card -->
<div data-entity="student" data-name="Aarav Sharma" data-id="STU001">
  Aarav Sharma — Grade 10-A
</div>

<!-- Chart Data Point (on chart hover/click) -->
<div data-chart="attendance_trend" data-label="January" data-value="92">
  January: 92%
</div>

<!-- Class Card -->
<div data-class="Grade 10-A" data-strength="45">
  Grade 10-A (45 students)
</div>
```

---

## API Reference

### All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat/new_session` | Create session |
| `POST` | `/api/chat/send` | Send message (with context_chips) |
| `GET` | `/api/chat/history/{session_id}` | Get history |
| `GET` | `/api/reports/download/{file_name}` | Download PDF report |
| `GET` | `/api/reports/list` | List reports |
| `GET` | `/api/exports/download/{file_name}` | Download CSV/Excel |
| `GET` | `/api/exports/list` | List exports |
| `POST` | `/api/drafts/{draft_id}/approve` | Approve email draft |
| `POST` | `/api/drafts/{draft_id}/reject` | Reject email draft |
| `POST` | `/api/drafts/{draft_id}/edit` | Edit email draft |
| `GET` | `/api/drafts/{draft_id}` | Get draft state |

### ChatResponse Full Schema

```typescript
interface ChatResponse {
  message: string;
  session_id: string;
  agentId: string;
  timestamp: string;
  chart?: { base64_image: string; chart_type: string; title: string };
  formatted?: object;
  governed?: boolean;
  bullets?: string[];
  report?: { file_name: string; file_path: string; report_type: string; message: string; file_size: number };
  export?: { file_name: string; file_path: string; row_count: number; format: string };
  email_draft?: { draft_id: string; to: string; subject: string; body: string; status: string; created_at: string };
  awaiting_approval?: boolean;
}
```

---

## Quick Checklist

- [ ] **chatService.ts**: Add `context_chips` to request body
- [ ] **chatService.ts**: Map `export`, `email_draft`, `awaiting_approval` from response
- [ ] **chatService.ts**: Add `downloadExport()` function
- [ ] **InputBar.tsx**: Read chips from store, pass to `sendMessageToBackend`, clear after send
- [ ] **MessageList.tsx**: Render `EmailDraftCard` when `email_draft` present
- [ ] **MessageList.tsx**: Render export download button when `export` present
- [ ] **useChatStore.ts**: Add `export?`, `email_draft?`, `awaiting_approval?` to Message type
- [ ] **Create `EmailDraftCard.tsx`**: Draft review/approve/reject/edit UI
- [ ] **Dashboard components**: Add `data-kpi`, `data-entity`, `data-chart`, `data-class` attributes
- [ ] **MarkdownRenderer.tsx**: Verify `remarkGfm` tables render correctly
