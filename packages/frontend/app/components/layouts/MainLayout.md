# MainLayout 컴포넌트

## 개요

ThreadFileSharing 애플리케이션의 메인 레이아웃 컴포넌트입니다. 4컬럼 구조의 기반이 되는 Layout 부분을 담당하며, Left Navigation과 Middle Chat Room List 패널을 관리합니다.

## 목적

- 전체 애플리케이션의 기본 레이아웃 구조 제공
- 공통 네비게이션과 채팅룸 리스트 영역 관리
- Page 컴포넌트들이 렌더링될 Outlet 영역 제공
- 반응형 패널 크기 조절 및 축소/확장 기능

## 파일 위치

`packages/frontend/app/components/layouts/MainLayout.tsx`

## Props

```typescript
interface MainLayoutProps {
  // 현재는 props 없음 - 모든 상태는 내부에서 관리
}
```

## 내부 구조

### 레이아웃 구조

```
┌─────────────┬─────────────┬─────────────────────────────────┐
│   Layout    │   Layout    │           Page Content          │
│ Navigation  │ Chat List   │    (Right + Thread Panels)      │
│ (64px)      │ (320px)     │                                 │
│ 고정        │ 리사이저블   │        Outlet 렌더링            │
└─────────────┴─────────────┴─────────────────────────────────┘
```

### ResizablePanelGroup 설정

```tsx
<ResizablePanelGroup direction="horizontal" className="min-h-screen">
  {/* Left Navigation Panel - 64px 고정 */}
  <ResizablePanel defaultSize={64} minSize={64} maxSize={64}>
    <Sidebar />
  </ResizablePanel>

  <ResizableHandle />

  {/* Middle Chat Room List Panel - 리사이저블 */}
  <ResizablePanel defaultSize={320} minSize={60} maxSize={500}>
    <ChatRoomList />
  </ResizablePanel>

  <ResizableHandle />

  {/* Page Content Area */}
  <div className="flex-1">
    <Outlet />
  </div>
</ResizablePanelGroup>
```

## 사용되는 컴포넌트

### 직접 사용

- `ResizablePanelGroup` - 메인 레이아웃 컨테이너
- `ResizablePanel` - 개별 패널들
- `ResizableHandle` - 패널 간 리사이즈 핸들
- `Outlet` - 페이지 컴포넌트 렌더링 영역

### 자식 컴포넌트

- `Sidebar` - Left Navigation 패널
- `ChatRoomList` - Middle Chat Room List 패널

## 스타일링

### 컨테이너 스타일

- `className="h-screen w-full"` - 전체 화면 크기
- `className="min-h-screen"` - 최소 높이 화면 크기

### 패널 크기 제약

- **Left Panel**: 80px 고정 (minSize=maxSize=80)
- **Middle Panel**: 60px~500px 리사이저블 (축소 가능)
- **Page Area**: flex-1 (나머지 공간 모두 사용)

### 테마 지원

- Light/Dark 테마 자동 적용
- CSS 변수를 통한 색상 관리

## 상태 관리

### 로컬 상태

- 패널 크기 상태 (ResizablePanelGroup이 내부 관리)
- 축소/확장 상태 (ResizablePanel의 collapsible 속성)

### 전역 상태 (향후)

- 선택된 채팅룸 ID
- 패널 축소 상태 (localStorage 연동 예정)
- 테마 설정

## 라우팅 연동

### Layout Route

- `_main.tsx`에서 사용
- 모든 `/main/*` 경로의 공통 레이아웃

### Outlet 렌더링

- `_main._index.tsx` → 기본 채팅 페이지
- `_main.chat.$roomId.tsx` → 특정 채팅룸 페이지
- `_main.settings._index.tsx` → 설정 페이지

## 접근성

### 키보드 네비게이션

- Tab 순서: Left Navigation → Chat Room List → Page Content
- ResizableHandle 키보드 접근 가능

### ARIA 속성

- 각 패널에 적절한 role 속성
- 패널 제목에 aria-label

## 성능 고려사항

### 렌더링 최적화

- Left/Middle 패널은 고정 컴포넌트로 최적화
- Page Content만 동적으로 변경
- ResizablePanelGroup의 성능 최적화 활용

### 메모리 관리

- 컴포넌트 언마운트 시 리사이즈 이벤트 정리
- 불필요한 리렌더링 방지

## 향후 개선 사항

### 축소/확장 기능

- Middle Panel 축소 시 아이콘만 표시
- 상태를 localStorage에 저장
- 키보드 단축키 지원 (Ctrl+1, Ctrl+2)

### 반응형 지원

- 화면 크기에 따른 패널 크기 조정
- 모바일에서는 다른 레이아웃 (향후)

### 드래그 앤 드롭

- 채팅룸 순서 변경
- 파일 드래그 앤 드롭 영역

## 사용 예시

```tsx
// _main.tsx에서 사용
export default function Main() {
  return <MainLayout />;
}

// Page 컴포넌트에서 접근
function ChatPage() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <ChatRoomContent />
      </ResizablePanel>
      <ResizablePanel>
        <ThreadPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

## 테스트 시나리오

### 기본 렌더링

1. MainLayout이 올바르게 렌더링되는지 확인
2. 3개 패널이 올바른 크기로 표시되는지 확인
3. ResizableHandle이 작동하는지 확인

### 패널 리사이징

1. Middle Panel 크기 조절이 작동하는지 확인
2. 최소/최대 크기 제한이 적용되는지 확인
3. Left Panel은 80px 고정 크기인지 확인

### 라우팅 연동

1. Outlet이 올바르게 페이지를 렌더링하는지 확인
2. 페이지 전환 시 레이아웃이 유지되는지 확인

### 접근성

1. 키보드 네비게이션이 올바르게 작동하는지 확인
2. 스크린 리더에서 패널 구조를 인식하는지 확인
