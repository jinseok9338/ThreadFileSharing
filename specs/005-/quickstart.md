# Quickstart: Frontend Authentication

## Prerequisites

- Backend running on `http://localhost:3001`
- Frontend dev server available

## Setup

1. **Start Backend**:

   ```bash
   cd packages/backend
   pnpm run start
   ```

2. **Start Frontend**:
   ```bash
   cd packages/frontend
   pnpm run dev
   # Opens http://localhost:5173
   ```

## Test Flows

### Registration

1. Navigate to `/auth/register`
2. Fill: email, password, fullName, companyName
3. Submit → Redirects to `/`
4. Check localStorage: `auth-storage`

### Login

1. Logout (if logged in)
2. Navigate to `/auth/login`
3. Enter credentials
4. Submit → Redirects to `/`

### Protected Routes

1. Logout
2. Try `/profile` → Redirects to `/auth/login`
3. Login → Redirects back to `/profile`

### Profile & Theme

1. Login → Navigate to `/profile`
2. View user info
3. Change theme → Applies instantly
4. Refresh → Theme persists

## Development

### Documentation-First

```bash
# Before creating component
touch app/pages/auth-login/LoginForm.md
# Document layout, spacing, shadcn components
```

### Troubleshooting

- **CORS errors**: Check backend allows `localhost:5173`
- **401 errors**: Check accessToken, try logout/login
- **Theme not saving**: Check localStorage `theme-storage`
- **Redirect loop**: Clear localStorage, check auth init


