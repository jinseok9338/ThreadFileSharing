import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { BodyTextSmall } from "~/components/typography";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
}

interface FileUploadProps {
  onFileSelect?: (files: File[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // bytes
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 10485760, // 10MB
  acceptedTypes = ["*/*"],
  disabled = false,
  className,
}: FileUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): void => {
    // 파일 크기 검증
    if (file.size > maxFileSize) {
      throw new Error(t("fileUpload.tooLarge"));
    }

    // 파일 타입 검증
    const isAccepted = acceptedTypes.some((type) => {
      if (type === "*/*") return true;
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace("*", ".*"));
    });

    if (!isAccepted) {
      throw new Error(t("fileUpload.invalidType"));
    }
  };

  const validateFiles = (files: File[]): void => {
    // 파일 개수 검증
    if (files.length > maxFiles) {
      throw new Error(t("fileUpload.tooMany"));
    }

    // 각 파일 검증
    files.forEach(validateFile);
  };

  const handleFileSelect = useCallback(
    (files: File[]) => {
      try {
        validateFiles(files);
        setSelectedFiles(files);
        onFileSelect?.(files);
      } catch (error) {
        onUploadError?.(error instanceof Error ? error.message : String(error));
      }
    },
    [maxFiles, maxFileSize, acceptedTypes, onFileSelect, onUploadError, t]
  );

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const simulateUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 업로드 시뮬레이션 (실제 구현에서는 실제 업로드 로직으로 교체)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadProgress(i);
        onUploadProgress?.(i);
      }

      // 업로드 완료 시뮬레이션
      const uploadedFiles: UploadedFile[] = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }));

      onUploadComplete?.(uploadedFiles);
      setSelectedFiles([]);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      simulateUpload(selectedFiles);
    }
  };

  const getAcceptString = (): string => {
    return acceptedTypes.join(",");
  };

  const getMaxFileSizeText = (): string => {
    return formatFileSize(maxFileSize);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptString()}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drag and drop area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver && !disabled
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          isUploading && "pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={t("fileUpload.selectFiles")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <BodyTextSmall className="text-muted-foreground mb-1">
          {t("fileUpload.dragDrop")}
        </BodyTextSmall>
        <BodyTextSmall className="text-xs text-muted-foreground">
          {t("fileUpload.supportedFormats")}
        </BodyTextSmall>
        <BodyTextSmall className="text-xs text-muted-foreground mt-1">
          최대 {maxFiles}개 파일, {getMaxFileSizeText()}까지
        </BodyTextSmall>
      </div>

      {/* Selected files */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <BodyTextSmall className="text-muted-foreground">
              선택된 파일 ({selectedFiles.length}개)
            </BodyTextSmall>
            <Button size="sm" onClick={handleUpload} disabled={disabled}>
              {t("fileUpload.uploading")}
            </Button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
              >
                <div className="flex-1 min-w-0">
                  <BodyTextSmall className="truncate">
                    {file.name}
                  </BodyTextSmall>
                  <BodyTextSmall className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </BodyTextSmall>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <BodyTextSmall className="text-muted-foreground">
              {t("fileUpload.uploading")}
            </BodyTextSmall>
            <BodyTextSmall className="text-muted-foreground">
              {uploadProgress}%
            </BodyTextSmall>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );
}
