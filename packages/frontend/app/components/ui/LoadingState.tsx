import { BodyText } from "~/components/typography";
import { cn } from "~/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({
  message = "로딩 중...",
  size = "md",
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "h-full flex items-center justify-center bg-background",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "animate-spin rounded-full border-b-2 border-primary",
            sizeClasses[size]
          )}
        ></div>
        <BodyText className="text-muted-foreground">{message}</BodyText>
      </div>
    </div>
  );
}
