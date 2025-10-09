import { BodyText } from "~/components/typography";
import { AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

interface ChatRoomListErrorProps {
  error?: Error | null;
  className?: string;
}

export function ChatRoomListError({
  error,
  className,
}: ChatRoomListErrorProps) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center p-8",
        className
      )}
    >
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <BodyText className="text-destructive text-xs font-medium mb-2">
        Failed to load chatrooms
      </BodyText>
      {error?.message && (
        <p className="text-xs text-muted-foreground text-center">
          {error.message}
        </p>
      )}
    </div>
  );
}
