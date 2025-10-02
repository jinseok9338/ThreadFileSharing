import type { LucideIcon } from "lucide-react";
import { Heading3, BodyText } from "~/components/typography";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "h-full flex items-center justify-center bg-background",
        className
      )}
    >
      <div className="text-center">
        {Icon && (
          <Icon className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
        )}
        {title && (
          <Heading3 className="text-muted-foreground mb-2">{title}</Heading3>
        )}
        {description && (
          <BodyText className="text-muted-foreground mb-4">
            {description}
          </BodyText>
        )}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
