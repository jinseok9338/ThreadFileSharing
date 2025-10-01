import { Link } from "react-router";
import { FileText } from "lucide-react";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  onClick?: () => void;
  className?: string;
}

const getSizeClasses = (size: string) => {
  switch (size) {
    case "sm":
      return {
        icon: "w-6 h-6",
        iconInner: "w-4 h-4",
        text: "text-xs",
      };
    case "md":
      return {
        icon: "w-8 h-8",
        iconInner: "w-5 h-5",
        text: "text-sm",
      };
    case "lg":
      return {
        icon: "w-10 h-10",
        iconInner: "w-6 h-6",
        text: "text-base",
      };
    default:
      return {
        icon: "w-8 h-8",
        iconInner: "w-5 h-5",
        text: "text-sm",
      };
  }
};

export function AppLogo({
  size = "md",
  showText = false,
  onClick,
  className,
}: AppLogoProps) {
  const { t } = useTranslation();
  const sizeClasses = getSizeClasses(size);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Link
        to="/main"
        className="flex items-center space-x-2 hover:scale-105 transition-transform"
        onClick={onClick}
        aria-label={t("nav.home")}
      >
        {/* 로고 아이콘 */}
        <div
          className={cn(
            "rounded-lg bg-primary flex items-center justify-center",
            sizeClasses.icon
          )}
        >
          <FileText
            className={cn("text-primary-foreground", sizeClasses.iconInner)}
          />
        </div>

        {/* 로고 텍스트 (조건부) */}
        {showText && (
          <span
            className={cn("font-semibold text-foreground", sizeClasses.text)}
          >
            {t("nav.appShortName")}
          </span>
        )}
      </Link>
    </div>
  );
}
