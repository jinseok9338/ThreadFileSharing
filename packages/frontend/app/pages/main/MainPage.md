# MainPage Component

**Purpose**: Main chat page component that provides three-column layout with chat room list, messages, and threads.

## 컴포넌트 목적

ThreadFileSharing 애플리케이션의 메인 채팅 페이지입니다. 채팅룸 목록, 메시지 영역, 스레드 패널의 3단 구조를 제공합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────┬─────────────────────────┬─────────────────────┐
│   Chat Room     │      Messages           │      Threads        │
│     List        │                         │                     │
│   (20%)         │        (50%)            │      (30%)          │
│ bg-muted/30     │    bg-background        │    bg-muted/20      │
│                 │                         │                     │
│ - Room List     │ - Message List          │ - Thread List       │
│ - Search        │ - Message Input         │ - Thread Detail     │
│ - Create Room   │ - File Upload           │ - Thread Files      │
│                 │ - Typing Indicator      │                     │
└─────────────────┴─────────────────────────┴─────────────────────┘
```

### 컴포넌트 구조

```tsx
<ResizablePanelGroup direction="horizontal" className="h-full">
  {/* Left Chat Room List Panel */}
  <ResizablePanel
    defaultSize={20}
    minSize={17}
    maxSize={35}
    className="bg-muted/30"
  >
    <ChatRoomList />
  </ResizablePanel>

  <ResizableHandle />

  {/* Middle Chat Content Panel */}
  <ResizablePanel
    defaultSize={50}
    minSize={30}
    maxSize={70}
    className="bg-background"
  >
    <ChatRoomContent />
  </ResizablePanel>

  <ResizableHandle />

  {/* Right Thread Panel */}
  <ResizablePanel
    defaultSize={30}
    minSize={15}
    maxSize={40}
    className="bg-muted/20"
  >
    <ThreadPanel />
  </ResizablePanel>
</ResizablePanelGroup>
```

## 사용되는 컴포넌트

### 직접 사용

- `ResizablePanelGroup` - 3단 레이아웃 컨테이너
- `ResizablePanel` - 개별 패널들
- `ResizableHandle` - 패널 간 리사이즈 핸들
- `ChatRoomList` - 채팅룸 목록 컴포넌트
- `Heading3` - 제목 텍스트
- `BodyTextSmall` - 본문 텍스트

### 의존성

- `react` - useState 훅
- `react-i18next` - 다국어 지원
- `~/components/ui/resizable` - 리사이저블 패널
- `~/components/typography` - 타이포그래피 컴포넌트
- `~/components/chat/ChatRoomList` - 채팅룸 목록

## 상태 관리

### 로컬 상태

```tsx
const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>();
```

### 이벤트 핸들러

```tsx
const handleChatRoomSelect = (chatRoomId: string) => {
  setSelectedChatRoomId(chatRoomId);
};

const handleCreateNewRoom = () => {
  // TODO: 새 채팅룸 생성 로직
  console.log("새 채팅룸 생성");
};
```

## 패널 설정

### Chat Room List Panel (왼쪽)

- **defaultSize**: 20% (기본 크기)
- **minSize**: 17% (최소 크기)
- **maxSize**: 35% (최대 크기)

### Messages Panel (중간)

- **defaultSize**: 50% (기본 크기)
- **minSize**: 30% (최소 크기)
- **maxSize**: 70% (최대 크기)

### Threads Panel (오른쪽)

- **defaultSize**: 30% (기본 크기)
- **minSize**: 15% (최소 크기)
- **maxSize**: 40% (최대 크기)

## 스타일링

### 컨테이너 스타일

- `h-full` - 전체 높이 사용

### 패널 스타일

- `bg-background` - 배경색
- `border-l` - 왼쪽 테두리 (Threads 패널)

### 텍스트 스타일

- `text-muted-foreground` - 회색 텍스트
- `text-left` - 왼쪽 정렬

## 다국어 지원

### 사용되는 키

- `main.messages` - "메시지" / "Messages"
- `main.selectChatRoom` - "채팅룸을 선택해주세요" / "Please select a chat room"
- `main.threads` - "Threads" / "Threads"
- `main.noThreads` - "스레드가 없습니다" / "No threads"

## 향후 구현 예정

### Chat Content Panel

```tsx
<ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
  <ChatRoomContent selectedChatRoomId={selectedChatRoomId} />
</ResizablePanel>
```

### Thread Panel

```tsx
<ResizablePanel defaultSize={30} minSize={15} maxSize={40}>
  <ThreadPanel selectedChatRoomId={selectedChatRoomId} />
</ResizablePanel>
```

## 사용 예시

```tsx
// 라우트에서 사용
<Route path="main" element={<MainPage />} />

// MainLayout 내부에서 렌더링
<MainLayout>
  <MainPage /> {/* Outlet으로 렌더링 */}
</MainLayout>
```

## 시각적 구분을 위한 백그라운드 차별화 (2024.01.15)

### 백그라운드 색상 전략

각 섹션의 시각적 구분을 위해 서로 다른 백그라운드 변수를 사용합니다:

#### **1. 채팅룸 목록 (Left Panel)**

- **백그라운드**: `bg-muted/30`
- **효과**: 연한 회색 배경으로 목록 영역을 명확히 구분
- **용도**: 채팅룸 목록과 검색 기능

#### **2. 채팅 컨텐츠 (Middle Panel)**

- **백그라운드**: `bg-background`
- **효과**: 메인 컨텐츠 영역으로 가장 밝은 배경
- **용도**: 메시지 표시 및 입력 영역

#### **3. 스레드 패널 (Right Panel)**

- **백그라운드**: `bg-muted/20`
- **효과**: 중간 정도의 회색 배경으로 스레드 영역 구분
- **용도**: 스레드 목록, 파일 관리, 스레드 채팅

### 컴포넌트별 백그라운드 투명도

각 컴포넌트는 상위 패널의 백그라운드를 보여주기 위해 투명 배경을 사용합니다:

#### **ChatRoomList**

```tsx
<div className="h-full flex flex-col bg-transparent">
```

#### **ChatRoomContent**

```tsx
<div className="h-full flex flex-col bg-transparent relative">
```

#### **ThreadPanel**

```tsx
<div className="h-full flex flex-col bg-transparent border-l">
```

### 시각적 계층 구조

1. **가장 밝음**: 채팅 컨텐츠 (`bg-background`)
2. **중간 밝기**: 스레드 패널 (`bg-muted/20`)
3. **가장 어두움**: 채팅룸 목록 (`bg-muted/30`)

이 구조를 통해 사용자가 각 영역을 쉽게 구분할 수 있고, 정보 계층을 명확하게 인식할 수 있습니다.

## 관련 파일

- `app/routes/_main.tsx` - 라우트 정의
- `app/components/layouts/MainLayout.tsx` - 메인 레이아웃
- `app/components/chat/ChatRoomList.tsx` - 채팅룸 목록
- `language.csv` - 다국어 키 정의
