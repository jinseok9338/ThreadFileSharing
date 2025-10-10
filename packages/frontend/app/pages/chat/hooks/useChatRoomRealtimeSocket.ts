import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useSocket } from "~/hooks/useSocket";
import { getSocket } from "~/lib/socket";
import {
  ClientToServerEvent,
  ServerToClientEvent,
} from "../types/websocket-events.enum";
import type { ChatRoomRealtimeData } from "../services/api";

export const CHAT_ROOM_REALTIME_KEY = "chatRoomRealtimeData";

/**
 * 채팅룸 실시간 데이터 관리 Hook
 * - TanStack Query로 실시간 데이터 캐싱
 * - WebSocket 이벤트 구독 및 처리
 * - 자동 동기화 및 업데이트
 *
 * @param chatroomIds - 구독할 채팅룸 ID 목록
 * @returns Map<chatroomId, ChatRoomRealtimeData> 형태의 실시간 데이터
 */
export function useChatRoomRealtimeSocket(chatroomIds: string[]) {
  const queryClient = useQueryClient();
  const { isConnected, emit } = useSocket();
  const prevChatroomIdsRef = useRef<string[]>([]);

  // 실시간 데이터를 TanStack Query로 관리
  const { data: realtimeDataMap = new Map<string, ChatRoomRealtimeData>() } =
    useQuery({
      queryKey: [CHAT_ROOM_REALTIME_KEY],
      queryFn: () => new Map<string, ChatRoomRealtimeData>(),
      staleTime: Infinity, // WebSocket으로만 업데이트
      gcTime: Infinity, // 가비지 컬렉션 안 함
    });

  // === 이벤트 핸들러 정의 ===

  // 실시간 데이터 업데이트 헬퍼 함수
  const updateRealtimeData = (
    updater: (
      oldMap: Map<string, ChatRoomRealtimeData>
    ) => Map<string, ChatRoomRealtimeData>
  ) => {
    queryClient.setQueryData<Map<string, ChatRoomRealtimeData>>(
      [CHAT_ROOM_REALTIME_KEY],
      (oldMap = new Map()) => updater(oldMap)
    );
  };

  // 1. 채팅룸 실시간 데이터 업데이트 (메시지 수신 등)
  const handleChatroomRealtimeUpdated = (data: ChatRoomRealtimeData) => {
    updateRealtimeData((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.set(data.chatroomId, data);
      return newMap;
    });
  };

  // 2. 메시지 읽음 처리
  const handleMessagesRead = (data: { chatroomId: string; userId: string }) => {
    updateRealtimeData((oldMap) => {
      const newMap = new Map(oldMap);
      const existing = newMap.get(data.chatroomId);
      if (existing) {
        newMap.set(data.chatroomId, { ...existing, unreadCount: 0 });
      }
      return newMap;
    });
  };

  // 3. 메시지 읽음 확인
  const handleMessagesReadConfirmed = (data: { chatroomId: string }) => {
    // 읽음 확인 처리 (필요시 추가 로직 구현)
  };

  // 4. 초기 동기화 응답 처리
  const handleSynced = (data: ChatRoomRealtimeData[]) => {
    updateRealtimeData((oldMap) => {
      const newMap = new Map(oldMap);
      data.forEach((item) => newMap.set(item.chatroomId, item));
      return newMap;
    });
  };

  // === WebSocket 이벤트 구독 ===
  useEffect(() => {
    const socket = getSocket();

    // 이벤트 리스너 등록

    // 이벤트 리스너 등록 (동기화 응답 포함)
    socket.on(
      ServerToClientEvent.CHATROOM_REALTIME_UPDATED,
      handleChatroomRealtimeUpdated
    );
    socket.on(ServerToClientEvent.MESSAGES_READ, handleMessagesRead);
    socket.on(
      ServerToClientEvent.MESSAGES_READ_CONFIRMED,
      handleMessagesReadConfirmed
    );
    socket.on(ServerToClientEvent.CHATROOM_REALTIME_DATA_SYNCED, handleSynced);

    return () => {
      socket.off(
        ServerToClientEvent.CHATROOM_REALTIME_UPDATED,
        handleChatroomRealtimeUpdated
      );
      socket.off(ServerToClientEvent.MESSAGES_READ, handleMessagesRead);
      socket.off(
        ServerToClientEvent.MESSAGES_READ_CONFIRMED,
        handleMessagesReadConfirmed
      );
      socket.off(
        ServerToClientEvent.CHATROOM_REALTIME_DATA_SYNCED,
        handleSynced
      );
    };
  }, [queryClient]);

  // === 초기 동기화 요청 ===
  useEffect(() => {
    if (!isConnected || chatroomIds.length === 0) {
      return;
    }

    // 이전과 다른 ID가 있을 때만 동기화
    const prevIds = new Set(prevChatroomIdsRef.current);
    const newIds = chatroomIds.filter((id) => !prevIds.has(id));

    if (newIds.length === 0) {
      return;
    }

    prevChatroomIdsRef.current = chatroomIds;

    // 서버에 동기화 요청
    emit(ClientToServerEvent.SYNC_CHATROOM_REALTIME_DATA, {
      chatroomIds: newIds,
    });
  }, [isConnected, chatroomIds, emit, queryClient]);

  return realtimeDataMap;
}
