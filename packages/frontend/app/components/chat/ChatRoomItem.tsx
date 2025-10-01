import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { BodyTextSmall, Caption } from "~/components/typography";
import { Users } from "lucide-react";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { formatTime } from "~/utils/time";
import type { ChatRoomSummary } from "~/pages/chat/types/types";

interface ChatRoomItemProps {
  chatRoom: ChatRoomSummary;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ChatRoomItem({
  chatRoom,
  isSelected = false,
  onClick,
  className,
}: ChatRoomItemProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.split("-")[0];

  return (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start p-2 h-auto text-left",
        "hover:bg-accent/50",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={onClick}
      aria-selected={isSelected}
    >
      <div className="flex items-start space-x-2 w-full text-left">
        {/* 아바타 */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={undefined} alt={chatRoom.name} />
          <AvatarFallback>
            {chatRoom.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* 채팅룸 정보 */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between">
            <BodyTextSmall className="truncate font-medium text-xs flex-1 min-w-0">
              {chatRoom.name}
            </BodyTextSmall>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {chatRoom.unreadCount > 0 ? (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  {chatRoom.unreadCount > 99 ? "99+" : chatRoom.unreadCount}
                </Badge>
              ) : (
                <Caption className="text-muted-foreground text-xs">
                  {formatTime(chatRoom.lastMessage?.createdAt, currentLanguage)}
                </Caption>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <BodyTextSmall className="text-muted-foreground truncate text-xs flex-1 min-w-0">
              {chatRoom.lastMessage?.content &&
              chatRoom.lastMessage.content.length > 20
                ? `${chatRoom.lastMessage.content.substring(0, 20)}...`
                : chatRoom.lastMessage?.content || "No messages"}
            </BodyTextSmall>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Users className="w-3 h-3 text-muted-foreground" />
              <Caption className="text-muted-foreground text-xs">
                {chatRoom.participantCount}
              </Caption>
            </div>
          </div>
        </div>
      </div>
    </Button>
  );
}
