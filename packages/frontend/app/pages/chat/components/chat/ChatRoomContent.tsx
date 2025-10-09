import { useState } from "react";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import { ChatRoomHeader } from "./ChatRoomHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "~/components/ui/EmptyState";
import { LoadingState } from "~/components/ui/LoadingState";
import { ErrorState } from "~/components/ui/ErrorState";
import type { ChatRoom, Message, User } from "~/pages/chat/types/types";

interface ChatRoomContentProps {
  selectedChatRoomId?: string;
  chatRoom?: ChatRoom;
  messages?: Message[];
  typingUsers?: TypingUser[];
  onSendMessage?: (message: string) => void;
  onFileUpload?: (files: File[]) => void;
  onCreateThread?: (files: File[]) => void;
  onParticipantClick?: (participantId: string) => void;
  onToggleThreads?: () => void;
  isThreadsOpen?: boolean;
  className?: string;
}

interface TypingUser {
  id: string;
  name: string;
}

// Mock 데이터 (개발용)
const mockChatRoom: ChatRoom = {
  id: "1",
  name: "General Chat",
  type: "group",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  participantCount: 5,
  unreadCount: 0,
  isArchived: false,
  createdBy: {
    id: "1",
    displayName: "Admin",
    status: "online",
  },
};

const mockMessages: Message[] = [
  {
    id: "1",
    content: "안녕하세요! 첫 번째 메시지입니다.",
    type: "text",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1시간 전
    isEdited: false,
    sender: {
      id: "1",
      displayName: "John",
      status: "online",
    },
  },
  {
    id: "2",
    content: "프로젝트 진행 상황은 어떤가요?",
    type: "text",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
    isEdited: false,
    sender: {
      id: "2",
      displayName: "Jane",
      status: "online",
    },
  },
  {
    id: "3",
    content: "좋습니다! 다음 주까지 완료 예정입니다.",
    type: "text",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15분 전
    isEdited: false,
    sender: {
      id: "1",
      displayName: "John",
      status: "online",
    },
  },
];

// Mock typing users for testing
const mockTypingUsers: TypingUser[] = [
  {
    id: "2",
    name: "Jane",
  },
  {
    id: "3",
    name: "Bob",
  },
];

export function ChatRoomContent({
  selectedChatRoomId,
  chatRoom = mockChatRoom,
  messages = mockMessages,
  typingUsers = mockTypingUsers, // Mock 데이터로 변경
  onSendMessage,
  onFileUpload,
  onCreateThread,
  onParticipantClick,
  onToggleThreads,
  isThreadsOpen = false,
  className,
}: ChatRoomContentProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSendMessage = (message: string) => {
    onSendMessage?.(message);
  };

  const handleFileUpload = (files: File[]) => {
    onFileUpload?.(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedChatRoomId) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!selectedChatRoomId) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Show alert for file drop
      alert(
        "파일을 업로드하려면 '스레드 만들기' 또는 '파일 공유하기'를 선택해주세요."
      );
    }
  };

  const handleParticipantClick = (participantId: string) => {
    onParticipantClick?.(participantId);
  };

  // 빈 상태 (채팅룸이 선택되지 않음)
  if (!selectedChatRoomId) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={t("main.selectChatRoom")}
        description={t("main.selectRoomFirst")}
        className={className}
      />
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <LoadingState message={t("chat.loadingMessages")} className={className} />
    );
  }

  // 에러 상태
  if (error) {
    return (
      <ErrorState
        message={error}
        showRetry={true}
        onRetry={() => {
          setError(null);
          setIsLoading(true);
          // TODO: 실제 재시도 로직 구현
          setTimeout(() => setIsLoading(false), 1000);
        }}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-transparent relative",
        isDragOver && "bg-primary/5 border-2 border-dashed border-primary",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 text-center shadow-lg">
            <div className="text-primary font-medium mb-2">파일 업로드</div>
            <div className="text-sm text-muted-foreground">
              '스레드 만들기' 또는 '파일 공유하기'를 선택해주세요
            </div>
          </div>
        </div>
      )}

      {/* Chat Room Header */}
      <ChatRoomHeader
        chatRoom={chatRoom}
        onParticipantClick={() => console.log("참여자 보기")}
        onMoreClick={() => console.log("더 많은 옵션")}
        onToggleThreads={onToggleThreads}
        isThreadsOpen={isThreadsOpen}
      />

      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          selectedChatRoomId={selectedChatRoomId}
        />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator users={typingUsers} />

      {/* Message Input */}
      <div className="p-4 border-t">
        <MessageInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onCreateThread={onCreateThread}
          disabled={!selectedChatRoomId}
        />
      </div>
    </div>
  );
}
