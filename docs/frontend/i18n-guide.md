# 다국어(i18n) 가이드

## 개요

ThreadFileSharing은 CSV 기반의 다국어 시스템을 사용합니다. Vite가 CSV를 자동으로 JSON으로 변환합니다.

---

## 파일 구조

**다국어 파일**: `packages/frontend/language.csv`

**형식**:

```csv
category,key,ko,en
auth,login,로그인,Login
validation,emailRequired,이메일을 입력해주세요,Email is required
```

---

## 카테고리

### 1. `auth` - 인증 관련

- login, register, email, password
- loginTitle, loginDescription
- alreadyHaveAccount, dontHaveAccount

### 2. `validation` - 검증 에러 메시지

- emailRequired, emailInvalid
- passwordMinLength, passwordUppercase, passwordNumber
- nameMinLength, companyNameMinLength

### 3. `action` - 공통 액션

- cancel, close, delete, edit, save, submit

### 4. `about` - 앱 정보

- versionInfo, privacyPolicy, termsAndPolicy

---

## 사용 방법

### Zod Validation Schema

에러 메시지를 i18n 키로 작성:

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "validation.emailRequired")
    .email("validation.emailInvalid"),
  password: z.string().min(8, "validation.passwordMinLength"),
});
```

### React Component

```typescript
import { useTranslation } from "react-i18next"; // 또는 사용하는 i18n 라이브러리

const LoginForm = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Label>{t("auth.email")}</Label>
      <Button>{t("auth.login")}</Button>
    </div>
  );
};
```

---

## 규칙

### ✅ DO

- 모든 사용자 대상 텍스트는 language.csv에 등록
- 카테고리별로 정리 (auth, validation, action 등)
- 키는 camelCase 사용 (emailRequired, loginTitle)
- 새 기능 구현 전 관련 i18n 키 먼저 추가

### ❌ DON'T

- 컴포넌트에 하드코딩된 한글/영어 문자열 작성 금지
- 에러 메시지 직접 작성 금지
- 중복 키 생성 금지

---

## 새 기능 추가 시

1. **language.csv에 필요한 키 추가**:

```csv
myFeature,title,내 기능,My Feature
myFeature,description,기능 설명,Feature description
validation,myFieldRequired,필드를 입력하세요,Field is required
```

2. **Zod schema에 키 사용**:

```typescript
myField: z.string().min(1, "validation.myFieldRequired");
```

3. **컴포넌트에서 키 사용**:

```typescript
<Heading1>{t("myFeature.title")}</Heading1>
```

---

## CSV → JSON 변환

Vite가 자동으로 처리하므로 별도 작업 불필요.

빌드 시 자동으로 JSON 파일이 생성됩니다.

---

## 주의사항

- CSV 파일 수정 후 dev server 재시작 필요할 수 있음
- 특수문자는 적절히 이스케이프 처리
- 줄바꿈이 필요한 긴 문장은 적절히 분리

---

**모든 새로운 기능은 language.csv 업데이트부터 시작하세요!**


