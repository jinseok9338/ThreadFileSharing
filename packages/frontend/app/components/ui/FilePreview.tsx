import { useTranslation } from "react-i18next";
import { overlay } from "overlay-kit";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  Download,
  Eye,
  X,
  Play,
  FileAudio,
  FileVideo,
  Archive,
} from "lucide-react";

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    size?: number;
    url?: string;
    thumbnail?: string;
  };
  showPreview?: boolean;
  showDownload?: boolean;
  showName?: boolean;
  showSize?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  onDownload?: (fileId: string) => void;
  onPreview?: (fileId: string) => void;
}

export function FilePreview({
  file,
  showPreview = true,
  showDownload = true,
  showName = true,
  showSize = true,
  className,
  size = "md",
  onDownload,
  onPreview,
}: FilePreviewProps) {
  const { t } = useTranslation();

  const getFileIcon = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <FileText className="w-full h-full text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <Image className="w-full h-full text-blue-500" />;
      case "docx":
      case "doc":
        return <FileText className="w-full h-full text-blue-600" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="w-full h-full text-green-500" />;
      case "pptx":
      case "ppt":
        return <Presentation className="w-full h-full text-orange-500" />;
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return <FileVideo className="w-full h-full text-purple-500" />;
      case "mp3":
      case "wav":
      case "flac":
        return <FileAudio className="w-full h-full text-pink-500" />;
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="w-full h-full text-yellow-600" />;
      default:
        return <File className="w-full h-full text-muted-foreground" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "h-16 w-16",
          icon: "w-6 h-6",
          text: "text-xs",
        };
      case "lg":
        return {
          container: "h-24 w-24",
          icon: "w-10 h-10",
          text: "text-sm",
        };
      default: // md
        return {
          container: "h-20 w-20",
          icon: "w-8 h-8",
          text: "text-sm",
        };
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const isImage = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "");
  };

  const isVideo = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return ["mp4", "avi", "mov", "wmv"].includes(extension || "");
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(file.id);
    } else {
      overlay.open(({ isOpen, close, unmount }) => {
        return (
          <FilePreviewModal
            file={file}
            isOpen={isOpen}
            close={close}
            unmount={unmount}
          />
        );
      });
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file.id);
    } else if (file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <>
      <div className={cn("flex flex-col items-center space-y-2", className)}>
        {/* 파일 아이콘/썸네일 */}
        <div
          className={cn(
            "relative flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer group",
            sizeClasses.container
          )}
          onClick={handlePreview}
        >
          {file.thumbnail && isImage() ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className={sizeClasses.icon}>{getFileIcon()}</div>
          )}

          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>

          {/* 파일 타입 배지 */}
          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded-full">
            {file.name.split(".").pop()?.toUpperCase()}
          </div>
        </div>

        {/* 파일 정보 */}
        {(showName || showSize) && (
          <div className="text-center space-y-1 max-w-full">
            {showName && (
              <div className={cn("font-medium truncate", sizeClasses.text)}>
                {file.name}
              </div>
            )}
            {showSize && file.size && (
              <div className={cn("text-muted-foreground", sizeClasses.text)}>
                {formatFileSize(file.size)}
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex space-x-1">
          {showPreview && (
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreview}
              className="h-6 px-2 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              {t("filePreview.preview")}
            </Button>
          )}
          {showDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-6 px-2 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              {t("filePreview.download")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// 파일 미리보기 모달 컴포넌트
interface FilePreviewModalProps {
  file: FilePreviewProps["file"];
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
}

function FilePreviewModal({
  file,
  isOpen,
  close,
  unmount,
}: FilePreviewModalProps) {
  const { t } = useTranslation();

  const getFileIcon = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <FileText className="w-20 h-20 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <Image className="w-20 h-20 text-blue-500" />;
      case "docx":
      case "doc":
        return <FileText className="w-20 h-20 text-blue-600" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="w-20 h-20 text-green-500" />;
      case "pptx":
      case "ppt":
        return <Presentation className="w-20 h-20 text-orange-500" />;
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return <FileVideo className="w-20 h-20 text-purple-500" />;
      case "mp3":
      case "wav":
      case "flac":
        return <FileAudio className="w-20 h-20 text-pink-500" />;
      case "zip":
      case "rar":
      case "7z":
        return <Archive className="w-20 h-20 text-yellow-600" />;
      default:
        return <File className="w-20 h-20 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const isImage = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "");
  };

  const isVideo = () => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return ["mp4", "avi", "mov", "wmv"].includes(extension || "");
  };

  const handleDownload = () => {
    if (file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={close} />

      {/* 모달 콘텐츠 */}
      <div className="relative bg-background rounded-lg shadow-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate">{file.name}</h2>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              {t("filePreview.download")}
            </Button>
            <Button size="sm" variant="ghost" onClick={close}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex items-center justify-center min-h-[400px] bg-muted/20 p-4">
          {isImage() ? (
            <img
              src={file.url || file.thumbnail}
              alt={file.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          ) : isVideo() ? (
            <video
              src={file.url}
              controls
              className="max-w-full max-h-[70vh] rounded-lg"
            >
              {t("filePreview.playVideo")}
            </video>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div>{getFileIcon()}</div>
              <div className="text-center">
                <p className="text-lg font-medium">{file.name}</p>
                {file.size && (
                  <p className="text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {t("filePreview.noPreview")}
                </p>
              </div>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                {t("filePreview.download")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
