import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useSocket } from "~/hooks/useSocket";
import {
  ClientToServerEvent,
  ServerToClientEvent,
} from "../types/websocket-events.enum";
import type { ChatRoomRealtimeData } from "../services/api";

export const CHAT_ROOM_REALTIME_KEY = "chatRoomRealtimeData";

/**
 * WebSocket으로 채팅룸 실시간 데이터 관리
 * - lastMessage: 마지막 메시지 정보
 * - unreadCount: 읽지 않은 메시지 개수
 *
 * @param chatroomIds - 구독할 채팅룸 ID 목록
 * @returns Map<chatroomId, ChatRoomRealtimeData> 형태의 실시간 데이터
 */
export function useChatRoomRealtimeSocket(chatroomIds: string[]) {
  const queryClient = useQueryClient();
  const { socket, isConnected, on, off, emit } = useSocket();
  const prevChatroomIdsRef = useRef<string[]>([]);

  // 실시간 데이터를 TanStack Query로 관리
  const { data: realtimeDataMap = new Map<string, ChatRoomRealtimeData>() } =
    useQuery({
      queryKey: [CHAT_ROOM_REALTIME_KEY],
      queryFn: () => new Map<string, ChatRoomRealtimeData>(),
      staleTime: Infinity, // WebSocket으로만 업데이트되므로 stale 처리 안 함
      gcTime: Infinity, // 가비지 컬렉션 안 함
    });

  // WebSocket 실시간 이벤트 구독
  useEffect(() => {
    if (!socket) return;

    // 1. 채팅룸 실시간 데이터 업데이트 (메시지 수신 등)
    const handleChatroomRealtimeUpdated = (data: ChatRoomRealtimeData) => {
      queryClient.setQueryData<Map<string, ChatRoomRealtimeData>>(
        [CHAT_ROOM_REALTIME_KEY],
        (oldMap = new Map()) => {
          const newMap = new Map(oldMap);
          newMap.set(data.chatroomId, data);
          return newMap;
        }
      );
    };

    // 2. 메시지 읽음 처리
    const handleMessagesRead = (data: {
      chatroomId: string;
      userId: string;
    }) => {
      queryClient.setQueryData<Map<string, ChatRoomRealtimeData>>(
        [CHAT_ROOM_REALTIME_KEY],
        (oldMap = new Map()) => {
          const newMap = new Map(oldMap);
          const existing = newMap.get(data.chatroomId);
          if (existing) {
            newMap.set(data.chatroomId, {
              ...existing,
              unreadCount: 0,
            });
          }
          return newMap;
        }
      );
    };

    // 3. 메시지 읽음 확인
    const handleMessagesReadConfirmed = (data: { chatroomId: string }) => {
      // 필요시 추가 처리
      console.log("Messages read confirmed:", data.chatroomId);
    };

    // 이벤트 리스너 등록
    on(
      ServerToClientEvent.CHATROOM_REALTIME_UPDATED,
      handleChatroomRealtimeUpdated
    );
    on(ServerToClientEvent.MESSAGES_READ, handleMessagesRead);
    on(
      ServerToClientEvent.MESSAGES_READ_CONFIRMED,
      handleMessagesReadConfirmed
    );

    return () => {
      off(
        ServerToClientEvent.CHATROOM_REALTIME_UPDATED,
        handleChatroomRealtimeUpdated
      );
      off(ServerToClientEvent.MESSAGES_READ, handleMessagesRead);
      off(
        ServerToClientEvent.MESSAGES_READ_CONFIRMED,
        handleMessagesReadConfirmed
      );
    };
  }, [socket, on, off, queryClient]);

  // 초기 동기화: chatroomIds가 변경될 때마다 서버에 요청
  useEffect(() => {
    if (!isConnected || chatroomIds.length === 0) return;

    // 이전과 다른 ID가 있을 때만 동기화
    const prevIds = new Set(prevChatroomIdsRef.current);
    const newIds = chatroomIds.filter((id) => !prevIds.has(id));

    if (newIds.length === 0) return;

    prevChatroomIdsRef.current = chatroomIds;

    // 서버에 실시간 데이터 동기화 요청
    emit(ClientToServerEvent.SYNC_CHATROOM_REALTIME_DATA, {
      chatroomIds: newIds,
    });

    // 서버 응답 처리
    const handleSynced = (data: ChatRoomRealtimeData[]) => {
      queryClient.setQueryData<Map<string, ChatRoomRealtimeData>>(
        [CHAT_ROOM_REALTIME_KEY],
        (oldMap = new Map()) => {
          const newMap = new Map(oldMap);
          data.forEach((item) => {
            newMap.set(item.chatroomId, item);
          });
          return newMap;
        }
      );
    };

    on(ServerToClientEvent.CHATROOM_REALTIME_DATA_SYNCED, handleSynced);

    return () => {
      off(ServerToClientEvent.CHATROOM_REALTIME_DATA_SYNCED, handleSynced);
    };
  }, [isConnected, chatroomIds, emit, on, off, queryClient]);

  return realtimeDataMap;
}
