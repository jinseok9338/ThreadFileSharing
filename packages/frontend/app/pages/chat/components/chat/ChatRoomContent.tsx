import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import { ChatRoomHeader } from "./ChatRoomHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { DragOverlay } from "./DragOverlay";
import { EmptyState } from "~/components/ui/EmptyState";
import { LoadingState } from "~/components/ui/LoadingState";
import { ErrorState } from "~/components/ui/ErrorState";
import type { ChatRoom, Message, User } from "~/pages/chat/types/types";
import { useQueryState } from "~/lib/nuqs/useQueryState";
import { SELECTED_CHATROOM_ID } from "~/constants/queryStrings";
import { parseAsString } from "~/lib/nuqs/parsers";
import { useGetChatRoomDetail } from "../../hooks/useGetChatRoomDetail";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

interface ChatRoomContentProps {
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
  const [selectedChatRoomId] = useQueryState(
    SELECTED_CHATROOM_ID.key,
    parseAsString.withDefault(SELECTED_CHATROOM_ID.defaultValue)
  );
  const { data: chatRoomDetail } = useGetChatRoomDetail(selectedChatRoomId);

  const handleSendMessage = (message: string) => {
    onSendMessage?.(message);
  };

  const handleFileUpload = (files: File[]) => {
    onFileUpload?.(files);
  };

  const handleDrop = (files: FileList) => {
    if (!selectedChatRoomId) return;

    const fileArray = Array.from(files);
    if (fileArray.length > 0) {
      // Show alert for file drop
      alert(
        "파일을 업로드하려면 '스레드 만들기' 또는 '파일 공유하기'를 선택해주세요."
      );
    }
  };

  const {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop: handleDropEvent,
  } = useDragAndDrop({ onDrop: handleDrop });

  const handleParticipantClick = (participantId: string) => {
    onParticipantClick?.(participantId);
  };

  // 빈 상태 (채팅룸이 선택되지 않음)
  if (!selectedChatRoomId || !chatRoomDetail) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={t("main.selectChatRoom")}
        description={t("main.selectRoomFirst")}
        className={className}
      />
    );
  }

  // TODO: 로딩 및 에러 상태는 상위 컴포넌트에서 처리하도록 개선 필요

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-transparent relative",
        isDragOver &&
          "bg-primary/5 outline-2 outline-dashed outline-primary shadow-[inset_0_0_0_2px_theme(colors.primary)]",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropEvent}
    >
      {/* Drag Overlay */}
      <DragOverlay isDragOver={isDragOver} />

      {/* Chat Room Header */}
      <ChatRoomHeader />

      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
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
