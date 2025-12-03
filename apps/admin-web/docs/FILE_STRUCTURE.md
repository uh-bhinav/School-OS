# 📁 File Structure - Auth Implementation

## Complete Directory Layout

```
apps/admin-web/
│
├── index.html                                    # ✅ Updated - Ubuntu font preconnect
├── package.json                                  # ✅ Updated - Added formik & yup
├── pnpm-lock.yaml                               # ✅ Auto-updated
│
├── public/
│   └── thumbnail.webp                           # 📸 School logo (background image)
│
└── src/app/
    │
    ├── main.tsx                                 # Entry point (no changes)
    │
    ├── components/
    │   ├── AppLoader.tsx                        # ✨ NEW - Loading component with logo animation
    │   └── Shell.tsx                            # Existing - App shell
    │
    ├── providers/
    │   ├── ThemeProvider.tsx                    # ✅ Updated - Ubuntu font + accent colors
    │   ├── AuthProvider.tsx                     # Existing
    │   └── ConfigProvider.tsx                   # Existing
    │
    ├── routes/
    │   ├── auth/
    │   │   ├── login.tsx                        # ✅ Updated - Modern split-screen design
    │   │   └── SignupPrincipal.tsx             # ✅ Updated - Multi-step form
    │   │
    │   └── dashboard/
    │       └── index.tsx                        # Existing - Dashboard
    │
    ├── stores/
    │   ├── useAuthStore.ts                      # Existing - Auth state
    │   └── useConfigStore.ts                    # Existing - Config state
    │
    ├── services/
    │   ├── supabase.ts                          # Existing - Supabase client
    │   ├── http.ts                              # Existing - Axios client
    │   └── queries/
    │       └── dashboard.ts                     # Existing
    │
    └── mocks/
        ├── browser.ts                           # Existing - MSW setup
        └── handlers.ts                          # Existing - Mock API handlers
```

---

## 📋 Files Modified

### 1. **index.html**
**Path**: `apps/admin-web/index.html`
**Changes**:
- Added meta description
- Added theme-color meta tag
- Formatted font preconnect links
- Already had Ubuntu font (verified and optimized)

### 2. **ThemeProvider.tsx**
**Path**: `apps/admin-web/src/app/providers/ThemeProvider.tsx`
**Changes**:
- Added Ubuntu font family to all typography
- Added secondary color (#0B5F5A)
- Enhanced button styles (no text-transform, better padding)
- Enhanced TextField styles (rounded corners)
- Typography hierarchy with proper font weights

### 3. **login.tsx**
**Path**: `apps/admin-web/src/app/routes/auth/login.tsx`
**Changes**: Complete rewrite
- Split-screen layout (desktop)
- Background image with blur overlay
- Formik + Yup validation
- Password visibility toggle
- Mobile responsive
- Icons in input fields
- Loading states
- Error handling

### 4. **SignupPrincipal.tsx**
**Path**: `apps/admin-web/src/app/routes/auth/SignupPrincipal.tsx`
**Changes**: Complete rewrite
- 3-step progressive form
- MUI Stepper component
- Warm orange theme
- Formik + Yup validation
- Step-by-step validation
- Back/Next navigation
- Password strength validation
- Password match validation
- Mobile responsive

---

## 📄 Files Created

### 1. **AppLoader.tsx**
**Path**: `apps/admin-web/src/app/components/AppLoader.tsx`
**Purpose**: Reusable loading component
**Exports**:
- `AppLoader` (default) - Full-screen or inline loader with logo
- `InlineLoader` - Small loader for buttons

### 2. **AUTH_SCREENS_README.md**
**Path**: `apps/admin-web/AUTH_SCREENS_README.md`
**Purpose**: Complete technical documentation
**Contents**:
- Design features overview
- File structure
- Component API reference
- Form validation details
- Responsive behavior
- Color palette
- Customization guide
- Troubleshooting
- Testing checklist

### 3. **QUICK_START_AUTH.md**
**Path**: `apps/admin-web/QUICK_START_AUTH.md`
**Purpose**: Quick start guide
**Contents**:
- Installation summary
- How to test
- Validation examples
- Quick customization tips
- Visual layout examples

### 4. **FILE_STRUCTURE.md** (this file)
**Path**: `apps/admin-web/FILE_STRUCTURE.md`
**Purpose**: Directory layout reference

---

## 🎯 Asset Locations

### Images
```
/public/thumbnail.webp          → School logo (background)
```

### Fonts
```
Google Fonts CDN                → Ubuntu font family
(loaded via index.html)
```

---

## 📦 Dependencies Added

### package.json Updates
```json
{
  "dependencies": {
    "formik": "^2.4.8",
    "yup": "^1.7.1"
  }
}
```

### Installation Command
```bash
pnpm add formik yup
```

---

## 🔗 Import Paths

### AppLoader Component
```typescript
import AppLoader, { InlineLoader } from '@/components/AppLoader';
// or
import AppLoader from '../components/AppLoader';
```

### Theme Hook
```typescript
import { useThemeMode } from '@/providers/ThemeProvider';
```

### Stores
```typescript
import { useConfigStore } from '@/stores/useConfigStore';
import { useAuthStore } from '@/stores/useAuthStore';
```

### Form Libraries
```typescript
import { useFormik } from 'formik';
import * as Yup from 'yup';
```

---

## 🎨 Asset Management

### Where to Put New Assets

**Images/Logos**:
```
/public/               → Static assets served at root
  ├── logo.png
  ├── thumbnail.webp   ← Current school logo
  └── icons/
```

**Referenced in Code**:
```typescript
// Public folder assets
<img src="/thumbnail.webp" />
backgroundImage: "url(/logo.png)"

// Import assets (for bundling)
import logo from '@/assets/logo.png';
<img src={logo} />
```

**Fonts**:
- Google Fonts → `index.html` (current approach)
- Custom fonts → `/public/fonts/` + CSS import

**Lottie Animations** (if added):
```
/src/app/assets/
  └── animations/
      ├── loader.json
      └── success.json
```

---

## 🧩 Component Hierarchy

```
App
└── ThemeRoot (ThemeProvider)
    └── AuthRoot (AuthProvider)
        └── ConfigRoot (ConfigProvider)
            └── RouterProvider
                ├── /auth/login
                │   └── Login Component
                │       ├── Background Image
                │       ├── Branding Section (desktop)
                │       └── Form Section
                │           ├── TextField (email)
                │           ├── TextField (password)
                │           └── Button (submit)
                │
                ├── /auth/signup
                │   └── SignupPrincipal Component
                │       ├── Stepper
                │       ├── Form (multi-step)
                │       │   ├── Step 1: School Code
                │       │   ├── Step 2: Name + Email
                │       │   └── Step 3: Password + Confirm
                │       └── Navigation (Back/Next)
                │
                └── / (protected)
                    └── Shell
                        └── Dashboard
```

---

## 📊 File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| `login.tsx` | ~420 | Login page component |
| `SignupPrincipal.tsx` | ~530 | Signup page component |
| `AppLoader.tsx` | ~120 | Loading component |
| `ThemeProvider.tsx` | ~75 | Theme configuration |
| `AUTH_SCREENS_README.md` | ~550 | Full documentation |
| `QUICK_START_AUTH.md` | ~330 | Quick start guide |

---

## 🔄 State Management Flow

```
User Input → Formik (local state) → Validation (Yup) → Submit
                                                           ↓
                                                    API Call (http/supabase)
                                                           ↓
                                                    Success/Error
                                                           ↓
                                          Update Global State (useAuthStore)
                                                           ↓
                                                    Navigate (react-router)
```

---

## 🛣️ Routing Structure

```
/                           → Dashboard (protected)
/auth/login                 → Login Page
/auth/signup                → Signup Page
/auth/* (other)             → 404 (not implemented)
```

**Protected Routes**: Require authentication (checked in `<Protected>` component)

---

## 🎯 Configuration Sources

### Theme Colors
```typescript
Source: useConfigStore → config.branding.colors
Fallback: Hardcoded defaults in ThemeProvider
```

### School Logo
```typescript
Source: useConfigStore → config.branding.logo.primary_url
Fallback: None (component handles missing logo gracefully)
```

### School Name
```typescript
Source: useConfigStore → config.identity.display_name
Fallback: "School OS"
```

---

## 📝 Code Style Patterns

### Component Structure
```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces (if needed)
interface Props { ... }

// 3. Validation schemas (if form)
const schema = Yup.object({ ... });

// 4. Component
export default function ComponentName() {
  // Hooks
  const theme = useTheme();
  const navigate = useNavigate();

  // State
  const [state, setState] = useState();

  // Form (if applicable)
  const formik = useFormik({ ... });

  // Handlers
  const handleClick = () => { ... };

  // Render
  return <div>...</div>;
}
```

### Styling Approach
- MUI `sx` prop for component-level styles
- Responsive values: `{ xs: 1, md: 2 }`
- Theme values: `theme.palette.primary.main`
- Alpha for transparency: `alpha(color, 0.5)`

---

## 🔧 Build Configuration

No changes needed to Vite config. All features work with default setup.

**Vite Features Used**:
- TypeScript
- React Fast Refresh
- Static asset handling
- Environment variables (if needed)

---

## 📖 Related Documentation

1. **AUTH_SCREENS_README.md** - Full technical reference
2. **QUICK_START_AUTH.md** - Getting started guide
3. **FILE_STRUCTURE.md** - This file (directory reference)
4. **SETUP_GUIDE.md** - Project setup (existing)
5. **README.md** - Project overview (existing)

---

## ✅ Quick Reference

**Auth Pages**:
- Login: `/auth/login` → `routes/auth/login.tsx`
- Signup: `/auth/signup` → `routes/auth/SignupPrincipal.tsx`

**Shared Components**:
- Loader: `components/AppLoader.tsx`
- Theme: `providers/ThemeProvider.tsx`

**Assets**:
- Background: `/public/thumbnail.webp`
- Font: Google Fonts (Ubuntu)

**Forms**:
- Library: Formik + Yup
- Validation: Real-time with Yup schemas

---

**Last Updated**: November 2025
**Version**: 1.0.0
