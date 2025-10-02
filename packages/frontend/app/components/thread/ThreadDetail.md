# ThreadDetail Component

**Purpose**: A detailed view component that displays thread information, messages, and allows interaction with thread content.

## 컴포넌트 목적

선택된 스레드의 상세 정보를 표시하는 컴포넌트입니다. 스레드 헤더, 메시지 목록, 파일 첨부, 그리고 새 메시지 입력 기능을 제공합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│ ← Back  📄 Project Proposal.pdf  ⋮     │
├─────────────────────────────────────────┤
│ 📎 Attached Files                       │
│ • Project Proposal.pdf (2.3MB)         │
│ • Design Notes.docx (1.1MB)            │
├─────────────────────────────────────────┤
│ 💬 Messages (5)                         │
│ ┌─────────────────────────────────────┐ │
│ │ John: This looks great!             │ │
│ │ 2시간 전                           │ │
│ ├─────────────────────────────────────┤ │
│ │ Jane: I'll review the details       │ │
│ │ 1시간 전                           │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [Type a message...]           [Send]    │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-full flex flex-col">
  {/* Thread Header */}
  <ThreadHeader
    thread={thread}
    onBack={onBack}
    onEdit={onEdit}
    onDelete={onDelete}
  />

  {/* File Attachments */}
  {thread.files && thread.files.length > 0 && (
    <div className="p-4 border-b bg-muted/20">
      <div className="space-y-2">
        <Caption className="text-muted-foreground">
          📎 {t("thread.attachedFiles")}
        </Caption>
        {thread.files.map((file) => (
          <FileAttachment key={file.id} file={file} />
        ))}
      </div>
    </div>
  )}

  {/* Messages */}
  <div className="flex-1 overflow-hidden">
    <ThreadMessageList messages={thread.messages} threadId={threadId} />
  </div>

  {/* Message Input */}
  <div className="p-4 border-t">
    <ThreadInput
      onSendMessage={handleSendMessage}
      onFileUpload={handleFileUpload}
      placeholder={t("thread.typeMessage")}
    />
  </div>
</div>
```

## Props Interface

```tsx
interface ThreadDetailProps {
  threadId: string;
  thread?: Thread;
  onBack?: () => void;
  onEdit?: (threadId: string) => void;
  onDelete?: (threadId: string) => void;
  onSendMessage?: (message: string) => void;
  onFileUpload?: (files: File[]) => void;
  onMessageUpdate?: (messageId: string, content: string) => void;
  onMessageDelete?: (messageId: string) => void;
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `Caption` - 파일 첨부 섹션 제목

### 하위 컴포넌트

- `ThreadHeader` - 스레드 헤더 컴포넌트
- `FileAttachment` - 파일 첨부 컴포넌트
- `ThreadMessageList` - 스레드 메시지 목록
- `ThreadInput` - 스레드 메시지 입력

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `~/components/thread/ThreadHeader` - 스레드 헤더
- `~/components/thread/FileAttachment` - 파일 첨부
- `~/components/thread/ThreadMessageList` - 메시지 목록
- `~/components/thread/ThreadInput` - 메시지 입력

## Props 설명

### threadId (필수)

- **타입**: `string`
- **설명**: 표시할 스레드 ID
- **기본값**: 없음

### thread (선택사항)

- **타입**: `Thread`
- **설명**: 스레드 데이터 (Mock 데이터 사용 가능)
- **기본값**: `undefined`

### onBack (선택사항)

- **타입**: `() => void`
- **설명**: 뒤로가기 버튼 클릭 시 실행할 함수
- **기본값**: `undefined`

### onEdit (선택사항)

- **타입**: `(threadId: string) => void`
- **설명**: 스레드 편집 시 실행할 함수
- **기본값**: `undefined`

### onDelete (선택사항)

- **타입**: `(threadId: string) => void`
- **설명**: 스레드 삭제 시 실행할 함수
- **기본값**: `undefined`

### onSendMessage (선택사항)

- **타입**: `(message: string) => void`
- **설명**: 메시지 전송 시 실행할 함수
- **기본값**: `undefined`

### onFileUpload (선택사항)

- **타입**: `(files: File[]) => void`
- **설명**: 파일 업로드 시 실행할 함수
- **기본값**: `undefined`

### onMessageUpdate (선택사항)

- **타입**: `(messageId: string, content: string) => void`
- **설명**: 메시지 수정 시 실행할 함수
- **기본값**: `undefined`

### onMessageDelete (선택사항)

- **타입**: `(messageId: string) => void`
- **설명**: 메시지 삭제 시 실행할 함수
- **기본값**: `undefined`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 스타일링

### 컨테이너 스타일

- `h-full flex flex-col` - 전체 높이, 세로 플렉스

### 파일 첨부 영역 스타일

- `p-4 border-b bg-muted/20` - 패딩, 하단 테두리, 배경색
- `space-y-2` - 아이템 간 간격

### 메시지 영역 스타일

- `flex-1 overflow-hidden` - 남은 공간 차지, 오버플로우 숨김

### 입력 영역 스타일

- `p-4 border-t` - 패딩, 상단 테두리

## 사용 예시

### 기본 사용

```tsx
<ThreadDetail
  threadId="thread-1"
  thread={thread}
  onBack={() => setSelectedThreadId(null)}
  onEdit={handleEditThread}
  onDelete={handleDeleteThread}
  onSendMessage={handleSendMessage}
  onFileUpload={handleFileUpload}
/>
```

### Mock 데이터로 테스트

```tsx
const mockThread = {
  id: "1",
  title: "Project Proposal.pdf",
  fileType: "pdf",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messageCount: 5,
  createdBy: {
    id: "1",
    displayName: "John",
    status: "online",
  },
  files: [
    {
      id: "1",
      name: "Project Proposal.pdf",
      size: 2300000,
      type: "application/pdf",
      url: "/files/proposal.pdf",
    },
  ],
  messages: [
    {
      id: "1",
      content: "This looks great!",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isEdited: false,
      sender: {
        id: "1",
        displayName: "John",
        status: "online",
      },
    },
  ],
};

<ThreadDetail threadId="1" thread={mockThread} />;
```

## 다양한 사용 사례

### 1. 기본 스레드 상세

```tsx
<ThreadDetail
  threadId="thread-1"
  thread={thread}
  onBack={() => setSelectedThreadId(null)}
/>
```

### 2. 파일 첨부가 있는 스레드

```tsx
<ThreadDetail
  threadId="thread-1"
  thread={threadWithFiles}
  onFileUpload={handleFileUpload}
/>
```

### 3. 메시지가 많은 스레드

```tsx
<ThreadDetail
  threadId="thread-1"
  thread={threadWithManyMessages}
  onSendMessage={handleSendMessage}
  onMessageUpdate={handleMessageUpdate}
  onMessageDelete={handleMessageDelete}
/>
```

## 파일 첨부 표시

### 첨부 파일 목록

```
📎 Attached Files
• Project Proposal.pdf (2.3MB)
• Design Notes.docx (1.1MB)
• Budget.xlsx (850KB)
```

### 파일 타입별 아이콘

- **PDF**: 📄
- **Word**: 📝
- **Excel**: 📊
- **PowerPoint**: 📈
- **이미지**: 🖼️
- **기타**: 📎

## 메시지 상호작용

### 메시지 액션

- **편집**: 더블클릭 또는 메뉴에서 편집
- **삭제**: 메뉴에서 삭제
- **반응**: 이모지 반응 추가

### 메시지 상태

- **일반**: 기본 메시지
- **편집됨**: "(edited)" 표시
- **삭제됨**: "This message was deleted" 표시

## 다국어 지원

### i18n 키

- `thread.attachedFiles` - "Attached Files" / "첨부 파일"
- `thread.typeMessage` - "Type a message..." / "메시지를 입력하세요..."
- `thread.messages` - "Messages" / "메시지"
- `thread.editThread` - "Edit Thread" / "스레드 편집"
- `thread.deleteThread` - "Delete Thread" / "스레드 삭제"

## 접근성

### ARIA 속성

- `role="main"` - 메인 콘텐츠임을 명시
- `aria-label="Thread detail"` - 상세 정보임을 명시

### 키보드 네비게이션

- Tab 키로 포커스 이동
- Enter/Space 키로 액션 실행

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- thread 객체 변경 시에만 리렌더링

### 가상화

- 많은 메시지가 있을 경우 `react-virtual` 사용 고려

## 테마 지원

### 다크/라이트 모드

- `bg-muted/20` - 테마에 따라 배경색 자동 변경
- `border-b`, `border-t` - 테마에 따라 테두리 색상 자동 변경

## 관련 파일

- `app/components/thread/ThreadHeader.tsx` - 스레드 헤더
- `app/components/thread/FileAttachment.tsx` - 파일 첨부
- `app/components/thread/ThreadMessageList.tsx` - 메시지 목록
- `app/components/thread/ThreadInput.tsx` - 메시지 입력
- `app/pages/chat/types/types.ts` - Thread 타입 정의
