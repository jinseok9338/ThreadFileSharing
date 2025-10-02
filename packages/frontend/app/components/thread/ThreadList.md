# ThreadList Component

**Purpose**: A scrollable list component that displays all threads in a chat room with file information and interaction counts.

## 컴포넌트 목적

채팅방의 모든 스레드들을 목록 형태로 표시하는 컴포넌트입니다. 각 스레드는 파일 정보, 메시지 수, 생성자 정보를 포함하며, 클릭 시 해당 스레드의 상세 내용을 볼 수 있습니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│ 📄 Project Proposal.pdf       5 💬     │
│ 👤 John • 2시간 전                     │
├─────────────────────────────────────────┤
│ 🖼️ Design Mockup.jpg          3 💬     │
│ 👤 Jane • 1시간 전                     │
├─────────────────────────────────────────┤
│ 📊 Presentation.pptx          1 💬     │
│ 👤 Bob • 30분 전                      │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-full flex flex-col">
  {threads.length === 0 ? (
    <EmptyState
      icon={MessageSquare}
      title={t("thread.noThreads")}
      description={t("thread.createFirst")}
      action={
        <Button onClick={onCreateThread}>
          <Plus className="w-4 h-4 mr-2" />
          {t("thread.createThread")}
        </Button>
      }
    />
  ) : (
    <>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {threads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isSelected={selectedThreadId === thread.id}
              onClick={() => onThreadSelect?.(thread.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  )}
</div>
```

## Props Interface

```tsx
interface ThreadListProps {
  threads?: Thread[];
  selectedThreadId?: string;
  onThreadSelect?: (threadId: string) => void;
  onCreateThread?: () => void;
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `ScrollArea` - 스크롤 가능한 영역
- `EmptyState` - 빈 상태 표시
- `Button` - 새 스레드 생성 버튼
- `Plus` - 플러스 아이콘

### 하위 컴포넌트

- `ThreadItem` - 개별 스레드 아이템 컴포넌트

### 의존성

- `~/components/ui/scroll-area` - 스크롤 영역
- `~/components/ui/button` - 버튼 컴포넌트
- `~/components/ui/EmptyState` - 빈 상태 컴포넌트
- `~/components/thread/ThreadItem` - 스레드 아이템

## Props 설명

### threads (선택사항)

- **타입**: `Thread[]`
- **설명**: 표시할 스레드 목록
- **기본값**: `[]`

### selectedThreadId (선택사항)

- **타입**: `string`
- **설명**: 현재 선택된 스레드 ID
- **기본값**: `undefined`

### onThreadSelect (선택사항)

- **타입**: `(threadId: string) => void`
- **설명**: 스레드 선택 시 실행할 함수
- **기본값**: `undefined`

### onCreateThread (선택사항)

- **타입**: `() => void`
- **설명**: 새 스레드 생성 시 실행할 함수
- **기본값**: `undefined`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 스타일링

### 컨테이너 스타일

- `h-full flex flex-col` - 전체 높이, 세로 플렉스

### 스크롤 영역 스타일

- `flex-1 p-2` - 남은 공간 차지, 패딩
- `space-y-1` - 아이템 간 간격

### 빈 상태 스타일

- `h-full flex items-center justify-center` - 중앙 정렬

## 사용 예시

### 기본 사용

```tsx
<ThreadList
  threads={threads}
  selectedThreadId={selectedThreadId}
  onThreadSelect={handleThreadSelect}
  onCreateThread={handleCreateThread}
/>
```

### Mock 데이터로 테스트

```tsx
const mockThreads = [
  {
    id: "1",
    title: "Project Proposal.pdf",
    fileType: "pdf",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messageCount: 5,
    createdBy: {
      id: "1",
      displayName: "John",
      status: "online",
    },
  },
  {
    id: "2",
    title: "Design Mockup.jpg",
    fileType: "image",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    messageCount: 3,
    createdBy: {
      id: "2",
      displayName: "Jane",
      status: "online",
    },
  },
];

<ThreadList threads={mockThreads} />;
```

## 다양한 사용 사례

### 1. 빈 상태 (스레드 없음)

```tsx
<ThreadList threads={[]} />
// EmptyState가 표시됨
```

### 2. 스레드 목록 표시

```tsx
<ThreadList
  threads={threads}
  onThreadSelect={(threadId) => {
    console.log("Selected thread:", threadId);
    setSelectedThreadId(threadId);
  }}
/>
```

### 3. 선택된 스레드 하이라이트

```tsx
<ThreadList
  threads={threads}
  selectedThreadId="thread-1"
  onThreadSelect={handleSelect}
/>
// 해당 스레드가 하이라이트됨
```

### 4. 새 스레드 생성

```tsx
<ThreadList
  threads={threads}
  onCreateThread={() => {
    // 파일 선택 다이얼로그 열기
    openFileDialog();
  }}
/>
```

## 파일 타입별 표시

### 지원하는 파일 타입

#### PDF 파일

```
📄 Project Proposal.pdf       5 💬
👤 John • 2시간 전
```

#### 이미지 파일

```
🖼️ Design Mockup.jpg         3 💬
👤 Jane • 1시간 전
```

#### 문서 파일

```
📄 Document.docx             2 💬
👤 Bob • 1시간 전
```

#### 프레젠테이션 파일

```
📊 Presentation.pptx         1 💬
👤 Alice • 30분 전
```

## 시간 표시 로직

### 상대 시간 표시

- **방금 전**: `justNow`
- **1분 전**: `1 minute ago`
- **30분 전**: `30 minutes ago`
- **1시간 전**: `1 hour ago`
- **2시간 전**: `2 hours ago`
- **1일 전**: `1 day ago`

## 다국어 지원

### i18n 키

- `thread.noThreads` - "No threads" / "스레드가 없습니다"
- `thread.createFirst` - "Create your first thread" / "첫 번째 스레드를 만들어보세요"
- `thread.createThread` - "Create Thread" / "스레드 만들기"
- `thread.messages` - "messages" / "메시지"

## 성능 최적화

### 가상화

- 많은 스레드가 있을 경우 `@tanstack/react-virtual` 사용
- 화면에 보이는 스레드만 렌더링

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- threads 배열 변경 시에만 리렌더링

## 접근성

### ARIA 속성

- `role="list"` - 목록임을 명시
- `aria-label="Thread list"` - 목록 목적 명시

### 키보드 네비게이션

- Arrow 키로 스레드 간 이동
- Enter/Space 키로 스레드 선택

## 테마 지원

### 다크/라이트 모드

- 모든 색상이 테마에 따라 자동 변경
- `bg-background`, `text-foreground` 등 사용

## 관련 파일

- `app/components/thread/ThreadItem.tsx` - 스레드 아이템 컴포넌트
- `app/components/thread/ThreadPanel.tsx` - 상위 패널 컴포넌트
- `app/pages/chat/types/types.ts` - Thread 타입 정의
- `app/utils/time.ts` - 시간 포맷팅 유틸리티
