# EmptyState Component

**Purpose**: A reusable component for displaying empty states with icon, title, description, and optional action button.

## 컴포넌트 목적

데이터가 없거나 특정 상태가 비어있을 때 사용자에게 시각적 피드백을 제공하는 컴포넌트입니다. 아이콘, 제목, 설명, 그리고 선택적인 액션 버튼을 포함할 수 있습니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│                                         │
│              [아이콘]                   │
│                                         │
│              제목                       │
│                                         │
│              설명                       │
│                                         │
│            [액션 버튼]                  │
│                                         │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-full flex items-center justify-center bg-background">
  <div className="text-center">
    {Icon && <Icon className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />}
    {title && (
      <Heading3 className="text-muted-foreground mb-2">{title}</Heading3>
    )}
    {description && (
      <BodyText className="text-muted-foreground mb-4">{description}</BodyText>
    )}
    {action && <div>{action}</div>}
  </div>
</div>
```

## Props Interface

```tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `Heading3` - 제목 텍스트
- `BodyText` - 설명 텍스트
- `LucideIcon` - 아이콘 (선택사항)

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `lucide-react` - 아이콘 라이브러리

## Props 설명

### icon (선택사항)

- **타입**: `LucideIcon`
- **설명**: 표시할 아이콘 컴포넌트
- **기본값**: `undefined`

### title (선택사항)

- **타입**: `string`
- **설명**: 빈 상태의 제목
- **기본값**: `undefined`

### description (선택사항)

- **타입**: `string`
- **설명**: 빈 상태의 설명
- **기본값**: `undefined`

### action (선택사항)

- **타입**: `React.ReactNode`
- **설명**: 액션 버튼이나 추가 UI 요소
- **기본값**: `undefined`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 스타일링

### 컨테이너 스타일

- `h-full flex items-center justify-center bg-background` - 전체 높이, 중앙 정렬, 배경색

### 아이콘 스타일

- `w-12 h-12 text-muted-foreground mb-4 mx-auto` - 48px 크기, 회색, 하단 마진, 중앙 정렬

### 텍스트 스타일

- **제목**: `text-muted-foreground mb-2` - 회색, 하단 마진
- **설명**: `text-muted-foreground mb-4` - 회색, 하단 마진

## 사용 예시

### 기본 사용

```tsx
<EmptyState
  icon={MessageSquare}
  title="메시지가 없습니다"
  description="첫 번째 메시지를 보내보세요"
/>
```

### 액션 버튼 포함

```tsx
<EmptyState
  icon={Plus}
  title="채팅룸이 없습니다"
  description="새로운 채팅룸을 만들어보세요"
  action={<Button onClick={handleCreateRoom}>채팅룸 만들기</Button>}
/>
```

### 아이콘 없이 사용

```tsx
<EmptyState title="결과가 없습니다" description="검색 조건을 변경해보세요" />
```

## 다양한 사용 사례

### 1. 채팅룸 선택 안됨

```tsx
<EmptyState
  icon={MessageSquare}
  title="채팅룸을 선택해주세요"
  description="왼쪽에서 채팅룸을 선택하면 메시지를 볼 수 있습니다"
/>
```

### 2. 메시지 없음

```tsx
<EmptyState
  icon={MessageCircle}
  title="메시지가 없습니다"
  description="첫 번째 메시지를 보내보세요"
/>
```

### 3. 파일 없음

```tsx
<EmptyState
  icon={FolderOpen}
  title="파일이 없습니다"
  description="파일을 업로드하거나 드래그 앤 드롭해보세요"
  action={
    <Button onClick={handleUpload}>
      <Upload className="w-4 h-4 mr-2" />
      파일 업로드
    </Button>
  }
/>
```

### 4. 검색 결과 없음

```tsx
<EmptyState
  icon={Search}
  title="검색 결과가 없습니다"
  description="다른 키워드로 검색해보세요"
/>
```

## 접근성

### ARIA 속성

- `role="status"` - 상태 정보임을 명시
- `aria-live="polite"` - 스크린 리더에게 상태 변경 알림

### 키보드 네비게이션

- 액션 버튼이 포함된 경우 Tab 키로 포커스 가능
- Enter/Space 키로 액션 실행

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- Props 변경 시에만 리렌더링

## 테마 지원

### 다크/라이트 모드

- `text-muted-foreground` - 테마에 따라 자동 색상 변경
- `bg-background` - 테마에 따라 배경색 자동 변경

## 관련 파일

- `app/components/ui/LoadingState.tsx` - 로딩 상태 컴포넌트
- `app/components/ui/ErrorState.tsx` - 에러 상태 컴포넌트
- `app/components/chat/ChatRoomContent.tsx` - 사용 예시
