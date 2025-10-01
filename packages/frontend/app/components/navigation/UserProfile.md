# UserProfile 컴포넌트

## 개요

Sidebar 하단에 위치하는 사용자 프로필 컴포넌트입니다. 사용자 아바타, 상태, 그리고 프로필 메뉴 접근을 제공합니다.

## 목적

- 사용자 프로필 정보 표시
- 사용자 상태 (온라인/오프라인) 표시
- 프로필 메뉴 접근 제공
- 컴팩트한 80px 폭에 맞는 디자인

## 파일 위치

`packages/frontend/app/components/navigation/UserProfile.tsx`

## Props

```typescript
interface UserProfileProps {
  user?: {
    id: string;
    displayName: string;
    avatar?: string;
    status: "online" | "away" | "busy" | "offline";
  };
  showStatus?: boolean; // 상태 표시 여부 (기본: true)
  onClick?: () => void; // 클릭 핸들러 (선택사항)
  className?: string; // 추가 CSS 클래스
}
```

## 내부 구조

### 컴포넌트 구조

```tsx
<div className={cn("flex flex-col items-center space-y-2", className)}>
  {/* 아바타 영역 */}
  <div className="relative">
    <Avatar className="w-10 h-10">
      <AvatarImage src={user?.avatar} alt={user?.displayName} />
      <AvatarFallback>
        {user?.displayName?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>

    {/* 상태 표시 */}
    {showStatus && (
      <div
        className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
          getStatusColor(user?.status)
        )}
      />
    )}
  </div>

  {/* 사용자 이름 (선택사항) */}
  {showName && (
    <span className="text-xs text-muted-foreground truncate max-w-16">
      {user?.displayName}
    </span>
  )}
</div>
```

## 아바타 디자인

### 아바타 스타일

- **크기**: 40px × 40px (w-10 h-10)
- **모양**: 원형
- **이미지**: 사용자 프로필 이미지 또는 이니셜

### Fallback 디자인

- 사용자 이름의 첫 글자
- 대문자로 표시
- 브랜드 컬러 배경

## 상태 표시

### 상태 색상 매핑

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "busy":
      return "bg-red-500";
    case "offline":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};
```

### 상태 표시 위치

- 아바타 오른쪽 하단
- 12px × 12px 크기
- 흰색 테두리로 구분

## 사용되는 컴포넌트

### shadcn/ui 컴포넌트

- `Avatar`, `AvatarImage`, `AvatarFallback` - 아바타 컴포넌트

### 외부 라이브러리

- `cn` - 클래스명 병합 유틸리티

## 스타일링

### 컨테이너 스타일

- `flex flex-col items-center space-y-2` - 세로 정렬, 중앙 정렬
- `p-3` - 12px 패딩 (Sidebar 하단 영역)

### 아바타 스타일

- `w-10 h-10` - 40px × 40px 크기
- `rounded-full` - 원형 모양

### 상태 표시 스타일

- `absolute -bottom-1 -right-1` - 절대 위치
- `w-3 h-3` - 12px × 12px 크기
- `rounded-full` - 원형
- `border-2 border-background` - 흰색 테두리

### 사용자 이름 스타일

- `text-xs` - 작은 크기
- `text-muted-foreground` - 회색 텍스트
- `truncate max-w-16` - 텍스트 잘림 처리

## 상태 관리

### Props 기반 상태

- `user` prop으로 사용자 정보 제어
- `showStatus` prop으로 상태 표시 제어

### 내부 상태

- 현재는 내부 상태 없음
- 모든 상태는 props로 제어

### Mock 데이터 (개발용)

```typescript
const defaultUser = {
  id: "1",
  displayName: "사용자",
  avatar: undefined,
  status: "online" as const,
};
```

## 접근성

### 키보드 네비게이션

- Tab으로 포커스 가능
- Enter/Space로 활성화
- 버튼 역할로 인식

### 스크린 리더 지원

- `aria-label="사용자 프로필"`
- 사용자 이름을 alt 텍스트로 제공
- 상태 정보를 aria-label로 제공

### 포커스 관리

- 포커스 시 명확한 시각적 피드백
- 키보드 네비게이션 순서 고려

## 테마 지원

### Light/Dark 테마

- CSS 변수를 통한 자동 테마 적용
- `bg-background`, `text-muted-foreground` 등 사용

### 색상 변화

- 상태 색상은 고정 (녹색, 노란색, 빨간색, 회색)
- 텍스트 색상은 테마에 따라 변경

## 성능 최적화

### 렌더링 최적화

- `memo` 사용으로 불필요한 리렌더링 방지
- 아바타 이미지 최적화

### 이미지 최적화

- 아바타 이미지 lazy loading
- 적절한 크기로 최적화

## 사용 예시

### 기본 사용법

```tsx
<UserProfile />
```

### 사용자 정보 포함

```tsx
<UserProfile
  user={{
    id: "1",
    displayName: "김철수",
    avatar: "/avatars/kim.jpg",
    status: "online",
  }}
/>
```

### 상태 표시 없음

```tsx
<UserProfile showStatus={false} />
```

### Sidebar에서 사용

```tsx
<div className="p-3">
  <UserProfile />
</div>
```

## 테스트 시나리오

### 기본 렌더링

1. 아바타가 올바르게 표시되는지 확인
2. 크기가 40px × 40px인지 확인
3. 원형 모양이 적용되었는지 확인

### 사용자 정보

1. 프로필 이미지가 표시되는지 확인
2. 이미지가 없을 때 이니셜이 표시되는지 확인
3. 사용자 이름이 올바르게 표시되는지 확인

### 상태 표시

1. 온라인 상태에서 녹색 점이 표시되는지 확인
2. 오프라인 상태에서 회색 점이 표시되는지 확인
3. 상태 표시를 비활성화했을 때 점이 사라지는지 확인

### 인터랙션

1. 클릭 시 프로필 메뉴가 열리는지 확인
2. 호버 효과가 작동하는지 확인
3. 키보드 네비게이션이 작동하는지 확인

### 접근성

1. 스크린 리더에서 사용자 정보를 읽는지 확인
2. 키보드만으로 접근 가능한지 확인
3. 포커스 표시가 명확한지 확인

### 테마 지원

1. Light/Dark 테마에서 색상이 올바른지 확인
2. 상태 색상이 고정되어 있는지 확인
3. 텍스트 색상이 자동으로 조정되는지 확인
