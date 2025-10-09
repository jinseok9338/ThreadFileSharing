# ChatRoomItem 컴포넌트

## 개요

ChatRoomList에서 사용되는 개별 채팅룸 아이템 컴포넌트입니다. 채팅룸 정보를 표시하고 선택 기능을 제공합니다.

## 목적

- 개별 채팅룸 정보 표시
- 채팅룸 선택 기능
- 읽지 않은 메시지 수 표시
- 마지막 메시지 미리보기
- 참가자 수 표시

## 파일 위치

`packages/frontend/app/components/chat/ChatRoomItem.tsx`

## Props

```typescript
interface ChatRoomItemProps {
  chatRoom: ChatRoom;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}
```

## 내부 구조

### 컴포넌트 구조

```tsx
<Button
  variant={isSelected ? "secondary" : "ghost"}
  className={cn(
    "w-full justify-start p-2 h-auto text-left",
    "hover:bg-accent/50",
    isSelected && "bg-accent text-accent-foreground",
    className
  )}
  onClick={onClick}
>
  <div className="flex items-start space-x-2 w-full text-left">
    {/* 아바타 */}
    <Avatar className="w-8 h-8 flex-shrink-0">
      <AvatarImage src={chatRoom.avatar} alt={chatRoom.name} />
      <AvatarFallback>{chatRoom.name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>

    {/* 채팅룸 정보 */}
    <div className="flex-1 min-w-0 text-left">
      <div className="flex items-center justify-between">
        <BodyTextSmall className="truncate font-medium text-xs flex-1 min-w-0">
          {chatRoom.name}
        </BodyTextSmall>
        <div className="flex items-center space-x-1 flex-shrink-0">
          {chatRoom.unreadCount > 0 ? (
            <Badge variant="destructive" className="text-xs">
              {chatRoom.unreadCount > 99 ? "99+" : chatRoom.unreadCount}
            </Badge>
          ) : (
            <Caption className="text-muted-foreground text-xs">
              {formatTime(chatRoom.lastMessage?.createdAt, currentLanguage)}
            </Caption>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <BodyTextSmall className="text-muted-foreground truncate text-xs flex-1 min-w-0">
          {chatRoom.lastMessage?.content &&
          chatRoom.lastMessage.content.length > 10
            ? `${chatRoom.lastMessage.content.substring(0, 10)}...`
            : chatRoom.lastMessage?.content || t("chat.noMessages")}
        </BodyTextSmall>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Users className="w-3 h-3 text-muted-foreground" />
          <Caption className="text-muted-foreground text-xs">
            {chatRoom.participantCount}
          </Caption>
        </div>
      </div>
    </div>
  </div>
</Button>
```

## 사용되는 컴포넌트

### Typography 컴포넌트

- `BodyTextSmall` - 채팅룸 이름 (font-medium, text-xs, flex-1 min-w-0 적용)
- `BodyTextSmall` - 마지막 메시지 내용 (text-xs, flex-1 min-w-0 적용)
- `Caption` - 시간 및 참가자 수

### shadcn/ui 컴포넌트

- `Button` - 클릭 가능한 채팅룸 아이템
- `Avatar`, `AvatarImage`, `AvatarFallback` - 채팅룸 아바타
- `Badge` - 읽지 않은 메시지 수 표시

### 외부 라이브러리

- `Users` - lucide-react 아이콘 (참가자 수)
- `cn` - 클래스명 병합 유틸리티

### 유틸리티 함수

- `formatTime` - 글로벌 시간 포맷팅 함수 (dayjs 기반)

## 스타일링

### 컨테이너 스타일

- `w-full justify-start p-2 h-auto text-left` - 전체 폭, 왼쪽 정렬, 8px 패딩, 텍스트 왼쪽 정렬
- `hover:bg-accent/50` - 호버 시 반투명 배경

### 선택 상태 스타일

- `bg-accent text-accent-foreground` - 선택 시 강조 색상
- `variant="secondary"` - 선택된 상태

### 비선택 상태 스타일

- `variant="ghost"` - 투명 배경
- 기본 텍스트 색상

### 아바타 스타일

- `w-10 h-10 flex-shrink-0` - 40px × 40px, 축소 방지

### 텍스트 스타일

- 채팅룸 이름: `BodyTextSmall` 컴포넌트 + `truncate font-medium text-xs flex-1 min-w-0`
- 마지막 메시지: `BodyTextSmall` 컴포넌트 + `text-muted-foreground truncate text-xs flex-1 min-w-0`
- 시간 및 참가자 수: `Caption` 컴포넌트 + `text-muted-foreground`

### 읽지 않은 메시지 표시 로직

- **새 메시지가 있을 때**: 시간 대신 읽지 않은 메시지 수 배지 표시
- **새 메시지가 없을 때**: 시간 표시
- **배지 표시**: `unreadCount > 0`일 때만 표시
- **시간 표시**: `unreadCount === 0`일 때만 표시

### 배지 스타일

- `variant="destructive"` - 빨간색 배경
- `text-xs` - 작은 텍스트

## 상태 관리

### Props 기반 상태

- `chatRoom` - 채팅룸 데이터
- `isSelected` - 선택 상태

### 내부 상태

- 현재는 내부 상태 없음
- 모든 상태는 props로 제어

## 인터랙션

### 클릭 이벤트

- 클릭 시 `onClick` 콜백 호출
- 부모 컴포넌트에서 채팅룸 선택 처리

### 호버 효과

- 마우스 오버 시 배경색 변경
- 부드러운 전환 애니메이션

## 유틸리티 함수

### 시간 포맷팅

글로벌 `formatTime` 함수를 사용합니다:

```typescript
import { formatTime } from "~/utils/time";

// 사용 예시
const timeString = formatTime(chatRoom.lastMessage?.timestamp, "ko");
```

#### formatTime 함수 특징:

- **dayjs 기반**: 정확하고 가벼운 날짜/시간 라이브러리
- **다국어 지원**: 한국어/영어 로케일 지원
- **상대적 시간**: "방금", "5분 전", "2시간 전", "3일 전" 등
- **자동 로케일**: 현재 언어 설정에 따라 자동 적용

#### 지원하는 시간 단위:

- 1분 미만: "방금" / "just now"
- 1시간 미만: "5분 전" / "5m ago"
- 24시간 미만: "2시간 전" / "2h ago"
- 7일 미만: "3일 전" / "3d ago"
- 1년 미만: "2개월 전" / "2mo ago"
- 1년 이상: "1년 전" / "1y ago"

## 접근성

### 키보드 네비게이션

- Tab으로 포커스 가능
- Enter/Space로 선택

### 스크린 리더 지원

- `aria-selected` 속성으로 선택 상태 표시
- 채팅룸 이름을 버튼 텍스트로 제공

### 포커스 관리

- 포커스 시 명확한 시각적 피드백
- 키보드 네비게이션 순서 고려

## 성능 최적화

### 렌더링 최적화

- `memo` 사용으로 불필요한 리렌더링 방지
- 시간 포맷팅 결과 메모이제이션

### 텍스트 잘림

- `truncate` 클래스로 긴 텍스트 처리
- `min-w-0`으로 flex 아이템 축소 허용

## 테마 지원

### Light/Dark 테마

- CSS 변수를 통한 자동 테마 적용
- `bg-accent`, `text-muted-foreground` 등 사용

### 색상 변화

- 선택된 아이템: 강조 색상
- 읽지 않은 메시지: 빨간색 배지

## 사용 예시

### 기본 사용법

```tsx
import { formatTime } from "~/utils/time";

<ChatRoomItem
  chatRoom={chatRoom}
  isSelected={selectedId === chatRoom.id}
  onClick={() => onSelect(chatRoom.id)}
/>;
```

### ChatRoomList에서 사용

```tsx
{
  chatRooms?.map((room) => (
    <ChatRoomItem
      key={room.id}
      chatRoom={room}
      isSelected={selectedChatRoomId === room.id}
      onClick={() => onChatRoomSelect?.(room.id)}
    />
  ));
}
```

## 테스트 시나리오

### 기본 렌더링

1. 채팅룸 이름이 올바르게 표시되는지 확인
2. 아바타가 표시되는지 확인
3. 마지막 메시지와 시간이 표시되는지 확인

### 선택 상태

1. `isSelected` prop에 따른 스타일 변화 확인
2. 선택된 아이템이 시각적으로 구분되는지 확인

### 읽지 않은 메시지

1. 읽지 않은 메시지가 있을 때 배지가 표시되는지 확인
2. 99개 이상일 때 "99+" 표시되는지 확인
3. 읽지 않은 메시지가 없을 때 배지가 숨겨지는지 확인

### 인터랙션

1. 클릭 시 `onClick` 콜백이 호출되는지 확인
2. 호버 효과가 작동하는지 확인
3. 키보드 네비게이션이 작동하는지 확인

### 접근성

1. 스크린 리더에서 선택 상태를 인식하는지 확인
2. 키보드만으로 선택 가능한지 확인
3. 포커스 표시가 명확한지 확인

### 시간 포맷팅

1. 다양한 시간대에서 올바르게 포맷팅되는지 확인
2. "방금", "분 전", "시간 전" 등이 올바르게 표시되는지 확인
