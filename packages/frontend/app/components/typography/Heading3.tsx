import { cn } from "~/lib/utils";

interface Heading3Props {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

/**
 * Heading3 - 작은 제목
 *
 * 기본 스타일: text-xl font-semibold text-foreground
 *
 * @example
 * ```tsx
 * <Heading3>서브 섹션 제목</Heading3>
 * <Heading3 className="text-muted-foreground">보조 제목</Heading3>
 * ```
 */
export function Heading3({
  children,
  className,
  as: Component = "h3",
}: Heading3Props) {
  return (
    <Component
      className={cn("text-xl font-semibold text-foreground", className)}
    >
      {children}
    </Component>
  );
}
