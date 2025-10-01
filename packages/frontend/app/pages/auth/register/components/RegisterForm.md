# RegisterForm

> 사용자 회원가입을 위한 폼 컴포넌트 (이름, 이메일, 회사명, 비밀번호)

## 개요

- **목적**: 신규 사용자 회원가입을 위한 폼 제공 (이름, 이메일, 회사명, 비밀번호 입력 및 검증)
- **사용 위치**: `/auth/register` 페이지

---

## 레이아웃

### Container (Card)

- **className**: `max-w-md w-full p-8 bg-card rounded-lg shadow-lg`
- **padding**: p-8 (32px)
- **margin**: m-0 (AuthLayout이 중앙 정렬)
- **width**: max-w-md w-full (최대 448px, 부모 width 100%)
- **height**: h-auto (내용에 따라 자동)
- **background**: bg-card
- **border**: rounded-lg

### Form Container

- **display**: flex
- **direction**: flex-col
- **gap**: gap-4 (16px, 폼 요소 간 간격)

---

## 내부 구조

```
<Card className="max-w-md w-full p-8">
  │
  ├─ <Heading1 className="mb-2">
  │    {t("auth.registerTitle")}
  │  </Heading1>
  │
  ├─ <BodyText className="text-muted-foreground mb-6">
  │    {t("auth.registerDescription")}
  │  </BodyText>
  │
  ├─ <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
  │    │
  │    ├─ <div>
  │    │    ├─ <Label htmlFor="fullName" className="mb-2">{t("auth.fullName")}</Label>
  │    │    ├─ <Input id="fullName" type="text" {...register("fullName")} />
  │    │    └─ {errors.fullName && <Caption className="text-destructive mt-1">{errors.fullName.message}</Caption>}
  │    │    </div>
  │    │
  │    ├─ <div>
  │    │    ├─ <Label htmlFor="email" className="mb-2">{t("auth.email")}</Label>
  │    │    ├─ <Input id="email" type="email" {...register("email")} />
  │    │    └─ {errors.email && <Caption className="text-destructive mt-1">{errors.email.message}</Caption>}
  │    │    </div>
  │    │
  │    ├─ <div>
  │    │    ├─ <Label htmlFor="companyName" className="mb-2">{t("auth.companyName")}</Label>
  │    │    ├─ <Input id="companyName" type="text" {...register("companyName")} />
  │    │    └─ {errors.companyName && <Caption className="text-destructive mt-1">{errors.companyName.message}</Caption>}
  │    │    </div>
  │    │
  │        ├─ <div>
    │    │    ├─ <Label htmlFor="password" className="mb-2">{t("auth.password")}</Label>
    │    │    ├─ <div className="relative">
    │    │    │    ├─ <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="pr-10" />
    │    │    │    └─ <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
    │    │    │         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    │    │    │       </button>
    │    │    └─ </div>
    │    │    └─ {errors.password && <Caption className="text-destructive mt-1">{errors.password.message}</Caption>}
    │    │    </div>
  │    │
  │    └─ <Button type="submit" className="w-full" disabled={isPending}>
  │         {isPending ? "Loading..." : t("auth.register")}
  │       </Button>
  │    </form>
  │
  └─ <BodyTextSmall className="text-center mt-4">
       {t("auth.alreadyHaveAccount")}{" "}
       <Link to="/auth/login" className="text-primary hover:underline">
         {t("auth.login")}
       </Link>
     </BodyTextSmall>
```

---

## 사용 컴포넌트

### shadcn/ui

- **Card**:
  - className: max-w-md w-full p-8
  - 사용 위치: 전체 폼 wrapper

- **Input**:
  - type: text, email, password
  - 사용 위치: 이름, 이메일, 회사명, 비밀번호 필드
  - props: {...register("fieldName")}

- **Button**:
  - variant: default
  - type: submit
  - className: w-full
  - disabled: {isPending}
  - 사용 위치: 제출 버튼

- **Label**:
  - htmlFor: input id와 매칭
  - className: mb-2 (Label과 Input 간 8px 간격)
  - 사용 위치: 각 입력 필드 위

### 폰트 컴포넌트

- **Heading1**: "auth.registerTitle" (회원가입 / Create Account)
- **BodyText**: "auth.registerDescription" (설명 텍스트, text-muted-foreground)
- **BodyTextSmall**: 하단 로그인 링크 텍스트
- **Caption**: 검증 에러 메시지 (text-destructive)

### 커스텀 컴포넌트

- **Link** (React Router): `/auth/login` 링크

---

## 상태 관리

### 로컬 상태

- **form**: React Hook Form의 useForm hook
  - resolver: zodResolver(registerSchema)
  - defaultValues: { fullName: "", email: "", companyName: "", password: "" }
  - 변경 시점: 사용자 입력
  - 사용 이유: 폼 데이터 관리 및 검증

- **showPassword**: useState(false)
  - 초기값: false (비밀번호 숨김)
  - 변경 시점: 눈 아이콘 클릭
  - 사용 이유: 비밀번호 보기/숨기기 토글

### 서버 상태 (TanStack Query)

- **Mutation**: useRegister hook
  - mutationFn: registerAPI
  - mutateAsync 사용 (async/await 패턴)
  - 성공 시: UserStore + TokenStore 업데이트, navigate("/")
  - 실패 시: toast.error()로 에러 메시지 표시

---

## 스타일 상세

### 색상

- **배경색**: bg-card (카드), bg-background (페이지)
- **텍스트 색상**: text-foreground (기본), text-muted-foreground (설명)
- **강조 색상**: text-primary (링크), text-destructive (에러)
- **테두리 색상**: border (Input 기본)

### 여백

- **외부 여백**: m-0 (AuthLayout이 중앙 정렬)
- **내부 여백**: p-8 (Card 내부)
- **요소 간 간격**:
  - Title → Description: mb-2 (8px)
  - Description → Form: mb-6 (24px)
  - Form fields: gap-4 (16px, flex-col)
  - Label → Input: mb-2 (8px)
  - Input → Error: mt-1 (4px)
  - Form → Link: mt-4 (16px)

### 크기

- **너비**: max-w-md w-full (최대 448px, 부모 100%)
- **높이**: h-auto (내용에 따라)

### 기타 스타일

- **그림자**: shadow-lg (Card)
- **둥근 모서리**: rounded-lg (Card)
- **투명도**: 없음

---

## 접근성

### ARIA 속성

- **htmlFor/id**: Label과 Input 연결
- **type**: text, email, password (적절한 키보드 제공)
- **autoComplete**: name, email, organization, new-password
- **aria-describedby**: 에러 메시지 연결 (Input)
- **aria-invalid**: 에러 상태 표시 (Input)
- **role**: alert (에러 메시지)
- **aria-label**: 비밀번호 토글 버튼 설명

### 키보드 네비게이션

- **Tab**: Input 간 이동, Button으로 이동
- **Enter**: 폼 제출 (type="submit")
- **Escape**: 없음 (Modal 아님)

### 스크린 리더

- **Label**: 각 Input에 대한 설명적 레이블
- **에러 메시지**: Caption으로 명확히 전달

---

## 상호작용

### 이벤트

- **onSubmit**: 폼 제출 (React Hook Form handleSubmit)
  - Zod 검증 통과 → registerAPI 호출
  - 검증 실패 → 에러 메시지 표시

- **onChange**: Input 변경 (React Hook Form register)
  - 자동 검증
  - 에러 상태 업데이트

### 호버 효과

- **Link hover**: hover:underline
- **Button hover**: hover:bg-primary/90 (shadcn 기본)

### 활성 상태

- **Input focus**: ring-2 ring-ring (shadcn 기본)
- **Button disabled**: opacity-50 cursor-not-allowed

### 로딩 상태

- **isPending true**:
  - Button disabled
  - Button text: "Loading..."

---

## React Hook Form 사용

```tsx
const form = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
  defaultValues: {
    fullName: "",
    email: "",
    companyName: "",
    password: "",
  },
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = form;
```

---

## TanStack Query Mutation

```tsx
const { mutateAsync, isPending } = useRegister();

const onSubmit = async (data: RegisterFormData) => {
  try {
    const response = await mutateAsync(data);
    useUserStore.getState().login({
      user: response.user,
      company: response.company,
    });
    useTokenStore.getState().login({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    navigate("/");
  } catch (error) {
    const message = await getServerErrorMessage(error);
    toast.error(message);
  }
};
```

---

## Zod 스키마 검증

```tsx
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "validation.nameMinLength")
    .max(100, "validation.nameMaxLength"),
  email: z.email("validation.emailInvalid"),
  companyName: z
    .string()
    .min(2, "validation.companyNameMinLength")
    .max(100, "validation.companyNameMaxLength"),
  password: z
    .string()
    .min(8, "validation.passwordMinLength")
    .regex(/[A-Z]/, "validation.passwordUppercase")
    .regex(/[0-9]/, "validation.passwordNumber")
    .regex(/[!@#$%^&*]/, "validation.passwordSpecialChar"),
});
```

---

## 예시 코드

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/registerSchema";
import useRegister from "../hooks/useRegister";
import useUserStore from "~/stores/userStore";
import useTokenStore from "~/stores/tokenStore";
import { getServerErrorMessage } from "~/utils/api";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Heading1,
  BodyText,
  BodyTextSmall,
  Caption,
  Link,
} from "~/components/typography";

const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { mutateAsync, isPending } = useRegister();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await mutateAsync(data);
      useUserStore.getState().login({
        user: response.user,
        company: response.company,
      });
      useTokenStore.getState().login({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      navigate("/");
    } catch (error) {
      const message = await getServerErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <Card className="max-w-md w-full p-8">
      <Heading1 className="mb-2">{t("auth.registerTitle")}</Heading1>
      <BodyText className="text-muted-foreground mb-6">
        {t("auth.registerDescription")}
      </BodyText>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name Input */}
        {/* Email Input */}
        {/* Company Name Input */}
        {/* Password Input */}
        {/* Submit Button */}
      </form>

      <BodyTextSmall className="text-center mt-4">
        {t("auth.alreadyHaveAccount")} <Link href="/auth/login">...</Link>
      </BodyTextSmall>
    </Card>
  );
};
```

---

## 참고 사항

- React Hook Form의 `register`로 Input 연결
- Zod 검증 에러는 `errors.fieldName.message`로 접근 (i18n 키로 저장)
- API 에러는 sonner의 `toast.error()`로 표시
- `mutateAsync` + `try/catch` 패턴 사용
- 로딩 중 Button disabled + 텍스트 변경
- 성공 시 UserStore + TokenStore 업데이트 후 리다이렉트
- 비밀번호 검증: 8자 이상, 대문자, 숫자, 특수문자 포함

---

## 변경 이력

- **2025-10-01**: 초기 문서 작성
- **2025-10-01**: mutateAsync + toast.error() 패턴으로 변경, apiError state 제거
- **2025-10-01**: 비밀번호 토글 기능 추가 (Eye/EyeOff 아이콘), 접근성 속성 추가
