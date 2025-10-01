# Login Page Wireframe

## 개요

로그인 페이지는 사용자 인증의 진입점으로, 중앙 정렬된 카드 레이아웃에 이메일/비밀번호 입력을 제공합니다.

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
│              │   │   "Login to Your"       │   │               │
│              │   │   "Account"             │   │               │
│              │   │   <Heading1>            │   │               │
│              │   │   (mb-2)                │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │   "Enter your email"    │   │               │
│              │   │   "and password"        │   │               │
│              │   │   <BodyText>            │   │               │
│              │   │   (text-muted-fg, mb-6) │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Email Input]          │   │               │
│              │   │  <Label>Email</Label>   │   │               │
│              │   │  <Input type="email">   │   │               │
│              │   │  (w-full, mb-4)         │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  [Password Input]       │   │               │
│              │   │  <Label>Password</Label>│   │               │
│              │   │  <Input type="password">│   │               │
│              │   │  (w-full, mb-6)         │   │               │
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
│              │   │  [Login Button]         │   │               │
│              │   │  <Button variant="      │   │               │
│              │   │   default" w-full>      │   │               │
│              │   │  "Login"                │   │               │
│              │   │  (mb-4)                 │   │               │
│              │   └─────────────────────────┘   │               │
│              │                                 │               │
│              │   ┌─────────────────────────┐   │               │
│              │   │  "Don't have account?"  │   │               │
│              │   │  <Link to="/auth/       │   │               │
│              │   │   register">Register    │   │               │
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
- Description → Form: mb-6 (24px)
- Email Input: mb-4 (16px)
- Password Input: mb-6 (24px)
- Error Message: mb-4 (16px, conditional)
- Login Button: mb-4 (16px)

### Form 요소

- Label: mb-2 (8px, 각 input 위)
- Input: w-full, h-10

---

## 컴포넌트 계층 구조

```
<div className="flex min-h-screen items-center justify-center bg-background">
  └─ <Card className="max-w-md w-full p-8">
       ├─ [Logo] (optional, mb-2)
       ├─ <Heading1>Login to Your Account</Heading1> (mb-2)
       ├─ <BodyText className="text-muted-foreground">Enter your email and password</BodyText> (mb-6)
       ├─ <form className="flex flex-col gap-4">
       │    ├─ <div>
       │    │    ├─ <Label>Email</Label>
       │    │    └─ <Input type="email" />
       │    │    </div> (mb-4)
       │    │
       │    ├─ <div>
       │    │    ├─ <Label>Password</Label>
       │    │    └─ <Input type="password" />
       │    │    </div> (mb-6)
       │    │
       │    ├─ {error && <Caption className="text-destructive">{error}</Caption>} (mb-4)
       │    │
       │    └─ <Button type="submit" className="w-full">Login</Button> (mb-4)
       │    </form>
       │
       └─ <BodyTextSmall className="text-center">
            Don't have an account? <Link to="/auth/register">Register</Link>
          </BodyTextSmall>
```

---

## 색상 및 스타일

- **배경**: bg-background (전체 페이지)
- **카드 배경**: bg-card
- **텍스트**: text-foreground (기본), text-muted-foreground (설명)
- **에러 텍스트**: text-destructive
- **링크**: text-primary, hover:underline
- **버튼**: variant="default" (primary 색상)

---

## 상호작용

### 포커스 상태

- Input focus: ring-2 ring-ring
- Button hover: hover:bg-primary/90
- Link hover: hover:underline

### 로딩 상태

- Button disabled + spinner
- Form inputs disabled

### 에러 상태

- Invalid input: border-destructive
- Error message display below form

---

## 참고 사항

- 이 와이어프레임은 AuthLayout.md와 LoginForm.md 작성 시 참조됩니다
- 실제 구현에서는 shadcn/ui Card, Input, Button 컴포넌트를 사용합니다
- 폰트 컴포넌트 (Heading1, BodyText, Caption, Label)는 이미 존재합니다
