import type {
  ChatRoomSummary,
  ChatRoomRealtimeData,
  ChatRoomWithRealtime,
} from "../services/api";

/**
 * API 데이터와 WebSocket 실시간 데이터를 병합
 *
 * @param apiData - API에서 가져온 채팅룸 목록
 * @param realtimeDataMap - WebSocket에서 관리하는 실시간 데이터 Map
 * @returns 병합된 채팅룸 목록
 */
export function mergeChatRoomData(
  apiData: ChatRoomSummary[],
  realtimeDataMap: Map<string, ChatRoomRealtimeData>
): ChatRoomWithRealtime[] {
  return apiData.map((room) => {
    const realtimeData = realtimeDataMap.get(room.id);

    return {
      ...room,
      lastMessage: realtimeData?.lastMessage,
      unreadCount: realtimeData?.unreadCount ?? 0,
    };
  });
}

/**
 * lastMessage 시간 기준으로 채팅룸 정렬
 * (최신 메시지가 있는 채팅룸이 위로)
 *
 * @param chatRooms - 정렬할 채팅룸 목록
 * @returns 정렬된 채팅룸 목록
 */
export function sortChatRoomsByLastMessage(
  chatRooms: ChatRoomWithRealtime[]
): ChatRoomWithRealtime[] {
  return [...chatRooms].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.updatedAt;
    const bTime = b.lastMessage?.createdAt || b.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}
