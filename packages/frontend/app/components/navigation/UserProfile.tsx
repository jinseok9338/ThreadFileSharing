import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface UserProfileProps {
  user?: {
    id: string;
    displayName: string;
    avatar?: string;
    status: "online" | "away" | "busy" | "offline";
  };
  showStatus?: boolean;
  showName?: boolean;
  onClick?: () => void;
  className?: string;
}

const getDefaultUser = (t: (key: string) => string) => ({
  id: "1",
  displayName: t("nav.userProfile"),
  avatar: undefined,
  status: "online" as const,
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "busy":
      return "bg-red-500";
    case "offline":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

export function UserProfile({
  user,
  showStatus = true,
  showName = false,
  onClick,
  className,
}: UserProfileProps) {
  const { t } = useTranslation();
  const defaultUser = getDefaultUser(t);
  const currentUser = user || defaultUser;
  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      {/* 아바타 영역 */}
      <div className="relative">
        <Avatar
          className="w-8 h-8 cursor-pointer hover:scale-105 transition-transform"
          onClick={onClick}
        >
          <AvatarImage
            src={currentUser?.avatar}
            alt={currentUser?.displayName}
          />
          <AvatarFallback>
            {currentUser?.displayName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* 상태 표시 */}
        {showStatus && (
          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
              getStatusColor(currentUser?.status)
            )}
          />
        )}
      </div>

      {/* 사용자 이름 (선택사항) */}
      {showName && (
        <span className="text-xs text-muted-foreground truncate max-w-16">
          {currentUser?.displayName}
        </span>
      )}
    </div>
  );
}
