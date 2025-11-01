# Frontend Environment Setup Guide

This document explains how to configure environment variables for the SchoolOS frontend applications.

## Overview

Both the login page and admin page frontends need to know the backend API URL. We use environment variables for this configuration.

## Quick Setup

### 1. Login Page Setup

Navigate to the login-page directory and create a `.env` file:

```bash
cd frontend/login-page
```

Create a `.env` file with the following content:

```env
# Backend API Base URL (including /v1 prefix)
VITE_API_URL=http://127.0.0.1:8000/v1
```

### 2. Admin Page Setup

Navigate to the admin-page directory and create a `.env` file:

```bash
cd frontend/admin-page
```

Create a `.env` file with the same content:

```env
# Backend API Base URL (including /v1 prefix)
VITE_API_URL=http://127.0.0.1:8000/v1
```

## Environment Configuration

### Local Development

For local development with the backend running on your machine:

```env
VITE_API_URL=http://127.0.0.1:8000/v1
```

### Production

For production deployment, replace with your production API URL:

```env
VITE_API_URL=https://api.yourschoolos.com/v1
```

### Environment Variables Explained

- **VITE_API_URL**: The base URL for the SchoolOS backend API. Must include the `/v1` prefix.
  
  - **Format**: `http://<host>:<port>/v1` or `https://<domain>/v1`
  - **Example (local)**: `http://127.0.0.1:8000/v1`
  - **Example (prod)**: `https://api.schoolos.example.com/v1`

> **Note**: Vite prefixed variables (like `VITE_`) are exposed to the client-side code at build time. Never put sensitive secrets here.

## Security Best Practices

### ✅ DO:

- Use environment variables for API URLs
- Keep `.env` files out of version control
- Use `.env.example` files as templates
- Set different values for development/staging/production

### ❌ DON'T:

- Commit `.env` files to Git
- Put API keys or secrets in environment variables (they're bundled with the client)
- Share your `.env` files publicly

## Complete Setup Example

Here's a complete example of setting up both frontends:

```bash
# 1. Navigate to login-page
cd frontend/login-page

# 2. Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://127.0.0.1:8000/v1
EOF

# 3. Install dependencies (if not done already)
npm install

# 4. Start development server
npm run dev

# 5. Repeat for admin-page in another terminal
cd ../admin-page
cat > .env << 'EOF'
VITE_API_URL=http://127.0.0.1:8000/v1
EOF
npm install
npm run dev
```

## Verifying Configuration

After creating your `.env` files and starting the development servers, you can verify the configuration by:

1. Opening the browser developer console (F12)
2. Checking Network requests to see if API calls are going to the correct URL
3. Looking for any CORS errors (which might indicate wrong API URL)

## Troubleshooting

### Issue: API calls failing with CORS errors

**Solution**: Make sure:
- The backend is running
- The `VITE_API_URL` matches your backend's actual address
- The backend has CORS configured to allow requests from your frontend

### Issue: "Cannot read property 'env' of undefined"

**Solution**: Make sure you're using `import.meta.env` (for Vite projects), not `process.env`.

### Issue: Environment variable not working

**Solution**: 
- Check the `.env` file is in the correct directory
- Make sure the variable name starts with `VITE_`
- Restart your development server after changing `.env` files
- Check for typos in the variable name

## Git Configuration

The `.env` files should already be in `.gitignore`. Verify this with:

```bash
git check-ignore .env
```

If it's not ignored, add it to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

## Next Steps

After setting up environment variables:

1. Start your backend: `poetry run uvicorn app.main:app --reload` (from backend/)
2. Start your frontends: `npm run dev` (from frontend/login-page or frontend/admin-page)
3. Test login flow and API integration

For more information, see the main SchoolOS README in the project root.

