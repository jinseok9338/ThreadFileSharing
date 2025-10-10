import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { BodyText } from "~/components/typography";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { ChatRoomItem } from "./ChatRoomItem";
import { ChatRoomListEmpty } from "./ChatRoomListEmpty";
import { ChatRoomListLoading } from "./ChatRoomListLoading";
import { ChatRoomListError } from "./ChatRoomListError";
import { ChatRoomListLoader } from "./ChatRoomListLoader";
import { useGetChatRoomsList } from "../../hooks/getChatRoomsList";
import { useChatRoomRealtimeSocket } from "../../hooks/useChatRoomRealtimeSocket";
import {
  mergeChatRoomData,
  sortChatRoomsByLastMessage,
} from "../../utils/mergeChatRoomData";
import { useQueryState } from "~/lib/nuqs/useQueryState";
import { SELECTED_CHATROOM_ID } from "~/constants/queryStrings";
import { parseAsString } from "~/lib/nuqs/parsers";

interface InfiniteChatRoomsProps {
  className?: string;
  itemHeight?: number;
  overscan?: number;
}

export function InfiniteChatRooms({
  className,
  itemHeight = 72,
  overscan = 5,
}: InfiniteChatRoomsProps) {
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement>(null);

  // 1️⃣ API 데이터 (무한 스크롤)
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetChatRoomsList();

  // URL 쿼리 스트링으로 선택된 채팅룸 관리
  const [selectedChatRoomId, setSelectedChatRoomId] = useQueryState(
    SELECTED_CHATROOM_ID.key,
    parseAsString.withDefault(SELECTED_CHATROOM_ID.defaultValue)
  );

  // API 데이터를 flat하게 병합
  const apiChatRooms = data ? data.pages.flatMap((page) => page.items) : [];

  // 2️⃣ WebSocket 실시간 데이터
  const chatroomIds = apiChatRooms.map((room) => room?.id);
  const realtimeDataMap = useChatRoomRealtimeSocket(chatroomIds);

  // 3️⃣ 두 데이터 병합 + 정렬
  const merged = mergeChatRoomData(apiChatRooms, realtimeDataMap);
  const allChatRooms = sortChatRoomsByLastMessage(merged);

  // TanStack Virtual 설정
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allChatRooms.length + 1 : allChatRooms.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  // 마지막 가상 아이템을 감지하여 자동으로 다음 페이지 로드
  const virtualItems = rowVirtualizer.getVirtualItems();
  const lastVirtualItem = virtualItems[virtualItems.length - 1];

  if (
    lastVirtualItem &&
    lastVirtualItem.index >= allChatRooms.length - 1 &&
    hasNextPage &&
    !isFetchingNextPage
  ) {
    fetchNextPage();
  }

  // 로딩 상태
  if (status === "pending") {
    return <ChatRoomListLoading className={className} />;
  }

  // 에러 상태
  if (status === "error") {
    return <ChatRoomListError error={error} className={className} />;
  }

  // 빈 상태
  if (!allChatRooms.length) {
    return <ChatRoomListEmpty className={className} />;
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* 스크롤 가능한 영역 */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{
          contain: "strict",
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* 가상화된 아이템들 렌더링 */}
          {virtualItems.map((virtualItem) => {
            const isLoaderRow = virtualItem.index > allChatRooms.length - 1;
            const chatRoom = allChatRooms[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isLoaderRow ? (
                  <ChatRoomListLoader hasNextPage={!!hasNextPage} />
                ) : (
                  <div className="p-1">
                    <ChatRoomItem
                      chatRoom={chatRoom}
                      isSelected={selectedChatRoomId === chatRoom.id}
                      onClick={() => setSelectedChatRoomId(chatRoom.id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 백그라운드 업데이트 표시 */}
      {isFetching && !isFetchingNextPage && (
        <div className="p-2 text-center border-t bg-muted/30">
          <BodyText className="text-muted-foreground text-xs">
            {t("common.updating")}
          </BodyText>
        </div>
      )}
    </div>
  );
}
