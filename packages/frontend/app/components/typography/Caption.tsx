import { cn } from "~/lib/utils";

interface CaptionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "div" | "span";
}

/**
 * Caption - 설명 텍스트 (작고 부드러운 색상)
 *
 * 기본 스타일: text-xs text-muted-foreground
 *
 * @example
 * ```tsx
 * <Caption>추가 설명 텍스트</Caption>
 * <Caption className="text-destructive">에러 메시지</Caption>
 * <Caption as="span">인라인 설명</Caption>
 * ```
 */
export function Caption({
  children,
  className,
  as: Component = "p",
  ...props
}: CaptionProps) {
  return (
    <Component
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
