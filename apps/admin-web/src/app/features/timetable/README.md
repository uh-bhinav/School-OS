# Timetable Generator Integration

## Overview

The Timetable Generator is integrated into SchoolOS ERP as a feature module at `/academics/timetable/generate`. It uses Google OR-Tools CP-SAT solver for intelligent constraint-based timetable generation.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SchoolOS ERP                             │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React 19 + MUI 7)                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  /academics/timetable/generate - Generate Page          │    │
│  │  /academics/timetable/constraints - Constraints Page    │    │
│  │  /academics/timetable/results/:jobId - Results Page     │    │
│  │  /academics/timetable/history - Job History Page        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  Backend (FastAPI)                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  /api/v1/admin/timetable/* (Proxy Router)               │    │
│  │  - Authentication via ERP                               │    │
│  │  - Admin role required                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Timetable Generator Service (localhost:8010)           │    │
│  │  - OR-Tools CP-SAT Solver                               │    │
│  │  - Constraint optimization                              │    │
│  │  - Job queue management                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
apps/admin-web/src/app/features/timetable/
├── index.ts                    # Feature exports
├── lib/
│   ├── api-client.ts          # Axios HTTP client
│   ├── api.ts                 # API functions
│   ├── schemas.ts             # Zod validation schemas
│   ├── utils.ts               # Utility functions
│   └── index.ts               # Lib exports
├── stores/
│   └── index.ts               # Zustand stores
├── pages/
│   ├── GeneratePage.tsx       # Main generation page
│   ├── ConstraintsPage.tsx    # Constraint configuration
│   ├── ResultsPage.tsx        # View generated timetable
│   ├── RecentJobsPage.tsx     # Job history
│   └── index.ts               # Page exports
└── README.md                   # This file
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/academics/timetable/generate` | GeneratePage | Load data, configure, generate timetable |
| `/academics/timetable/constraints` | ConstraintsPage | Configure timing, hard/soft constraints |
| `/academics/timetable/results/:jobId` | ResultsPage | View generated timetable by class/teacher/resource |
| `/academics/timetable/history` | RecentJobsPage | View past generation jobs |

## API Endpoints (via ERP Proxy)

All endpoints require Admin role authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/timetable/health` | Check timetable service health |
| GET | `/api/v1/admin/timetable/sample-data` | Get bundled demo data |
| POST | `/api/v1/admin/timetable/upload` | Upload school data |
| POST | `/api/v1/admin/timetable/validate` | Validate data |
| POST | `/api/v1/admin/timetable/solve` | Create solve job |
| GET | `/api/v1/admin/timetable/jobs` | List all jobs |
| GET | `/api/v1/admin/timetable/jobs/:id` | Get job status |
| GET | `/api/v1/admin/timetable/jobs/:id/result` | Get job result |
| POST | `/api/v1/admin/timetable/jobs/:id/cancel` | Cancel running job |
| POST | `/api/v1/admin/timetable/jobs/:id/rerun` | Rerun job |
| GET | `/api/v1/admin/timetable/jobs/:id/download` | Download result |

## Stores

### useUploadStore
Manages uploaded school data (teachers, subjects, classes, resources).

### useConstraintsStore (persisted)
Stores constraint configuration:
- Timing (school hours, period duration, breaks)
- Hard constraints (no teacher overlap, required breaks)
- Soft constraints (teacher preferences, consecutive limits)

### useJobStore (persisted)
Tracks current job status and recent job IDs.

### useResultStore (persisted)
Caches the most recent timetable result.

### useUIStore
UI state (view mode, filters, selected items).

## Running Locally

### Prerequisites
1. Start the ERP backend (port 8000):
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. Start the Timetable Generator service (port 8010):
   ```bash
   cd apps/admin-web/src/app/Timetable/server
   python -m uvicorn main:app --reload --port 8010 --host 127.0.0.1
   ```

3. Start the ERP frontend (port 5173):
   ```bash
   cd apps/admin-web
   pnpm dev
   ```

### Demo Mode
For demo without full authentication:
1. Set `VITE_DEMO_MODE=true` in `.env`
2. Navigate to `/academics/timetable/generate`
3. Click "Load Sample Data" to use bundled demo data
4. Click "Generate Timetable" to create a schedule

## Constraints

### Hard Constraints (must satisfy)
- No teacher can teach two classes simultaneously
- Lab sessions must be consecutive periods
- Required break periods must be respected
- Maximum periods per day per teacher

### Soft Constraints (weighted optimization)
- Teacher time preferences
- Subject time preferences (e.g., Math in morning)
- Workload balance across days
- Minimize gaps in teacher schedules

### Timing Configuration
- School start/end times
- Period duration
- Break periods (recess, lunch)
- Working days

## Security

1. **Frontend**: Protected by ERP authentication (requires Admin role)
2. **Backend Proxy**: Validates authentication before forwarding
3. **Timetable Service**: Should only accept requests from localhost

### Recommended: Localhost-only binding
Configure the timetable service to bind to localhost only:
```bash
uvicorn main:app --host 127.0.0.1 --port 8010
```

## Troubleshooting

### "Timetable Generator service is unavailable"
- Ensure the timetable service is running on port 8010
- Check if localhost:8010 is accessible

### "Request timed out"
- Complex schedules may take longer to solve
- Consider adjusting solver time limits in constraints

### Results not showing
- Check browser console for API errors
- Verify job completed successfully
- Check if result data structure matches expected schema

## Future Enhancements

1. **Real data integration**: Connect to actual school data from ERP
2. **Multi-school support**: Handle tenant context for multi-school deployments
3. **Incremental updates**: Modify existing timetables without regenerating
4. **Export to calendar**: Export to iCal, Google Calendar
5. **Conflict resolution UI**: Visual conflict editor
