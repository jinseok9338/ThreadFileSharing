# LoadingSkeleton Component

**Purpose**: Provides skeleton loading states for various UI components during data fetching.

## 컴포넌트 목적

데이터 로딩 중에 사용자에게 콘텐츠가 로드되고 있음을 시각적으로 표시하는 스켈레톤 컴포넌트입니다. 다양한 UI 요소에 맞는 스켈레톤을 제공합니다.

## Props

### LoadingSkeleton

```tsx
interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "text" | "avatar" | "button" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}
```

#### **variant**

- `default`: 기본 직사각형 스켈레톤
- `text`: 텍스트 라인용 스켈레톤
- `avatar`: 원형 아바타용 스켈레톤
- `button`: 버튼용 스켈레톤
- `card`: 카드용 큰 스켈레톤

#### **lines**

- 텍스트 variant에서 여러 줄을 표시할 때 사용
- 1 이상의 숫자

## 특화된 스켈레톤 컴포넌트

### MessageSkeleton

메시지 아이템용 스켈레톤

- 아바타 + 텍스트 라인들

### ChatRoomItemSkeleton

채팅룸 아이템용 스켈레톤

- 아바타 + 제목 + 시간 + 미리보기

### FileItemSkeleton

파일 아이템용 스켈레톤

- 파일 아이콘 + 이름 + 메타데이터

### ThreadItemSkeleton

스레드 아이템용 스켈레톤

- 제목 + 설명 + 메타데이터

## 사용 예시

```tsx
// 기본 사용
<LoadingSkeleton className="h-4 w-full" />

// 텍스트 여러 줄
<LoadingSkeleton variant="text" lines={3} />

// 아바타
<LoadingSkeleton variant="avatar" className="h-12 w-12" />

// 특화된 스켈레톤
<MessageSkeleton />
<ChatRoomItemSkeleton />
<FileItemSkeleton />
<ThreadItemSkeleton />
```

## 스타일링

### 애니메이션

- `animate-pulse`: 부드러운 펄스 애니메이션
- `animation-delay`: 여러 줄에서 순차적 애니메이션

### 색상

- `bg-muted`: 테마에 따른 배경색

### 크기 조정

- `width`, `height` props로 동적 크기 설정
- `className`으로 추가 스타일링

## 접근성

- 스크린 리더에서 로딩 상태를 인식할 수 있도록 시각적 피드백 제공
- 애니메이션이 너무 빠르지 않아 사용자 경험에 방해되지 않음

## 테마 지원

- `bg-muted` 클래스로 다크/라이트 모드 자동 지원
- 테마 변경 시 색상이 자동으로 조정됨
