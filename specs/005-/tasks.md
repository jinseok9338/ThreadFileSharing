# Tasks: Frontend Authentication (Login & Register)

**Input**: Implementation plan from `/specs/005-/plan.md`
**Prerequisites**: Backend authentication API (Day 2) running, Frontend project setup complete

---

## Phase 0: Design Documents (Wireframes)

- [x] **T001** [P] Create login page wireframe

  - **File**: `docs/screens/wireframes/auth-login.md`
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T002** [P] Create register page wireframe
  - **File**: `docs/screens/wireframes/auth-register.md`
  - **Status**: ✅ Complete
  - **Dependencies**: None

---

## Phase 1: Setup & Dependencies

- [x] **T003** Create auth type definitions

  - **File**: `packages/frontend/app/pages/auth/login/types/types.ts`
  - **Description**: Created User, Company, AuthTokens, AuthResponse, ApiResponse types (co-located with auth pages)
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T004** Install Zustand dependency
  - **Status**: ✅ Already installed
  - **Dependencies**: None

---

## Phase 2: Core Infrastructure

- [x] **T005** Update UserStore with new types

  - **File**: `packages/frontend/app/stores/userStore.ts`
  - **Status**: ✅ Complete
  - **Dependencies**: T003

- [x] **T006** Update TokenStore with new types

  - **File**: `packages/frontend/app/stores/tokenStore.ts`
  - **Status**: ✅ Complete
  - **Dependencies**: T003

- [x] **T007** Enhance API client with auth interceptors

  - **File**: `packages/frontend/app/api/ky.ts`
  - **Description**: Updated to use TokenStore/UserStore, fixed refresh token path to /api/v1/auth/refresh, updated response handling for backend ApiResponse wrapper
  - **Status**: ✅ Complete
  - **Dependencies**: T003, T005, T006

- [x] **T008** Create form validation schemas
  - **Files**:
    - `packages/frontend/app/pages/auth/login/schemas/loginSchema.ts`
    - `packages/frontend/app/pages/auth/register/schemas/registerSchema.ts`
  - **Description**: Created Zod schemas - login (email, password min 8), register (email, password regex with uppercase/number/special, fullName min 2, companyName min 2)
  - **Status**: ✅ Complete
  - **Dependencies**: None

---

## Phase 3: Routes Setup

- [x] **T009** Create auth routes

  - **File**: `packages/frontend/app/routes/_auth.tsx`
  - **Description**: Auth layout route with Outlet
  - **Status**: ✅ Complete (already created by user)
  - **Dependencies**: None

- [x] **T010** Create login route

  - **File**: `packages/frontend/app/routes/_auth.auth.login._index.tsx`
  - **Description**: Login page route
  - **Status**: ✅ Complete (already created by user)
  - **Dependencies**: T009

- [x] **T011** Create register route
  - **File**: `packages/frontend/app/routes/_auth.auth.register._index.tsx`
  - **Description**: Register page route
  - **Status**: ✅ Complete (already created by user)
  - **Dependencies**: T009

---

## Phase 4: AuthLayout Documentation & Implementation

- [x] **T012** Document AuthLayout component

  - **File**: `packages/frontend/app/components/layouts/AuthLayout.md`
  - **Description**: Created component documentation - simple centered layout (flex min-h-screen items-center justify-center bg-background), minimal wrapper for auth pages
  - **Status**: ✅ Complete
  - **Dependencies**: T001, T002

- [x] **T013** Implement AuthLayout component
  - **File**: `packages/frontend/app/components/layouts/AuthLayout.tsx`
  - **Description**: Implemented simple centered layout based on AuthLayout.md
  - **Status**: ✅ Complete
  - **Dependencies**: T012

---

## Phase 5: Login Page Documentation & Components

- [x] **T014** Document LoginForm component

  - **File**: `packages/frontend/app/pages/auth/login/components/LoginForm.md`
  - **Description**: Created component documentation based on auth-login.md wireframe - Card layout, React Hook Form integration, Zod validation, error handling, i18n keys
  - **Status**: ✅ Complete
  - **Dependencies**: T001

- [x] **T015** [P] Get shadcn Input component

  - **Command**: `cd packages/frontend && pnpm dlx shadcn@latest add input`
  - **Description**: ✅ Installed
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T016** [P] Get shadcn Button component (if not exists)

  - **Command**: `cd packages/frontend && pnpm dlx shadcn@latest add button`
  - **Description**: ✅ Installed
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T017** [P] Get shadcn Card component

  - **Command**: `cd packages/frontend && pnpm dlx shadcn@latest add card`
  - **Description**: ✅ Installed
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T018** [P] Get shadcn Label component

  - **Command**: `cd packages/frontend && pnpm dlx shadcn@latest add label`
  - **Description**: ✅ Installed
  - **Status**: ✅ Complete
  - **Dependencies**: None

- [x] **T019** Create useLogin custom hook

  - **File**: `packages/frontend/app/pages/auth/login/hooks/useLogin.ts`
  - **Description**: ✅ Already created - useMutation wrapper for loginAPI
  - **Status**: ✅ Complete
  - **Dependencies**: T005, T006, T007

- [x] **T020** Implement LoginForm component

  - **File**: `packages/frontend/app/pages/auth/login/components/LoginForm.tsx`
  - **Description**: ✅ Implemented with React Hook Form + Zod + i18n + stores integration
  - **Status**: ✅ Complete
  - **Dependencies**: T014, T015, T016, T017, T018, T019, T008

- [x] **T021** Create login page
  - **File**: `packages/frontend/app/pages/auth/login/index.tsx`
  - **Description**: ✅ Created - exports LoginForm (route already exists)
  - **Status**: ✅ Complete
  - **Dependencies**: T013, T020

---

## Phase 6: Register Page Documentation & Components

- [x] **T022** Document RegisterForm component

  - **File**: `packages/frontend/app/pages/auth/register/components/RegisterForm.md`
  - **Description**: ✅ Created component documentation - form layout (flex flex-col gap-4), email/password/fullName/companyName inputs (4 fields), submit button, error display, "Login" link, padding/spacing specs
  - **Status**: ✅ Complete
  - **Dependencies**: T002

- [x] **T023** Create useRegister custom hook

  - **File**: `packages/frontend/app/pages/auth/register/hooks/useRegister.ts`
  - **Description**: ✅ Already created - TanStack Query mutation for register API call (POST /api/v1/auth/register), handle success (save to UserStore and TokenStore + redirect), handle errors (409 conflict)
  - **Status**: ✅ Complete
  - **Dependencies**: T005, T006, T007

- [x] **T024** Implement RegisterForm component

  - **File**: `packages/frontend/app/pages/auth/register/components/RegisterForm.tsx`
  - **Description**: ✅ Implemented - React Hook Form + Zod validation (stronger password rules), shadcn Input/Button/Label, useRegister hook, error display, link to login
  - **Status**: ✅ Complete
  - **Dependencies**: T022, T015, T016, T017, T018, T023, T008

- [x] **T025** Create register page
  - **File**: `packages/frontend/app/pages/auth/register/index.tsx`
  - **Description**: ✅ Created - register page using AuthLayout + RegisterForm
  - **Status**: ✅ Complete
  - **Dependencies**: T013, T024

---

## Phase 7: Protected Routes & App Integration

- [ ] **T026** Update App root with auth protection
  - **File**: `packages/frontend/app/root.tsx`
  - **Description**: Add auth check in App component using UserStore - redirect unauthenticated users to /auth/login (except auth pages), redirect authenticated users from auth pages to /, preserve original URL in location state
  - **Dependencies**: T005

---

## Phase 8: Integration & Testing

- [ ] **T027** Test registration flow

  - **Manual Test**: Navigate to /auth/register → Fill form → Submit → Verify redirect to / → Check localStorage (userInfo, companyInfo, accessToken, refreshToken)
  - **Dependencies**: T025, T026

- [ ] **T028** Test login flow

  - **Manual Test**: Logout → Navigate to /auth/login → Enter credentials → Submit → Verify redirect to / → Check tokens in localStorage
  - **Dependencies**: T021, T026

- [ ] **T029** Test protected route access

  - **Manual Test**: Logout → Try to access / → Verify redirect to /auth/login → Login → Verify redirect back to /
  - **Dependencies**: T026

- [ ] **T030** Test token refresh

  - **Manual Test**: Wait for token expiration (or manually clear accessToken) → Make API call → Verify auto-refresh → Verify request retry
  - **Dependencies**: T007

- [ ] **T031** Test already authenticated redirect
  - **Manual Test**: Login → Try to access /auth/login → Verify redirect to / → Try /auth/register → Verify redirect to /
  - **Dependencies**: T026

---

## Phase 9: Polish & Error Handling

- [ ] **T032** [P] Add loading states

  - **Files**: LoginForm.tsx, RegisterForm.tsx
  - **Description**: Add loading spinners/disabled states during API calls, use Button isLoading prop
  - **Dependencies**: T020, T024

- [ ] **T033** [P] Add form validation error displays

  - **Files**: LoginForm.tsx, RegisterForm.tsx
  - **Description**: Show inline validation errors from Zod, show API error messages clearly, use Caption or BodyTextSmall for errors
  - **Dependencies**: T020, T024

- [ ] **T034** [P] Add accessibility attributes
  - **Files**: All form components
  - **Description**: Add aria-label, aria-describedby, role attributes, ensure keyboard navigation (Tab, Enter, Escape)
  - **Dependencies**: T020, T024

---

## Progress Summary

**Completed**: T001-T025 (25/34 tasks)
**Remaining**: T026-T034 (9 tasks)

**Latest**:

- ✅ RegisterForm component documented and implemented
- ✅ Register page created with AuthLayout
- ✅ useRegister hook already existed and working

**Next Task**: T026 - Update App root with auth protection

---

**TASKS STATUS**: Ready for execution - Continue with T022
