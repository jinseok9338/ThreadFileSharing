import { Link } from "react-router";
import { MessageSquare, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface NavigationItemProps {
  icon: "chat" | "settings";
  active?: boolean;
  to: string;
  tooltip?: string;
  onClick?: () => void;
}

const getIcon = (icon: string) => {
  switch (icon) {
    case "chat":
      return <MessageSquare className="w-5 h-5" />;
    case "settings":
      return <Settings className="w-5 h-5" />;
    default:
      return null;
  }
};

const getDefaultTooltip = (icon: string, t: (key: string) => string) => {
  switch (icon) {
    case "chat":
      return t("nav.chat");
    case "settings":
      return t("nav.settings");
    default:
      return "";
  }
};

export function NavigationItem({
  icon,
  active = false,
  to,
  tooltip,
  onClick,
}: NavigationItemProps) {
  const { t } = useTranslation();
  const tooltipText = tooltip || getDefaultTooltip(icon, t);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-12 h-12 rounded-lg transition-all duration-200",
              active && "bg-accent text-accent-foreground",
              !active && "hover:bg-accent/50 hover:scale-105"
            )}
            aria-current={active ? "page" : undefined}
            onClick={onClick}
            asChild
          >
            <Link to={to}>{getIcon(icon)}</Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
