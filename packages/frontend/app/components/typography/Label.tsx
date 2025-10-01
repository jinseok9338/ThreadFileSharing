import { cn } from "~/lib/utils";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
}

/**
 * Label - 라벨 텍스트 (폼 필드용)
 *
 * 기본 스타일: text-sm font-medium text-foreground
 *
 * @example
 * ```tsx
 * <Label htmlFor="email">이메일</Label>
 * <Label htmlFor="password" required>비밀번호</Label>
 * <Label className="text-muted-foreground">선택 항목</Label>
 * ```
 */
export function Label({ children, className, htmlFor, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium text-foreground", className)}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}
