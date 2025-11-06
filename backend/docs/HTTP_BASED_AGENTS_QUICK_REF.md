# HTTP-based Agents: Quick Reference

## Quick Start

### 1. Environment Setup

Add to your existing `.env` or `.env.test`:
```bash
# API Base URL for HTTP-based agents
API_BASE_URL=http://localhost:8000/api/v1

# Note: JWT tokens are NOT stored in .env
# They come from the frontend with each request
```

### 2. Frontend Example

```javascript
// Get JWT token from login/session
const token = localStorage.getItem('jwt_token');

// Call agent endpoint
const response = await fetch('http://localhost:8000/api/v1/agents/chat/attendance', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Mark student 123 as present today',
    session_id: 'user-session-123'
  })
});

const result = await response.json();
console.log(result.response);
```

### 3. Agent Endpoint (Backend)

```python
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/agents")

@router.post("/chat/attendance")
async def attendance_chat(
    request: AgentChatRequest,
    token: str = Depends(oauth2_scheme),  # Extract JWT from Authorization header
):
    context = ToolRuntimeContext(
        jwt_token=token,
        api_base_url=os.getenv("API_BASE_URL"),
    )

    with use_tool_context(context):
        result = agent_app.invoke(request.query)

    return AgentChatResponse(response=result["response"])
```

### 4. Agent Tool (HTTP-based)

```python
from app.agents.http_client import AgentHTTPClient

@tool("mark_student_attendance")
async def mark_student_attendance(
    student_id: str,
    attendance_date: str,
    status: str,
) -> dict:
    async with AgentHTTPClient() as client:
        response = await client.post(
            "/attendance/",
            json={
                "student_id": int(student_id),
                "date": attendance_date,
                "status": status,
            }
        )

        return {
            "success": True,
            "message": f"Attendance marked for student {student_id}",
            "record": response,
        }
```

---

## Common Patterns

### Error Handling

```python
try:
    async with AgentHTTPClient() as client:
        data = await client.get("/attendance/", params={"student_id": 123})
        return {"success": True, "data": data}

except AgentAuthenticationError as e:
    return {"success": False, "error": "Authentication failed", "detail": e.message}

except AgentResourceNotFoundError as e:
    return {"success": False, "error": "Resource not found", "detail": e.message}

except AgentHTTPClientError as e:
    return {"success": False, "error": e.message}
```

### Query Parameters

```python
# GET with query parameters
data = await client.get(
    "/attendance/",
    params={
        "student_id": 123,
        "start_date": "2025-11-01",
        "end_date": "2025-11-30"
    }
)
```

### POST with JSON Body

```python
# POST with JSON body
result = await client.post(
    "/attendance/",
    json={
        "student_id": 123,
        "date": "2025-11-06",
        "status": "Present",
        "notes": "On time"
    }
)
```

### PUT for Updates

```python
# PUT to update a resource
updated = await client.put(
    "/attendance/456",
    json={"status": "Absent", "notes": "Sick leave"}
)
```

### DELETE

```python
# DELETE a resource
await client.delete("/attendance/456")
```

---

## HTTP Status Code Handling

| Status | Exception | Description |
|--------|-----------|-------------|
| 200 | Success | Request successful |
| 201 | Success | Resource created |
| 204 | Success | No content (delete) |
| 400 | `AgentHTTPClientError` | Bad request |
| 401 | `AgentAuthenticationError` | Invalid/expired token |
| 403 | `AgentAuthenticationError` | Insufficient permissions |
| 404 | `AgentResourceNotFoundError` | Resource not found |
| 422 | `AgentValidationError` | Validation error |
| 500 | `AgentHTTPClientError` | Server error |

---

## Testing Checklist

- [ ] JWT token extracted from request in agent endpoint
- [ ] API_BASE_URL configured in .env
- [ ] Agent tools use AgentHTTPClient (not service calls)
- [ ] No direct database access in agent tools
- [ ] Error handling for 401, 403, 404, 422
- [ ] Frontend sends Authorization header
- [ ] Backend API validates JWT
- [ ] Role-based access control works

---

## Troubleshooting

### "JWT token not available"
**Fix:** Add `token: str = Depends(oauth2_scheme)` to agent endpoint

### "API base URL not configured"
**Fix:** Set `API_BASE_URL=http://localhost:8000/api/v1` in .env

### "401 Unauthorized"
**Fix:**
1. Check token is valid
2. Verify Supabase configuration
3. Ensure token not expired

### "403 Forbidden"
**Fix:** Verify user has required role (Teacher/Admin)

### "Connection refused"
**Fix:**
1. Verify backend is running
2. Check API_BASE_URL
3. Check Docker/network configuration

---

## API Endpoint Reference

### Attendance Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance/` | Teacher | Create attendance record |
| GET | `/attendance/` | Teacher | Get attendance records |
| GET | `/attendance/students/{id}` | Parent | Get student attendance |
| PUT | `/attendance/{id}` | Teacher | Update attendance |
| DELETE | `/attendance/{id}` | Admin | Delete attendance |

### Role Requirements

| Role | Permissions |
|------|-------------|
| Admin | Full access (create, read, update, delete) |
| Teacher | Create, read, update attendance |
| Parent | Read own child's attendance |
| Student | Read own attendance |

---

## Security Best Practices

1. **Never store JWT in .env**
   - ✅ Pass from frontend
   - ❌ Store in backend environment

2. **Token expiry handling**
   - Frontend refreshes token
   - Retry request with new token

3. **HTTPS in production**
   - Use `https://` for API_BASE_URL
   - Enable SSL/TLS

4. **Rate limiting**
   - Implement on agent endpoints
   - Prevent abuse

5. **Logging**
   - Log authentication failures
   - Monitor suspicious activity

---

## Performance Tips

1. **Reuse HTTP client**
   ```python
   async with AgentHTTPClient() as client:
       result1 = await client.get("/endpoint1")
       result2 = await client.post("/endpoint2", json={...})
   ```

2. **Batch operations**
   - Use bulk endpoints when available
   - Reduce number of HTTP requests

3. **Caching**
   - Cache frequently accessed data
   - Use Redis for session data

4. **Timeouts**
   ```python
   client = AgentHTTPClient(
       timeout=30.0,  # seconds
       max_retries=3
   )
   ```

---

## Migration Steps

1. ✅ Add API_BASE_URL to .env
2. ✅ Update tool_context.py to include jwt_token field
3. ✅ Create AgentHTTPClient in http_client.py
4. ✅ Refactor agent tools to use HTTP client
5. ✅ Update agent endpoints to extract JWT
6. ✅ Remove service imports from agent tools
7. ✅ Test with different roles
8. ✅ Deploy and monitor

---

## Files Changed

```
backend/
├── app/
│   ├── agents/
│   │   ├── tool_context.py          # Added jwt_token field
│   │   ├── http_client.py           # New HTTP client
│   │   ├── api_with_jwt.py          # Example endpoint
│   │   └── modules/academics/leaves/attendance_agent/
│   │       └── tools_api_based.py   # HTTP-based tools
│   └── ...
└── docs/
    ├── HTTP_BASED_AGENTS_ARCHITECTURE.md  # Full documentation
    └── HTTP_BASED_AGENTS_QUICK_REF.md     # This file
```

---

## Next Steps

1. Review full documentation: `docs/HTTP_BASED_AGENTS_ARCHITECTURE.md`
2. Test with Postman/curl
3. Update frontend to send JWT
4. Monitor logs for errors
5. Gradually migrate other agents

---

**Questions?** Check the full documentation or ask the team!
