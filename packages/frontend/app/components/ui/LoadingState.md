# LoadingState Component

**Purpose**: A reusable component for displaying loading states with customizable spinner size and message.

## 컴포넌트 목적

데이터를 로딩 중일 때 사용자에게 시각적 피드백을 제공하는 컴포넌트입니다. 회전하는 스피너와 로딩 메시지를 표시하며, 다양한 크기 옵션을 제공합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│                                         │
│        [🔄] 로딩 중...                  │
│                                         │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-full flex items-center justify-center bg-background">
  <div className="flex items-center space-x-2">
    <div className="animate-spin rounded-full border-b-2 border-primary h-6 w-6"></div>
    <BodyText className="text-muted-foreground">{message}</BodyText>
  </div>
</div>
```

## Props Interface

```tsx
interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `BodyText` - 로딩 메시지 텍스트

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트

## Props 설명

### message (선택사항)

- **타입**: `string`
- **설명**: 표시할 로딩 메시지
- **기본값**: `"로딩 중..."`

### size (선택사항)

- **타입**: `"sm" | "md" | "lg"`
- **설명**: 스피너 크기
- **기본값**: `"md"`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 크기 옵션

| 크기 | 클래스    | 실제 크기 |
| ---- | --------- | --------- |
| `sm` | `h-4 w-4` | 16px      |
| `md` | `h-6 w-6` | 24px      |
| `lg` | `h-8 w-8` | 32px      |

## 스타일링

### 컨테이너 스타일

- `h-full flex items-center justify-center bg-background` - 전체 높이, 중앙 정렬, 배경색

### 스피너 스타일

- `animate-spin` - 회전 애니메이션
- `rounded-full` - 원형 모양
- `border-b-2 border-primary` - 하단 테두리만 표시 (프라이머리 색상)

### 텍스트 스타일

- `text-muted-foreground` - 회색 텍스트

## 사용 예시

### 기본 사용

```tsx
<LoadingState />
```

### 커스텀 메시지

```tsx
<LoadingState message="메시지를 불러오는 중..." />
```

### 다양한 크기

```tsx
// 작은 크기
<LoadingState size="sm" message="저장 중..." />

// 중간 크기 (기본값)
<LoadingState size="md" message="로딩 중..." />

// 큰 크기
<LoadingState size="lg" message="처리 중..." />
```

### 다국어 지원

```tsx
<LoadingState message={t("chat.loadingMessages")} />
```

## 다양한 사용 사례

### 1. 메시지 로딩

```tsx
<LoadingState message="메시지를 불러오는 중..." />
```

### 2. 파일 업로드

```tsx
<LoadingState size="sm" message="파일을 업로드하는 중..." />
```

### 3. 데이터 저장

```tsx
<LoadingState message="변경사항을 저장하는 중..." />
```

### 4. 검색 중

```tsx
<LoadingState size="sm" message="검색 중..." />
```

## 애니메이션

### CSS 애니메이션

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### 성능 최적화

- `transform: rotate()` 사용으로 GPU 가속
- `linear` 타이밍으로 부드러운 회전
- `infinite` 반복으로 계속 회전

## 접근성

### 스크린 리더 지원

- `aria-live="polite"` - 로딩 상태 변경 알림
- `role="status"` - 상태 정보임을 명시

### 키보드 사용자

- 포커스 가능한 요소 없음 (로딩 중이므로)
- 로딩 완료 후 적절한 요소로 포커스 이동

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- Props 변경 시에만 리렌더링

### 애니메이션 최적화

- CSS 애니메이션 사용 (JavaScript 애니메이션보다 효율적)
- `will-change: transform` 자동 적용

## 테마 지원

### 다크/라이트 모드

- `text-muted-foreground` - 테마에 따라 자동 색상 변경
- `bg-background` - 테마에 따라 배경색 자동 변경
- `border-primary` - 테마에 따라 프라이머리 색상 자동 변경

## 관련 파일

- `app/components/ui/EmptyState.tsx` - 빈 상태 컴포넌트
- `app/components/ui/ErrorState.tsx` - 에러 상태 컴포넌트
- `app/components/chat/ChatRoomContent.tsx` - 사용 예시
