import { cn } from "~/lib/utils";

interface Heading1Props extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

/**
 * Heading1 - 가장 큰 제목
 *
 * 기본 스타일: text-3xl font-bold text-foreground
 *
 * @example
 * ```tsx
 * <Heading1>페이지 제목</Heading1>
 * <Heading1 className="text-primary">강조된 제목</Heading1>
 * <Heading1 as="h2">다른 태그로 렌더링</Heading1>
 * ```
 */
export function Heading1({
  children,
  className,
  as: Component = "h1",
  ...props
}: Heading1Props) {
  return (
    <Component
      className={cn("text-3xl font-bold text-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
