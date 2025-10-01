# Typography Components

폰트 컴포넌트 시스템 - 일관된 타이포그래피를 위한 재사용 가능한 컴포넌트

## 개요

**원칙**: className으로 폰트 스타일을 직접 정의하지 않고, 폰트 컴포넌트를 사용합니다.

```tsx
// ❌ 나쁜 예시
<h1 className="text-3xl font-bold">제목</h1>
<p className="text-sm text-gray-500">설명</p>

// ✅ 좋은 예시
<Heading1>제목</Heading1>
<Caption>설명</Caption>
```

---

## 컴포넌트 목록

### **제목 (Headings)**

#### `<Heading1>`

- **용도**: 페이지 제목, 메인 타이틀
- **스타일**: `text-3xl font-bold text-foreground`
- **태그**: h1 (기본)
- **예시**:
  ```tsx
  <Heading1>ThreadFileSharing</Heading1>
  <Heading1 className="text-primary">강조된 제목</Heading1>
  <Heading1 as="h2">다른 태그로 렌더링</Heading1>
  ```

#### `<Heading2>`

- **용도**: 섹션 제목
- **스타일**: `text-2xl font-semibold text-foreground`
- **태그**: h2 (기본)
- **예시**:
  ```tsx
  <Heading2>파일 목록</Heading2>
  <Heading2 className="mb-4">스레드</Heading2>
  ```

#### `<Heading3>`

- **용도**: 서브 섹션 제목
- **스타일**: `text-xl font-semibold text-foreground`
- **태그**: h3 (기본)
- **예시**:
  ```tsx
  <Heading3>최근 업로드</Heading3>
  <Heading3 className="text-muted-foreground">보조 제목</Heading3>
  ```

---

### **본문 (Body Text)**

#### `<BodyText>`

- **용도**: 일반 본문 텍스트
- **스타일**: `text-base font-normal text-foreground`
- **태그**: p (기본)
- **예시**:
  ```tsx
  <BodyText>이 파일은 프로젝트 문서입니다.</BodyText>
  <BodyText as="div">div 태그로 렌더링</BodyText>
  <BodyText className="text-center">가운데 정렬</BodyText>
  ```

#### `<BodyTextSmall>`

- **용도**: 작은 본문 텍스트
- **스타일**: `text-sm font-normal text-foreground`
- **태그**: p (기본)
- **예시**:
  ```tsx
  <BodyTextSmall>작은 설명 텍스트</BodyTextSmall>
  <BodyTextSmall className="text-muted-foreground">보조 정보</BodyTextSmall>
  ```

---

### **기타 (Others)**

#### `<Caption>`

- **용도**: 매우 작은 설명 텍스트, 부가 정보
- **스타일**: `text-xs text-muted-foreground`
- **태그**: p (기본)
- **예시**:
  ```tsx
  <Caption>2024-01-01 업로드됨</Caption>
  <Caption className="text-destructive">필수 항목</Caption>
  <Caption as="span">인라인 설명</Caption>
  ```

#### `<Label>`

- **용도**: 폼 필드 라벨
- **스타일**: `text-sm font-medium text-foreground`
- **태그**: label
- **Props**: `htmlFor`, `required`
- **예시**:
  ```tsx
  <Label htmlFor="email">이메일</Label>
  <Label htmlFor="password" required>비밀번호</Label>
  <Label className="text-muted-foreground">선택 항목</Label>
  ```

#### `<Link>`

- **용도**: 내부/외부 링크
- **스타일**: `text-primary hover:text-primary/80 transition-colors`
- **태그**: React Router Link 또는 a
- **Props**: `href`, `external`, `underline`
- **예시**:
  ```tsx
  <Link href="/threads">스레드 목록</Link>
  <Link href="https://example.com" external>외부 링크</Link>
  <Link href="/about" underline>밑줄 링크</Link>
  ```

---

## 공통 Props

모든 Typography 컴포넌트는 다음 공통 props를 지원합니다:

- **children**: React.ReactNode - 표시할 텍스트
- **className**: string - 추가 스타일 (Tailwind classes)
- **as**: string - 렌더링할 HTML 태그 (옵션)

---

## 사용 방법

### 1. Import

```tsx
// 개별 import
import { Heading1 } from "~/components/typography/Heading1";
import { BodyText } from "~/components/typography/BodyText";

// 또는 한 번에 import (권장)
import { Heading1, BodyText, Caption } from "~/components/typography";
```

### 2. 기본 사용

```tsx
function ThreadDetail() {
  return (
    <div>
      <Heading1>스레드 제목</Heading1>
      <Caption>2024-01-01 생성됨</Caption>
      <BodyText>스레드 설명 내용입니다.</BodyText>
    </div>
  );
}
```

### 3. 커스터마이징

```tsx
function CustomPage() {
  return (
    <div>
      {/* 색상 변경 */}
      <Heading1 className="text-primary">강조된 제목</Heading1>

      {/* 여백 추가 */}
      <BodyText className="mb-4">본문 텍스트</BodyText>

      {/* 정렬 */}
      <Caption className="text-center">중앙 정렬</Caption>

      {/* 태그 변경 */}
      <Heading1 as="h2">h2 태그로 렌더링</Heading1>
    </div>
  );
}
```

---

## 스타일 가이드

### 크기 계층

| 컴포넌트      | 크기             | Font Weight   | 용도          |
| ------------- | ---------------- | ------------- | ------------- |
| Heading1      | text-3xl (30px)  | font-bold     | 페이지 제목   |
| Heading2      | text-2xl (24px)  | font-semibold | 섹션 제목     |
| Heading3      | text-xl (20px)   | font-semibold | 서브섹션 제목 |
| BodyText      | text-base (16px) | font-normal   | 일반 본문     |
| BodyTextSmall | text-sm (14px)   | font-normal   | 작은 본문     |
| Caption       | text-xs (12px)   | font-normal   | 설명 텍스트   |
| Label         | text-sm (14px)   | font-medium   | 폼 라벨       |

### 색상 가이드

| 컴포넌트   | 기본 색상             | 대체 색상 옵션                      |
| ---------- | --------------------- | ----------------------------------- |
| Heading1-3 | text-foreground       | text-primary, text-muted-foreground |
| BodyText   | text-foreground       | text-muted-foreground               |
| Caption    | text-muted-foreground | text-destructive, text-primary      |
| Label      | text-foreground       | text-muted-foreground               |
| Link       | text-primary          | -                                   |

---

## 접근성

모든 Typography 컴포넌트는 접근성을 고려합니다:

- **의미 있는 HTML 태그**: 기본적으로 적절한 시맨틱 태그 사용
- **as prop**: 필요시 다른 태그로 변경 가능
- **텍스트 대비**: 충분한 색상 대비 유지
- **Label 컴포넌트**: htmlFor 속성으로 폼 필드와 연결

---

## 테스트

```typescript
// Typography 컴포넌트 테스트 예시
import { render, screen } from "@testing-library/react";
import { Heading1, BodyText, Caption } from "~/components/typography";

describe("Typography Components", () => {
  it("renders Heading1 correctly", () => {
    render(<Heading1>Test Heading</Heading1>);
    expect(screen.getByText("Test Heading")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <BodyText className="text-primary">Custom Text</BodyText>
    );
    expect(container.firstChild).toHaveClass("text-primary");
  });

  it("renders as different tag", () => {
    const { container } = render(<Heading1 as="h2">Title</Heading1>);
    expect(container.querySelector("h2")).toBeInTheDocument();
  });
});
```

---

## 참고 사항

### className 사용 시 주의사항

✅ **허용되는 className 사용**:

- 여백: `mb-4`, `mt-2`, `px-4`
- 정렬: `text-center`, `text-right`
- 색상 변경: `text-primary`, `text-destructive`
- 반응형: `md:text-4xl`, `sm:text-sm`

❌ **지양해야 할 className 사용**:

- 폰트 크기: `text-2xl` (대신 다른 Heading 컴포넌트 사용)
- 폰트 굵기: `font-bold` (대신 적절한 컴포넌트 선택)
- 기본 색상: `text-gray-900` (대신 `text-foreground` 사용)

---

## 확장

새로운 폰트 컴포넌트가 필요한 경우:

1. 새 컴포넌트 파일 생성 (예: `Heading4.tsx`)
2. 기본 스타일 정의
3. `index.ts`에 export 추가
4. 이 README에 문서 추가
