import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface DragOverlayProps {
  isDragOver: boolean;
  className?: string;
}

/**
 * 파일 드래그 앤 드롭 시 표시되는 오버레이 컴포넌트
 */
export function DragOverlay({ isDragOver, className }: DragOverlayProps) {
  const { t } = useTranslation();

  if (!isDragOver) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-primary/10 flex items-center justify-center z-50",
        className
      )}
    >
      <div className="bg-background border rounded-lg p-6 text-center shadow-lg">
        <div className="text-primary font-medium mb-2">
          {t("fileUpload.dragOverlayTitle")}
        </div>
        <div className="text-sm text-muted-foreground">
          {t("fileUpload.dragOverlayDescription")}
        </div>
      </div>
    </div>
  );
}
