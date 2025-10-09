import { BodyText } from "~/components/typography";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";

interface ChatRoomListLoadingProps {
  className?: string;
}

export function ChatRoomListLoading({ className }: ChatRoomListLoadingProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center p-8",
        className
      )}
    >
      <BodyText className="text-muted-foreground text-xs">
        {t("common.loading")}
      </BodyText>
    </div>
  );
}
