import { BodyTextSmall } from "~/components/typography";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface TypingUser {
  id: string;
  name: string;
}

interface TypingIndicatorProps {
  users?: TypingUser[];
  className?: string;
}

export function TypingIndicator({
  users = [],
  className,
}: TypingIndicatorProps) {
  const { t } = useTranslation();

  if (users.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} ${t("chat.typing")}`;
    } else if (users.length === 2) {
      return `${users[0].name} ${t("chat.and")} ${users[1].name} ${t("chat.typing")}`;
    } else {
      return `${users[0].name} ${t("chat.and")} ${users.length - 1} ${t("chat.others")} ${t("chat.typing")}`;
    }
  };

  return (
    <div className={cn("px-4 py-2 border-t bg-muted/30", className)}>
      <BodyTextSmall className="text-muted-foreground text-xs flex items-center">
        <span className="flex items-center space-x-1">
          <span className="flex space-x-1">
            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></span>
          </span>
          <span className="ml-2">{getTypingText()}</span>
        </span>
      </BodyTextSmall>
    </div>
  );
}
