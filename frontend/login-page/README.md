# SchoolOS Login Page

React-based login interface for SchoolOS users.

## Features

- Email/password authentication
- Social login placeholders (Google, Facebook)
- Remember me functionality
- Secure token storage
- Redirect to admin dashboard after login

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

The login page will be available at `http://localhost:5173` (or the port Vite assigns).

### 4. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL (must include `/v1`) | `http://127.0.0.1:8000/v1` |

## Usage

### Authentication Flow

1. User enters email and password
2. App calls `POST /v1/auth/login` with credentials
3. Backend returns JWT access token
4. Token stored in `localStorage` as `auth_token`
5. User redirected to `next` parameter or `/admin-page/`

### Redirect Behavior

After successful login, the user is redirected based on the `next` query parameter:

- With `?next=/custom/path`: redirects to `/custom/path`
- Without `next` parameter: redirects to `/admin-page/`

This allows the admin dashboard to request login by redirecting to `/login-page/?next=/admin-page/`.

## Testing

### Manual Testing

1. Start the backend server (`poetry run uvicorn app.main:app --reload`)
2. Start this frontend (`npm run dev`)
3. Navigate to the login page
4. Enter any email/password (backend uses test token in dev mode)
5. Should redirect to admin page with token stored

### Mock Login (Development)

In development mode, the backend's `/v1/auth/login` endpoint returns a test token configured via `TEST_TEACHER_TOKEN` in the backend `.env`.

For production, you'll need to implement proper Supabase auth or your chosen authentication provider.

## Project Structure

```
login-page/
├── index.jsx           # Main login component
├── main.jsx            # React entry point
├── Login.module.css    # Styled components
├── school-logo.png     # School logo asset
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── .env.example        # Environment template
└── README.md           # This file
```

## Technologies

- **React** - UI library
- **Vite** - Build tool and dev server
- **CSS Modules** - Scoped styling

## Security Notes

- Tokens are stored in `localStorage` (consider httpOnly cookies for production)
- Social login placeholders are disabled (implement with your OAuth provider)
- Environment variables are bundled into the client (never put secrets here)
- HTTPS required in production

## Troubleshooting

### Login fails with CORS error

- Ensure backend is running
- Check `VITE_API_URL` matches your backend
- Verify backend CORS settings allow your frontend origin

### Redirect doesn't work

- Check browser console for errors
- Verify token is being stored: `localStorage.getItem('auth_token')`
- Ensure `next` parameter is URL-encoded if it contains special characters

### Environment variable not working

- Restart dev server after changing `.env`
- Check variable name starts with `VITE_`
- Verify `.env` file is in correct directory

## Related Documentation

- [Frontend Setup Guide](../SETUP.md)
- [Backend API Documentation](../../backend/README.md)
- [Admin Dashboard README](../admin-page/README.md)

