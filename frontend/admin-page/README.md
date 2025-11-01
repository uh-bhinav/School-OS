# SchoolOS Admin Dashboard

Comprehensive admin dashboard for managing all aspects of your school through the SchoolOS platform.

## Features

- 📊 **Dashboard Overview** - Real-time statistics and insights
- 🎓 **Student Management** - Full CRUD operations for students
- 👩‍🏫 **Teacher Management** - Manage teacher profiles and assignments  
- ✅ **Attendance Tracking** - Monitor student attendance
- 📝 **Exams & Results** - Grade management and results publishing
- 💰 **Fees & Finance** - Invoice generation and payment tracking
- 💬 **Communication Center** - Send announcements and messages
- ⚙️ **System Settings** - Configure school-wide settings

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in this directory:

```env
VITE_API_URL=http://127.0.0.1:8000/v1
```

See `frontend/SETUP.md` for detailed environment configuration instructions.

### 3. Run Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173` (or the port Vite assigns).

### 4. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL (must include `/v1`) | `http://127.0.0.1:8000/v1` |

## Authentication

The admin dashboard requires authentication. Users without a valid token will be redirected to the login page.

### Token Storage

Authentication tokens are stored in `localStorage` under the key `auth_token`. The admin API client automatically attaches this token to all requests as a Bearer token in the `Authorization` header.

### Protected Routes

All admin routes are protected by an `AuthGuard` component that:
1. Checks for an authentication token in `localStorage`
2. Redirects to `/login-page/?next=/admin-page/` if no token found
3. Saves the original destination in the `next` query parameter

## API Integration

### API Client

The app uses a centralized axios-based API client (`src/utils/api.js`) that:

- **Base Configuration**: Uses `VITE_API_URL` environment variable
- **Automatic Auth**: Adds `Authorization: Bearer <token>` header to all requests
- **Error Handling**: Extracts error messages from backend responses
- **Request Timeout**: 30 seconds default

### Usage Example

```javascript
import { api } from './utils/api';

// GET request
const students = await api.get('/students');

// POST request
const newStudent = await api.post('/students', {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await api.put(`/students/${id}`, data);

// DELETE request
await api.delete(`/students/${id}`);
```

## Modules

### Students Management

**Endpoint**: `GET|POST|PUT|DELETE /v1/students`

- List all students with search/filter
- Add new student enrollment
- Edit student information
- Delete/deactivate students
- View academic summaries

**Features**:
- Real-time data loading
- Form validation
- Error handling with user-friendly messages
- Optimistic UI updates

### Dashboard Statistics

**Endpoints**: Various

- Total students count from `/v1/students`
- Total teachers (placeholder)
- Attendance rate (placeholder)
- Monthly revenue (placeholder)

### More Modules Coming Soon

- **Attendance**: Bulk attendance recording, reports
- **Teachers**: Staff management, assignments
- **Classes**: Section management, schedules
- **Exams**: Exam creation, grading, results

## Project Structure

```
admin-page/
├── src/
│   ├── components/
│   │   ├── ActivityList.jsx        # Recent activities feed
│   │   ├── EventsCard.jsx          # Upcoming events
│   │   ├── QuickActions.jsx        # Quick action buttons
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── StatCard.jsx            # Statistics display
│   │   ├── StudentsPanel.jsx       # Students CRUD panel
│   │   └── Topbar.jsx              # Top navigation bar
│   ├── utils/
│   │   ├── api.js                  # API client (axios)
│   │   └── config.js               # Configuration utilities
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
├── .env.example                    # Environment template
└── README.md                       # This file
```

## Technologies

- **React 18** - UI library
- **React DOM** - DOM bindings
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Tailwind CSS** - Utility-first styling
- **Heroicons** - Icon library
- **Vite** - Build tool and dev server

## Development

### Adding a New Module

1. Create a new panel component in `src/components/`
2. Add route/state handling in `App.jsx`
3. Update the sidebar to include the new module
4. Implement API integration using the centralized `api` client

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow existing card-based layout patterns
- Maintain consistent spacing and typography
- Use Framer Motion for UI transitions
- Dark mode ready (add dark: classes as needed)

### Code Quality

- Use functional components and hooks
- Implement proper error boundaries
- Add loading states for async operations
- Validate user input on forms
- Provide user-friendly error messages

## Testing

### Manual Testing Flow

1. **Start Backend**: `poetry run uvicorn app.main:app --reload` (from backend/)
2. **Start Frontend**: `npm run dev` (from this directory)
3. **Login**: Navigate to `/login-page/` and authenticate
4. **Verify Redirect**: Should redirect to `/admin-page/`
5. **Test Dashboard**: Check statistics load correctly
6. **Test Students**: Create, edit, delete students

### Testing Checklist

- [ ] Login redirects to dashboard
- [ ] Dashboard statistics load
- [ ] Students module shows list
- [ ] Add student form works
- [ ] Edit student saves changes
- [ ] Delete student removes from list
- [ ] Error messages display properly
- [ ] Logout clears token

## Troubleshooting

### API calls failing

- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env` matches backend
- Open browser DevTools → Network tab to inspect requests
- Verify authentication token is present

### CORS errors

- Ensure backend CORS middleware is configured
- Check backend allows your frontend origin
- Verify no trailing slash in API_URL

### Module not loading

- Check browser console for errors
- Verify module component is imported in App.jsx
- Ensure API endpoint exists on backend
- Check network requests in DevTools

### Styling issues

- Restart dev server after Tailwind config changes
- Clear browser cache
- Check Tailwind classes are being purged correctly
- Verify CSS is loading in DevTools

## Production Deployment

### Build Optimization

```bash
npm run build
```

Vite will optimize:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Deployment Checklist

- [ ] Set `VITE_API_URL` to production API
- [ ] Build optimized production bundle
- [ ] Test in production mode
- [ ] Configure HTTPS
- [ ] Set up CDN for assets
- [ ] Configure proper CORS on backend
- [ ] Monitor error logs

### Environment-Specific Builds

Create different `.env` files:
- `.env.development` - Local development
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

Vite automatically picks the correct file based on build mode.

## Related Documentation

- [Frontend Setup Guide](../SETUP.md)
- [Login Page README](../login-page/README.md)
- [Backend API Documentation](../../backend/README.md)
- [API Reference](http://127.0.0.1:8000/docs)

## Contributing

When adding new features:

1. Follow existing code patterns
2. Use the centralized API client
3. Add proper error handling
4. Include loading states
5. Update this README with new modules
6. Test thoroughly before submitting

## Support

For issues or questions:

1. Check this README for solutions
2. Review browser console errors
3. Inspect Network tab in DevTools
4. Check backend logs
5. Refer to backend API documentation at `/docs`

