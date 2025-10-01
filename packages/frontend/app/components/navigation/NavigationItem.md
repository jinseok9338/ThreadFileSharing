# NavigationItem 컴포넌트

## 개요

Sidebar에서 사용되는 개별 네비게이션 아이템 컴포넌트입니다. 아이콘 기반의 네비게이션 버튼으로, 활성 상태와 호버 효과를 지원합니다.

## 목적

- 아이콘 기반 네비게이션 버튼 제공
- 활성/비활성 상태 시각적 구분
- 호버 효과 및 툴팁 지원
- 접근성 및 키보드 네비게이션 지원

## 파일 위치

`packages/frontend/app/components/navigation/NavigationItem.tsx`

## Props

```typescript
interface NavigationItemProps {
  icon: "chat" | "settings"; // 아이콘 타입
  active?: boolean; // 활성 상태
  to: string; // 이동할 경로
  tooltip?: string; // 툴팁 텍스트
  onClick?: () => void; // 클릭 핸들러 (선택사항)
}
```

## 내부 구조

### 컴포넌트 구조

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "w-12 h-12 rounded-lg transition-all duration-200",
          active && "bg-accent text-accent-foreground",
          !active && "hover:bg-accent/50 hover:scale-105"
        )}
        aria-current={active ? "page" : undefined}
      >
        {getIcon(icon)}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="right">
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## 아이콘 매핑

### 채팅 아이콘

- **타입**: `"chat"`
- **아이콘**: `MessageSquare` (lucide-react)
- **기본 툴팁**: "채팅"

### 설정 아이콘

- **타입**: `"settings"`
- **아이콘**: `Settings` (lucide-react)
- **기본 툴팁**: "설정"

## 사용되는 컴포넌트

### shadcn/ui 컴포넌트

- `Button` - 기본 버튼 컴포넌트
- `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent` - 툴팁 기능

### 외부 라이브러리

- `MessageSquare`, `Settings` - lucide-react 아이콘
- `cn` - 클래스명 병합 유틸리티

## 스타일링

### 기본 스타일

- `w-12 h-12` - 48px × 48px 크기
- `rounded-lg` - 둥근 모서리
- `transition-all duration-200` - 부드러운 전환 효과

### 활성 상태 스타일

- `bg-accent` - 활성 배경색
- `text-accent-foreground` - 활성 텍스트 색상
- `aria-current="page"` - 접근성 속성

### 비활성 상태 스타일

- `hover:bg-accent/50` - 호버 시 반투명 배경
- `hover:scale-105` - 호버 시 살짝 확대

## 상태 관리

### Props 기반 상태

- `active` prop으로 활성 상태 제어
- 부모 컴포넌트에서 현재 경로 기반으로 전달

### 내부 상태

- 현재는 내부 상태 없음
- 모든 상태는 props로 제어

## 접근성

### 키보드 네비게이션

- Tab으로 포커스 가능
- Enter/Space로 활성화
- `aria-current="page"` 속성으로 현재 페이지 표시

### 스크린 리더 지원

- 툴팁 텍스트로 아이콘 설명 제공
- `aria-current` 속성으로 현재 페이지 알림

### 포커스 관리

- 포커스 시 명확한 시각적 피드백
- 키보드 네비게이션 순서 고려

## 툴팁 기능

### 툴팁 위치

- `side="right"` - 오른쪽에 표시
- 80px 폭 사이드바에 맞는 위치

### 툴팁 내용

- 아이콘 타입에 따른 기본 텍스트
- 커스텀 툴팁 텍스트 지원

### 툴팁 동작

- 호버 시 표시
- 키보드 포커스 시 표시
- 자동 숨김 기능

## 테마 지원

### Light/Dark 테마

- CSS 변수를 통한 자동 테마 적용
- `bg-accent`, `text-accent-foreground` 등 사용

### 색상 변화

- 활성: 강조 색상 사용
- 비활성: 기본 색상 사용
- 호버: 반투명 강조 색상 사용

## 성능 최적화

### 렌더링 최적화

- `memo` 사용으로 불필요한 리렌더링 방지
- 아이콘 컴포넌트 최적화

### 이벤트 처리

- 클릭 이벤트 최적화
- 호버 이벤트 최적화

## 사용 예시

### 기본 사용법

```tsx
<NavigationItem
  icon="chat"
  active={isChatActive}
  to="/main"
  tooltip="채팅"
/>

<NavigationItem
  icon="settings"
  active={isSettingsActive}
  to="/main/settings"
  tooltip="설정"
/>
```

### Sidebar에서 사용

```tsx
<div className="flex-1 flex flex-col items-center space-y-2 py-4">
  <NavigationItem icon="chat" active={isChatActive} to="/main" />
  <NavigationItem
    icon="settings"
    active={isSettingsActive}
    to="/main/settings"
  />
</div>
```

## 테스트 시나리오

### 기본 렌더링

1. 아이콘이 올바르게 표시되는지 확인
2. 크기가 48px × 48px인지 확인
3. 둥근 모서리가 적용되었는지 확인

### 상태 변화

1. `active` prop에 따른 스타일 변화 확인
2. 활성 상태에서 `aria-current="page"` 속성 확인
3. 비활성 상태에서 호버 효과 확인

### 인터랙션

1. 클릭 시 올바른 경로로 이동하는지 확인
2. 호버 시 툴팁이 표시되는지 확인
3. 키보드 네비게이션이 작동하는지 확인

### 접근성

1. 스크린 리더에서 아이콘 설명을 읽는지 확인
2. 키보드만으로 모든 기능에 접근 가능한지 확인
3. 포커스 표시가 명확한지 확인

### 툴팁 기능

1. 호버 시 툴팁이 표시되는지 확인
2. 툴팁 위치가 올바른지 확인
3. 툴팁 내용이 정확한지 확인
