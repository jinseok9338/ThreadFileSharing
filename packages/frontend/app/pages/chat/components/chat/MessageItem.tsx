import { Avatar } from "~/components/ui/avatar";
import { BodyText, BodyTextSmall } from "~/components/typography";
import { cn } from "~/lib/utils";
import type { Message } from "~/pages/chat/types/types";
import type { ChatRoomMessage } from "../../services/api";

interface MessageItemProps {
  message: ChatRoomMessage;
  showAvatar?: boolean;
  className?: string;
}

export function MessageItem({
  message,
  showAvatar = true,
  className,
}: MessageItemProps) {
  return (
    <div className={cn("flex items-start space-x-3", className)}>
      {showAvatar && (
        <Avatar
          src={message.sender.avatarUrl}
          alt={message.sender.fullName}
          fallback={message.sender.fullName}
          size="sm"
          className="w-8 h-8 flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-center space-x-2 mb-1">
            <BodyTextSmall className="font-medium text-xs">
              {message.sender.fullName}
            </BodyTextSmall>
            <BodyTextSmall className="text-muted-foreground text-xs">
              {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </BodyTextSmall>
          </div>
        )}

        <BodyText className="text-sm">{message.content}</BodyText>

        {message.isEdited && (
          <BodyTextSmall className="text-muted-foreground text-xs mt-1">
            (편집됨)
          </BodyTextSmall>
        )}
      </div>
    </div>
  );
}
