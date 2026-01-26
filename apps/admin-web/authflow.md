I'll search the frontend folder to trace the authentication flow and identify which API endpoints are being called.

Searched text for `auth|login|signup|token|session` (`**/apps/admin-web/src/**/*.{ts,tsx,js,jsx}`), 20 results

Searched for files matching `**/apps/admin-web/src/**/auth*.{ts,tsx}`, 2 matches

Searched for files matching `**/apps/admin-web/src/**/login*.{ts,tsx}`, 2 matches

Searched for files matching `**/apps/admin-web/src/app/services/**/*.{ts,tsx}`, 20 matches

Let me read the key authentication files:

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/routes/auth/login.tsx#1-1), lines 1 to 200

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/stores/useAuthStore.ts#1-1), lines 1 to 200

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/services/profile.api.ts)

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/services/supabase.ts)

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/services/http.ts#1-1), lines 1 to 150

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/components/RouteGuard.tsx)

Searched for files matching `**/apps/admin-web/src/app/providers/*Provider*.tsx`, 12 matches

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/providers/AuthProvider.tsx)

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/stores/useAuthStore.ts#150-150), lines 150 to 200

Searched text for `/profiles/me` (`**/apps/admin-web/src/app/routes/**/*.tsx`), no results

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/stores/useAuthStore.ts#200-200), lines 200 to 316

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/services/http.ts#150-150), lines 150 to 277

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/providers/ConfigProvider.tsx#1-1), lines 1 to 100

Searched text for `/schools.*config|fetchSchoolConfig` (`**/apps/admin-web/src/app/**/*.{ts,tsx}`), 7 results

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/services/config.ts#1-1), lines 1 to 100

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/routes/auth/login.tsx#200-200), lines 200 to 441

Now let me check the main app entry point and routing:

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/main.tsx#1-1), lines 1 to 100

Searched for files matching `**/apps/admin-web/src/app/routes/**/index.tsx`, 12 matches

Searched text for `Protected|ProtectedRoute|RouteGuard` (`**/apps/admin-web/src/app/**/*.{ts,tsx}`), 8 results

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/components/Shell.tsx#1-1), lines 1 to 150

Read [](file:///Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/app/services/config.ts#100-100), lines 100 to 252

Perfect! Now I have a complete picture. Let me create a comprehensive explanation of the authentication flow.

# 🔐 **School-OS Authentication Flow - Detailed Analysis**

## **Overview**

The frontend uses **Supabase Authentication** with minimal backend integration. Only **2 backend endpoints** are called:
1. `GET /api/v1/profiles/me` - Get user profile
2. `GET /api/v1/schools/{school_id}` - Get school configuration

All other features use **mock data** on the frontend.

---

## **📊 Authentication Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER VISITS APP                                   │
│                 http://localhost:5173                                │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│               MAIN.TSX - App Entry Point                             │
│  • Runs runAuthMigration() - Cleans stale auth data                 │
│  • Initializes QueryClient with optimized settings                  │
│  • Sets up Router with AuthRoot provider                            │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│             AuthRoot (AuthProvider.tsx)                              │
│  🔐 SINGLE BOOTSTRAP (useRef guard prevents re-runs)                │
│                                                                       │
│  Step 1: Check existing session                                     │
│    ↓                                                                 │
│    supabase.auth.getSession()                                       │
│    ├─ Session exists? → Restore session                             │
│    │   ├─ setSession(session) → Updates Zustand store               │
│    │   └─ fetchProfile(false) → Use cached if available             │
│    └─ No session? → Continue (user must login)                      │
│                                                                       │
│  Step 2: Set up auth state listener                                 │
│    ↓                                                                 │
│    supabase.auth.onAuthStateChange((event, session) => {            │
│      • SIGNED_IN → fetchProfile(true) [force fresh]                 │
│      • SIGNED_OUT → clear() [clear all state]                       │
│      • TOKEN_REFRESHED → setSession() [NO profile refetch]          │
│      • INITIAL_SESSION → Use cached profile [NO fetch]              │
│    })                                                                │
│                                                                       │
│  Step 3: Proactive token refresh timer                              │
│    ↓                                                                 │
│    Every 60 seconds: Check if token expires in < 5 minutes          │
│    If yes: supabase.auth.refreshSession()                           │
└────────────────────────┬────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────────┐       ┌──────────────────────┐
│   NO SESSION FOUND   │       │   SESSION EXISTS     │
│   Show Login Page    │       │   Route to Protected │
└──────────────────────┘       └──────────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  LOGIN PAGE (login.tsx)                              │
│                                                                       │
│  User enters email & password                                        │
│    ↓                                                                 │
│  formik.onSubmit → async (values) => {                              │
│    1. Set up one-time SIGNED_IN listener                            │
│    2. Call supabase.auth.signInWithPassword()                       │
│    3. Wait for SIGNED_IN event                                      │
│    4. setSession(session) → Update Zustand                          │
│    5. fetchProfile(true) → Call /profiles/me                        │
│    6. navigate("/") → Redirect to dashboard                         │
│  }                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│             🔑 BACKEND API CALL #1: /profiles/me                    │
│                                                                       │
│  Endpoint: GET http://localhost:8000/api/v1/profiles/me             │
│  Headers: Authorization: Bearer <supabase_jwt_token>                │
│                                                                       │
│  Response: {                                                         │
│    user_id: "uuid-string",                                          │
│    school_id: 2,                                                    │
│    first_name: "Admin",                                             │
│    last_name: "User",                                               │
│    roles: [                                                          │
│      { role_definition: { role_name: "admin" } }                    │
│    ]                                                                 │
│  }                                                                   │
│                                                                       │
│  ✅ Stored in Zustand (useAuthStore):                               │
│    • userId                                                          │
│    • schoolId                                                        │
│    • role (extracted: "admin")                                       │
│    • cachedProfile (cached for 10 min)                              │
│    • accessToken                                                     │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Protected Component (Shell.tsx)                         │
│                                                                       │
│  useEffect(() => {                                                   │
│    const { role, schoolId, userId } = useAuthStore()                │
│                                                                       │
│    if (!role || !schoolId || !userId) {                             │
│      navigate("/auth/login") // Redirect if missing                 │
│    }                                                                 │
│                                                                       │
│    if (role !== "admin") {                                          │
│      return "Access Denied" // Only admins allowed                  │
│    }                                                                 │
│  })                                                                  │
│                                                                       │
│  return (                                                            │
│    <ConfigRoot>  {/* Loads school config */}                        │
│      {children}  {/* Renders dashboard/modules */}                  │
│    </ConfigRoot>                                                     │
│  )                                                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│          ConfigRoot (ConfigProvider.tsx)                             │
│  🔧 LOADS SCHOOL CONFIG ONCE PER SESSION                            │
│                                                                       │
│  Step 1: Check if config already cached                             │
│    ↓                                                                 │
│    if (existingConfig && lastFetchedSchoolId === schoolId) {        │
│      return; // Skip fetch, use cache                               │
│    }                                                                 │
│                                                                       │
│  Step 2: Verify session before API call                             │
│    ↓                                                                 │
│    const { session } = await supabase.auth.getSession()             │
│    if (!session) refreshSession()                                   │
│                                                                       │
│  Step 3: Fetch school configuration                                 │
│    ↓                                                                 │
│    const cfg = await fetchSchoolConfig(schoolId)                    │
│    setConfig(cfg) // Store in Zustand (useConfigStore)              │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│         🔑 BACKEND API CALL #2: /schools/{school_id}                │
│                                                                       │
│  Endpoint: GET http://localhost:8000/api/v1/schools/2               │
│  Headers: Authorization: Bearer <supabase_jwt_token>                │
│                                                                       │
│  Response: {                                                         │
│    school_id: 2,                                                    │
│    name: "Tapasya Vidyanikethan",                                   │
│    configuration: {                                                  │
│      version: "1.0.0",                                              │
│      identity: {                                                     │
│        display_name: "Tapasya Vidyanikethan",                       │
│        school_code: "TVPS99"                                        │
│      },                                                              │
│      branding: {                                                     │
│        logo: { primary_url: "https://..." },                        │
│        colors: { primary: "#2563eb", ... }                          │
│      },                                                              │
│      locale: { language: "en", timezone: "Asia/Kolkata", ... },     │
│      modules: { subscribed: [...], settings: {...} }                │
│    }                                                                 │
│  }                                                                   │
│                                                                       │
│  ✅ Stored in Zustand (useConfigStore):                             │
│    • config.branding (logo, colors, typography)                     │
│    • config.identity (school name, code)                            │
│    • config.modules (enabled features)                              │
│    • config.locale (language, timezone, currency)                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│              🎉 APP FULLY LOADED                                     │
│                                                                       │
│  ✅ User authenticated (Supabase session valid)                     │
│  ✅ Profile loaded (userId, schoolId, role cached)                  │
│  ✅ Config loaded (branding, modules cached)                        │
│  ✅ Dashboard rendered with mock data                               │
│                                                                       │
│  From this point forward:                                           │
│  • ALL module data = MOCK DATA (no backend calls)                   │
│  • Token auto-refreshed by Supabase + AuthProvider                  │
│  • Profile cached for 10 minutes                                    │
│  • Config cached for entire session                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## **🔐 Key Components & Their Roles**

### **1. Supabase Client (supabase.ts)**

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // ✅ Saves session to localStorage
    autoRefreshToken: true,       // ✅ Auto-refreshes before expiry
    detectSessionInUrl: true,     // ✅ Handles OAuth redirects
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
});

// Synchronous token getter (used by HTTP interceptor)
export function getAccessToken(): string | null {
  const storedSession = localStorage.getItem('supabase.auth.token');
  return JSON.parse(storedSession)?.access_token;
}
```

**Purpose:** Manages Supabase authentication state, persists session across reloads.

---

### **2. Auth Store (useAuthStore.ts)**

```typescript
interface AuthState {
  userId?: string;
  schoolId?: number;
  role?: "admin" | "teacher" | "student" | "parent";

  // Profile caching (prevents API spam)
  cachedProfile?: Profile;
  profileCachedAt?: number; // Timestamp

  // Session tracking (for token refresh)
  accessToken?: string;
  sessionExpiresAt?: number;
  sessionVersion: number; // Bumped on token refresh

  // Actions
  setAuth: (payload) => void;
  setSession: (session: Session | null) => void; // ← Called by AuthProvider
  fetchProfile: (force?: boolean) => Promise<Profile>; // ← Cached with 10min TTL
  logout: () => void;
}
```

**Key Features:**
- ✅ **Profile caching** (10-minute TTL) - prevents repeated `/profiles/me` calls
- ✅ **Token tracking** - stores `accessToken` and `sessionExpiresAt`
- ✅ **Smart fetching** - `fetchProfile(false)` uses cache, `fetchProfile(true)` fetches fresh

---

### **3. Auth Provider (AuthProvider.tsx)**

```typescript
export function AuthRoot({ children }) {
  const hasBootstrapped = useRef(false); // ← CRITICAL: Prevents re-runs

  useEffect(() => {
    if (hasBootstrapped.current) return; // ← Only runs ONCE
    hasBootstrapped.current = true;

    // Step 1: Check existing session
    supabase.auth.getSession().then(({ session }) => {
      setSession(session); // Always sync to Zustand
      if (session) {
        fetchProfile(false); // Use cache if available
      }
    });

    // Step 2: Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session); // Always sync token

      if (event === "SIGNED_IN") {
        fetchProfile(true); // Force fresh on new login
      } else if (event === "TOKEN_REFRESHED") {
        // NO profile refetch - just token sync
      } else if (event === "SIGNED_OUT") {
        clear();
      }
    });
  }, []); // ← Empty deps = run once

  // Proactive token refresh (every 60s, refresh 5min before expiry)
  useEffect(() => {
    setInterval(() => {
      const session = await supabase.auth.getSession();
      const timeUntilExpiry = session.expires_at - Date.now();
      if (timeUntilExpiry < 300) {
        supabase.auth.refreshSession(); // Proactive refresh
      }
    }, 60000);
  }, []);
}
```

**Purpose:**
- ✅ Initializes auth state on app load
- ✅ Prevents `/profiles/me` spam via single bootstrap
- ✅ Handles token refresh transparently
- ✅ Syncs Supabase session → Zustand store

---

### **4. HTTP Client (http.ts)**

```typescript
// Request Interceptor
http.interceptors.request.use(async (config) => {
  // Get token from Zustand or localStorage
  let token = useAuthStore.getState().getAccessToken();
  if (!token) token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor (handles 401)
http.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const { data } = await supabase.auth.refreshSession();

      if (data.session) {
        // Update Zustand with new token
        useAuthStore.getState().setSession(data.session);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return http(originalRequest);
      } else {
        // Refresh failed - logout
        useAuthStore.getState().logout();
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);
```

**Purpose:**
- ✅ Automatically adds `Authorization` header to all requests
- ✅ Handles 401 errors by attempting token refresh
- ✅ Falls back to logout if refresh fails

---

### **5. Profile API (profile.api.ts)**

```typescript
export async function getMyProfile(): Promise<Profile> {
  const { data } = await http.get("/profiles/me"); // ← Only backend endpoint for profile
  return ProfileSchema.parse(data);
}

export function getPrimaryRole(profile: Profile): Role {
  const roleNames = profile.roles.map(r => r.role_definition.role_name);

  if (roleNames.includes("admin")) return "admin";
  if (roleNames.includes("teacher")) return "teacher";
  if (roleNames.includes("parent")) return "parent";
  return "student";
}
```

**Backend Endpoint:**
```
GET http://localhost:8000/api/v1/profiles/me
Authorization: Bearer <supabase_jwt>

Response:
{
  "user_id": "uuid",
  "school_id": 2,
  "first_name": "Admin",
  "last_name": "User",
  "roles": [
    { "role_definition": { "role_name": "admin" } }
  ]
}
```

---

### **6. Config Provider (ConfigProvider.tsx)**

```typescript
export function ConfigRoot({ children }) {
  const { schoolId } = useAuthStore();
  const existingConfig = useConfigStore((s) => s.config);
  const setConfig = useConfigStore((s) => s.set);

  useEffect(() => {
    // Skip if no schoolId
    if (!schoolId) return;

    // Skip if config already loaded for this school
    if (existingConfig && lastFetchedSchoolId.current === schoolId) {
      return;
    }

    // Verify session exists
    const { session } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.refreshSession();
    }

    // Fetch config
    const cfg = await fetchSchoolConfig(schoolId);
    setConfig(cfg);
    lastFetchedSchoolId.current = schoolId;
  }, [schoolId]);
}
```

**Backend Endpoint:**
```
GET http://localhost:8000/api/v1/schools/2
Authorization: Bearer <supabase_jwt>

Response:
{
  "school_id": 2,
  "name": "Tapasya Vidyanikethan",
  "configuration": {
    "version": "1.0.0",
    "identity": { "display_name": "...", "school_code": "..." },
    "branding": { "logo": {...}, "colors": {...} },
    "locale": { "language": "en", "timezone": "Asia/Kolkata" },
    "modules": { "subscribed": [...], "settings": {...} }
  }
}
```

---

### **7. Protected Component (Shell.tsx)**

```typescript
export function Protected({ children }) {
  const { role, schoolId, userId } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!role || !schoolId || !userId) {
      navigate("/auth/login", { replace: true });
    }

    // Check admin privileges
    if (role !== "admin") {
      return <AccessDenied />;
    }
  }, [role, schoolId, userId]);

  return (
    <ConfigRoot>
      {children}
    </ConfigRoot>
  );
}
```

---

## **📈 Token Refresh Strategy**

### **3-Layer Token Refresh System:**

1. **Supabase Auto-Refresh** (Built-in)
   - Supabase client automatically refreshes token 5-10 minutes before expiry
   - Fires `TOKEN_REFRESHED` event → AuthProvider syncs to Zustand

2. **Proactive Refresh** (AuthProvider)
   - Timer checks every 60 seconds
   - If token expires in < 5 minutes → manually calls `refreshSession()`

3. **Reactive Refresh** (HTTP Interceptor)
   - If API call returns 401 → attempts `refreshSession()`
   - Retries original request with new token
   - Falls back to logout if refresh fails

---

## **🎯 Summary: Backend API Calls**

| Endpoint | When Called | Purpose | Cached? |
|----------|-------------|---------|---------|
| **GET /api/v1/profiles/me** | Once on login, once on page reload | Get user profile (userId, schoolId, role) | ✅ Yes (10 min) |
| **GET /api/v1/schools/{id}** | Once per session (after auth) | Get school configuration (branding, modules) | ✅ Yes (session) |

**That's it!** Only 2 backend endpoints are used. Everything else is mock data.

---

## **✅ Key Optimizations**

1. ✅ **Single Bootstrap** - AuthProvider runs once via `useRef` guard
2. ✅ **Profile Caching** - 10-minute TTL prevents `/profiles/me` spam
3. ✅ **Config Caching** - Loaded once per session, never refetched
4. ✅ **Token Sync** - Always syncs Supabase session → Zustand
5. ✅ **Smart Refresh** - Only fetches profile on `SIGNED_IN`, not `TOKEN_REFRESHED`
6. ✅ **Request Deduplication** - HTTP client prevents duplicate concurrent requests
7. ✅ **Connection Throttling** - Limits max concurrent requests to 6

---

This architecture ensures **minimal backend load** while maintaining a **smooth authentication experience**! 🚀
