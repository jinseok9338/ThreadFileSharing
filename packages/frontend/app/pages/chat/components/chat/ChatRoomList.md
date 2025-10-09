# ChatRoomList 컴포넌트

## 개요

중간 패널에 위치하는 채팅룸 목록 컴포넌트입니다. 사용자가 참여한 채팅룸들을 표시하고, 선택할 수 있는 기능을 제공합니다.

## 목적

- 채팅룸 목록 표시 및 관리
- 채팅룸 선택 기능
- 새 채팅룸 생성 버튼
- 검색 및 필터링 기능 (향후)
- 실시간 업데이트 (향후)

## 파일 위치

`packages/frontend/app/components/chat/ChatRoomList.tsx`

## Props

```typescript
interface ChatRoomListProps {
  chatRooms?: ChatRoom[];
  selectedChatRoomId?: string;
  onChatRoomSelect?: (chatRoomId: string) => void;
  onCreateNewRoom?: () => void;
  className?: string;
}
```

## 내부 구조

### 컴포넌트 구조

```tsx
<div className={cn("h-full flex flex-col bg-background", className)}>
  {/* 헤더 */}
  <div className="p-3 border-b">
    <div className="flex items-center justify-between">
      <BodyText className="text-muted-foreground font-medium text-xs">
        {t("chat.rooms")}
      </BodyText>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCreateNewRoom}
        className="h-6 w-6 p-0"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  </div>

  {/* 채팅룸 목록 */}
  <ScrollArea className="flex-1">
    <div className="p-1 space-y-0.5">
      {chatRooms?.map((room) => (
        <ChatRoomItem
          key={room.id}
          chatRoom={room}
          isSelected={selectedChatRoomId === room.id}
          onClick={() => onChatRoomSelect?.(room.id)}
        />
      ))}
    </div>
  </ScrollArea>

  {/* 빈 상태 */}
  {!chatRooms?.length && (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
      <BodyText className="text-muted-foreground mb-2 font-medium text-xs">
        {t("chat.noRooms")}
      </BodyText>
      <p className="text-xs text-muted-foreground mb-4 text-center">
        {t("chat.createFirstRoom")}
      </p>
      <Button onClick={onCreateNewRoom} variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        {t("chat.createRoom")}
      </Button>
    </div>
  )}
</div>
```

## 사용되는 컴포넌트

### Typography 컴포넌트

- `BodyText` - 헤더 텍스트 (font-medium, text-xs 적용)

### shadcn/ui 컴포넌트

- `Button` - 새 채팅룸 생성 버튼
- `ScrollArea` - 채팅룸 목록 스크롤 영역

### 외부 라이브러리

- `Plus`, `MessageSquare` - lucide-react 아이콘
- `cn` - 클래스명 병합 유틸리티

### 커스텀 컴포넌트

- `ChatRoomItem` - 개별 채팅룸 아이템

### Lucide 아이콘

- `Plus` - 새 채팅룸 생성 버튼 아이콘
- `MessageSquare` - 빈 상태 아이콘

## 스타일링

### 컨테이너 스타일

- `h-full flex flex-col` - 전체 높이, 세로 정렬
- `bg-background` - 배경색

### 헤더 스타일

- `p-4 border-b` - 16px 패딩, 하단 테두리
- `flex items-center justify-between` - 양쪽 정렬

### 목록 스타일

- `flex-1` - 남은 공간 모두 사용
- `p-2 space-y-1` - 8px 패딩, 아이템 간 간격

### 버튼 스타일

- `size="sm" variant="ghost"` - 작은 크기, 투명 배경
- `w-4 h-4` - 16px 아이콘 크기

## 상태 관리

### Props 기반 상태

- `chatRooms` - 채팅룸 목록 데이터
- `selectedChatRoomId` - 현재 선택된 채팅룸 ID

### 내부 상태

- 현재는 내부 상태 없음
- 모든 상태는 props로 제어

### Mock 데이터 (개발용)

```typescript
const mockChatRooms: ChatRoom[] = [
  {
    id: "1",
    name: "일반 채팅",
    type: "group",
    lastMessage: {
      content: "안녕하세요!",
      timestamp: new Date(),
      user: { id: "1", displayName: "김철수" },
    },
    unreadCount: 2,
    participants: 5,
  },
  {
    id: "2",
    name: "프로젝트 팀",
    type: "group",
    lastMessage: {
      content: "파일을 공유했습니다",
      timestamp: new Date(),
      user: { id: "2", displayName: "이영희" },
    },
    unreadCount: 0,
    participants: 8,
  },
];
```

## 인터랙션

### 채팅룸 선택

- 클릭 시 `onChatRoomSelect` 콜백 호출
- 선택된 채팅룸 시각적 표시

### 새 채팅룸 생성

- Plus 버튼 클릭 시 `onCreateNewRoom` 콜백 호출
- 빈 상태에서도 동일한 액션 제공

### 스크롤

- 긴 목록에서 스크롤 가능
- 부드러운 스크롤 애니메이션

## 접근성

### 키보드 네비게이션

- Tab으로 채팅룸 간 이동
- Enter/Space로 선택
- 화살표 키로 네비게이션 (향후)

### 스크린 리더 지원

- `role="list"` - 목록 역할
- `aria-label` - 목록 설명
- 각 아이템에 `aria-selected` 속성

### 포커스 관리

- 포커스 시 명확한 시각적 피드백
- 키보드 네비게이션 순서 고려

## 성능 최적화

### 렌더링 최적화

- `memo` 사용으로 불필요한 리렌더링 방지
- `useMemo`로 필터링된 목록 메모이제이션

### 가상화 (향후)

- `@tanstack/react-virtual` 사용
- 대량의 채팅룸에서 성능 최적화

## 테마 지원

### Light/Dark 테마

- CSS 변수를 통한 자동 테마 적용
- `bg-background`, `text-muted-foreground` 등 사용

### 색상 변화

- 선택된 아이템: 강조 색상
- 호버 효과: 반투명 배경

## 사용 예시

### 기본 사용법

```tsx
<ChatRoomList
  chatRooms={chatRooms}
  selectedChatRoomId={selectedId}
  onChatRoomSelect={handleSelect}
  onCreateNewRoom={handleCreate}
/>
```

### MainLayout에서 사용

```tsx
<ResizablePanel defaultSize={320} minSize={60} maxSize={500}>
  <ChatRoomList
    chatRooms={chatRooms}
    selectedChatRoomId={selectedChatRoomId}
    onChatRoomSelect={setSelectedChatRoomId}
    onCreateNewRoom={handleCreateRoom}
  />
</ResizablePanel>
```

## 테스트 시나리오

### 기본 렌더링

1. 채팅룸 목록이 올바르게 표시되는지 확인
2. 헤더와 새 채팅룸 버튼이 표시되는지 확인
3. 스크롤 영역이 올바르게 작동하는지 확인

### 빈 상태

1. 채팅룸이 없을 때 EmptyState가 표시되는지 확인
2. 빈 상태에서 새 채팅룸 생성 버튼이 작동하는지 확인

### 채팅룸 선택

1. 채팅룸 클릭 시 선택되는지 확인
2. 선택된 채팅룸이 시각적으로 구분되는지 확인
3. `onChatRoomSelect` 콜백이 호출되는지 확인

### 인터랙션

1. 새 채팅룸 버튼 클릭 시 `onCreateNewRoom` 콜백 호출 확인
2. 키보드 네비게이션이 작동하는지 확인
3. 스크롤이 부드럽게 작동하는지 확인

### 접근성

1. 스크린 리더에서 목록 구조를 인식하는지 확인
2. 키보드만으로 모든 기능에 접근 가능한지 확인
3. 포커스 표시가 명확한지 확인

### 성능

1. 많은 채팅룸에서도 렌더링이 빠른지 확인
2. 스크롤 성능이 부드러운지 확인
3. 메모리 사용량이 적절한지 확인
