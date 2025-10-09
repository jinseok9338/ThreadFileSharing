import API, { getResponseData } from "~/api/ky";

export interface ChatRoomsListResponse {
  status: string;
  timestamp: Date;
  data: ChatRoomsList;
}

export interface ChatRoomsList {
  items: ChatRoomSummary[];
  pagination: Pagination;
}

export interface ChatRoomSummary {
  id: string;
  companyId: string;
  name: string;
  description: string;
  avatarUrl: string;
  isPrivate: boolean;
  createdBy: string;
  creator: Creator;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Creator {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
}

export interface Pagination {
  hasNext: boolean;
  nextIndex: Date;
  limit: number;
}

/**
 * WebSocket에서 오는 실시간 데이터 (chatroomId별로 관리)
 */
export interface ChatRoomRealtimeData {
  chatroomId: string;
  lastMessage?: {
    id: string;
    content: string;
    senderName: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

/**
 * UI에서 사용할 병합된 타입
 * API 데이터 + WebSocket 실시간 데이터
 */
export interface ChatRoomWithRealtime extends ChatRoomSummary {
  lastMessage?: ChatRoomRealtimeData["lastMessage"];
  unreadCount: number;
}

export const getChatRooms = async ({
  limit = 20,
  lastIndex,
}: {
  limit?: number;
  lastIndex?: string;
}) => {
  const response = await API.get<ChatRoomsListResponse>("chatrooms", {
    searchParams: {
      limit,
      lastIndex,
    },
  });
  const result = await response.json();
  const data = getResponseData<ChatRoomsList>(result);
  return data;
};
