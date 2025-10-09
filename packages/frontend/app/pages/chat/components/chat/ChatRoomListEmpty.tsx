import { BodyText } from "~/components/typography";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

interface ChatRoomListEmptyProps {
  className?: string;
}

export function ChatRoomListEmpty({ className }: ChatRoomListEmptyProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center p-8",
        className
      )}
    >
      <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
      <BodyText className="text-muted-foreground mb-2 font-medium text-xs">
        {t("chat.noRooms")}
      </BodyText>
      <p className="text-xs text-muted-foreground text-center">
        {t("chat.createFirstRoom")}
      </p>
    </div>
  );
}
