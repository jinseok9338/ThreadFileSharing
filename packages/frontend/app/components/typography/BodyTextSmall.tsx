import { cn } from "~/lib/utils";

interface BodyTextSmallProps {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "div" | "span";
}

/**
 * BodyTextSmall - 작은 본문 텍스트
 *
 * 기본 스타일: text-sm font-normal text-foreground
 *
 * @example
 * ```tsx
 * <BodyTextSmall>작은 본문 텍스트입니다.</BodyTextSmall>
 * <BodyTextSmall className="text-muted-foreground">보조 설명</BodyTextSmall>
 * ```
 */
export function BodyTextSmall({
  children,
  className,
  as: Component = "p",
}: BodyTextSmallProps) {
  return (
    <Component className={cn("text-sm font-normal text-foreground", className)}>
      {children}
    </Component>
  );
}
