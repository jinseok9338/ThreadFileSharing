import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatRoomMessages } from "../services/api";
import type { ChatRoomMessagesResult } from "../services/api";

export const CHAT_ROOM_MESSAGES_QUERY_KEY = "chatRoomMessages";

interface UseGetChatRoomMessagesParams {
  chatRoomId: string;
  limit?: number;
}

/**
 * 채팅룸 메시지를 cursor 기반 무한 스크롤로 가져오는 Hook
 */
const useGetChatRoomMessages = ({
  chatRoomId,
  limit = 20,
}: UseGetChatRoomMessagesParams) => {
  return useInfiniteQuery<ChatRoomMessagesResult, Error>({
    queryKey: [CHAT_ROOM_MESSAGES_QUERY_KEY, chatRoomId],
    queryFn: ({ pageParam }) =>
      getChatRoomMessages({
        chatRoomId,
        limit,
        lastIndex: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasNext) {
        return lastPage?.pagination?.nextIndex;
      }
      return undefined;
    },
    enabled: !!chatRoomId,
  });
};

export default useGetChatRoomMessages;
