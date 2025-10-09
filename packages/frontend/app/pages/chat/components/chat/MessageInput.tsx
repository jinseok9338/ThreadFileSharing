import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { Send, Paperclip } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { Commands } from "./Commands";

interface MessageInputProps {
  onSendMessage?: (message: string) => void;
  onFileUpload?: (files: File[]) => void;
  onCreateThread?: (files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  showFileUpload?: boolean;
  className?: string;
}

export function MessageInput({
  onSendMessage,
  onFileUpload,
  onCreateThread,
  disabled = false,
  placeholder,
  showFileUpload = false,
  className,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage?.(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    setShowCommands(true);
  };

  const handleCommandSelect = (
    command: "create-thread" | "share-file" | "cancel"
  ) => {
    switch (command) {
      case "create-thread":
        onCreateThread?.(selectedFiles);
        break;
      case "share-file":
        onFileUpload?.(selectedFiles);
        break;
      case "cancel":
        // Do nothing, just close commands
        break;
    }
    setShowCommands(false);
    setSelectedFiles([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  if (showFileUpload) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Commands */}
        {showCommands && <Commands onSelect={handleCommandSelect} />}

        {/* File Upload Area */}
        <FileUpload
          onFileSelect={handleFileSelect}
          maxFiles={5}
          maxFileSize={10485760} // 10MB
          acceptedTypes={["*/*"]}
          disabled={disabled}
        />

        {/* Message Input */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 min-w-0">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || t("chat.typeMessage")}
              disabled={disabled}
              className="w-full"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!message.trim() || disabled}
            className="p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Commands */}
      {showCommands && <Commands onSelect={handleCommandSelect} />}

      <div className="flex items-center space-x-2">
        {/* File Upload Button */}
        <div className="relative">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled}
            aria-label={t("chat.uploadFile")}
          />
          <Button variant="ghost" size="sm" disabled={disabled} className="p-2">
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex-1 min-w-0">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t("chat.typeMessage")}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Send Button */}
        <Button
          size="sm"
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          className="p-2"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
