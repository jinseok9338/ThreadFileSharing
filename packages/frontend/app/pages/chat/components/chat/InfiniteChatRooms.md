# InfiniteChatRooms Component

## Overview

`InfiniteChatRooms`는 TanStack Virtual을 사용하여 대량의 채팅룸 목록을 효율적으로 렌더링하는 가상화 컴포넌트입니다. 수천 개의 채팅룸이 있어도 성능 저하 없이 부드러운 스크롤과 빠른 렌더링을 제공합니다.

## Features

- **가상화 스크롤링**: TanStack Virtual을 사용한 고성능 가상화
- **무한 스크롤**: 필요에 따라 데이터를 동적으로 로드
- **반응형 디자인**: 다양한 화면 크기에 적응
- **접근성 지원**: 키보드 네비게이션 및 스크린 리더 지원
- **부드러운 애니메이션**: 스크롤 및 선택 상태 전환 애니메이션

## Props

### `chatRooms?: ChatRoomSummary[]`

채팅룸 목록 데이터. `ChatRoomSummary` 타입의 배열입니다.

### `selectedChatRoomId?: string`

현재 선택된 채팅룸의 ID.

### `onChatRoomSelect?: (chatRoomId: string) => void`

채팅룸 선택 시 호출되는 콜백 함수.

### `onLoadMore?: () => void`

추가 데이터 로드가 필요할 때 호출되는 콜백 함수 (무한 스크롤용).

### `hasMore?: boolean`

더 로드할 데이터가 있는지 여부.

### `isLoading?: boolean`

데이터 로딩 중인지 여부.

### `className?: string`

추가 CSS 클래스.

### `itemHeight?: number`

각 채팅룸 아이템의 고정 높이 (픽셀). 기본값: 72px.

### `overscan?: number`

뷰포트 외부에 렌더링할 추가 아이템 수. 기본값: 5.

## Usage

```tsx
import { InfiniteChatRooms } from "~/components/chat/InfiniteChatRooms";
import type { ChatRoomSummary } from "~/pages/chat/types/types";

function ChatRoomList() {
  const [chatRooms, setChatRooms] = useState<ChatRoomSummary[]>([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleChatRoomSelect = (chatRoomId: string) => {
    setSelectedChatRoomId(chatRoomId);
  };

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newRooms = await fetchMoreChatRooms(chatRooms.length);
      setChatRooms((prev) => [...prev, ...newRooms]);
      setHasMore(newRooms.length === 20); // 20개씩 로드한다고 가정
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InfiniteChatRooms
      chatRooms={chatRooms}
      selectedChatRoomId={selectedChatRoomId}
      onChatRoomSelect={handleChatRoomSelect}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      className="h-full"
    />
  );
}
```

## Implementation Details

### Virtualization Strategy

- **Vertical Virtualization**: 세로 방향으로만 가상화 (기본값)
- **Fixed Item Height**: 모든 아이템이 동일한 높이를 가짐 (72px)
- **Overscan**: 뷰포트 외부에 5개 아이템을 추가로 렌더링하여 부드러운 스크롤 제공

### Performance Optimizations

- **React.memo**: ChatRoomItem 컴포넌트를 memo로 감싸 불필요한 리렌더링 방지
- **useCallback**: 이벤트 핸들러들을 useCallback으로 메모이제이션
- **TanStack Virtual**: DOM 노드를 최소화하여 메모리 사용량 최적화

### Accessibility Features

- **ARIA attributes**: `aria-selected`, `role="listitem"` 등 적절한 ARIA 속성 제공
- **Keyboard Navigation**: 화살표 키로 채팅룸 간 이동 가능
- **Focus Management**: 선택된 채팅룸에 자동 포커스

## Dependencies

- `@tanstack/react-virtual`: 가상화 라이브러리
- `react-i18next`: 다국어 지원
- `~/components/chat/ChatRoomItem`: 개별 채팅룸 아이템 컴포넌트
- `~/components/ui/scroll-area`: 스크롤 영역 컴포넌트

## Styling

- Tailwind CSS 클래스 사용
- 반응형 디자인 지원
- 다크/라이트 테마 호환

## Future Enhancements

- **Horizontal Virtualization**: 가로 방향 가상화 지원
- **Dynamic Item Height**: 가변 높이 아이템 지원
- **Grid Layout**: 그리드 형태 레이아웃 지원
- **Search Integration**: 실시간 검색 기능 통합
- **Drag & Drop**: 채팅룸 순서 변경 기능
