import { cn } from "~/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "text" | "avatar" | "button" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function LoadingSkeleton({
  className,
  variant = "default",
  width,
  height,
  lines = 1,
}: LoadingSkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "text":
        return "h-4 w-full rounded";
      case "avatar":
        return "h-8 w-8 rounded-full";
      case "button":
        return "h-8 w-20 rounded-md";
      case "card":
        return "h-32 w-full rounded-lg";
      default:
        return "h-4 w-full rounded";
    }
  };

  const getAnimationDelay = (index: number) => {
    return `animation-delay-[${index * 150}ms]`;
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "animate-pulse bg-muted",
              getVariantStyles(),
              getAnimationDelay(index),
              className
            )}
            style={{
              width: index === lines - 1 ? "75%" : width,
              height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("animate-pulse bg-muted", getVariantStyles(), className)}
      style={{
        width,
        height,
      }}
    />
  );
}

// 특화된 스켈레톤 컴포넌트들
export function MessageSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-3">
      <LoadingSkeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <LoadingSkeleton variant="text" className="h-3 w-20" />
          <LoadingSkeleton variant="text" className="h-3 w-16" />
        </div>
        <LoadingSkeleton variant="text" lines={2} />
      </div>
    </div>
  );
}

export function ChatRoomItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3">
      <LoadingSkeleton variant="avatar" className="h-10 w-10" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="text" className="h-3 w-24" />
          <LoadingSkeleton variant="text" className="h-3 w-12" />
        </div>
        <LoadingSkeleton variant="text" className="h-3 w-32" />
      </div>
    </div>
  );
}

export function FileItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-2">
      <LoadingSkeleton variant="default" className="h-4 w-4" />
      <div className="flex-1 space-y-1">
        <LoadingSkeleton variant="text" className="h-3 w-40" />
        <div className="flex items-center space-x-4">
          <LoadingSkeleton variant="text" className="h-3 w-16" />
          <LoadingSkeleton variant="text" className="h-3 w-20" />
          <LoadingSkeleton variant="text" className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function ThreadItemSkeleton() {
  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <LoadingSkeleton variant="text" className="h-3 w-32" />
        <LoadingSkeleton variant="text" className="h-3 w-8" />
      </div>
      <LoadingSkeleton variant="text" className="h-3 w-48" />
      <div className="flex items-center justify-between">
        <LoadingSkeleton variant="text" className="h-3 w-16" />
        <LoadingSkeleton variant="text" className="h-3 w-12" />
      </div>
    </div>
  );
}
