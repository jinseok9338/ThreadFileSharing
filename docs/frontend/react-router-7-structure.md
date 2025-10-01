# React Router 7 프로젝트 구조 가이드

## 개요

ThreadFileSharing 프론트엔드는 React Router 7의 파일 기반 라우팅과 co-location 패턴을 따릅니다.

---

## 폴더 구조

### Routes 폴더 (`app/routes/`)

파일 기반 라우팅으로 파일명이 URL 경로를 결정합니다.

**파일 명명 규칙:**

- `_layout.tsx` → Layout 컴포넌트 (Outlet 사용)
- `_layout.feature.page._index.tsx` → 페이지 라우트

**예시:**

```
app/routes/
├── _auth.tsx                           → /auth (layout)
├── _auth.auth.login._index.tsx        → /auth/login (route)
├── _auth.auth.register._index.tsx     → /auth/register (route)
└── $.tsx                               → 404 catch-all
```

**Route 파일 구조:**

```tsx
import { DEFAULT_META } from "~/constants/consts";
import AuthLoginPage from "~/pages/auth/login";
import type { Route } from "./+types/_auth.auth.login._index";

export function meta({}: Route.MetaArgs) {
  return DEFAULT_META; // 또는 커스텀 meta
}

const AuthLoginRoute = () => {
  return <AuthLoginPage />;
};

export default AuthLoginRoute;
```

**Layout 파일 구조:**

```tsx
import { Outlet } from "react-router";
import { DEFAULT_META } from "~/constants/consts";
import type { Route } from "./+types/_auth";

export function meta({}: Route.MetaArgs) {
  return DEFAULT_META;
}

const AuthLayoutRoute = () => {
  return <Outlet />;
};

export default AuthLayoutRoute;
```

---

### Pages 폴더 (`app/pages/`)

실제 페이지 컴포넌트와 관련된 모든 파일을 co-location 패턴으로 배치합니다.

**구조:**

```
app/pages/
└── {feature}/
    └── {page}/
        ├── index.tsx           (페이지 컴포넌트)
        ├── components/         (페이지별 컴포넌트)
        │   ├── ComponentName.tsx
        │   └── ComponentName.md
        ├── hooks/              (페이지별 hooks)
        │   └── usePageHook.ts
        ├── services/           (페이지별 API)
        │   └── api.ts
        ├── types/              (페이지별 타입)
        │   └── types.ts
        ├── utils/              (페이지별 유틸)
        │   └── helpers.ts
        └── schemas.ts          (페이지별 validation)
```

**실제 예시 (auth/login):**

```
app/pages/auth/login/
├── index.tsx                  (AuthLoginPage 컴포넌트)
├── components/
│   ├── LoginForm.tsx
│   └── LoginForm.md
├── hooks/
│   └── useLogin.ts
├── services/
│   └── api.ts
├── types/
│   └── types.ts              (User, Company, AuthResponse 등)
└── schemas.ts                (loginSchema)
```

**페이지 컴포넌트 (`index.tsx`):**

```tsx
const AuthLoginPage = () => {
  return <div>AuthLoginPage</div>;
};

export default AuthLoginPage;
```

---

## 타입 공유 패턴

### 페이지 간 타입 공유

같은 feature 내 페이지들은 첫 번째 페이지의 types를 import:

```tsx
// pages/auth/register/components/RegisterForm.tsx
import type { User, AuthResponse } from "~/pages/auth/login/types/types";
```

### 전역 타입

`.d.ts` 타입 선언 파일만 `app/types/`에 배치:

```
app/types/
├── global.d.ts
└── env.d.ts
```

---

## Import 경로 (`~` alias)

- `~/pages/auth/login` - 페이지
- `~/components/ui/Button` - 전역 컴포넌트
- `~/stores/userStore` - 전역 store
- `~/api/ky` - 공통 API client
- `~/constants/consts` - 전역 상수

---

## 컴포넌트 개발 프로세스

1. **와이어프레임 작성** (docs/screens/wireframes/)
2. **컴포넌트 문서 작성** (.md 파일)
3. **컴포넌트 구현** (.tsx 파일)

**문서 위치:**

- Layout: `app/components/layouts/AuthLayout.md`
- 페이지별 컴포넌트: `app/pages/{feature}/{page}/components/ComponentName.md`

---

## 주의사항

1. **Route 파일은 최소화**: 페이지 import + meta만
2. **페이지 로직은 pages/에**: 모든 비즈니스 로직, 상태, 훅
3. **전역 공유만 루트에**: 정말 여러 페이지에서 쓰는 것만
4. **타입도 co-locate**: 페이지별 types/ 폴더 사용

---

## 예시: 새 페이지 추가

### 1. Route 생성

```bash
# app/routes/_main.dashboard._index.tsx
```

### 2. Page 구조 생성

```bash
mkdir -p app/pages/dashboard/{components,hooks,services,types,utils}
touch app/pages/dashboard/index.tsx
touch app/pages/dashboard/types/types.ts
```

### 3. Route 연결

```tsx
// app/routes/_main.dashboard._index.tsx
import DashboardPage from "~/pages/dashboard";
export default () => <DashboardPage />;
```

---

**이 구조는 프로젝트 전반에 일관되게 적용됩니다.**


