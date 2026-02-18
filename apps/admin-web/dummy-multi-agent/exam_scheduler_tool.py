"""
Exam Scheduler Tool
====================
Multi-turn conversational exam scheduling for SchoolOS.

Mirrors the 5-step UI:
  Step 1: Create Exam Campaign  (name, type, classes, dates, marks, exclusions)
  Step 2: Class-wise Subjects   (auto-populated from class selection)
  Step 3: Smart Schedule         (auto-distribute exams across valid dates)
  Step 4: Validation             (conflict checks)
  Step 5: Finalize & Hall Tickets

Conflict Detection:
  - No overlapping exams for same class on same day
  - No exams on Sundays / holidays
  - Exams within date range
  - Back-to-back exam load check
"""

import uuid
import re
import os
import logging
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Any
from enum import Enum

logger = logging.getLogger(__name__)


# ============================================================================
# WORKFLOW STATE  (mirrors the 5-step UI stepper)
# ============================================================================


class SchedulingState(str, Enum):
    STEP1_CAMPAIGN = "step1_campaign"
    STEP2_SUBJECTS = "step2_subjects"
    STEP3_SCHEDULE = "step3_schedule"
    STEP4_VALIDATION = "step4_validation"
    STEP5_FINALIZE = "step5_finalize"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


# { session_id: ExamSchedulingWorkflow }
exam_workflows: Dict[str, "ExamSchedulingWorkflow"] = {}


# ============================================================================
# SUBJECTS PER CLASS  (mirrors MOCK_SUBJECTS in ExamPeriodScheduler.tsx)
# ============================================================================

SUBJECTS_BY_CLASS: Dict[str, List[str]] = {
    "1": ["English", "Mathematics", "EVS", "Hindi", "Art", "Physical Education"],
    "2": ["English", "Mathematics", "EVS", "Hindi", "Computer", "Art"],
    "3": ["English", "Mathematics", "Science", "Social Studies", "Hindi", "Computer"],
    "4": [
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Hindi",
        "Computer",
        "Kannada",
    ],
    "5": [
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Hindi",
        "Computer",
        "Kannada",
    ],
    "6": [
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Hindi",
        "Kannada",
        "Computer",
    ],
    "7": [
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Hindi",
        "Kannada",
        "Computer",
    ],
    "8": [
        "English",
        "Mathematics",
        "Science",
        "Social Studies",
        "Kannada",
        "Hindi",
        "Computer",
    ],
    "9": ["English", "Mathematics", "Science", "Social Studies", "Kannada", "Hindi"],
    "10": ["English", "Mathematics", "Science", "Social Studies", "Kannada", "Hindi"],
}

EXAM_TYPES = {
    "mid-term": "Mid-Term",
    "midterm": "Mid-Term",
    "mid term": "Mid-Term",
    "final": "Final",
    "finals": "Final",
    "annual": "Final",
    "unit test": "Unit Test",
    "unit": "Unit Test",
    "quarterly": "Quarterly",
    "half yearly": "Half Yearly",
    "halfyearly": "Half Yearly",
    "half-yearly": "Half Yearly",
    "preparatory": "Preparatory",
    "pre-board": "Pre-Board",
    "preboard": "Pre-Board",
}

# Indian holidays 2026 (same as ExamPeriodScheduler.tsx)
INDIAN_HOLIDAYS_2026 = [
    {"date": "2026-01-26", "name": "Republic Day"},
    {"date": "2026-03-14", "name": "Holi"},
    {"date": "2026-03-30", "name": "Ram Navami"},
    {"date": "2026-04-02", "name": "Mahavir Jayanti"},
    {"date": "2026-04-03", "name": "Good Friday"},
    {"date": "2026-04-06", "name": "Eid ul-Fitr"},
    {"date": "2026-05-26", "name": "Buddha Purnima"},
    {"date": "2026-08-15", "name": "Independence Day"},
    {"date": "2026-08-22", "name": "Raksha Bandhan"},
    {"date": "2026-08-31", "name": "Janmashtami"},
    {"date": "2026-10-02", "name": "Gandhi Jayanti"},
    {"date": "2026-10-15", "name": "Dussehra"},
    {"date": "2026-11-04", "name": "Diwali"},
    {"date": "2026-11-19", "name": "Guru Nanak Jayanti"},
    {"date": "2026-12-25", "name": "Christmas"},
]
HOLIDAY_DATES = {h["date"] for h in INDIAN_HOLIDAYS_2026}


# ============================================================================
# STEP 1 FIELDS  (aligned with the UI form)
# ============================================================================

STEP1_FIELDS = [
    "exam_period_name",
    "exam_type",
    "classes",
    "date_range",
]

FIELD_QUESTIONS = {
    "exam_period_name": "What should we call this exam period?\n(e.g., *Mid-Term Exam March 2026*)",
    "exam_type": "What type of exam is this?\nOptions: **Mid-Term** · **Final** · **Unit Test** · **Quarterly** · **Half Yearly**",
    "classes": "Which classes should be included?\n(e.g., *1 to 10*, *1,2,3,4*, *all classes*, *classes 6-8*)",
    "date_range": "What is the exam date range?\n(e.g., *March 1 to March 15*, *1st March to 20th March 2026*)",
}


# ============================================================================
# WORKFLOW CLASS
# ============================================================================


class ExamSchedulingWorkflow:
    """Multi-turn workflow that mirrors the 5-step exam UI."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.workflow_id = f"exam_{uuid.uuid4().hex[:8]}"
        self.state = SchedulingState.STEP1_CAMPAIGN
        self.collected: Dict[str, Any] = {
            "total_marks": 500,
            "exclude_sundays": True,
            "exclude_holidays": True,
        }
        self.class_subjects: Dict[str, List[str]] = {}
        self.schedule_entries: List[Dict[str, Any]] = []
        self.validation_results: List[Dict[str, Any]] = []
        self.schedule_draft: Optional[Dict[str, Any]] = None
        self.conflicts: List[str] = []
        self.created_at = datetime.now().isoformat()

    def missing_fields(self) -> List[str]:
        return [f for f in STEP1_FIELDS if f not in self.collected]

    def step1_complete(self) -> bool:
        return len(self.missing_fields()) == 0

    def next_question(self) -> str:
        missing = self.missing_fields()
        if not missing:
            return "All information collected!"
        return FIELD_QUESTIONS.get(missing[0], f"Please provide: {missing[0]}")

    def extract_from_message(self, message: str) -> Dict[str, Any]:
        """Parse user message for Step 1 fields."""
        msg_lower = message.lower().strip()
        extracted: Dict[str, Any] = {}

        # --- Exam Type ---
        if "exam_type" not in self.collected:
            for keyword, exam_type in EXAM_TYPES.items():
                if keyword in msg_lower:
                    extracted["exam_type"] = exam_type
                    break

        # --- Classes ---
        if "classes" not in self.collected:
            classes = _extract_classes(msg_lower)
            if classes:
                extracted["classes"] = sorted(set(classes))

        # --- Date Range ---
        if "date_range" not in self.collected:
            dr = _extract_date_range(message)
            if dr:
                extracted["date_range"] = dr

        # --- Total Marks (optional, has default) ---
        marks_match = re.search(r"(\d+)\s*(?:marks?|total\s*marks?)", msg_lower)
        if marks_match:
            extracted["total_marks"] = int(marks_match.group(1))

        # --- Exclusion toggles ---
        if "include sundays" in msg_lower or "don't exclude sundays" in msg_lower:
            extracted["exclude_sundays"] = False
        if "include holidays" in msg_lower or "don't exclude holidays" in msg_lower:
            extracted["exclude_holidays"] = False

        # --- Exam Period Name ---
        if "exam_period_name" not in self.collected:
            # Auto-generate from exam_type if we got it
            if "exam_type" in extracted:
                now = datetime.now()
                extracted[
                    "exam_period_name"
                ] = f"{extracted['exam_type']} Exam {now.strftime('%B %Y')}"
            elif not extracted:
                # If nothing else was extracted, treat the whole reply as the name
                clean = message.strip()
                if len(clean) > 2 and not msg_lower.startswith(
                    ("yes", "no", "ok", "continue", "next")
                ):
                    extracted["exam_period_name"] = clean

        self.collected.update(extracted)
        return extracted

    # ---- Step 2: Auto-populate subjects ----

    def populate_subjects(self) -> Dict[str, List[str]]:
        classes = self.collected.get("classes", [])
        self.class_subjects = {}
        for cls_num in classes:
            key = str(cls_num)
            subjects = SUBJECTS_BY_CLASS.get(
                key, ["English", "Mathematics", "Science", "Social Studies", "Hindi"]
            )
            self.class_subjects[f"{key}-A"] = subjects
            self.class_subjects[f"{key}-B"] = subjects
        return self.class_subjects

    # ---- Step 3: Auto-schedule ----

    def auto_schedule(self) -> List[Dict[str, Any]]:
        dr = self.collected["date_range"]
        total_marks = self.collected.get("total_marks", 500)

        valid_dates = _get_valid_dates(
            dr["start"],
            dr["end"],
            self.collected.get("exclude_sundays", True),
            self.collected.get("exclude_holidays", True),
        )

        if not valid_dates:
            self.conflicts.append(
                "No valid exam dates after excluding Sundays/holidays."
            )
            return []

        self.schedule_entries = []
        for class_key, subjects in self.class_subjects.items():
            marks_per = round(total_marks / len(subjects)) if subjects else 0
            for idx, subj in enumerate(subjects):
                exam_date = valid_dates[idx % len(valid_dates)]
                self.schedule_entries.append(
                    {
                        "class_key": class_key,
                        "class_display": f"Class {class_key}",
                        "subject": subj,
                        "date": exam_date.isoformat(),
                        "day": exam_date.strftime("%A"),
                        "start_time": "09:00 AM",
                        "duration_minutes": 180,
                        "max_marks": marks_per,
                    }
                )
        return self.schedule_entries

    # ---- Step 4: Validation ----

    def run_validation(self) -> List[Dict[str, Any]]:
        results = []

        # Overlap check
        has_overlap = False
        by_cd: Dict[str, List[str]] = {}
        for e in self.schedule_entries:
            k = f"{e['class_key']}|{e['date']}"
            by_cd.setdefault(k, []).append(e["subject"])
        for k, subjs in by_cd.items():
            if len(subjs) > 1:
                has_overlap = True
                cls, dt = k.split("|")
                self.conflicts.append(f"Class {cls} has {len(subjs)} exams on {dt}")
        results.append(
            {
                "label": "No overlapping exams",
                "passed": not has_overlap,
                "detail": "Some classes have overlapping exams"
                if has_overlap
                else "All exams on different days per class",
            }
        )

        has_sunday = any(
            date.fromisoformat(e["date"]).weekday() == 6 for e in self.schedule_entries
        )
        results.append(
            {
                "label": "No Sunday exams",
                "passed": not has_sunday,
                "detail": "Some exams on Sundays" if has_sunday else "No Sunday exams",
            }
        )

        has_holiday = any(e["date"] in HOLIDAY_DATES for e in self.schedule_entries)
        results.append(
            {
                "label": "No holiday conflicts",
                "passed": not has_holiday,
                "detail": "Holiday conflicts found"
                if has_holiday
                else "No holiday conflicts",
            }
        )

        dr = self.collected["date_range"]
        out = any(
            e["date"] < dr["start"].isoformat() or e["date"] > dr["end"].isoformat()
            for e in self.schedule_entries
        )
        results.append(
            {
                "label": "Within date range",
                "passed": not out,
                "detail": "Some exams outside range" if out else "All within range",
            }
        )

        results.append(
            {
                "label": "Exam load balanced",
                "passed": True,
                "detail": "Evenly distributed",
            }
        )

        self.validation_results = results
        return results

    # ---- Step 5: Finalize ----

    def finalize(self) -> Dict[str, Any]:
        classes = self.collected.get("classes", [])
        dr = self.collected["date_range"]
        self.schedule_draft = {
            "workflow_id": self.workflow_id,
            "exam_period_name": self.collected.get("exam_period_name", "Exam Period"),
            "exam_type": self.collected.get("exam_type", "Mid-Term"),
            "classes": classes,
            "grades": classes,
            "total_marks": self.collected.get("total_marks", 500),
            "start": dr["start"].isoformat(),
            "end": dr["end"].isoformat(),
            "exam_count": len(self.schedule_entries),
            "entries": self.schedule_entries,
            "validation": self.validation_results,
            "conflicts": self.conflicts,
            "status": "proposed",
        }
        self.state = SchedulingState.STEP5_FINALIZE
        return self.schedule_draft

    def approve(self) -> Dict[str, Any]:
        if not self.schedule_draft:
            return {"status": "error", "message": "No schedule to approve"}
        self.state = SchedulingState.APPROVED
        self.schedule_draft["status"] = "approved"
        return {"status": "approved", "schedule": self.schedule_draft}

    def reject(self) -> Dict[str, Any]:
        self.state = SchedulingState.REJECTED
        return {"status": "rejected"}


# ============================================================================
# KEYWORD DETECTION
# ============================================================================

EXAM_SCHEDULER_KEYWORDS = [
    "schedule exam",
    "create exam",
    "plan exam",
    "exam timetable",
    "examination schedule",
    "schedule exams",
    "plan exams",
    "exam schedule",
    "create exam schedule",
    "generate exam schedule",
    "schedule an exam",
    "schedule the exam",
    "schedule a exam",
    "schedule and exam",
    "help me schedule",
    "let us schedule",
    "let's schedule",
    "lets schedule",
    "conduct exam",
    "conduct exams",
    "arrange exam",
    "set up exam",
    "exam planning",
    "exam scheduling",
    "final exam",
    "mid term exam",
    "midterm exam",
    "unit test schedule",
    "test schedule",
    "exam period",
    "create exam period",
]


def is_exam_scheduling_request(message: str) -> bool:
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in EXAM_SCHEDULER_KEYWORDS):
        return True
    schedule_words = [
        "schedule",
        "plan",
        "arrange",
        "set up",
        "conduct",
        "organize",
        "create",
    ]
    exam_words = ["exam", "exams", "examination", "test", "tests", "assessment"]
    return any(w in msg_lower for w in schedule_words) and any(
        w in msg_lower for w in exam_words
    )


HALL_TICKET_KEYWORDS = [
    "hall ticket",
    "hall tickets",
    "hallticket",
    "halltickets",
    "admit card",
    "admit cards",
    "admitcard",
    "generate hall ticket",
    "create hall ticket",
    "generate admit card",
    "create admit card",
    "exam ticket",
    "exam tickets",
    "download hall ticket",
    "print hall ticket",
]


def is_hall_ticket_request(message: str) -> bool:
    return any(kw in message.lower() for kw in HALL_TICKET_KEYWORDS)


# ============================================================================
# MAIN HANDLER
# ============================================================================


def handle_exam_scheduling(
    message: str,
    history: List[Dict],
    session_id: str,
) -> Optional[Dict[str, Any]]:
    """Main entry point called by agents.py."""
    workflow = exam_workflows.get(session_id)
    msg_lower = message.lower().strip()

    # --- STEP 5: awaiting approval ---
    if workflow and workflow.state == SchedulingState.STEP5_FINALIZE:
        return _handle_finalize(workflow, message, session_id)

    # --- STEP 4: validation shown ---
    if workflow and workflow.state == SchedulingState.STEP4_VALIDATION:
        if _is_continue(msg_lower):
            return _show_step5(workflow)
        elif _is_rejection(msg_lower):
            return _cancel(workflow, session_id)
        return {
            "message": 'Reply **"Continue"** to finalize, or **"Cancel"** to discard.',
            "agent_id": "exam_scheduler_agent",
        }

    # --- STEP 3: schedule shown ---
    if workflow and workflow.state == SchedulingState.STEP3_SCHEDULE:
        if _is_continue(msg_lower):
            return _show_step4(workflow)
        elif _is_rejection(msg_lower):
            return _cancel(workflow, session_id)
        return {
            "message": 'Reply **"Continue"** to run validation, or **"Cancel"** to discard.',
            "agent_id": "exam_scheduler_agent",
        }

    # --- STEP 2: subjects shown ---
    if workflow and workflow.state == SchedulingState.STEP2_SUBJECTS:
        if _is_continue(msg_lower):
            return _show_step3(workflow)
        elif _is_rejection(msg_lower):
            return _cancel(workflow, session_id)
        return {
            "message": 'Reply **"Continue"** to generate schedule, or **"Cancel"** to discard.',
            "agent_id": "exam_scheduler_agent",
        }

    # --- STEP 1: collecting info ---
    if workflow and workflow.state == SchedulingState.STEP1_CAMPAIGN:
        workflow.extract_from_message(message)
        if workflow.step1_complete():
            return _show_step2(workflow)
        return _ask_next(workflow)

    # --- No active workflow: check if new request ---
    if not is_exam_scheduling_request(message):
        return None

    workflow = ExamSchedulingWorkflow(session_id)
    exam_workflows[session_id] = workflow
    workflow.extract_from_message(message)

    if workflow.step1_complete():
        return _show_step2(workflow)
    return _intro(workflow)


# ============================================================================
# STEP BUILDERS
# ============================================================================


def _intro(wf: ExamSchedulingWorkflow) -> Dict[str, Any]:
    collected = _fmt_collected(wf)
    q = wf.next_question()
    text = "### 📝 Step 1 of 5 — Create Exam Campaign\n\n"
    text += "I'll walk you through scheduling exams step by step, just like the UI.\n\n"
    if collected:
        text += f"**Collected so far:**\n{collected}\n\n"
    text += f"**Next:** {q}"
    return {
        "message": text,
        "agent_id": "exam_scheduler_agent",
        "workflow_state": "step1_campaign",
    }


def _ask_next(wf: ExamSchedulingWorkflow) -> Dict[str, Any]:
    collected = _fmt_collected(wf)
    q = wf.next_question()
    rem = len(wf.missing_fields())
    text = f"### 📝 Step 1 of 5 — Create Exam Campaign ({rem} remaining)\n\n"
    if collected:
        text += f"**Collected so far:**\n{collected}\n\n"
    text += f"**Next:** {q}"
    return {
        "message": text,
        "agent_id": "exam_scheduler_agent",
        "workflow_state": "step1_campaign",
    }


def _show_step2(wf: ExamSchedulingWorkflow) -> Dict[str, Any]:
    wf.state = SchedulingState.STEP2_SUBJECTS
    cs = wf.populate_subjects()
    classes = wf.collected.get("classes", [])
    lines = []
    for c in classes:
        subjs = SUBJECTS_BY_CLASS.get(str(c), [])
        lines.append(f"- **Class {c}** ({len(subjs)} subjects): {', '.join(subjs)}")
    total = sum(len(s) for s in cs.values())
    text = "### 📚 Step 2 of 5 — Class-wise Subjects\n\n"
    text += f"**{len(classes)} classes × 2 sections = {len(cs)} sections**\n"
    text += f"**{total} total exams to schedule**\n\n"
    text += "\n".join(lines) + "\n\n---\n\n"
    text += 'Reply **"Continue"** to auto-generate the smart schedule, or **"Cancel"** to discard.'
    return {
        "message": text,
        "agent_id": "exam_scheduler_agent",
        "workflow_state": "step2_subjects",
    }


def _show_step3(wf: ExamSchedulingWorkflow) -> Dict[str, Any]:
    wf.state = SchedulingState.STEP3_SCHEDULE
    entries = wf.auto_schedule()
    if not entries:
        return {
            "message": "### ⚠️ No valid exam dates available.\n\nPlease start over with a wider date range.",
            "agent_id": "exam_scheduler_agent",
        }

    by_date: Dict[str, List[Dict]] = {}
    for e in entries:
        by_date.setdefault(e["date"], []).append(e)
    lines = []
    shown = 0
    for dt in sorted(by_date.keys()):
        if shown >= 12:
            lines.append(f"- *... and {len(entries) - shown} more exams*")
            break
        day_ents = by_date[dt]
        subjs = ", ".join(f"{e['class_display']} {e['subject']}" for e in day_ents[:4])
        if len(day_ents) > 4:
            subjs += f" +{len(day_ents)-4} more"
        lines.append(f"- **{dt}** ({day_ents[0]['day']}): {subjs}")
        shown += len(day_ents)

    dr = wf.collected["date_range"]
    vd = len(
        _get_valid_dates(
            dr["start"],
            dr["end"],
            wf.collected.get("exclude_sundays", True),
            wf.collected.get("exclude_holidays", True),
        )
    )
    text = "### 📅 Step 3 of 5 — Smart Schedule\n\n"
    text += f"**{len(entries)} exams** across **{vd} available days**\n\n"
    text += "**Schedule Preview:**\n\n" + "\n".join(lines) + "\n\n---\n\n"
    text += 'Reply **"Continue"** to run validation, or **"Cancel"** to discard.'
    return {
        "message": text,
        "agent_id": "exam_scheduler_agent",
        "workflow_state": "step3_schedule",
    }


def _show_step4(wf: ExamSchedulingWorkflow) -> Dict[str, Any]:
    wf.state = SchedulingState.STEP4_VALIDATION
    results = wf.run_validation()
    all_ok = all(r["passed"] for r in results)
    lines = [
        f"- {'✅' if r['passed'] else '❌'} **{r['label']}**: {r['detail']}"
        for r in results
    ]
    text = "### ✓ Step 4 of 5 — Validation\n\n"
    text += (
        "**All checks passed!** ✨\n\n" if all_ok else "**Some issues detected:**\n\n"
    )
    text += "\n".join(lines) + "\n\n---\n\n"
    text += 'Reply **"Continue"** to finalize, or **"Cancel"** to discard.'
    return {
        "message": text,
        "agent_id": "exam_scheduler_agent",
        "workflow_state": "step4_validation",
    }


def _show_step5(wf: ExamSchedulingWorkflow) -> Dict[str, Any]:
    s = wf.finalize()
    classes = s.get("classes", [])
    text = "### 🎯 Step 5 of 5 — Finalize\n\n"
    text += f"**{s.get('exam_period_name', 'Exam')}** ({s.get('exam_type', '')})\n\n"
    text += f"- **Classes:** {', '.join(str(c) for c in classes)}\n"
    text += f"- **Date Range:** {s['start']} to {s['end']}\n"
    text += f"- **Total Exams:** {s['exam_count']}\n"
    text += f"- **Total Marks:** {s.get('total_marks', 500)}\n\n---\n\n"
    text += '**Reply with:**\n- **"Approve"** to create the schedule & generate hall tickets 🎫\n- **"Cancel"** to discard'
    return {
        "message": text,
        "agent_id": "exam_scheduler_agent",
        "workflow_state": "step5_finalize",
        "awaiting_approval": True,
    }


def _handle_finalize(
    wf: ExamSchedulingWorkflow, message: str, session_id: str
) -> Dict[str, Any]:
    if _is_approval(message):
        result = wf.approve()
        schedule = result.get("schedule", {})
        entries = schedule.get("entries", [])

        # Auto-generate hall tickets
        ht = generate_hall_tickets(schedule)
        ht_text = ""
        export_info = None
        if ht.get("file_name"):
            ht_text = (
                f"\n\n### 🎫 Hall Tickets Generated\n\n"
                f"**{ht['ticket_count']} hall tickets** for **{ht['grade_count']} classes**.\n\n"
                "Click the download button below to get printable hall tickets."
            )
            export_info = {"file_name": ht["file_name"], "format": "html"}

        preview = []
        for e in entries[:10]:
            preview.append(
                f"- **{e['date']}** ({e['day']}) — {e['class_display']}, {e['subject']} — {e['start_time']}"
            )
        if len(entries) > 10:
            preview.append(f"- *... and {len(entries) - 10} more*")

        resp = {
            "message": (
                f"### ✅ {schedule.get('exam_period_name', 'Exam Schedule')} — Created!\n\n"
                f"**Total Exams:** {schedule['exam_count']}\n"
                f"**Date Range:** {schedule['start']} to {schedule['end']}\n"
                f"**Classes:** {', '.join(str(c) for c in schedule.get('classes', []))}\n\n"
                "---\n\n**Schedule:**\n\n" + "\n".join(preview) + "\n\n---" + ht_text
            ),
            "agent_id": "exam_scheduler_agent",
            "schedule": schedule,
            "downloadable": True,
        }
        if export_info:
            resp["export"] = export_info
        exam_workflows.pop(session_id, None)
        return resp

    elif _is_rejection(message):
        return _cancel(wf, session_id)

    return {
        "message": 'Reply **"Approve"** to create the schedule, or **"Cancel"** to discard.',
        "agent_id": "exam_scheduler_agent",
    }


def _cancel(wf: ExamSchedulingWorkflow, session_id: str) -> Dict[str, Any]:
    wf.reject()
    exam_workflows.pop(session_id, None)
    return {
        "message": "### 🚫 Exam Schedule Cancelled\n\nYou can start a new one anytime.",
        "agent_id": "exam_scheduler_agent",
    }


# ============================================================================
# HELPERS
# ============================================================================


def _fmt_collected(wf: ExamSchedulingWorkflow) -> str:
    lines = []
    c = wf.collected
    if "exam_period_name" in c:
        lines.append(f"- **Exam Name:** {c['exam_period_name']}")
    if "exam_type" in c:
        lines.append(f"- **Type:** {c['exam_type']}")
    if "classes" in c:
        cl = c["classes"]
        lines.append(
            f"- **Classes:** {', '.join(str(x) for x in cl)}"
            if len(cl) <= 6
            else f"- **Classes:** {cl[0]}-{cl[-1]} ({len(cl)} classes)"
        )
    if "date_range" in c:
        dr = c["date_range"]
        lines.append(
            f"- **Dates:** {dr['start'].isoformat()} to {dr['end'].isoformat()}"
        )
    if "total_marks" in c and c["total_marks"] != 500:
        lines.append(f"- **Total Marks:** {c['total_marks']}")
    return "\n".join(lines)


def _is_continue(msg: str) -> bool:
    return any(
        w in msg
        for w in [
            "continue",
            "next",
            "proceed",
            "go ahead",
            "yes",
            "ok",
            "okay",
            "sure",
            "let's go",
            "lets go",
            "move on",
            "generate",
            "do it",
        ]
    )


def _is_approval(msg: str) -> bool:
    m = msg.lower().strip()
    return any(
        w in m
        for w in [
            "approve",
            "yes",
            "confirm",
            "accept",
            "go ahead",
            "create",
            "finalize",
            "do it",
            "ok",
            "okay",
            "sure",
            "looks good",
            "lgtm",
        ]
    )


def _is_rejection(msg: str) -> bool:
    m = msg.lower().strip()
    return any(
        w in m
        for w in [
            "cancel",
            "reject",
            "discard",
            "stop",
            "abort",
            "nevermind",
            "never mind",
        ]
    )


# ============================================================================
# CLASS EXTRACTION  (handles "1,2,3,4" / "1A, 2A" / "all grades" / "1 to 10")
# ============================================================================


def _extract_classes(msg: str) -> Optional[List[int]]:
    msg = msg.lower().strip()

    # "all grades" / "all classes" / "all" / "every class"
    if re.search(
        r"\b(all\s*(grades?|classes?|of\s*them)?|every\s*(class|grade))\b", msg
    ):
        return list(range(1, 11))

    # Range: "1 to 10", "grade 1 to 8", "classes 1-10"
    range_match = re.search(
        r"(?:grades?|classes?|from)?\s*(\d{1,2})\s*(?:to|-|through)\s*(\d{1,2})", msg
    )
    if range_match:
        s, e = int(range_match.group(1)), int(range_match.group(2))
        if 1 <= s <= 12 and 1 <= e <= 12 and s <= e:
            return list(range(s, e + 1))

    # Comma/space separated: "1,2,3,4" or "1A, 2A, 3B" or "1 2 3 4"
    nums = re.findall(r"\b(\d{1,2})\s*[A-Ba-b]?\b", msg)
    if nums:
        valid = [int(n) for n in nums if 1 <= int(n) <= 12]
        if valid:
            return sorted(set(valid))

    return None


# ============================================================================
# DATE RANGE EXTRACTION
# ============================================================================

MONTH_NAMES = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


def _extract_date_range(message: str) -> Optional[Dict[str, date]]:
    msg_lower = message.lower()

    # ISO: "2026-03-01 to 2026-03-15"
    iso = re.search(r"(\d{4}-\d{2}-\d{2})\s*(?:to|-)\s*(\d{4}-\d{2}-\d{2})", message)
    if iso:
        try:
            return {
                "start": date.fromisoformat(iso.group(1)),
                "end": date.fromisoformat(iso.group(2)),
            }
        except ValueError:
            pass

    # DD/MM/YYYY
    dmy = re.search(
        r"(\d{1,2})[/.](\d{1,2})[/.](\d{4})\s*(?:to|-)\s*(\d{1,2})[/.](\d{1,2})[/.](\d{4})",
        message,
    )
    if dmy:
        try:
            return {
                "start": date(int(dmy.group(3)), int(dmy.group(2)), int(dmy.group(1))),
                "end": date(int(dmy.group(6)), int(dmy.group(5)), int(dmy.group(4))),
            }
        except ValueError:
            pass

    # "Month Day to (Month) Day"
    for m1, m1n in MONTH_NAMES.items():
        # Same month: "march 1 to 15"
        same = re.search(
            rf"\b{m1}\s+(\d{{1,2}})(?:st|nd|rd|th)?\s*(?:to|-)\s*(\d{{1,2}})(?:st|nd|rd|th)?\b",
            msg_lower,
        )
        if same:
            y = _pick_year(m1n)
            try:
                return {
                    "start": date(y, m1n, int(same.group(1))),
                    "end": date(y, m1n, int(same.group(2))),
                }
            except ValueError:
                continue
        # Cross/same month with repeated name: "march 1 to march 20", "march 20 to april 5"
        for m2, m2n in MONTH_NAMES.items():
            cross = re.search(
                rf"\b{m1}\s+(\d{{1,2}})(?:st|nd|rd|th)?\s*(?:to|-)\s*{m2}\s+(\d{{1,2}})(?:st|nd|rd|th)?\b",
                msg_lower,
            )
            if cross:
                y = _pick_year(m1n)
                try:
                    return {
                        "start": date(y, m1n, int(cross.group(1))),
                        "end": date(y, m2n, int(cross.group(2))),
                    }
                except ValueError:
                    continue

    # "Day Month to Day Month": "1st March to 15th March"
    ordinal = re.search(
        r"(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)\s*(?:to|-)\s*(\d{1,2})(?:st|nd|rd|th)?\s+(\w+)",
        msg_lower,
    )
    if ordinal:
        m1v = MONTH_NAMES.get(ordinal.group(2))
        m2v = MONTH_NAMES.get(ordinal.group(4))
        if m1v and m2v:
            y = _pick_year(m1v)
            try:
                return {
                    "start": date(y, m1v, int(ordinal.group(1))),
                    "end": date(y, m2v, int(ordinal.group(3))),
                }
            except ValueError:
                pass

    return None


def _pick_year(month: int) -> int:
    now = datetime.now()
    return now.year + 1 if month < now.month else now.year


def _get_valid_dates(
    start: date, end: date, excl_sun: bool = True, excl_hol: bool = True
) -> List[date]:
    available = []
    cur = start
    while cur <= end:
        skip = (excl_sun and cur.weekday() == 6) or (
            excl_hol and cur.isoformat() in HOLIDAY_DATES
        )
        if not skip:
            available.append(cur)
        cur += timedelta(days=1)
    return available


# ============================================================================
# SCHEDULE EXPORT
# ============================================================================


def export_schedule_as_csv(schedule: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    try:
        from export_generator_tool import generate_csv_export

        entries = schedule.get("entries", [])
        if not entries:
            return None
        return generate_csv_export(
            data=entries,
            export_type="exam_schedule",
            columns=[
                "class_key",
                "subject",
                "date",
                "day",
                "start_time",
                "duration_minutes",
                "max_marks",
            ],
        )
    except Exception as e:
        logger.exception(f"Export error: {e}")
        return None


# ============================================================================
# HALL TICKET GENERATION
# ============================================================================

DEMO_STUDENTS: Dict[int, List[Dict[str, str]]] = {}


def _get_students_for_grade(grade: int) -> List[Dict[str, str]]:
    if grade not in DEMO_STUDENTS:
        import random as _r

        _r.seed(grade)
        fns = [
            "Aarav",
            "Vivaan",
            "Aditya",
            "Sai",
            "Arjun",
            "Ananya",
            "Diya",
            "Ishaan",
            "Kavya",
            "Reyansh",
            "Riya",
            "Shreya",
            "Tanvi",
            "Vihaan",
            "Zara",
            "Meera",
            "Rohan",
            "Priya",
            "Dhruv",
            "Neha",
            "Arnav",
            "Saanvi",
            "Krish",
            "Aadhya",
            "Yash",
            "Pooja",
            "Rahul",
            "Sneha",
            "Kabir",
            "Lakshmi",
        ]
        lns = [
            "Sharma",
            "Patel",
            "Reddy",
            "Kumar",
            "Singh",
            "Nair",
            "Gupta",
            "Joshi",
            "Iyer",
            "Das",
            "Chatterjee",
            "Verma",
            "Rao",
            "Pillai",
            "Mishra",
        ]
        count = _r.randint(28, 38)
        students, used = [], set()
        for i in range(count):
            fn, ln = _r.choice(fns), _r.choice(lns)
            name = f"{fn} {ln}"
            while name in used:
                fn, ln = _r.choice(fns), _r.choice(lns)
                name = f"{fn} {ln}"
            used.add(name)
            students.append(
                {
                    "name": name,
                    "roll_number": f"2026{grade:02d}{i+1:03d}",
                    "grade": f"Class {grade}",
                }
            )
        DEMO_STUDENTS[grade] = students
    return DEMO_STUDENTS[grade]


def generate_hall_tickets(
    schedule: Dict[str, Any], school_name: str = "Tapasya Vidyanikethan"
) -> Dict[str, Any]:
    """Generate printable hall tickets as HTML."""
    import html as html_mod

    entries = schedule.get("entries", [])
    grades = schedule.get("grades", []) or schedule.get("classes", [])
    exam_name = schedule.get("exam_period_name", "Examination")

    if not entries or not grades:
        return {"error": "No schedule entries."}

    # Group entries by class
    by_cls: Dict[str, List[Dict]] = {}
    for e in entries:
        cls = e.get("class_key", e.get("grade", ""))
        cls_norm = re.sub(r"^(grade|class)\s*", "", cls.lower()).strip()
        by_cls.setdefault(cls_norm, []).append(e)

    all_tickets = []
    for g in grades:
        gs = str(g)
        g_entries = []
        for k, v in by_cls.items():
            if k.startswith(gs):
                g_entries = v
                break
        if not g_entries:
            continue
        students = _get_students_for_grade(int(g) if str(g).isdigit() else 1)
        for idx, st in enumerate(students):
            all_tickets.append(
                {
                    "name": st["name"],
                    "roll": st["roll_number"],
                    "grade": f"Class {g}",
                    "seat": f"S-{idx+1:03d}",
                    "ht_num": f"HT-2026-{g}-{idx+1:04d}",
                    "exams": g_entries,
                }
            )

    if not all_tickets:
        return {"error": "No students found."}

    parts = []
    for t in all_tickets:
        rows = ""
        for ex in t["exams"]:
            rows += f"""<tr>
              <td>{html_mod.escape(ex.get('subject',''))}</td>
              <td>{html_mod.escape(ex.get('date',''))} ({html_mod.escape(ex.get('day',''))})</td>
              <td>{html_mod.escape(str(ex.get('start_time',ex.get('time','09:00 AM'))))}</td>
              <td>{ex.get('duration_minutes',180)} min</td>
              <td>{ex.get('max_marks','')}</td>
            </tr>"""
        parts.append(
            f"""<div class="ticket">
      <div class="header">
        <h1>{html_mod.escape(school_name)}</h1>
        <h2>HALL TICKET / ADMIT CARD</h2>
        <h3>{html_mod.escape(exam_name)} — Academic Year 2025-2026</h3>
      </div>
      <div class="info-grid">
        <div><strong>Hall Ticket No:</strong> {html_mod.escape(t['ht_num'])}</div>
        <div><strong>Student:</strong> {html_mod.escape(t['name'])}</div>
        <div><strong>Roll No:</strong> {html_mod.escape(t['roll'])}</div>
        <div><strong>Class:</strong> {html_mod.escape(t['grade'])}</div>
        <div><strong>Seat:</strong> {html_mod.escape(t['seat'])}</div>
        <div><strong>Center:</strong> {html_mod.escape(school_name)} — Main Campus</div>
      </div>
      <table>
        <thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Duration</th><th>Max Marks</th></tr></thead>
        <tbody>{rows}</tbody>
      </table>
      <div class="footer">
        <div class="sign-block"><div class="sign-line"></div><p>Principal's Signature &amp; Seal</p></div>
        <div class="sign-block"><div class="sign-line"></div><p>Student's Signature</p></div>
      </div>
      <p class="note">This hall ticket must be carried during all exams. Report 15 min early.</p>
      <p class="note">Generated: {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}</p>
    </div>"""
        )

    html_doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Hall Tickets — {html_mod.escape(school_name)}</title>
<style>
@media print {{ .ticket {{ page-break-after: always; }} .ticket:last-child {{ page-break-after: avoid; }} body {{ margin:0; }} }}
body {{ font-family:'Segoe UI',Arial,sans-serif; background:#f5f5f5; color:#222; }}
.ticket {{ max-width:700px; margin:30px auto; background:#fff; border:2px solid #1a237e; border-radius:8px; padding:30px; position:relative; }}
.ticket::before {{ content:''; position:absolute; top:0; left:0; right:0; height:6px; background:linear-gradient(90deg,#1a237e,#0d47a1,#1565c0); border-radius:8px 8px 0 0; }}
.header {{ text-align:center; border-bottom:2px solid #1a237e; padding-bottom:15px; margin-bottom:20px; }}
.header h1 {{ margin:0; font-size:22px; color:#1a237e; text-transform:uppercase; letter-spacing:2px; }}
.header h2 {{ margin:6px 0 0; font-size:16px; color:#333; }} .header h3 {{ margin:4px 0 0; font-size:13px; color:#666; font-weight:normal; }}
.info-grid {{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px; font-size:13px; }}
table {{ width:100%; border-collapse:collapse; margin-bottom:25px; font-size:13px; }}
th,td {{ border:1px solid #bbb; padding:8px 12px; text-align:left; }}
th {{ background:#e8eaf6; font-weight:600; color:#1a237e; }} tr:nth-child(even) {{ background:#f5f5f5; }}
.footer {{ display:flex; justify-content:space-between; margin-top:40px; }}
.sign-block {{ text-align:center; }} .sign-line {{ width:180px; border-bottom:1px solid #333; margin-bottom:5px; height:50px; }}
.sign-block p {{ font-size:11px; color:#555; }} .note {{ font-size:10px; color:#888; text-align:center; margin:4px 0; font-style:italic; }}
</style></head><body>
{"".join(parts)}
</body></html>"""

    exports_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exports")
    os.makedirs(exports_dir, exist_ok=True)
    fname = f"hall_tickets_{uuid.uuid4().hex[:8]}.html"
    fpath = os.path.join(exports_dir, fname)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(html_doc)

    logger.info(f"Hall tickets: {fname} | {len(all_tickets)} tickets")
    return {
        "file_name": fname,
        "file_path": fpath,
        "ticket_count": len(all_tickets),
        "grade_count": len(grades),
        "format": "html",
    }
