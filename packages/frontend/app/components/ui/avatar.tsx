import { cn } from "~/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  status?: "online" | "offline" | "away" | "busy";
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  shape = "circle",
  status,
  className,
  onClick,
}: AvatarProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return {
          avatar: "h-6 w-6 text-xs",
          status: "h-1.5 w-1.5",
          statusOffset: "bottom-0 right-0",
        };
      case "sm":
        return {
          avatar: "h-8 w-8 text-sm",
          status: "h-2 w-2",
          statusOffset: "bottom-0 right-0",
        };
      case "lg":
        return {
          avatar: "h-12 w-12 text-lg",
          status: "h-3 w-3",
          statusOffset: "bottom-0 right-0",
        };
      case "xl":
        return {
          avatar: "h-16 w-16 text-xl",
          status: "h-4 w-4",
          statusOffset: "bottom-1 right-1",
        };
      default: // md
        return {
          avatar: "h-10 w-10 text-sm",
          status: "h-2.5 w-2.5",
          statusOffset: "bottom-0 right-0",
        };
    }
  };

  const getStatusColor = () => {
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
        return "";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = getSizeClasses();
  const initials = getInitials(fallback || alt);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center bg-muted text-muted-foreground font-medium select-none overflow-hidden",
        sizeClasses.avatar,
        shape === "circle" ? "rounded-full" : "rounded-md",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full">
          {initials}
        </span>
      )}

      {/* 상태 표시 */}
      {status && (
        <div
          className={cn(
            "absolute border-2 border-background",
            sizeClasses.status,
            sizeClasses.statusOffset,
            getStatusColor(),
            "rounded-full"
          )}
        />
      )}

      {/* 기본 아이콘 (이미지 로드 실패 시) */}
      {src && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <User className="w-1/2 h-1/2 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// 아바타 그룹 컴포넌트
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback?: string;
  }>;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="border-2 border-background hover:z-10 transition-transform hover:scale-110"
        />
      ))}
      {remainingCount > 0 && (
        <Avatar
          size={size}
          fallback={`+${remainingCount}`}
          className="border-2 border-background bg-muted text-muted-foreground"
        />
      )}
    </div>
  );
}

// 사용자 아바타 컴포넌트 (특화된 버전)
interface UserAvatarProps {
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    status?: AvatarProps["status"];
  };
  size?: AvatarProps["size"];
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

export function UserAvatar({
  user,
  size = "md",
  showStatus = true,
  className,
  onClick,
}: UserAvatarProps) {
  return (
    <Avatar
      src={user.avatar}
      alt={user.name}
      fallback={user.name}
      size={size}
      status={showStatus ? user.status : undefined}
      className={className}
      onClick={onClick}
    />
  );
}
