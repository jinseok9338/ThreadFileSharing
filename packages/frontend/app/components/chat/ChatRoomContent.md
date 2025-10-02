# ChatRoomContent Component

**Purpose**: Main chat room content container that displays messages, handles message input, and shows typing indicators.

## 컴포넌트 목적

선택된 채팅룸의 메시지들을 표시하고, 새 메시지 입력을 처리하며, 타이핑 인디케이터를 보여주는 메인 채팅 영역입니다. ChatRoomList에서 선택된 채팅룸의 모든 메시지 관련 기능을 담당합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────────────────────┐
│ Chat Room Header                                        │
│ - Room Name, Participants, Status                      │
├─────────────────────────────────────────────────────────┤
│ Message List Area                                       │
│ - Scrollable message list                              │
│ - Virtual scrolling for performance                    │
├─────────────────────────────────────────────────────────┤
│ Typing Indicator (when users are typing)               │
├─────────────────────────────────────────────────────────┤
│ Message Input Area                                      │
│ - Text input with emoji support                        │
│ - File upload button                                    │
│ - Send button                                           │
└─────────────────────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-full flex flex-col bg-background">
  {/* Chat Room Header */}
  <div className="p-4 border-b">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={chatRoom.avatar} alt={chatRoom.name} />
          <AvatarFallback>{chatRoom.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <Heading3>{chatRoom.name}</Heading3>
          <BodyTextSmall className="text-muted-foreground">
            {participantCount} participants
          </BodyTextSmall>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Users className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>

  {/* Message List */}
  <div className="flex-1 overflow-hidden">
    <MessageList messages={messages} selectedChatRoomId={selectedChatRoomId} />
  </div>

  {/* Typing Indicator */}
  {typingUsers.length > 0 && (
    <div className="px-4 py-2 border-t">
      <TypingIndicator users={typingUsers} />
    </div>
  )}

  {/* Message Input */}
  <div className="p-4 border-t">
    <MessageInput
      onSendMessage={handleSendMessage}
      onFileUpload={handleFileUpload}
      disabled={!selectedChatRoomId}
    />
  </div>
</div>
```

## Props Interface

```tsx
interface ChatRoomContentProps {
  selectedChatRoomId?: string;
  chatRoom?: ChatRoom;
  messages?: Message[];
  typingUsers?: TypingUser[];
  onSendMessage?: (message: string) => void;
  onFileUpload?: (files: File[]) => void;
  onParticipantClick?: (participantId: string) => void;
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `Avatar`, `AvatarImage`, `AvatarFallback` - 채팅룸 아바타
- `Button` - 액션 버튼들
- `Heading3` - 채팅룸 이름
- `BodyTextSmall` - 참여자 수 표시
- `MessageList` - 메시지 목록
- `TypingIndicator` - 타이핑 인디케이터
- `MessageInput` - 메시지 입력

### 의존성

- `~/components/ui/avatar` - 아바타 컴포넌트
- `~/components/ui/button` - 버튼 컴포넌트
- `~/components/typography` - 타이포그래피
- `~/components/chat/MessageList` - 메시지 목록
- `~/components/chat/TypingIndicator` - 타이핑 인디케이터
- `~/components/chat/MessageInput` - 메시지 입력
- `lucide-react` - 아이콘들

## 상태 관리

### 로컬 상태

```tsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Props로 받는 상태

- `selectedChatRoomId` - 현재 선택된 채팅룸 ID
- `chatRoom` - 채팅룸 정보
- `messages` - 메시지 목록
- `typingUsers` - 타이핑 중인 사용자들

## 이벤트 핸들러

```tsx
const handleSendMessage = (message: string) => {
  onSendMessage?.(message);
};

const handleFileUpload = (files: File[]) => {
  onFileUpload?.(files);
};

const handleParticipantClick = (participantId: string) => {
  onParticipantClick?.(participantId);
};
```

## 스타일링

### 컨테이너 스타일

- `h-full flex flex-col bg-background` - 전체 높이, 세로 flex, 배경색

### 헤더 스타일

- `p-4 border-b` - 패딩, 하단 테두리
- `flex items-center justify-between` - 가로 배치, 양쪽 정렬

### 메시지 영역 스타일

- `flex-1 overflow-hidden` - 남은 공간 차지, 오버플로우 숨김

### 입력 영역 스타일

- `p-4 border-t` - 패딩, 상단 테두리

## 빈 상태 처리

```tsx
{!selectedChatRoomId ? (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
      <Heading3 className="text-muted-foreground mb-2">
        채팅룸을 선택해주세요
      </Heading3>
      <BodyText className="text-muted-foreground">
        왼쪽에서 채팅룸을 선택하면 메시지를 볼 수 있습니다
      </BodyText>
    </div>
  </div>
) : (
  // 메시지 콘텐츠
)}
```

## 로딩 상태 처리

```tsx
{isLoading ? (
  <div className="flex-1 flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <BodyText className="text-muted-foreground">메시지 로딩 중...</BodyText>
    </div>
  </div>
) : (
  // 메시지 목록
)}
```

## 에러 상태 처리

```tsx
{
  error && (
    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <BodyText className="text-destructive">{error}</BodyText>
      </div>
    </div>
  );
}
```

## 다국어 지원

### 사용되는 키

- `chat.selectRoom` - "채팅룸을 선택해주세요"
- `chat.selectRoomDescription` - "왼쪽에서 채팅룸을 선택하면 메시지를 볼 수 있습니다"
- `chat.participants` - "참여자"
- `chat.loadingMessages` - "메시지 로딩 중..."

## 접근성

### ARIA 속성

- `aria-label` - 채팅룸 헤더
- `role="main"` - 메인 콘텐츠 영역
- `aria-live="polite"` - 타이핑 인디케이터

### 키보드 네비게이션

- Tab 키로 버튼들 순차 이동
- Enter 키로 메시지 전송
- Escape 키로 파일 업로드 취소

## 성능 최적화

### 가상화

- `@tanstack/react-virtual` 사용하여 메시지 목록 가상화
- 대량의 메시지에서도 부드러운 스크롤

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- `useMemo`로 메시지 목록 메모이제이션

## 사용 예시

```tsx
<ChatRoomContent
  selectedChatRoomId={selectedChatRoomId}
  chatRoom={currentChatRoom}
  messages={messages}
  typingUsers={typingUsers}
  onSendMessage={handleSendMessage}
  onFileUpload={handleFileUpload}
  onParticipantClick={handleParticipantClick}
/>
```

## 향후 개선사항

1. **메시지 검색**: 메시지 내 검색 기능
2. **메시지 필터링**: 날짜, 사용자별 필터
3. **메시지 고정**: 중요 메시지 고정 기능
4. **반응형 디자인**: 모바일 환경 최적화
5. **접근성 개선**: 스크린 리더 지원 강화

## 관련 파일

- `app/pages/main/index.tsx` - 메인 페이지에서 사용
- `app/components/chat/MessageList.tsx` - 메시지 목록 컴포넌트
- `app/components/chat/MessageInput.tsx` - 메시지 입력 컴포넌트
- `app/components/chat/TypingIndicator.tsx` - 타이핑 인디케이터
- `app/pages/chat/types/types.ts` - 타입 정의
