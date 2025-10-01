import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { BodyText } from "~/components/typography";
import { Plus, MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { ChatRoomItem } from "./ChatRoomItem";
import type { ChatRoomSummary } from "~/pages/chat/types/types";

interface ChatRoomListProps {
  chatRooms?: ChatRoomSummary[];
  selectedChatRoomId?: string;
  onChatRoomSelect?: (chatRoomId: string) => void;
  onCreateNewRoom?: () => void;
  className?: string;
}

// Mock 데이터 (개발용)
const mockChatRooms: ChatRoomSummary[] = [
  {
    id: "1",
    name: "General Chat",
    type: "group",
    lastMessage: {
      id: "msg1",
      content: "Hello!",
      senderName: "John",
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
    },
    participantCount: 5,
    unreadCount: 2,
    isArchived: false,
  },
  {
    id: "2",
    name: "Project Team",
    type: "group",
    lastMessage: {
      id: "msg2",
      content: "File shared",
      senderName: "Jane",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    },
    participantCount: 8,
    unreadCount: 0,
    isArchived: false,
  },
  {
    id: "3",
    name: "Design Team",
    type: "group",
    lastMessage: {
      id: "msg3",
      content: "Please review the new design system",
      senderName: "Mike",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    },
    participantCount: 12,
    unreadCount: 5,
    isArchived: false,
  },
];

export function ChatRoomList({
  chatRooms = mockChatRooms,
  selectedChatRoomId,
  onChatRoomSelect,
  onCreateNewRoom,
  className,
}: ChatRoomListProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* 헤더 */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <BodyText className="text-muted-foreground font-medium text-xs">
            {t("chat.rooms")}
          </BodyText>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCreateNewRoom}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 채팅룸 목록 */}
      <ScrollArea className="flex-1">
        <div className="p-1 space-y-0.5">
          {chatRooms?.map((room) => (
            <ChatRoomItem
              key={room.id}
              chatRoom={room}
              isSelected={selectedChatRoomId === room.id}
              onClick={() => onChatRoomSelect?.(room.id)}
            />
          ))}
        </div>
      </ScrollArea>

      {/* 빈 상태 */}
      {!chatRooms?.length && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
          <BodyText className="text-muted-foreground mb-2 font-medium text-xs">
            {t("chat.noRooms")}
          </BodyText>
          <p className="text-xs text-muted-foreground mb-4 text-left">
            {t("chat.createFirstRoom")}
          </p>
          <Button onClick={onCreateNewRoom} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            {t("chat.createRoom")}
          </Button>
        </div>
      )}
    </div>
  );
}
