import { Button } from "~/components/ui/button";
import { Avatar } from "~/components/ui/avatar";
import { Heading3, BodyTextSmall } from "~/components/typography";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { Users, MoreVertical, MessageSquare } from "lucide-react";
import type { ChatRoom } from "~/pages/chat/types/types";

interface ChatRoomHeaderProps {
  chatRoom?: ChatRoom;
  onParticipantClick?: () => void;
  onMoreClick?: () => void;
  onToggleThreads?: () => void;
  isThreadsOpen?: boolean;
  className?: string;
}

export function ChatRoomHeader({
  chatRoom,
  onParticipantClick,
  onMoreClick,
  onToggleThreads,
  isThreadsOpen = false,
  className,
}: ChatRoomHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("p-4 border-b", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar
            src={chatRoom?.avatar}
            alt={chatRoom?.name}
            fallback={chatRoom?.name}
            size="md"
            className="w-10 h-10"
          />
          <div>
            <Heading3 className="text-sm">{chatRoom?.name}</Heading3>
            <BodyTextSmall className="text-muted-foreground">
              {chatRoom?.participantCount} {t("chat.participants")}
            </BodyTextSmall>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleThreads}
            className={cn(isThreadsOpen && "bg-accent text-accent-foreground")}
            aria-label={t("chat.toggleThreads")}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onParticipantClick}
            aria-label={t("chat.showParticipants")}
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoreClick}
            aria-label={t("chat.moreOptions")}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
