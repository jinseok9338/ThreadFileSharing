# Register Page Wireframe

## 개요

회원가입 페이지는 새로운 사용자와 회사를 생성하는 페이지로, 중앙 정렬된 카드 레이아웃에 4개의 입력 필드를 제공합니다.

---

## 전체 레이아웃 (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       [Background: bg-background]               │
│                       [Min-height: 100vh]                       │
│                                                                 │
│                                                                 │
│              ┌─────────────────────────────────┐               │
│              │   [AuthLayout - Centered Card]  │               │
│              │   [max-w-md, w-full]            │               │
│              │   [p-8, bg-card, rounded-lg]    │               │
│              │   [shadow-lg]                   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │     [Logo Area]         │   │               │
│              │   │     (optional)          │   │               │
│              │   │     (mb-2)              │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │   "Create Your"         │   │               │
│              │   │   "Account"             │   │               │
│              │   │   <Heading1>            │   │               │
│              │   │   (mb-2)                │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │   "Start collaborating" │   │               │
│              │   │   "with your team"      │   │               │
│              │   │   <BodyText>            │   │               │
│              │   │   (text-muted-fg, mb-6) │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Full Name Input]      │   │               │
│              │   │  <Label>Full Name       │   │               │
│              │   │  <Input>                │   │               │
│              │   │  (w-full, mb-4)         │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Email Input]          │   │               │
│              │   │  <Label>Email           │   │               │
│              │   │  <Input type="email">   │   │               │
│              │   │  (w-full, mb-4)         │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Company Name Input]   │   │               │
│              │   │  <Label>Company Name    │   │               │
│              │   │  <Input>                │   │               │
│              │   │  (w-full, mb-4)         │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Password Input]       │   │               │
│              │   │  <Label>Password        │   │               │
│              │   │  <Input type="password">│   │               │
│              │   │  (w-full, mb-2)         │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Password Hint]        │   │               │
│              │   │  <Caption>              │   │               │
│              │   │  "Min 8 chars, 1"       │   │               │
│              │   │  "uppercase, 1 number"  │   │               │
│              │   │  (text-muted-fg, mb-6)  │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Error Message Area]   │   │               │
│              │   │  <Caption>              │   │               │
│              │   │  (text-destructive)     │   │               │
│              │   │  (mb-4, conditional)    │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Register Button]      │   │               │
│              │   │  <Button variant="      │   │               │
│              │   │   default" w-full>      │   │               │
│              │   │  "Create Account"       │   │               │
│              │   │  (mb-4)                 │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  "Already have account?"│   │               │
│              │   │  <Link to="/auth/login">│   │               │
│              │   │  Login                  │   │               │
│              │   │  <BodyTextSmall>        │   │               │
│              │   │  (text-center)          │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              └─────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 간격 명세

### Card Container

- **max-width**: max-w-md (448px)
- **width**: w-full
- **padding**: p-8 (32px)
- **background**: bg-card
- **border-radius**: rounded-lg
- **shadow**: shadow-lg

### 내부 요소 간격

- Logo → Title: mb-2 (8px)
- Title → Description: mb-2 (8px)
- Description → First Input: mb-6 (24px)
- Between Inputs: mb-4 (16px)
- Password → Password Hint: mb-2 (8px)
- Password Hint → Error: mb-6 (24px)
- Error Message: mb-4 (16px, conditional)
- Register Button: mb-4 (16px)

### Form 요소

- Each Input Group: mb-4 (16px)
- Label: mb-2 (8px, 각 input 위)
- Input: w-full, h-10
- Button: w-full, h-10

---

## 컴포넌트 계층 구조

```
<div className="flex min-h-screen items-center justify-center bg-background">
  └─ <Card className="max-w-md w-full p-8">
       ├─ [Logo] (optional, mb-2)
       │
       ├─ <Heading1>Create Your Account</Heading1> (mb-2)
       │
       ├─ <BodyText className="text-muted-foreground">
       │    Start collaborating with your team
       │  </BodyText> (mb-6)
       │
       ├─ <form className="flex flex-col">
       │    │
       │    ├─ <div className="mb-4">
       │    │    ├─ <Label>Full Name</Label>
       │    │    └─ <Input type="text" />
       │    │    </div>
       │    │
       │    ├─ <div className="mb-4">
       │    │    ├─ <Label>Email</Label>
       │    │    └─ <Input type="email" />
       │    │    </div>
       │    │
       │    ├─ <div className="mb-4">
       │    │    ├─ <Label>Company Name</Label>
       │    │    └─ <Input type="text" />
       │    │    </div>
       │    │
       │    ├─ <div className="mb-2">
       │    │    ├─ <Label>Password</Label>
       │    │    └─ <Input type="password" />
       │    │    </div>
       │    │
       │    ├─ <Caption className="text-muted-foreground mb-6">
       │    │    Min 8 characters, 1 uppercase, 1 number
       │    │  </Caption>
       │    │
       │    ├─ {error && <Caption className="text-destructive mb-4">{error}</Caption>}
       │    │
       │    └─ <Button type="submit" className="w-full mb-4">
       │         Create Account
       │       </Button>
       │    </form>
       │
       └─ <BodyTextSmall className="text-center">
            Already have an account? <Link to="/auth/login">Login</Link>
          </BodyTextSmall>
```

---

## 입력 필드 순서 (위 → 아래)

1. **Full Name** (첫 번째)

   - Placeholder: "John Doe"
   - Required: Yes

2. **Email** (두 번째)

   - Placeholder: "you@company.com"
   - Required: Yes
   - Validation: Email format

3. **Company Name** (세 번째)

   - Placeholder: "Acme Corporation"
   - Required: Yes
   - Note: 새 회사가 자동 생성됨

4. **Password** (네 번째)
   - Placeholder: "••••••••"
   - Required: Yes
   - Validation: Min 8, 1 uppercase, 1 number

---

## 색상 및 스타일

- **배경**: bg-background (전체 페이지)
- **카드 배경**: bg-card
- **텍스트**: text-foreground (기본), text-muted-foreground (설명, 힌트)
- **에러 텍스트**: text-destructive
- **링크**: text-primary, hover:underline
- **버튼**: variant="default"

---

## 상호작용

### 폼 제출

1. 모든 필드 검증 (클라이언트)
2. API 호출 (POST /api/v1/auth/register)
3. 성공 → 자동 로그인 + 홈 리다이렉트
4. 실패 → 에러 메시지 표시

### 검증 에러

- 각 필드 아래 인라인 에러 표시 (Caption, text-destructive)
- API 에러는 폼 위쪽에 표시

### 이미 계정 있음

- "Login" 링크 클릭 → /auth/login 이동

---

## 참고 사항

- 이 와이어프레임은 AuthLayout.md와 RegisterForm.md 작성 시 참조됩니다
- Company Name 필드는 회원가입 시에만 표시됩니다 (로그인에는 없음)
- Password Hint는 사용자 경험 향상을 위해 항상 표시됩니다
