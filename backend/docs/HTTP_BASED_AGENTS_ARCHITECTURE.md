# HTTP-based Agent Architecture Documentation

## Overview

This document describes the HTTP-based agent architecture that replaces direct service calls with authenticated API requests. This design ensures agents act as external HTTP clients, maintaining proper security boundaries and role-based access control.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Request Flow](#request-flow)
3. [Components](#components)
4. [Migration Guide](#migration-guide)
5. [Security Considerations](#security-considerations)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### OLD Architecture (Service-based)

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ JWT Token
       ▼
┌─────────────────────┐
│   Agent Endpoint    │
│  (API Layer)        │
└──────┬──────────────┘
       │ DB Session + Profile
       ▼
┌─────────────────────┐
│   Agent Tools       │
│  (Direct Service    │
│   Calls)            │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Service Layer     │
│  (Business Logic)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│     Database        │
└─────────────────────┘
```

**Issues:**
- ❌ Agents bypass API security boundaries
- ❌ Agents have direct database access
- ❌ Role validation in agent code (duplication)
- ❌ Tight coupling between agents and services

---

### NEW Architecture (HTTP-based)

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ JWT Token
       ▼
┌──────────────────────┐
│  Agent Endpoint      │
│  (API Layer)         │
│  - Extracts JWT      │
│  - Injects into      │
│    ToolContext       │
└──────┬───────────────┘
       │ JWT Token + API Base URL
       ▼
┌──────────────────────┐
│   Agent Tools        │
│  (HTTP Client)       │
│  - AgentHTTPClient   │
│  - Bearer Token      │
└──────┬───────────────┘
       │ HTTP Request (Authorization: Bearer <token>)
       ▼
┌──────────────────────┐
│   Backend API        │
│  (Public Endpoints)  │
│  - JWT Validation    │
│  - Role Check        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Service Layer      │
│  (Business Logic)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│     Database         │
└──────────────────────┘
```

**Benefits:**
- ✅ Agents act as external HTTP clients
- ✅ Single authentication/authorization point
- ✅ No direct database access from agents
- ✅ Loose coupling via API contracts
- ✅ Easier testing and monitoring

---

## Request Flow

### Step-by-Step Flow

1. **Frontend sends request**
   ```javascript
   fetch('http://localhost:8000/api/v1/agents/chat/attendance', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer <jwt_token>',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       query: 'Mark student 123 as present today',
       session_id: 'user-session-123'
     })
   })
   ```

2. **Agent endpoint extracts JWT**
   ```python
   @router.post("/chat/attendance")
   async def attendance_chat(
       request: AgentChatRequest,
       token: str = Depends(oauth2_scheme),  # ← Extracts JWT
   ):
   ```

3. **JWT injected into ToolRuntimeContext**
   ```python
   context = ToolRuntimeContext(
       jwt_token=token,  # JWT from frontend
       api_base_url="http://localhost:8000/api/v1",
   )
   ```

4. **Agent tool makes HTTP request**
   ```python
   async with AgentHTTPClient() as client:
       response = await client.post(
           "/attendance/",
           json={"student_id": 123, "status": "Present", ...}
       )
   ```

5. **HTTP client adds Authorization header**
   ```python
   headers = {
       "Authorization": f"Bearer {context.jwt_token}",
       "Content-Type": "application/json"
   }
   ```

6. **Backend API validates JWT and checks permissions**
   ```python
   @router.post("/attendance/", dependencies=[Depends(require_role("Teacher"))])
   async def create_attendance(
       attendance_in: AttendanceRecordCreate,
       db: AsyncSession = Depends(get_db),
   ):
       # JWT validated, role checked, execute business logic
   ```

7. **Response returned through the chain**
   ```
   Backend API → Agent Tool → Agent → Frontend
   ```

---

## Components

### 1. ToolRuntimeContext (`tool_context.py`)

**Purpose:** Holds ambient dependencies for agent tools.

**New Fields:**
- `jwt_token`: JWT token from frontend
- `api_base_url`: Base URL for API requests (e.g., `http://localhost:8000/api/v1`)

**Example:**
```python
context = ToolRuntimeContext(
    jwt_token="eyJhbGciOiJIUzI1NiIs...",  # From frontend
    api_base_url="http://localhost:8000/api/v1",
)
```

---

### 2. AgentHTTPClient (`http_client.py`)

**Purpose:** Reusable HTTP client for making authenticated API requests.

**Features:**
- Automatic JWT token injection
- Authorization header management
- Comprehensive error handling (401, 403, 404, 422, 5xx)
- Retry logic for transient failures
- Structured error responses

**Usage:**
```python
async with AgentHTTPClient() as client:
    # GET request
    data = await client.get("/attendance/", params={"student_id": 123})

    # POST request
    result = await client.post("/attendance/", json={...})

    # PUT request
    updated = await client.put("/attendance/456", json={...})

    # DELETE request
    await client.delete("/attendance/456")
```

**Error Handling:**
```python
try:
    data = await client.get("/attendance/123")
except AgentAuthenticationError as e:
    # 401/403 errors
    print(f"Auth failed: {e.message}")
except AgentResourceNotFoundError as e:
    # 404 errors
    print(f"Not found: {e.message}")
except AgentValidationError as e:
    # 422 validation errors
    print(f"Invalid data: {e.detail}")
except AgentHTTPClientError as e:
    # Other HTTP errors
    print(f"Error: {e.message}")
```

---

### 3. HTTP-based Agent Tools (`tools_api_based.py`)

**Purpose:** Agent tools that use HTTP client instead of service calls.

**Example:**
```python
@tool("mark_student_attendance", args_schema=MarkStudentAttendanceSchema)
async def mark_student_attendance(
    student_id: str,
    attendance_date: str,
    status: str,
    remarks: Optional[str] = None,
) -> dict[str, Any]:
    """Mark attendance via HTTP API."""

    async with AgentHTTPClient() as client:
        response = await client.post(
            "/attendance/",
            json={
                "student_id": int(student_id),
                "date": attendance_date,
                "status": status,
                "notes": remarks,
            }
        )

        return {
            "success": True,
            "message": f"Attendance marked for student {student_id}",
            "record": response,
        }
```

---

### 4. Updated Agent Endpoints (`api_with_jwt.py`)

**Purpose:** Agent invocation endpoints that inject JWT into tool context.

**Example:**
```python
@router.post("/chat/attendance")
async def attendance_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # ← Extract JWT
):
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=get_api_base_url(),
    )

    with use_tool_context(context):
        result = agent_app.invoke(request.query)

    return AgentChatResponse(response=result["response"])
```

---

## Migration Guide

### Step 1: Update Environment Configuration

Add to `.env`:
```bash
# API Base URL for HTTP-based agents
API_BASE_URL=http://localhost:8000/api/v1

# For production:
# API_BASE_URL=https://api.yourdomain.com/api/v1
```

---

### Step 2: Update Agent Tools

**Before (Service-based):**
```python
from app.services import attendance_record_service

async def mark_attendance(student_id: str, date: str, status: str):
    context = get_tool_context()
    db = context.db

    # Direct service call
    record = await attendance_record_service.create_attendance_record(
        db=db,
        attendance_in=AttendanceRecordCreate(
            student_id=student_id,
            date=date,
            status=status,
        )
    )
    return record
```

**After (HTTP-based):**
```python
from app.agents.http_client import AgentHTTPClient

async def mark_attendance(student_id: str, date: str, status: str):
    async with AgentHTTPClient() as client:
        response = await client.post(
            "/attendance/",
            json={"student_id": student_id, "date": date, "status": status}
        )
    return response
```

---

### Step 3: Update Agent Endpoints

**Before:**
```python
@router.post("/chat/attendance")
async def attendance_chat(
    request: AgentChatRequest,
    db: AsyncSession = Depends(get_db),
    current_profile: Profile = Depends(get_current_active_user),
):
    context = ToolRuntimeContext(db=db, current_profile=current_profile)
    with use_tool_context(context):
        result = agent_app.invoke(request.query)
    return AgentChatResponse(response=result["response"])
```

**After:**
```python
@router.post("/chat/attendance")
async def attendance_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # ← Add this
):
    context = ToolRuntimeContext(
        jwt_token=token,  # ← Pass JWT
        api_base_url=get_api_base_url(),  # ← Pass API URL
    )
    with use_tool_context(context):
        result = agent_app.invoke(request.query)
    return AgentChatResponse(response=result["response"])
```

---

### Step 4: Remove Service Imports

Remove these from agent tools:
```python
# ❌ Remove these
from app.services import attendance_record_service
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

# ✅ Add these
from app.agents.http_client import AgentHTTPClient
```

---

## Security Considerations

### 1. JWT Token Flow

**✅ CORRECT: Token from Frontend**
```
Frontend obtains JWT → Sends to agent endpoint → Agent uses for API calls
```

**❌ INCORRECT: Token from .env**
```
Agent reads token from .env → Security issue (shared token, no user context)
```

### 2. Token Storage

**Frontend (JavaScript):**
```javascript
// Store token after login
const token = response.data.access_token;
localStorage.setItem('jwt_token', token);

// Use token for agent requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
};
```

**Agent Layer (Python):**
```python
# ✅ Token passed through request, not stored
token: str = Depends(oauth2_scheme)

# ❌ Never store tokens in agent layer
# DO NOT: token = os.getenv("JWT_TOKEN")
```

### 3. Token Expiry

**Handling:**
- Frontend detects 401 Unauthorized
- Refreshes token or prompts re-login
- Retries request with new token

**Example:**
```javascript
async function callAgent(query) {
  try {
    const response = await fetch('/api/v1/agents/chat/attendance', {
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ query })
    });

    if (response.status === 401) {
      // Token expired
      await refreshToken();
      // Retry request
      return callAgent(query);
    }

    return await response.json();
  } catch (error) {
    console.error('Agent call failed:', error);
  }
}
```

### 4. Role-Based Access Control

**Backend API enforces roles:**
```python
@router.post("/attendance/", dependencies=[Depends(require_role("Teacher"))])
async def create_attendance(...):
    # Only Teacher or Admin can create attendance
    pass
```

**Agent tools don't check roles:**
```python
# ❌ Don't do this in agent tools
if current_profile.role != "Teacher":
    raise PermissionError()

# ✅ Backend API handles it
response = await client.post("/attendance/", json={...})
# Backend returns 403 if unauthorized
```

---

## Configuration

### Environment Variables

**`.env` file:**
```bash
# API Base URL for HTTP-based agents
API_BASE_URL=http://localhost:8000/api/v1

# Alternative: Specify host and port separately
BACKEND_HOST=localhost
BACKEND_PORT=8000
API_V1_STR=/api/v1

# Supabase (for JWT validation in backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
```

### Docker Configuration

**`docker-compose.yml`:**
```yaml
services:
  backend:
    environment:
      - API_BASE_URL=http://backend:8000/api/v1
      - BACKEND_HOST=backend
      - BACKEND_PORT=8000
```

### Kubernetes Configuration

**ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  API_BASE_URL: "http://backend-service:8000/api/v1"
```

---

## Testing

### Unit Testing Agent Tools

```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_mark_attendance():
    # Mock HTTP client
    with patch('app.agents.http_client.AgentHTTPClient') as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            return_value={"id": 1, "status": "Present"}
        )

        # Test tool
        result = await mark_student_attendance(
            student_id="123",
            attendance_date="2025-11-06",
            status="Present"
        )

        assert result["success"] is True
```

### Integration Testing

```python
@pytest.mark.asyncio
async def test_attendance_agent_e2e(test_client, auth_token):
    response = await test_client.post(
        "/api/v1/agents/chat/attendance",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "query": "Mark student 123 as present today",
            "session_id": "test-session"
        }
    )

    assert response.status_code == 200
    assert "marked successfully" in response.json()["response"].lower()
```

### Testing with Different Roles

```python
@pytest.mark.parametrize("role,should_succeed", [
    ("Teacher", True),
    ("Admin", True),
    ("Parent", False),
    ("Student", False),
])
async def test_attendance_role_authorization(role, should_succeed, test_client):
    token = get_test_token(role=role)

    response = await test_client.post(
        "/api/v1/agents/chat/attendance",
        headers={"Authorization": f"Bearer {token}"},
        json={"query": "Mark student 123 as present"}
    )

    if should_succeed:
        assert response.status_code == 200
    else:
        assert response.status_code == 403
```

---

## Troubleshooting

### Issue 1: "JWT token not available"

**Error:**
```
AgentAuthenticationError: JWT token not available. Ensure the frontend passes a valid token.
```

**Cause:** Agent endpoint not extracting JWT from request.

**Solution:**
```python
# Add token extraction
@router.post("/chat/attendance")
async def attendance_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # ← Add this
):
```

---

### Issue 2: "API base URL not configured"

**Error:**
```
AgentAuthenticationError: API base URL not configured in tool context.
```

**Solution:**
1. Set `API_BASE_URL` in `.env`:
   ```bash
   API_BASE_URL=http://localhost:8000/api/v1
   ```

2. Or inject in agent endpoint:
   ```python
   context = ToolRuntimeContext(
       jwt_token=token,
       api_base_url="http://localhost:8000/api/v1",  # ← Add this
   )
   ```

---

### Issue 3: "401 Unauthorized"

**Error:**
```
AgentAuthenticationError: Authentication failed: Invalid authentication credentials
```

**Causes:**
1. Token expired
2. Token invalid
3. Token not in request

**Solution:**
1. Frontend: Refresh token
2. Frontend: Verify token in request headers
3. Backend: Check Supabase configuration

---

### Issue 4: "403 Forbidden"

**Error:**
```
AgentAuthenticationError: Authorization failed: Operation not permitted
```

**Cause:** User doesn't have required role.

**Solution:**
1. Verify user role in database
2. Check endpoint's `require_role()` dependency
3. Ensure JWT contains correct user information

---

### Issue 5: "Connection refused"

**Error:**
```
AgentHTTPClientError: Network error: Connection refused
```

**Causes:**
1. Backend API not running
2. Incorrect API_BASE_URL
3. Network/firewall issues

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check API_BASE_URL in .env
3. Check Docker network configuration

---

## Best Practices

### 1. Error Handling

**Always handle specific exceptions:**
```python
try:
    result = await client.post("/attendance/", json=data)
except AgentAuthenticationError:
    return {"error": "Please log in again"}
except AgentValidationError as e:
    return {"error": f"Invalid data: {e.detail}"}
except AgentHTTPClientError as e:
    return {"error": "Request failed", "details": e.message}
```

### 2. Logging

**Log important events:**
```python
logger.info(f"Agent HTTP GET: {url}")
logger.debug(f"Request payload: {json_data}")
logger.error(f"Request failed: {error}", exc_info=True)
```

### 3. Timeouts

**Configure appropriate timeouts:**
```python
client = AgentHTTPClient(
    timeout=30.0,  # 30 seconds
    max_retries=3,
)
```

### 4. Monitoring

**Track agent API calls:**
- Request count
- Error rate
- Response time
- Token expiry rate

---

## Summary

### Key Changes

1. **ToolRuntimeContext:** Added `jwt_token` and `api_base_url` fields
2. **AgentHTTPClient:** New HTTP client with JWT injection
3. **Agent Tools:** Use HTTP client instead of service calls
4. **Agent Endpoints:** Extract JWT and inject into context

### Benefits

- ✅ Single authentication/authorization point
- ✅ Proper security boundaries
- ✅ Easier testing and monitoring
- ✅ Loose coupling via API contracts
- ✅ Production-ready architecture

### Migration Checklist

- [ ] Add `API_BASE_URL` to `.env`
- [ ] Update agent endpoints to extract JWT
- [ ] Refactor agent tools to use `AgentHTTPClient`
- [ ] Remove direct service imports
- [ ] Update tests
- [ ] Deploy and verify

---

**Need Help?**
- Check the troubleshooting section
- Review example implementations in `tools_api_based.py`
- Consult the team for migration support
