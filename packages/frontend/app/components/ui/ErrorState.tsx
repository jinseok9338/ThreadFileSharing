import { BodyText } from "~/components/typography";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  message = "오류가 발생했습니다",
  showRetry = false,
  onRetry,
  retryLabel = "다시 시도",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "h-full flex items-center justify-center bg-background",
        className
      )}
    >
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <BodyText className="text-destructive">{message}</BodyText>
        </div>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
