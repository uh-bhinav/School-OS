# SchoolOS Frontend-Backend Integration Guide

This document provides a complete guide for integrating the React frontend with the FastAPI backend.

## Overview

The integration connects:
- **Login Page** (`frontend/login-page`) → Authenticates users and stores tokens
- **Admin Dashboard** (`frontend/admin-page`) → Full CRUD operations using API
- **Backend API** (`backend/app`) → FastAPI endpoints with JWT authentication

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Login Page    │─────▶│   Backend Auth   │─────▶│  JWT Token      │
│  (React/Vite)   │      │  POST /v1/auth   │      │  localStorage   │
└─────────────────┘      │      /login      │      └─────────────────┘
                         └──────────────────┘                │
                                    ▲                        │
                                    │                        │
                         ┌──────────┴────────────────────────┴──────────┐
                         │                                             │
                         ▼                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard (React/Vite)                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  API Client (axios) with Bearer token auto-attachment              │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  GET /v1/students          → List all students                            │
│  POST /v1/students         → Create new student                           │
│  PUT /v1/students/{id}     → Update student                               │
│  DELETE /v1/students/{id}  → Delete student                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │   FastAPI Backend        │
                         │   (127.0.0.1:8000)      │
                         │                          │
                         │  • JWT verification      │
                         │  • Role-based access     │
                         │  • Database operations   │
                         │  • CORS enabled          │
                         └──────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Poetry for Python environment
- PostgreSQL database running
- Supabase configured (for auth)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
poetry install

# Configure environment
cp .env.example .env
# Edit .env with your database and Supabase credentials

# Set test token for development
echo "TEST_TEACHER_TOKEN=your-test-jwt-token-here" >> .env

# Start backend server
poetry run uvicorn app.main:app --reload
```

Backend will be available at `http://127.0.0.1:8000`

### 2. Login Page Setup

```bash
cd frontend/login-page

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://127.0.0.1:8000/v1" > .env

# Start development server
npm run dev
```

Login page will be available at `http://localhost:5173` (or assigned port)

### 3. Admin Dashboard Setup

```bash
cd frontend/admin-page

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://127.0.0.1:8000/v1" > .env

# Start development server
npm run dev
```

Admin dashboard will be available at `http://localhost:5174` (or assigned port)

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/schoolos

# Supabase (for authentication)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# API Configuration
PROJECT_NAME="SchoolOS API"
API_V1_STR=/api/v1

# Security (for JWT)
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Development Token (optional, for testing)
TEST_TEACHER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Agents (optional)
GROQ_API_KEY=your-groq-key
MISTRAL_API_KEY=your-mistral-key
DEEPSEEK_API_KEY=your-deepseek-key
GOOGLE_API_KEY=your-google-key
```

### Frontend Environment Variables

Create `.env` files for both frontend apps:

**`frontend/login-page/.env`**:
```env
VITE_API_URL=http://127.0.0.1:8000/v1
```

**`frontend/admin-page/.env`**:
```env
VITE_API_URL=http://127.0.0.1:8000/v1
```

**Production example**:
```env
VITE_API_URL=https://api.yourschoolos.com/v1
```

## Authentication Flow

### 1. User Login

```javascript
// frontend/login-page/index.jsx
const onSubmit = async (e) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  
  // Store token
  localStorage.setItem('auth_token', data.access_token);
  
  // Redirect
  window.location.href = '/admin-page/';
};
```

### 2. API Request with Token

```javascript
// frontend/admin-page/src/utils/api.js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Backend Token Verification

```python
# backend/app/core/security.py
async def _get_current_user_profile_from_db(
    token: str = Depends(oauth2_scheme),
    supabase: Client = Depends(get_supabase_client),
    db: AsyncSession = Depends(get_db),
) -> Profile:
    # Verify token with Supabase or test token
    # Return user profile
    ...
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/login` | Login and get JWT token |

**Request**:
```json
{
  "email": "admin@school.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Students Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/v1/students` | List all students | ✅ |
| GET | `/v1/students/{id}` | Get student details | ✅ |
| POST | `/v1/students` | Create new student | ✅ Admin |
| PUT | `/v1/students/{id}` | Update student | ✅ Admin |
| DELETE | `/v1/students/{id}` | Delete student | ✅ Admin |

**Example - List Students**:
```javascript
const students = await api.get('/students');
// Returns: Array of StudentOut objects
```

**Example - Create Student**:
```javascript
const newStudent = await api.post('/students', {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone_number: '+1234567890',
  date_of_birth: '2010-01-15',
  gender: 'Male',
  address: '123 Main St',
  school_id: 1,
  class_id: 1
});
```

## Testing the Integration

### 1. Test Login Flow

```bash
# Terminal 1: Start backend
cd backend
poetry run uvicorn app.main:app --reload

# Terminal 2: Start login page
cd frontend/login-page
npm run dev

# Browser: Navigate to http://localhost:5173
# Enter any email/password
# Should redirect to admin page
```

### 2. Test API Calls

```bash
# Start admin dashboard
cd frontend/admin-page
npm run dev

# Browser: Navigate to http://localhost:5174
# Click "Students" in sidebar
# Should see students list (may be empty)
```

### 3. Test CRUD Operations

1. **Add Student**: Fill form → Submit → Check table
2. **Edit Student**: Click Edit → Modify → Submit
3. **Delete Student**: Click Delete → Confirm
4. **View Dashboard**: Check "Total Students" stat updates

### 4. Verify with Backend Logs

Watch backend terminal for API requests:
```
INFO:     127.0.0.1:XXXXX - "GET /v1/students HTTP/1.1" 200 OK
INFO:     127.0.0.1:XXXXX - "POST /v1/students HTTP/1.1" 201 Created
```

## Error Handling

### Frontend Error Handling

```javascript
// frontend/admin-page/src/components/StudentsPanel.jsx
try {
  const students = await api.get('/students');
  setStudents(students);
} catch (error) {
  setError(error.message); // Display user-friendly error
}
```

### Backend Error Responses

```json
{
  "detail": "Student not found"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Issues

#### CORS Error

**Problem**: Browser blocks API requests with CORS error

**Solution**: Backend already configured CORS in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Token Not Attached

**Problem**: API calls fail with 401 Unauthorized

**Solution**: Check:
1. Token stored: `localStorage.getItem('auth_token')`
2. Token attached: Check Network tab → Request Headers → Authorization
3. Token valid: Verify with backend

#### Environment Variable Not Working

**Problem**: API_URL not loading correctly

**Solution**:
1. Restart dev server after changing `.env`
2. Check variable name starts with `VITE_`
3. Verify `.env` in correct directory
4. Check console for config: Look for "🔧 Frontend Configuration" log

## Production Deployment

### Backend Deployment

1. Set environment variables on production server
2. Configure PostgreSQL database
3. Set up Supabase production project
4. Use production SECRET_KEY
5. Configure proper CORS origins
6. Enable HTTPS

### Frontend Deployment

1. Build production bundles:
```bash
cd frontend/login-page && npm run build
cd frontend/admin-page && npm run build
```

2. Set production API URL:
```env
VITE_API_URL=https://api.yourschoolos.com/v1
```

3. Deploy to CDN/hosting:
- Vercel, Netlify, or AWS S3 + CloudFront
- Serve `dist/` directories

4. Configure:
- HTTPS certificates
- Custom domains
- Environment-specific variables

### Security Checklist

- [ ] HTTPS enabled on all services
- [ ] Production SECRET_KEY generated
- [ ] CORS restricted to production domains
- [ ] Environment variables secured
- [ ] Token storage secure (consider httpOnly cookies)
- [ ] Rate limiting configured
- [ ] Database credentials secured
- [ ] API keys in environment, not code

## Extending the Integration

### Adding New Endpoints

1. **Backend**: Create endpoint in `backend/app/api/v1/endpoints/`
2. **Frontend**: Add API call in component
3. **Document**: Update this guide

### Adding New Modules

1. **Backend**: Create service + endpoint
2. **Frontend**: Create panel component
3. **Integration**: Wire up CRUD operations
4. **Navigation**: Add to admin sidebar

## Resources

- **Backend API Docs**: http://127.0.0.1:8000/docs
- **Frontend Setup**: `frontend/SETUP.md`
- **Login Page**: `frontend/login-page/README.md`
- **Admin Dashboard**: `frontend/admin-page/README.md`
- **Backend README**: `backend/README.md`

## Support

For integration issues:

1. Check browser console for errors
2. Check backend logs for API errors
3. Verify environment configuration
4. Test endpoints manually with curl/Postman
5. Review network requests in DevTools

## Version History

- **v1.0** - Initial integration
  - Login flow with JWT tokens
  - Students CRUD operations
  - Dashboard statistics
  - Protected routes

## License

See project root LICENSE file.

