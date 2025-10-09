import { useInfiniteQuery } from "@tanstack/react-query";
import { getChatRooms } from "../services/api";
import type { ChatRoomsList, ChatRoomsListResponse } from "../services/api";

export const GET_CHAT_ROOMS_LIST_KEY = "getChatRoomsList";

interface UseGetChatRoomsListOptions {
  limit?: number;
}

/**
 * 채팅룸 목록을 무한 스크롤로 가져오는 hook
 * @param options.limit - 한 번에 가져올 채팅룸 개수 (기본값: 20)
 */
export const useGetChatRoomsList = ({
  limit = 20,
}: UseGetChatRoomsListOptions = {}) => {
  return useInfiniteQuery<ChatRoomsList, Error>({
    queryKey: [GET_CHAT_ROOMS_LIST_KEY, limit],
    queryFn: ({ pageParam }) =>
      getChatRooms({
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
  });
};

export default useGetChatRoomsList;
