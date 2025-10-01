import { cn } from "~/lib/utils";

interface BodyTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "div" | "span";
}

/**
 * BodyText - 본문 텍스트
 *
 * 기본 스타일: text-base font-normal text-foreground
 *
 * @example
 * ```tsx
 * <BodyText>본문 내용입니다.</BodyText>
 * <BodyText className="text-muted-foreground">보조 텍스트</BodyText>
 * <BodyText as="span">인라인 텍스트</BodyText>
 * ```
 */
export function BodyText({
  children,
  className,
  as: Component = "p",
  ...props
}: BodyTextProps) {
  return (
    <Component
      className={cn("text-base font-normal text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
