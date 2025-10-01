import { cn } from "~/lib/utils";
import { Link as RouterLink } from "react-router";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
  className?: string;
  external?: boolean;
  underline?: boolean;
}

/**
 * Link - 링크 텍스트
 *
 * 기본 스타일: text-primary hover:text-primary/80 transition-colors
 *
 * @example
 * ```tsx
 * <Link href="/threads">스레드 목록</Link>
 * <Link href="https://example.com" external>외부 링크</Link>
 * <Link href="/about" underline>밑줄 링크</Link>
 * ```
 */
export function Link({
  children,
  href,
  className,
  external,
  underline,
  ...props
}: LinkProps) {
  const baseStyles = cn(
    "text-primary hover:text-primary/80 transition-colors",
    underline && "underline",
    className
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseStyles}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={href} className={baseStyles} {...props}>
      {children}
    </RouterLink>
  );
}
