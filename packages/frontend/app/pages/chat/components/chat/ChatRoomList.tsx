import { Button } from "~/components/ui/button";
import { BodyText } from "~/components/typography";
import { Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { InfiniteChatRooms } from "./InfiniteChatRooms";
import type { ChatRoomSummary } from "~/pages/chat/types/types";

interface ChatRoomListProps {
  className?: string;
}

export function ChatRoomList({ className }: ChatRoomListProps) {
  const { t } = useTranslation();
  const handleCreateNewRoom = () => {
    console.log("create new room");
  };

  return (
    <div className={cn("h-full flex flex-col bg-transparent", className)}>
      {/* 헤더 */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <BodyText className="text-muted-foreground font-medium text-xs">
            {t("chat.rooms")}
          </BodyText>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCreateNewRoom}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 채팅룸 목록 - InfiniteChatRooms 사용 */}
      <InfiniteChatRooms className="flex-1" />
    </div>
  );
}
