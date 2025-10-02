import { FileText, Share, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Heading3 } from "~/components/typography";

interface CommandsProps {
  onSelect?: (command: "create-thread" | "share-file" | "cancel") => void;
  className?: string;
}

export function Commands({ onSelect, className }: CommandsProps) {
  const { t } = useTranslation();

  const handleSelect = (command: "create-thread" | "share-file" | "cancel") => {
    onSelect?.(command);
  };

  return (
    <div
      className={cn(
        "bg-background border rounded-lg shadow-lg p-4 max-w-sm mx-auto",
        className
      )}
      role="dialog"
      aria-label={t("commands.fileUpload")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          <Heading3 className="text-sm">{t("commands.fileUpload")}</Heading3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSelect("cancel")}
          className="h-6 w-6 p-0"
          aria-label={t("commands.cancel")}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Commands */}
      <div className="space-y-2">
        {/* Create Thread */}
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3 hover:bg-accent"
          onClick={() => handleSelect("create-thread")}
        >
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 mt-0.5 text-primary" />
            <div className="text-left">
              <div className="font-medium text-sm">
                {t("commands.createThread")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("commands.createThreadDescription")}
              </div>
            </div>
          </div>
        </Button>

        {/* Share File */}
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3 hover:bg-accent"
          onClick={() => handleSelect("share-file")}
        >
          <div className="flex items-start space-x-3">
            <Share className="w-5 h-5 mt-0.5 text-primary" />
            <div className="text-left">
              <div className="font-medium text-sm">
                {t("commands.shareFile")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("commands.shareFileDescription")}
              </div>
            </div>
          </div>
        </Button>
      </div>

      {/* Cancel Button */}
      <div className="mt-4 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => handleSelect("cancel")}
        >
          {t("commands.cancel")}
        </Button>
      </div>
    </div>
  );
}
