import { Button } from "~/components/ui/button";
import { Avatar } from "~/components/ui/avatar";
import { Heading3, BodyTextSmall } from "~/components/typography";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { Users, MoreVertical, MessageSquare } from "lucide-react";
import type { ChatRoom } from "~/pages/chat/types/types";
import type { ChatRoomDetail } from "../../services/api";
import {
  IS_THREADS_OPEN,
  SELECTED_CHATROOM_ID,
} from "~/constants/queryStrings";
import { useQueryState } from "~/lib/nuqs/useQueryState";
import { parseAsBoolean, parseAsString } from "~/lib/nuqs/parsers";
import { useGetChatRoomDetail } from "../../hooks/useGetChatRoomDetail";

interface ChatRoomHeaderProps {}

export function ChatRoomHeader({}: ChatRoomHeaderProps) {
  const { t } = useTranslation();
  const [selectedChatRoomId] = useQueryState(
    SELECTED_CHATROOM_ID.key,
    parseAsString.withDefault(SELECTED_CHATROOM_ID.defaultValue)
  );
  const { data: chatRoom } = useGetChatRoomDetail(selectedChatRoomId);
  const handleParticipantClick = () => {
    console.log("참여자 보기");
  };
  const handleMoreClick = () => {
    console.log("더 많은 옵션");
  };

  const [isThreadsOpen, setIsThreadsOpen] = useQueryState(
    IS_THREADS_OPEN.key,
    parseAsBoolean.withDefault(IS_THREADS_OPEN.defaultValue)
  );
  const handleToggleThreads = () => {
    setIsThreadsOpen(!isThreadsOpen);
  };

  return (
    <div className={cn("p-4 border-b")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar
            src={chatRoom?.avatarUrl}
            alt={chatRoom?.name}
            fallback={chatRoom?.name}
            size="md"
            className="w-10 h-10"
          />
          <div>
            <Heading3 className="text-sm">{chatRoom?.name}</Heading3>
            <BodyTextSmall className="text-muted-foreground">
              {chatRoom?.memberCount} {t("chat.participants")}
            </BodyTextSmall>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleThreads}
            className={cn(isThreadsOpen && "bg-accent text-accent-foreground")}
            aria-label={t("chat.toggleThreads")}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleParticipantClick}
            aria-label={t("chat.showParticipants")}
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMoreClick}
            aria-label={t("chat.moreOptions")}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
