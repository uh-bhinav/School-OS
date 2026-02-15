# Response Template Integration Guide

## Overview

The response templating system has been integrated into the multi-agent School ERP platform to enforce concise, scannable, operationally useful outputs. This document describes the integration, usage, and testing procedures.

**UPDATE: Response Governor** - A stricter enforcement layer has been added (see section below) that ensures all agent outputs follow software-like console formatting rules.

## Files Modified

1. **`graph_helpers.py`** - Added template utilities and helper functions
2. **`agents.py`** - Integrated templates into principal agent responses
3. **`super_admin_agents.py`** - Integrated templates into super admin agent responses
4. **`agent_router.py`** - Added response validation
5. **`super_admin_router.py`** - Added response validation
6. **`api.py`** - Updated response schema to include templated format
7. **`manager/__init__.py`** - Exported template classes
8. **`__init__.py`** - Exported template utilities
9. **`response_governor.py`** - **NEW** Strict output enforcement layer

---

## Response Governor (Strict Mode)

The Response Governor is a strict enforcement layer that ensures all agent outputs follow hard rules. When enabled, it takes precedence over the legacy templating system.

### Feature Flag

```python
# In agents.py / super_admin_agents.py
GOVERNOR_ENABLED = True  # Set to False to use legacy templates
```

### Hard Rules Enforced

| Rule | Description |
|------|-------------|
| **Max 12 Lines** | All responses truncated to 12 lines max |
| **Bullets Only** | All data rendered as bullet points, no paragraphs |
| **No Emojis** | All emojis stripped from output |
| **No Greetings** | "Hello", "Hi", "Sure!" etc. removed |
| **No Filler** | "Based on the data", "Here is", "I found" removed |
| **Mandatory Graphs** | Any analytical/trend query MUST produce a chart |

### Query Analysis

The `QueryAnalyzer` class detects when a graph is required:

```python
# Keywords that trigger mandatory graph generation
GRAPH_KEYWORDS = [
    "trend", "over time", "compare", "distribution", "breakdown",
    "month", "week", "daily", "quarterly", "yearly", "growth",
    "decline", "analysis", "visualization", "chart", "graph"
]
```

### Governor Output Format

```json
{
  "message": "Attendance Summary\n• Grade 1-A: 95.5%\n• Grade 5-A: 92.3%\n• Total: 8 classes tracked",
  "agent_id": "attendance_agent",
  "formatted": {
    "text": "Attendance Summary",
    "bullets": ["Grade 1-A: 95.5%", "Grade 5-A: 92.3%", "Total: 8 classes tracked"]
  },
  "governed": true,
  "chart": {
    "base64_image": "...",
    "chart_type": "bar",
    "title": "Class Attendance Comparison"
  }
}
```

### API Response Schema (Updated)

```python
class ChatResponse(BaseModel):
    message: str
    session_id: str
    agentId: str
    timestamp: str
    chart: Optional[dict] = None      # Chart visualization data
    formatted: Optional[dict] = None  # Structured template format
    governed: Optional[bool] = None   # True if governor processed
    bullets: Optional[list[str]] = None  # Extracted bullet points
```

---

## Legacy Templates (Fallback)

## Response Format

### Before (Verbose)
```json
{
  "message": "📊 Based on the data analysis, here is what I found. The attendance for Class A has been consistently high over the past month. We can see that the average is around 95%. This shows that students are attending regularly. Here is a breakdown of the attendance:\n\n- Grade 1-A: 95.5%\n- Grade 5-A: 92.3%\n- Grade 8-A: 94.1%\n- Grade 10-A: 96.2%",
  "agent_id": "attendance_agent"
}
```

### After (Templated)
```json
{
  "message": "📊 Class A attendance stable at 95%\n\n• Grade 1-A: 95.5%\n• Grade 5-A: 92.3%\n• Grade 8-A: 94.1%\n• Grade 10-A: 96.2%",
  "agent_id": "attendance_agent",
  "formatted": {
    "text": "Class A attendance stable at 95%",
    "bullets": [
      "Grade 1-A: 95.5%",
      "Grade 5-A: 92.3%",
      "Grade 8-A: 94.1%",
      "Grade 10-A: 96.2%"
    ]
  }
}
```

## Template Types

### 1. Simple List (`ResponseTemplates.simple_list`)
Use for: List queries like "Show all teachers", "List students"
```python
ResponseTemplates.simple_list(title="Teachers List", items=["John", "Jane", "Bob"])
# Output: {"text": "Teachers List", "bullets": ["John", "Jane", "Bob"]}
```

### 2. Insight Summary (`ResponseTemplates.insight_summary`)
Use for: Analytical queries like "Analyze attendance trends"
```python
ResponseTemplates.insight_summary(
    headline="Attendance improving steadily",
    points=["Up 5% this month", "Best in Grade 10", "Watch Grade 1-B"]
)
```

### 3. Metric Snapshot (`ResponseTemplates.metric_snapshot`)
Use for: Metric queries like "What's the average grade?"
```python
ResponseTemplates.metric_snapshot(
    name="Average Grade",
    value="82.5%",
    change="+3.2%",
    status="Good"
)
```

### 4. Comparison (`ResponseTemplates.comparison`)
Use for: Comparison queries like "Compare Class A vs Class B"
```python
ResponseTemplates.comparison(
    a_name="Class A", a_value="95%",
    b_name="Class B", b_value="87%",
    winner="Class A"
)
```

### 5. Alert (`ResponseTemplates.alert`)
Use for: Alert queries like "Who has poor attendance?"
```python
ResponseTemplates.alert(
    issue="Low attendance alert",
    who="5 students in Grade 5",
    what="Below 75% threshold",
    impact="May affect academics"
)
```

### 6. Chart Insight (`ResponseTemplates.chart_insight`)
Use for: Chart/visualization queries
```python
ResponseTemplates.chart_insight(one_liner="Attendance peaked in October")
```

### 7. Action Steps (`ResponseTemplates.action_steps`)
Use for: Action recommendations
```python
ResponseTemplates.action_steps(steps=[
    "Contact parents of at-risk students",
    "Schedule counseling sessions",
    "Review attendance policy"
])
```

### 8. Ranking (`ResponseTemplates.ranking`)
Use for: Ranking queries like "Top performers"
```python
ResponseTemplates.ranking(
    title="Top Performers",
    items=[
        {"name": "Diya Patel", "value": "98%"},
        {"name": "Mira Deshpande", "value": "97%"}
    ]
)
```

## Query Type Detection

The system automatically detects query types based on patterns:

| Query Type | Example Patterns |
|------------|------------------|
| `list` | "show all", "list", "display" |
| `analysis` | "analyze", "trend", "insight" |
| `metric` | "average", "total", "percentage" |
| `comparison` | "compare", "versus", "vs" |
| `alert` | "at risk", "failing", "overdue" |
| `chart` | "chart", "graph", "visualize" |
| `action` | "recommend", "suggest", "next steps" |
| `ranking` | "top", "bottom", "best", "worst" |

## Validation

Responses are validated to ensure:
1. Required fields (`text`, `bullets`) are present
2. Maximum 5 bullet points
3. No forbidden filler phrases
4. Word limits are respected

### Forbidden Phrases (automatically removed)
- "here is the"
- "based on the"
- "it appears that"
- "you can see that"
- "this shows that"
- "overall"
- "in conclusion"

## Testing Checklist

After implementation, test the following scenarios:

### Principal Agent Tests
1. ✅ Simple list query: "Show all teachers"
2. ✅ Analytical query: "Analyze attendance trends"
3. ✅ Metric query: "What's the average grade in Class 5?"
4. ✅ Comparison query: "Compare Grade 5-A vs Grade 5-B attendance"
5. ✅ Alert query: "Who has attendance below 75%?"
6. ✅ Chart query: "Show attendance trend over time"
7. ✅ Empty result handling: "Show students named XYZ"

### Super Admin Agent Tests
1. ✅ Overview query: "Group overview"
2. ✅ Finance query: "Which schools have high dues?"
3. ✅ Attendance query: "Schools with poor attendance"
4. ✅ Compliance query: "Show compliance issues"
5. ✅ Ranking query: "Top performing schools"

### Error Scenarios
1. ✅ Template formatting fails → Falls back to raw response
2. ✅ Validation fails → Logs warning, returns response anyway
3. ✅ Empty data → Returns `ResponseTemplates.empty()`

## API Response Schema

```typescript
interface ChatResponse {
  message: string;           // Formatted message with bullets
  session_id: string;
  agentId: string;
  timestamp: string;
  chart?: {                  // Optional chart data
    base64_image: string;
    chart_type: string;
    title: string;
  };
  formatted?: {              // Optional templated structure
    text: string;
    bullets: string[];
  };
}
```

## Backward Compatibility

- The `message` field still contains the full response text
- The `formatted` field is optional and additive
- Existing API contracts are preserved
- Templates can be disabled via feature flag

## Usage in Agents

```python
from .graph_helpers import (
    USE_RESPONSE_TEMPLATES,
    TEMPLATES_ENABLED,
    apply_template_to_message,
)

# After getting raw response from LLM
if USE_RESPONSE_TEMPLATES and TEMPLATES_ENABLED:
    template_result = apply_template_to_message(
        message=response_text,
        query=user_message,
        agent_id=agent_id,
        chart=chart_result
    )
    result = {
        "message": f"{emoji} {template_result['message']}",
        "agent_id": agent_id,
        "formatted": template_result.get("formatted")
    }
else:
    result = {"message": f"{emoji} {response_text}", "agent_id": agent_id}
```

## Performance Considerations

- Text processing is lightweight (regex-based)
- Templates are applied only at the final response stage
- Validation is non-blocking (logs warnings, doesn't fail requests)
- Word limits prevent excessive output

## Troubleshooting

### Templates not being applied
1. Check `USE_RESPONSE_TEMPLATES` is `True` in `graph_helpers.py`
2. Verify `TEMPLATES_ENABLED` is `True` (templates module imported successfully)
3. Check logs for import errors

### Filler phrases still appearing
1. Ensure system prompts include anti-filler instructions
2. Check `TextProcessor.FILLER_PATTERNS` for coverage
3. Filler removal is case-insensitive

### Validation warnings in logs
1. Review the specific issues reported
2. Common causes: too many bullets, forbidden phrases
3. Responses are still returned despite validation warnings
