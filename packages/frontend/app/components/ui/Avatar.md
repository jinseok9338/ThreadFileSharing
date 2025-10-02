# Avatar Component

**Purpose**: Provides user avatar display with image support, fallbacks, status indicators, and group functionality.

## 컴포넌트 목적

사용자 아바타를 표시하는 컴포넌트입니다. 이미지, 폴백 텍스트, 상태 표시, 그룹 기능을 지원합니다.

## Props

### Avatar

```tsx
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  status?: "online" | "offline" | "away" | "busy";
  className?: string;
  onClick?: () => void;
}
```

#### **size**

- `xs`: 24x24px (h-6 w-6) - 매우 작은 표시용
- `sm`: 32x32px (h-8 w-8) - 목록 아이템용
- `md`: 40x40px (h-10 w-10) - 기본값
- `lg`: 48x48px (h-12 w-12) - 프로필 표시용
- `xl`: 64x64px (h-16 w-16) - 큰 프로필용

#### **shape**

- `circle`: 원형 (기본값)
- `square`: 사각형

#### **status**

- `online`: 초록색 - 온라인 상태
- `away`: 노란색 - 자리 비움
- `busy`: 빨간색 - 바쁨
- `offline`: 회색 - 오프라인

## 컴포넌트 변형

### AvatarGroup

여러 아바타를 그룹으로 표시하는 컴포넌트

```tsx
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback?: string;
  }>;
  max?: number; // 최대 표시 개수
  size?: AvatarProps["size"];
  className?: string;
}
```

### UserAvatar

사용자 정보에 특화된 아바타 컴포넌트

```tsx
interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    status?: AvatarProps["status"];
  };
  size?: AvatarProps["size"];
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}
```

## 주요 기능

### 1. 이미지 폴백 처리

```tsx
// 이미지 로드 실패 시 폴백 처리
{
  src ? (
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  ) : (
    <span>{getInitials(fallback || alt)}</span>
  );
}
```

### 2. 이니셜 생성

```tsx
const getInitials = (name?: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
```

### 3. 상태 표시

- 아바타 우하단에 작은 원형 인디케이터
- 상태별 색상 구분
- 크기에 따른 상태 인디케이터 크기 조정

### 4. 그룹 표시

- 여러 아바타를 겹쳐서 표시
- 최대 표시 개수 제한
- 남은 개수 표시 (+N)

## 사용 예시

### 기본 아바타

```tsx
<Avatar src="/avatar.jpg" alt="사용자 이름" fallback="홍길동" />
```

### 상태 표시

```tsx
<Avatar
  src="/avatar.jpg"
  alt="사용자 이름"
  fallback="홍길동"
  status="online"
  size="lg"
/>
```

### 사용자 아바타

```tsx
<UserAvatar
  user={{
    id: "1",
    name: "홍길동",
    email: "hong@example.com",
    avatar: "/avatar.jpg",
    status: "online",
  }}
  size="lg"
  showStatus={true}
/>
```

### 아바타 그룹

```tsx
<AvatarGroup
  avatars={[
    { src: "/avatar1.jpg", alt: "사용자1" },
    { src: "/avatar2.jpg", alt: "사용자2" },
    { src: "/avatar3.jpg", alt: "사용자3" },
  ]}
  max={2}
  size="sm"
/>
```

### 클릭 이벤트

```tsx
<Avatar
  src="/avatar.jpg"
  alt="사용자 이름"
  fallback="홍길동"
  onClick={() => console.log("아바타 클릭")}
/>
```

## 스타일링

### 크기 시스템

- 5단계 크기 (xs ~ xl)
- 각 크기에 맞는 텍스트 크기 자동 조정
- 상태 인디케이터 크기도 비례적으로 조정

### 모양 변형

- 원형: `rounded-full`
- 사각형: `rounded-md`

### 상태 색상

- 온라인: `bg-green-500`
- 자리 비움: `bg-yellow-500`
- 바쁨: `bg-red-500`
- 오프라인: `bg-gray-400`

### 호버 효과

- 클릭 가능한 아바타에 호버 시 투명도 변화
- 그룹에서 개별 아바타 확대 효과

## 접근성

### 키보드 지원

- 클릭 가능한 아바타에 포커스 가능
- 엔터 키로 클릭 이벤트 발생

### 스크린 리더

- 적절한 `alt` 텍스트 제공
- 상태 정보를 스크린 리더가 인식할 수 있도록 구조화

### 시각적 피드백

- 클릭 가능한 요소임을 명확히 표시
- 상태 변화에 대한 시각적 피드백

## 확장성

### 새로운 상태 추가

```tsx
// getStatusColor 함수에 새로운 상태 추가
case "invisible":
  return "bg-gray-300";
```

### 커스텀 크기

```tsx
// className으로 커스텀 크기 지정 가능
<Avatar
  className="h-14 w-14"
  // ... 다른 props
/>
```

### 커스텀 모양

```tsx
// className으로 커스텀 모양 지정 가능
<Avatar
  className="rounded-lg"
  // ... 다른 props
/>
```
