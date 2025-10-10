import { useQuery } from "@tanstack/react-query";
import { getChatRoomDetail } from "../services/api";

export const CHAT_ROOM_DETAIL_KEY = "chatRoomDetail";

export const useGetChatRoomDetail = (chatRoomId: string) => {
  return useQuery({
    queryKey: [CHAT_ROOM_DETAIL_KEY, chatRoomId],
    queryFn: () => getChatRoomDetail({ chatRoomId }),
  });
};
