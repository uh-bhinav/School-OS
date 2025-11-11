# School OS - Admin Web Dashboard

A modern, scalable admin dashboard for School OS built with React, TypeScript, Material-UI, and Vite.

## 🏗️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **UI Library**: Material-UI (MUI) v7
- **Routing**: React Router DOM v7
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack React Query v5
- **Authentication**: Supabase Auth
- **API Client**: Axios with interceptors
- **Validation**: Zod
- **API Mocking**: MSW (Mock Service Worker) v2
- **Package Manager**: pnpm v10

## 📁 Project Structure

```
apps/admin-web/
├── src/
│   ├── app/
│   │   ├── main.tsx              # Application entry point
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Shell.tsx         # App shell with navigation
│   │   │   └── RouteGuard.tsx    # Route protection component
│   │   ├── providers/            # Global context providers
│   │   │   ├── AuthProvider.tsx  # Authentication state management
│   │   │   ├── ConfigProvider.tsx # School configuration provider
│   │   │   └── ThemeProvider.tsx # MUI theme configuration
│   │   ├── services/             # API and service layer
│   │   │   ├── supabase.ts       # Supabase client setup
│   │   │   ├── http.ts           # Axios instance with interceptors
│   │   │   └── config.ts         # School config schema & fetching
│   │   ├── stores/               # Zustand state stores
│   │   │   ├── useAuthStore.ts   # Auth state (persisted)
│   │   │   └── useConfigStore.ts # Config state
│   │   ├── routes/               # Page components
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx     # Login page
│   │   │   │   └── SignupPrincipal.tsx # Principal signup
│   │   │   └── dashboard/
│   │   │       └── index.ts      # Main dashboard
│   │   └── mocks/                # MSW mock handlers (dev only)
│   │       ├── handlers.ts       # API mock definitions
│   │       └── browser.ts        # MSW browser setup
│   └── env.d.ts                  # TypeScript environment types
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment template
└── package.json                  # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+ (recommended)
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd School-OS
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` in `apps/admin-web/`:
   ```bash
   cd apps/admin-web
   cp .env.example .env
   ```

   Update `.env` with your actual values:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Start development server**
   ```bash
   # From project root
   pnpm dev:web

   # Or directly in admin-web folder
   cd apps/admin-web/src/app
   pnpm dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

## 🔑 Key Features

### Authentication & Authorization
- Supabase-based authentication
- Role-based access control (Admin, Teacher, Student, Parent)
- Protected routes with `<Protected>` component
- Persistent auth state with Zustand

### Configuration Management
- Dynamic school configuration (v1.0.0 JSON schema)
- Zod validation for type-safe config
- Centralized theme based on school branding
- Configuration caching and error handling

### Developer Experience
- Full TypeScript support with strict mode
- Hot Module Replacement (HMR)
- MSW for API mocking in development
- Industry-standard folder structure
- Comprehensive error handling

### UI/UX
- Material-UI components with custom theming
- Responsive layout (mobile-first)
- Loading states and error boundaries
- Consistent color palette from config
- Dark mode support (planned)

## 📝 Available Scripts

```bash
# Development
pnpm dev:web          # Start dev server (from root)
pnpm dev              # Start dev server (from admin-web/src/app)

# Build
pnpm build:web        # Production build (from root)
pnpm build            # Production build (from admin-web/src/app)

# Preview
pnpm preview          # Preview production build

# Linting
pnpm lint             # Run ESLint
```

## 🔧 Configuration Files

### `tsconfig.json`
- Strict TypeScript mode enabled
- React JSX transform
- Path aliases support (`@/*`)
- Vite environment types

### `vite.config.ts`
- React plugin with Fast Refresh
- Path alias resolution
- Development server on port 5173

## 🎨 Theming

The application uses a dynamic theming system based on school configuration:

```typescript
// Example: Theme is auto-generated from config
const theme = {
  palette: {
    primary: { main: config.branding.colors.primary },
    // ... other colors from config
  },
  shape: {
    borderRadius: config.branding.layout.corner_style === 'rounded' ? 12 : 4
  }
}
```

## 🔐 Authentication Flow

1. User logs in via Supabase Auth
2. `AuthProvider` sets auth state (userId, schoolId, role)
3. `ConfigProvider` fetches school configuration
4. `ThemeProvider` applies school branding
5. User sees personalized dashboard

## 🧪 API Mocking (MSW)

In development mode, MSW intercepts API calls and returns mock data:

```typescript
// Example mock handler
http.get('*/schools/2/configuration', () =>
  HttpResponse.json(mockSpringfieldConfig)
)
```

This allows frontend development without a running backend.

## 📦 State Management

### Auth Store (`useAuthStore`)
```typescript
const { userId, schoolId, role, setAuth, clear } = useAuthStore();
```
- Persisted to localStorage
- Cleared on logout

### Config Store (`useConfigStore`)
```typescript
const { config, set, clear } = useConfigStore();
```
- Holds validated school configuration
- Used by theme and navigation

## 🚨 Error Handling

- Axios interceptors for HTTP errors
- Zod validation for data schemas
- React error boundaries (planned)
- User-friendly error messages
- Console logging for debugging

## 🔮 Future Enhancements

- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Unit tests with Vitest
- [ ] E2E tests with Playwright
- [ ] Storybook for component documentation
- [ ] Performance monitoring
- [ ] Analytics integration

## 🤝 Contributing

1. Create a feature branch
2. Make your changes with proper TypeScript types
3. Ensure no linting errors
4. Test in development mode
5. Submit a pull request

## 📄 License

Proprietary - School OS

## 👥 Team

Built with ❤️ by the School OS team

---

**Note**: This is an internal admin dashboard. For student/parent portals, see the mobile app.
