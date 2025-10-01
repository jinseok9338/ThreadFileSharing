# Sidebar 컴포넌트

## 개요

ThreadFileSharing 애플리케이션의 왼쪽 네비게이션 사이드바 컴포넌트입니다. 아이콘 기반의 컴팩트한 네비게이션을 제공하며, 80px 고정 폭으로 설계되었습니다.

## 목적

- 메인 애플리케이션 네비게이션 제공 (채팅, 설정)
- 아이콘 중심의 직관적인 UI
- 컴팩트한 80px 폭으로 공간 효율성 극대화
- 현재 활성 상태 표시 및 호버 효과

## 파일 위치

`packages/frontend/app/components/navigation/Sidebar.tsx`

## Props

```typescript
interface SidebarProps {
  // 현재는 props 없음 - 내부에서 현재 경로 감지
}
```

## 내부 구조

### 레이아웃 구조 (64px 폭)

```
┌────────┐
│   🏠   │ ← 앱 로고/아이콘 (상단)
├────────┤
│   💬   │ ← 채팅 아이콘
│   ⚙️   │ ← 설정 아이콘
├────────┤
│        │ ← 여백 (flex-1)
│        │
│        │
├────────┤
│   👤   │ ← 사용자 프로필 (하단)
└────────┘
```

### 컴포넌트 구조

```tsx
<div className="w-16 h-full flex flex-col bg-background border-r">
  {/* 상단: 앱 로고 */}
  <div className="p-2">
    <AppLogo size="sm" />
  </div>

  {/* 중간: 네비게이션 메뉴 */}
  <div className="flex-1 flex flex-col items-center space-y-1 py-2">
    <NavigationItem icon="chat" active={isChatActive} />
    <NavigationItem icon="settings" active={isSettingsActive} />
  </div>

  {/* 하단: 사용자 프로필 */}
  <div className="p-2">
    <UserProfile />
  </div>
</div>
```

## 네비게이션 아이템

### 채팅 아이콘

- **아이콘**: 💬 (MessageSquare 또는 Chat 아이콘)
- **활성 상태**: 현재 경로가 `/main` 또는 `/main/chat/*`
- **링크**: `/main`
- **툴팁**: "채팅"

### 설정 아이콘

- **아이콘**: ⚙️ (Settings 또는 Gear 아이콘)
- **활성 상태**: 현재 경로가 `/main/settings`
- **링크**: `/main/settings`
- **툴팁**: "설정"

## 사용되는 컴포넌트

### 직접 사용

- `Link` - React Router Link 컴포넌트
- `Button` - shadcn/ui Button (네비게이션 아이템용)
- `Tooltip` - shadcn/ui Tooltip (아이콘 설명)

### 커스텀 컴포넌트

- `NavigationItem` - 개별 네비게이션 아이템
- `AppLogo` - 앱 로고/아이콘
- `UserProfile` - 사용자 프로필 아이콘

## 스타일링

### 컨테이너 스타일

- `w-16` - 64px 고정 폭
- `h-full` - 전체 높이
- `flex flex-col` - 세로 플렉스 레이아웃
- `bg-background border-r` - 배경색과 오른쪽 테두리

### 네비게이션 아이템 스타일

- `w-12 h-12` - 48px × 48px 크기
- `rounded-lg` - 둥근 모서리
- `transition-colors` - 색상 전환 애니메이션

### 활성 상태 스타일

- `bg-accent` - 활성 배경색
- `text-accent-foreground` - 활성 텍스트 색상

### 호버 상태 스타일

- `hover:bg-accent/50` - 호버 시 반투명 배경
- `hover:scale-105` - 호버 시 살짝 확대

## 상태 관리

### 로컬 상태

- 현재 활성 네비게이션 아이템 감지
- `useLocation`으로 현재 경로 확인

### 상태 로직

```typescript
const location = useLocation();

const isChatActive = location.pathname === "/main" || location.pathname === "/";

const isSettingsActive = location.pathname === "/settings";
```

## 라우팅 연동

### 경로 매핑

- **채팅**: `/main` → 기본 채팅 페이지
- **설정**: `/settings` → 설정 페이지

### Link 컴포넌트 사용

```tsx
<Link to="/main">
  <NavigationItem icon="chat" active={isChatActive} />
</Link>

<Link to="/settings">
  <NavigationItem icon="settings" active={isSettingsActive} />
</Link>
```

## 접근성

### 키보드 네비게이션

- Tab 순서: 채팅 → 설정 → 사용자 프로필
- Enter/Space로 활성화
- 화살표 키로 네비게이션 (향후)

### ARIA 속성

- `role="navigation"` - 네비게이션 역할
- `aria-label="메인 네비게이션"`
- 각 아이템에 `aria-current="page"` (활성 시)

### 툴팁 지원

- 아이콘 호버 시 툴팁 표시
- 스크린 리더를 위한 설명 텍스트

## 테마 지원

### Light/Dark 테마

- CSS 변수를 통한 자동 테마 적용
- `bg-background`, `text-foreground` 등 사용

### 아이콘 색상

- 활성: `text-accent-foreground`
- 비활성: `text-muted-foreground`
- 호버: `text-foreground`

## 성능 고려사항

### 렌더링 최적화

- `memo` 사용으로 불필요한 리렌더링 방지
- 아이콘 컴포넌트 최적화

### 메모리 관리

- 이벤트 리스너 정리
- 컴포넌트 언마운트 시 상태 정리

## 향후 개선 사항

### 추가 네비게이션

- 알림 아이콘 (향후)
- 즐겨찾기 아이콘 (향후)
- 검색 아이콘 (향후)

### 인터랙션 개선

- 드래그 앤 드롭으로 아이콘 순서 변경
- 키보드 단축키 지원
- 애니메이션 효과 강화

### 사용자 경험

- 새 알림 표시 (빨간 점)
- 사용자 상태 표시 (온라인/오프라인)
- 프로필 이미지 표시

## 사용 예시

```tsx
// MainLayout에서 사용
<ResizablePanel defaultSize={80} minSize={80} maxSize={80}>
  <Sidebar />
</ResizablePanel>

// 독립적으로 사용
<Sidebar />
```

## 테스트 시나리오

### 기본 렌더링

1. Sidebar가 80px 폭으로 렌더링되는지 확인
2. 채팅과 설정 아이콘이 표시되는지 확인
3. 앱 로고와 사용자 프로필이 표시되는지 확인

### 네비게이션 기능

1. 채팅 아이콘 클릭 시 `/main`으로 이동하는지 확인
2. 설정 아이콘 클릭 시 `/main/settings`로 이동하는지 확인
3. 현재 페이지에 해당하는 아이콘이 활성화되는지 확인

### 인터랙션

1. 아이콘 호버 시 툴팁이 표시되는지 확인
2. 호버 효과가 올바르게 작동하는지 확인
3. 키보드 네비게이션이 작동하는지 확인

### 접근성

1. 스크린 리더에서 네비게이션 구조를 인식하는지 확인
2. 키보드만으로 모든 기능에 접근 가능한지 확인
3. ARIA 속성이 올바르게 설정되었는지 확인

### 반응형

1. 80px 폭이 고정되어 있는지 확인
2. 다양한 화면 크기에서 올바르게 표시되는지 확인
