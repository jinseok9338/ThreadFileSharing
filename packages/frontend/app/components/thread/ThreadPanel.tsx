import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Folder,
  MessageSquare,
  ChevronRight,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  MessageCircle,
} from "lucide-react";
import { FileUpload } from "~/components/chat/FileUpload";
import { FileExplorer } from "./FileExplorer";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import type { Thread, Message, User } from "~/pages/chat/types/types";

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

interface ThreadPanelProps {
  files?: FileNode[];
  threadMessages?: Message[];
  threads?: Thread[];
  selectedFileId?: string;
  selectedThreadId?: string;
  activeTab?: "files" | "chat" | "threads";
  onFileSelect?: (fileId: string) => void;
  onFileUpload?: (files: File[]) => void;
  onSendMessage?: (message: string) => void;
  onThreadSelect?: (threadId: string) => void;
  onTabChange?: (tab: "files" | "chat" | "threads") => void;
  className?: string;
}

export function ThreadPanel({
  files = [],
  threadMessages = [],
  threads = [],
  selectedFileId,
  selectedThreadId,
  activeTab = "threads",
  onFileSelect,
  onFileUpload,
  onSendMessage,
  onThreadSelect,
  onTabChange,
  className,
}: ThreadPanelProps) {
  const { t } = useTranslation();
  const [localActiveTab, setLocalActiveTab] = useState<
    "files" | "chat" | "threads"
  >(activeTab);

  const currentActiveTab = localActiveTab;

  const handleTabChange = (tab: "files" | "chat" | "threads") => {
    setLocalActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleFileSelect = (fileId: string) => {
    onFileSelect?.(fileId);
  };

  const handleFileUpload = (files: File[]) => {
    onFileUpload?.(files);
  };

  const handleSendMessage = (message: string) => {
    onSendMessage?.(message);
  };

  return (
    <div
      className={cn("h-full flex flex-col bg-transparent border-l", className)}
    >
      {/* Tab Navigation */}
      <div className="flex border-b">
        <Button
          variant={currentActiveTab === "threads" ? "default" : "ghost"}
          onClick={() => handleTabChange("threads")}
          className="flex-1 rounded-none text-xs h-8"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          {t("thread.threads")}
        </Button>
        <Button
          variant={currentActiveTab === "files" ? "default" : "ghost"}
          onClick={() => handleTabChange("files")}
          className="flex-1 rounded-none text-xs h-8"
        >
          <Folder className="w-3 h-3 mr-1" />
          {t("thread.files")}
        </Button>
        <Button
          variant={currentActiveTab === "chat" ? "default" : "ghost"}
          onClick={() => handleTabChange("chat")}
          className="flex-1 rounded-none text-xs h-8"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          {t("thread.chat")}
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {currentActiveTab === "threads" ? (
          <ThreadListPanel
            threads={threads}
            selectedThreadId={selectedThreadId}
            onThreadSelect={(threadId) => {
              onThreadSelect?.(threadId);
              // 스레드 선택 시 파일 탭으로 자동 전환
              handleTabChange("files");
            }}
          />
        ) : currentActiveTab === "files" ? (
          <FileExplorer
            files={files}
            selectedFileId={selectedFileId}
            onFileSelect={handleFileSelect}
            onFileUpload={handleFileUpload}
          />
        ) : (
          <ThreadChatPanel
            messages={threadMessages}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}

// ThreadChatPanel component

function ThreadChatPanel({
  messages,
  onSendMessage,
}: {
  messages: Message[];
  onSendMessage: (message: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <p className="text-xs font-medium">{t("thread.chat")}</p>
      </div>
      <div className="flex-1 p-2 overflow-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-xs">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="p-2 bg-muted/30 rounded-lg">
                <p className="text-xs mb-1">{message.content}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {message.sender.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-2 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={t("thread.typeMessage")}
            className="flex-1 px-2 py-1 text-xs border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                onSendMessage(e.currentTarget.value.trim());
                e.currentTarget.value = "";
              }
            }}
          />
          <Button
            size="sm"
            className="px-2 text-xs h-7"
            onClick={(e) => {
              const input = e.currentTarget
                .previousElementSibling as HTMLInputElement;
              if (input && input.value.trim()) {
                onSendMessage(input.value.trim());
                input.value = "";
              }
            }}
          >
            {t("thread.send")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ThreadListPanel({
  threads,
  selectedThreadId,
  onThreadSelect,
}: {
  threads: Thread[];
  selectedThreadId?: string;
  onThreadSelect?: (threadId: string) => void;
}) {
  const { t } = useTranslation();

  if (threads.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-1 text-xs">
            {t("thread.noThreads")}
          </p>
          <p className="text-muted-foreground text-xs">
            Upload files to create threads
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-2 space-y-1">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={cn(
              "p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors",
              selectedThreadId === thread.id && "bg-accent"
            )}
            onClick={() => onThreadSelect?.(thread.id)}
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium truncate">{thread.title}</p>
                <span className="text-xs text-muted-foreground">
                  {thread.messageCount}
                </span>
              </div>
              {thread.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {thread.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  by {thread.createdBy.displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
