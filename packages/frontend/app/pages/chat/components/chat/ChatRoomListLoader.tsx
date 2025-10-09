import { BodyText } from "~/components/typography";
import { useTranslation } from "react-i18next";

interface ChatRoomListLoaderProps {
  hasNextPage: boolean;
}

export function ChatRoomListLoader({ hasNextPage }: ChatRoomListLoaderProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 text-center">
      <BodyText className="text-muted-foreground text-xs">
        {hasNextPage ? t("common.loading") : t("chat.allRoomsLoaded")}
      </BodyText>
    </div>
  );
}
