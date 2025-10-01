import { cn } from "~/lib/utils";

interface Heading2Props extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

/**
 * Heading2 - 중간 크기 제목
 *
 * 기본 스타일: text-2xl font-semibold text-foreground
 *
 * @example
 * ```tsx
 * <Heading2>섹션 제목</Heading2>
 * <Heading2 className="text-primary">강조된 섹션</Heading2>
 * ```
 */
export function Heading2({
  children,
  className,
  as: Component = "h2",
  ...props
}: Heading2Props) {
  return (
    <Component
      className={cn("text-2xl font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
