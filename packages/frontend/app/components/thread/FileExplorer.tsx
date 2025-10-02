import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Folder,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  Upload,
  Share,
  Download,
  Filter,
  MoreHorizontal,
  FolderPlus,
} from "lucide-react";
// FileNode interface (same as ThreadPanel)
interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: number;
  parentId?: string;
  modifiedAt: string;
  modifiedBy: string;
  createdAt: string;
  uploadedBy: User;
}

interface User {
  id: string;
  displayName: string;
  status: "online" | "away" | "busy" | "offline";
}

interface FileExplorerProps {
  files: FileNode[];
  selectedFileId?: string;
  onFileSelect: (fileId: string) => void;
  onFileUpload: (files: File[]) => void;
}

export function FileExplorer({
  files,
  selectedFileId,
  onFileSelect,
  onFileUpload,
}: FileExplorerProps) {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState<string>("root");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current folder files
  const getCurrentFiles = () => {
    let currentFiles = files.filter((file) => file.parentId === currentPath);

    // Apply search filter
    if (searchQuery) {
      currentFiles = currentFiles.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    currentFiles.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison =
            new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
          break;
        case "size":
          comparison = (a.size || 0) - (b.size || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return currentFiles;
  };

  const currentFiles = getCurrentFiles();

  const getFileIcon = (file: FileNode) => {
    if (file.type === "folder") {
      return <Folder className="w-3 h-3 text-yellow-500" />;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-3 h-3 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="w-3 h-3 text-blue-500" />;
      case "docx":
      case "doc":
        return <FileText className="w-3 h-3 text-blue-600" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="w-3 h-3 text-green-500" />;
      case "pptx":
      case "ppt":
        return <Presentation className="w-3 h-3 text-orange-500" />;
      default:
        return <File className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const folders = currentFiles.filter((file) => file.type === "folder");
  const fileItems = currentFiles.filter((file) => file.type === "file");

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
    e.target.value = ""; // Reset input value
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt(t("fileExplorer.folderName"));
    if (name) {
      // TODO: Implement folder creation
      console.log("Create folder:", name);
    }
  };

  const handleShareFiles = () => {
    // TODO: Implement file sharing
    console.log("Share files");
  };

  const handleDownloadFiles = () => {
    // TODO: Implement file download
    console.log("Download files");
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-background relative",
        isDragOver && "bg-primary/5 border-2 border-dashed border-primary"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        aria-label={t("fileExplorer.upload")}
      />

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-4 text-center shadow-lg">
            <div className="text-primary font-medium mb-1 text-sm">
              {t("fileExplorer.upload")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("fileExplorer.dropFilesHere")}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="px-4 py-2 border-b bg-muted/10">
        <div className="flex items-center gap-2">
          <Folder className="w-3 h-3 text-primary" />
          <span className="text-xs text-muted-foreground">
            {t("fileExplorer.breadcrumb")}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
              onClick={handleFileUpload}
            >
              <Upload className="w-3 h-3 mr-1" />
              {t("fileExplorer.upload")}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2"
                >
                  <MoreHorizontal className="w-3 h-3 mr-1" />
                  {t("fileExplorer.moreActions")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleCreateFolder}>
                  <FolderPlus className="w-3 h-3 mr-2" />
                  {t("fileExplorer.newFolder")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareFiles}>
                  <Share className="w-3 h-3 mr-2" />
                  {t("fileExplorer.share")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadFiles}>
                  <Download className="w-3 h-3 mr-2" />
                  {t("fileExplorer.download")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Search Area */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder={t("fileExplorer.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 h-7 pl-7 text-xs"
              />
              <Filter className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Folder Overview */}
      {folders.length > 0 && (
        <div className="px-4 py-3 border-b bg-muted/5">
          <div className="grid grid-cols-4 gap-4">
            {folders.slice(0, 4).map((folder) => (
              <div
                key={folder.id}
                className="flex flex-col items-center cursor-pointer hover:bg-accent/30 rounded-lg p-3 transition-colors group"
              >
                <Folder className="w-8 h-8 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                <span className="text-xs mt-1 truncate w-full text-center font-medium">
                  {folder.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {folder.children?.length || 0} {t("fileExplorer.filesCount")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto">
        <div className="border-t">
          {/* Header */}
          <div className="px-4 py-2 bg-muted/30 text-xs font-medium border-b">
            <div className="grid grid-cols-12 gap-4">
              <div
                className="col-span-6 cursor-pointer hover:text-foreground transition-colors flex items-center gap-1"
                onClick={() => {
                  setSortBy("name");
                  setSortOrder(
                    sortBy === "name" && sortOrder === "asc" ? "desc" : "asc"
                  );
                }}
              >
                {t("fileExplorer.name")}
                {sortBy === "name" && (
                  <span className="text-xs">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
              <div
                className="col-span-2 cursor-pointer hover:text-foreground transition-colors flex items-center gap-1"
                onClick={() => {
                  setSortBy("date");
                  setSortOrder(
                    sortBy === "date" && sortOrder === "asc" ? "desc" : "asc"
                  );
                }}
              >
                {t("fileExplorer.modifiedDate")}
                {sortBy === "date" && (
                  <span className="text-xs">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
              <div className="col-span-2 text-muted-foreground">
                {t("fileExplorer.modifiedBy")}
              </div>
              <div
                className="col-span-2 cursor-pointer hover:text-foreground transition-colors flex items-center gap-1"
                onClick={() => {
                  setSortBy("size");
                  setSortOrder(
                    sortBy === "size" && sortOrder === "asc" ? "desc" : "asc"
                  );
                }}
              >
                {t("fileExplorer.size")}
                {sortBy === "size" && (
                  <span className="text-xs">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* File Items */}
          {currentFiles.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <Folder className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : t("fileExplorer.noFiles")}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-muted-foreground/70">
                    {t("fileExplorer.uploadHere")}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {currentFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "px-4 py-2 hover:bg-accent/30 cursor-pointer transition-colors",
                    selectedFileId === file.id && "bg-accent/50"
                  )}
                  onClick={() => onFileSelect(file.id)}
                >
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6 flex items-center gap-2">
                      {getFileIcon(file)}
                      <span className="text-xs truncate font-medium">
                        {file.name}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground flex items-center">
                      {formatDate(file.modifiedAt)}
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground flex items-center">
                      {file.modifiedBy}
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground flex items-center">
                      {file.type === "file" && file.size
                        ? formatFileSize(file.size)
                        : "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
