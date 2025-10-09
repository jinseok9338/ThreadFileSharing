import { ScrollArea } from "~/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { Heading3, BodyText } from "~/components/typography";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { MessageItem } from "./MessageItem";
import type { Message } from "~/pages/chat/types/types";

interface MessageListProps {
  messages?: Message[];
  selectedChatRoomId?: string;
  className?: string;
}

export function MessageList({
  messages = [],
  selectedChatRoomId,
  className,
}: MessageListProps) {
  const { t } = useTranslation();

  // 빈 상태 (메시지가 없음)
  if (!selectedChatRoomId || messages.length === 0) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
          <Heading3 className="text-muted-foreground mb-2">
            {messages.length === 0
              ? t("chat.noMessages")
              : t("main.selectChatRoom")}
          </Heading3>
          <BodyText className="text-muted-foreground">
            {messages.length === 0
              ? t("chat.sendFirstMessage")
              : t("main.selectRoomFirst")}
          </BodyText>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} showAvatar={true} />
        ))}
      </div>
    </ScrollArea>
  );
}
