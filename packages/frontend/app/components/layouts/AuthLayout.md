# AuthLayout

> 로그인 및 회원가입 페이지를 위한 중앙 정렬 레이아웃 컴포넌트

## 개요

- **목적**: 인증 페이지들(로그인, 회원가입)을 중앙에 배치하고 일관된 레이아웃 제공
- **사용 위치**: `/auth/login`, `/auth/register` 라우트

---

## 레이아웃

### Container

- **className**: `flex min-h-screen items-center justify-center bg-background`
- **padding**: p-0 (children이 padding 관리)
- **margin**: m-0
- **width**: w-full
- **height**: min-h-screen (전체 화면 높이)
- **background**: bg-background (테마별 배경색)
- **border**: 없음

### Flexbox

- **display**: flex
- **direction**: flex-row (기본, 중앙 정렬용)
- **align**: items-center (수직 중앙)
- **justify**: justify-center (수평 중앙)
- **gap**: 없음 (단일 children)

---

## 내부 구조

```
<div className="flex min-h-screen items-center justify-center bg-background">
  └─ {children}
       (AuthLayout은 단순히 중앙 정렬만 제공)
       (실제 Card, Form 등은 children에서 처리)
</div>
```

**간단한 구조 다이어그램**:

```
┌──────────────────────────────────────────────────────────┐
│                    [Full Screen]                         │
│                    [bg-background]                       │
│                                                          │
│                                                          │
│                 ┌──────────────────┐                    │
│                 │                  │                    │
│                 │    {children}    │  ← 중앙 정렬       │
│                 │                  │                    │
│                 └──────────────────┘                    │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 사용 컴포넌트

### shadcn/ui

- 없음 (순수 div + Tailwind)

### 폰트 컴포넌트

- 없음 (children이 처리)

### 커스텀 컴포넌트

- 없음 (Layout만 담당)

---

## 상태 관리

### 상태 없음

- **이유**: 순수 레이아웃 컴포넌트, 상태 불필요

---

## 스타일 상세

### 색상

- **배경색**: bg-background (테마에 따라 자동 변경)
- **텍스트 색상**: 없음 (children이 처리)
- **강조 색상**: 없음
- **테두리 색상**: 없음

### 여백

- **외부 여백 (margin)**: m-0 (전체 화면 사용)
- **내부 여백 (padding)**: p-0 (children이 padding 관리)
- **요소 간 간격 (gap)**: 없음

### 크기

- **너비**: w-full (100% viewport width)
- **높이**: min-h-screen (최소 100vh)

### 기타 스타일

- **그림자**: 없음
- **둥근 모서리**: 없음
- **투명도**: 없음

---

## Props

### children (required)

- **타입**: `React.ReactNode`
- **설명**: 인증 페이지 컴포넌트 (LoginForm, RegisterForm 등)
- **사용 예시**: `<AuthLayout><LoginForm /></AuthLayout>`

---

## 접근성

### ARIA 속성

- 없음 (semantic HTML만 사용)

### 키보드 네비게이션

- 없음 (children이 처리)

### 스크린 리더

- 없음 (children이 처리)

---

## 상호작용

### 이벤트

- 없음 (Layout은 상호작용 없음)

### 호버 효과

- 없음

### 활성 상태

- 없음

---

## 예시 코드

```tsx
// 기본 사용
<AuthLayout>
  <LoginForm />
</AuthLayout>

// Register 페이지
<AuthLayout>
  <RegisterForm />
</AuthLayout>

// children은 자체적으로 Card 등을 포함
<AuthLayout>
  <Card className="max-w-md w-full p-8">
    {/* 폼 내용 */}
  </Card>
</AuthLayout>
```

---

## 참고 사항

- AuthLayout은 **최소한의 역할**만 수행 (중앙 정렬)
- 실제 Card, padding, shadow 등은 children에서 처리
- 배경색은 테마 시스템에 의해 자동 변경됨
- React Router의 Outlet과 유사하지만, Outlet은 `_auth.tsx` route에서 사용
- 이 컴포넌트는 페이지 컴포넌트 내에서 직접 사용

---

## 변경 이력

- **2025-10-01**: 초기 문서 작성


