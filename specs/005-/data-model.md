# Data Model: Frontend Authentication State

## Auth Store (Zustand + Persist)

```typescript
interface AuthStore {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (response: AuthResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  setLoading: (loading: boolean) => void;
}
```

**Persistence**: localStorage key `auth-storage`

## Form States

### Login Form

```typescript
interface LoginFormData {
  email: string; // validated: email format
  password: string; // validated: min 8 chars
}
```

### Register Form

```typescript
interface RegisterFormData {
  email: string; // validated: email format
  password: string; // validated: min 8, uppercase, number
  fullName: string; // validated: min 2 chars
  companyName: string; // validated: min 2 chars
}
```

### Profile Form

```typescript
interface ProfileFormData {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}
```

## API Response Wrapper

All backend responses wrapped in:

```typescript
{
  status: "success" | "error";
  timestamp: string;
  data: T; // on success
  error: {
    code, message, details;
  } // on error
}
```


