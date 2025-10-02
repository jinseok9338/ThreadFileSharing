# MainLayout Component

**Purpose**: Main layout component that provides fixed left navigation sidebar and flexible page content area.

## 컴포넌트 목적

ThreadFileSharing 애플리케이션의 메인 레이아웃을 담당합니다. 왼쪽에는 고정된 네비게이션 사이드바를 배치하고, 오른쪽에는 페이지별 콘텐츠가 렌더링되는 영역을 제공합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────┬─────────────────────────────────────────────────────┐
│   Layout    │                Page Content                         │
│ Navigation  │              (varies by route)                      │
│ (64px)      │                                                      │
│ 고정        │    - Main Page: Chat Room List + Messages + Threads │
│             │    - Settings Page: Settings content                │
│             │    - Future Pages: Their own layouts                │
└─────────────┴─────────────────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-screen w-full flex">
  {/* Left Navigation Panel - Fixed 64px */}
  <div className="w-16 flex-shrink-0 h-full">
    <Sidebar />
  </div>

  {/* Page Content Area - Takes remaining space */}
  <div className="flex-1 h-full">
    <Outlet />
  </div>
</div>
```

## 사용되는 컴포넌트

### 직접 사용

- `Sidebar` - 왼쪽 네비게이션 사이드바
- `Outlet` - React Router의 중첩 라우트 렌더링

### 의존성

- `react-router` - Outlet 컴포넌트
- `~/components/navigation/Sidebar` - 네비게이션 사이드바

## 스타일링

### 컨테이너 스타일

- `h-screen w-full flex` - 전체 화면 높이, 전체 너비, flex 레이아웃

### 왼쪽 네비게이션 패널

- `w-16 flex-shrink-0 h-full` - 64px 고정 너비, 축소 방지, 전체 높이

### 페이지 콘텐츠 영역

- `flex-1 h-full` - 남은 공간 모두 차지, 전체 높이

## 라우팅 구조

### Layout 역할

- **고정 영역**: 왼쪽 네비게이션 사이드바 (64px)
- **동적 영역**: 페이지별 콘텐츠 (나머지 공간)

### 페이지별 콘텐츠

#### Main Page (`/main`)

- ChatRoomList + ChatContent + ThreadPanel의 3단 구조

#### Settings Page (`/settings`)

- 설정 페이지 콘텐츠만 표시

#### Future Pages

- 각 페이지가 자체 레이아웃을 가질 수 있음

## 장점

### 1. 유연한 페이지 구조

- 각 페이지가 자체 레이아웃을 가질 수 있음
- 설정 페이지에서는 채팅룸 목록이 표시되지 않음

### 2. 일관된 네비게이션

- 모든 페이지에서 동일한 왼쪽 네비게이션 제공
- 현재 페이지 표시 및 상태 관리

### 3. 확장성

- 새로운 페이지 추가 시 레이아웃 변경 없이 확장 가능
- 각 페이지별 독립적인 상태 관리

## 사용 예시

```tsx
// 라우트 구조
<Route path="/" element={<MainLayout />}>
  <Route path="main" element={<MainPage />} />
  <Route path="settings" element={<SettingsPage />} />
</Route>

// MainPage 내부에서 자체 3단 레이아웃 구성
<ResizablePanelGroup>
  <ResizablePanel><ChatRoomList /></ResizablePanel>
  <ResizablePanel><ChatContent /></ResizablePanel>
  <ResizablePanel><ThreadPanel /></ResizablePanel>
</ResizablePanelGroup>
```

## 향후 개선사항

1. **네비게이션 상태 관리**: 현재 페이지 추적 및 활성 상태 표시
2. **반응형 디자인**: 모바일 환경에서의 사이드바 토글 기능
3. **접근성 개선**: 키보드 네비게이션 및 스크린 리더 지원
4. **테마 통합**: 다크/라이트 모드 지원

## 관련 파일

- `app/routes/_main.tsx` - 라우트 정의
- `app/pages/main/index.tsx` - 메인 페이지 구현
- `app/pages/settings/index.tsx` - 설정 페이지 구현
- `app/components/navigation/Sidebar.tsx` - 네비게이션 사이드바
