# ErrorState Component

**Purpose**: A reusable component for displaying error states with customizable message, retry functionality, and consistent styling.

## 컴포넌트 목적

오류가 발생했을 때 사용자에게 명확한 피드백을 제공하고, 필요시 재시도 기능을 제공하는 컴포넌트입니다. 에러 아이콘, 메시지, 그리고 선택적인 재시도 버튼을 포함합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│                                         │
│    [⚠️] 오류가 발생했습니다             │
│                                         │
│         [다시 시도]                     │
│                                         │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-full flex items-center justify-center bg-background">
  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
    <div className="flex items-center space-x-2 mb-3">
      <AlertCircle className="w-4 h-4 text-destructive" />
      <BodyText className="text-destructive">{message}</BodyText>
    </div>
    {showRetry && onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-2" />
        {retryLabel}
      </Button>
    )}
  </div>
</div>
```

## Props Interface

```tsx
interface ErrorStateProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `BodyText` - 에러 메시지 텍스트
- `Button` - 재시도 버튼
- `AlertCircle` - 에러 아이콘
- `RefreshCw` - 재시도 아이콘

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `~/components/ui/button` - 버튼 컴포넌트
- `lucide-react` - 아이콘 라이브러리

## Props 설명

### message (선택사항)

- **타입**: `string`
- **설명**: 표시할 에러 메시지
- **기본값**: `"오류가 발생했습니다"`

### showRetry (선택사항)

- **타입**: `boolean`
- **설명**: 재시도 버튼 표시 여부
- **기본값**: `false`

### onRetry (선택사항)

- **타입**: `() => void`
- **설명**: 재시도 버튼 클릭 시 실행할 함수
- **기본값**: `undefined`

### retryLabel (선택사항)

- **타입**: `string`
- **설명**: 재시도 버튼의 텍스트
- **기본값**: `"다시 시도"`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 스타일링

### 컨테이너 스타일

- `h-full flex items-center justify-center bg-background` - 전체 높이, 중앙 정렬, 배경색

### 에러 카드 스타일

- `p-4 bg-destructive/10 border border-destructive/20 rounded-lg` - 패딩, 파괴적 색상 배경, 테두리, 둥근 모서리

### 아이콘 스타일

- `w-4 h-4 text-destructive` - 16px 크기, 파괴적 색상

### 텍스트 스타일

- `text-destructive` - 파괴적 색상 (일반적으로 빨간색)

### 버튼 스타일

- `variant="outline" size="sm"` - 아웃라인 스타일, 작은 크기
- `w-full` - 전체 너비

## 사용 예시

### 기본 에러 표시

```tsx
<ErrorState message="네트워크 연결을 확인해주세요" />
```

### 재시도 기능 포함

```tsx
<ErrorState
  message="메시지를 불러올 수 없습니다"
  showRetry={true}
  onRetry={() => {
    console.log("재시도 중...");
    // 재시도 로직
  }}
/>
```

### 커스텀 재시도 버튼 텍스트

```tsx
<ErrorState
  message="파일 업로드에 실패했습니다"
  showRetry={true}
  onRetry={handleRetryUpload}
  retryLabel="다시 업로드"
/>
```

### 다국어 지원

```tsx
<ErrorState
  message={t("error.networkError")}
  showRetry={true}
  onRetry={handleRetry}
  retryLabel={t("action.retry")}
/>
```

## 다양한 사용 사례

### 1. 네트워크 오류

```tsx
<ErrorState
  message="인터넷 연결을 확인해주세요"
  showRetry={true}
  onRetry={handleNetworkRetry}
  retryLabel="다시 시도"
/>
```

### 2. 서버 오류

```tsx
<ErrorState
  message="서버에 일시적인 문제가 발생했습니다"
  showRetry={true}
  onRetry={handleServerRetry}
/>
```

### 3. 파일 업로드 오류

```tsx
<ErrorState
  message="파일 업로드에 실패했습니다"
  showRetry={true}
  onRetry={handleFileRetry}
  retryLabel="다시 업로드"
/>
```

### 4. 권한 오류

```tsx
<ErrorState message="이 작업을 수행할 권한이 없습니다" showRetry={false} />
```

### 5. 데이터 로딩 오류

```tsx
<ErrorState
  message="데이터를 불러올 수 없습니다"
  showRetry={true}
  onRetry={() => {
    setError(null);
    setIsLoading(true);
    fetchData();
  }}
/>
```

## 재시도 로직 예시

### 일반적인 재시도 패턴

```tsx
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

const handleRetry = async () => {
  setError(null);
  setIsLoading(true);

  try {
    await fetchData();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

// 컴포넌트에서 사용
{
  error && (
    <ErrorState message={error} showRetry={true} onRetry={handleRetry} />
  );
}
```

## 접근성

### ARIA 속성

- `role="alert"` - 중요한 에러 정보임을 명시
- `aria-live="assertive"` - 즉시 에러 메시지 알림

### 키보드 네비게이션

- 재시도 버튼은 Tab 키로 포커스 가능
- Enter/Space 키로 재시도 실행

### 스크린 리더 지원

- 에러 아이콘과 메시지가 함께 읽힘
- 재시도 버튼의 목적이 명확히 전달됨

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- Props 변경 시에만 리렌더링

### 이벤트 핸들러

- `useCallback`으로 재시도 함수 메모이제이션 권장

## 테마 지원

### 다크/라이트 모드

- `text-destructive` - 테마에 따라 파괴적 색상 자동 변경
- `bg-destructive/10` - 테마에 따라 배경색 자동 변경
- `border-destructive/20` - 테마에 따라 테두리 색상 자동 변경

## 관련 파일

- `app/components/ui/EmptyState.tsx` - 빈 상태 컴포넌트
- `app/components/ui/LoadingState.tsx` - 로딩 상태 컴포넌트
- `app/components/chat/ChatRoomContent.tsx` - 사용 예시
