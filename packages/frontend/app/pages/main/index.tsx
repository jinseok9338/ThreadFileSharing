import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Heading3, BodyTextSmall } from "~/components/typography";

import { ThreadPanel } from "~/components/thread/ThreadPanel";
import { useTranslation } from "react-i18next";
import type { Thread, UserStatus } from "~/pages/chat/types/types";
import { ChatRoomList } from "../chat/components/chat/ChatRoomList";
import { ChatRoomContent } from "../chat/components/chat/ChatRoomContent";

// Mock file data for testing
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
  uploadedBy: {
    id: string;
    displayName: string;
    status: UserStatus;
  };
}

// Mock data for different tabs
// Threads tab mock data
const mockThreadsTabData: Thread[] = [
  {
    id: "thread-1",
    title: "프로젝트 기획 회의",
    description: "새로운 프로젝트에 대한 기획 회의 내용",
    chatRoomId: "1",
    createdBy: {
      id: "1",
      displayName: "김철수",
      status: "online" as const,
    },
    messageCount: 15,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isArchived: false,
  },
  {
    id: "thread-2",
    title: "UI/UX 디자인 리뷰",
    description: "최신 디자인 목업에 대한 피드백",
    chatRoomId: "1",
    createdBy: {
      id: "2",
      displayName: "이영희",
      status: "online" as const,
    },
    messageCount: 8,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isArchived: false,
  },
  {
    id: "thread-3",
    title: "기술 스택 논의",
    description: "프론트엔드 기술 스택 선택에 대한 논의",
    chatRoomId: "1",
    createdBy: {
      id: "3",
      displayName: "박민수",
      status: "away" as const,
    },
    messageCount: 23,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isArchived: false,
  },
  {
    id: "thread-4",
    title: "마케팅 전략",
    description: "새로운 마케팅 캠페인 기획",
    chatRoomId: "1",
    createdBy: {
      id: "4",
      displayName: "최예진",
      status: "busy" as const,
    },
    messageCount: 12,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isArchived: false,
  },
];

// Files tab mock data (rich and realistic)
const mockFilesTabData: FileNode[] = [
  // Root level files
  {
    id: "root-file-1",
    name: "README.md",
    type: "file",
    size: 2500,
    parentId: "root",
    modifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    modifiedBy: "김철수",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "1",
      displayName: "김철수",
      status: "online" as UserStatus,
    },
  },
  {
    id: "root-file-2",
    name: "package.json",
    type: "file",
    size: 1200,
    parentId: "root",
    modifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    modifiedBy: "이영희",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "2",
      displayName: "이영희",
      status: "online" as UserStatus,
    },
  },

  // Project Documents folder
  {
    id: "project-docs",
    name: "프로젝트 문서",
    type: "folder",
    parentId: "root",
    modifiedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    modifiedBy: "박민수",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "3",
      displayName: "박민수",
      status: "away" as UserStatus,
    },
    children: [
      {
        id: "proposal-pdf",
        name: "프로젝트 제안서.pdf",
        type: "file",
        size: 2300000,
        parentId: "project-docs",
        modifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        modifiedBy: "김철수",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "1",
          displayName: "김철수",
          status: "online" as UserStatus,
        },
      },
      {
        id: "requirements-docx",
        name: "요구사항 정의서.docx",
        type: "file",
        size: 850000,
        parentId: "project-docs",
        modifiedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        modifiedBy: "이영희",
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "2",
          displayName: "이영희",
          status: "online" as UserStatus,
        },
      },
      {
        id: "meeting-notes",
        name: "회의록_2024_01_15.docx",
        type: "file",
        size: 450000,
        parentId: "project-docs",
        modifiedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        modifiedBy: "박민수",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "3",
          displayName: "박민수",
          status: "away" as UserStatus,
        },
      },
    ],
  },

  // Design Assets folder
  {
    id: "design-assets",
    name: "디자인 에셋",
    type: "folder",
    parentId: "root",
    modifiedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    modifiedBy: "최예진",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "4",
      displayName: "최예진",
      status: "online" as UserStatus,
    },
    children: [
      {
        id: "mockup-fig",
        name: "UI_목업.fig",
        type: "file",
        size: 3500000,
        parentId: "design-assets",
        modifiedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        modifiedBy: "최예진",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "4",
          displayName: "최예진",
          status: "online" as UserStatus,
        },
      },
      {
        id: "logo-svg",
        name: "로고.svg",
        type: "file",
        size: 120000,
        parentId: "design-assets",
        modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        modifiedBy: "최예진",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "4",
          displayName: "최예진",
          status: "online" as UserStatus,
        },
      },
      {
        id: "icons-png",
        name: "아이콘_세트.png",
        type: "file",
        size: 1800000,
        parentId: "design-assets",
        modifiedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        modifiedBy: "최예진",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "4",
          displayName: "최예진",
          status: "online" as UserStatus,
        },
      },
    ],
  },

  // Code folder
  {
    id: "code-folder",
    name: "소스 코드",
    type: "folder",
    parentId: "root",
    modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    modifiedBy: "정수현",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "5",
      displayName: "정수현",
      status: "online" as UserStatus,
    },
    children: [
      {
        id: "main-tsx",
        name: "App.tsx",
        type: "file",
        size: 15000,
        parentId: "code-folder",
        modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        modifiedBy: "정수현",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "5",
          displayName: "정수현",
          status: "online" as UserStatus,
        },
      },
      {
        id: "components-tsx",
        name: "components.tsx",
        type: "file",
        size: 25000,
        parentId: "code-folder",
        modifiedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        modifiedBy: "정수현",
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "5",
          displayName: "정수현",
          status: "online" as UserStatus,
        },
      },
    ],
  },

  // Images folder
  {
    id: "images-folder",
    name: "이미지",
    type: "folder",
    parentId: "root",
    modifiedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    modifiedBy: "홍길동",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "6",
      displayName: "홍길동",
      status: "away" as UserStatus,
    },
    children: [
      {
        id: "screenshot-1",
        name: "스크린샷_001.png",
        type: "file",
        size: 850000,
        parentId: "images-folder",
        modifiedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        modifiedBy: "홍길동",
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "6",
          displayName: "홍길동",
          status: "away" as UserStatus,
        },
      },
      {
        id: "screenshot-2",
        name: "스크린샷_002.png",
        type: "file",
        size: 920000,
        parentId: "images-folder",
        modifiedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        modifiedBy: "홍길동",
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        uploadedBy: {
          id: "6",
          displayName: "홍길동",
          status: "away" as UserStatus,
        },
      },
    ],
  },

  // More root level files
  {
    id: "budget-xlsx",
    name: "예산_계획서.xlsx",
    type: "file",
    size: 450000,
    parentId: "root",
    modifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    modifiedBy: "김철수",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "1",
      displayName: "김철수",
      status: "online" as UserStatus,
    },
  },
  {
    id: "presentation-pptx",
    name: "프레젠테이션.pptx",
    type: "file",
    size: 3200000,
    parentId: "root",
    modifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    modifiedBy: "이영희",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    uploadedBy: {
      id: "2",
      displayName: "이영희",
      status: "online" as UserStatus,
    },
  },
];

// Chat tab mock data (different from threads)
const mockChatTabData = [
  {
    id: "chat-msg-1",
    content: "This thread discussion looks great!",
    type: "text" as const,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isEdited: false,
    sender: {
      id: "1",
      displayName: "김철수",
      status: "online" as const,
    },
  },
  {
    id: "chat-msg-2",
    content: "I agree with the proposed changes.",
    type: "text" as const,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    isEdited: false,
    sender: {
      id: "2",
      displayName: "이영희",
      status: "online" as const,
    },
  },
  {
    id: "chat-msg-3",
    content: "Let's schedule a follow-up meeting.",
    type: "text" as const,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isEdited: false,
    sender: {
      id: "3",
      displayName: "박민수",
      status: "away" as const,
    },
  },
];

export default function MainPage() {
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>("1");
  const [selectedThreadId, setSelectedThreadId] = useState<string>("thread-1");
  const [isThreadsOpen, setIsThreadsOpen] = useState<boolean>(false);

  const handleThreadSelect = (threadId: string) => {
    setSelectedThreadId(threadId);
    console.log("선택된 스레드:", threadId);
  };

  const handleToggleThreads = () => {
    setIsThreadsOpen(!isThreadsOpen);
  };

  const handleCreateThread = (files: File[]) => {
    console.log("스레드 생성:", files);
    // 실제로는 여기서 스레드를 생성하고 파일을 업로드
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      {/* Left: Chat Room List */}
      <ResizablePanel
        id="chat-room-list"
        order={1}
        defaultSize={isThreadsOpen ? 15 : 20}
        minSize={15}
        maxSize={25}
        className="bg-muted/30"
      >
        <ChatRoomList />
      </ResizablePanel>

      <ResizableHandle />

      {/* Middle: Chat Room Content */}
      <ResizablePanel
        id="chat-content"
        order={2}
        defaultSize={isThreadsOpen ? 55 : 80}
        minSize={50}
        maxSize={isThreadsOpen ? 65 : 85}
        className="bg-background"
      >
        <ChatRoomContent
          onSendMessage={(message) => {
            console.log("메시지 전송:", message);
          }}
          onFileUpload={(files) => {
            console.log("파일 공유:", files);
          }}
          onCreateThread={handleCreateThread}
          onToggleThreads={handleToggleThreads}
          isThreadsOpen={isThreadsOpen}
        />
      </ResizablePanel>

      {isThreadsOpen && selectedChatRoomId && (
        <>
          <ResizableHandle />
          {/* Right Thread Panel */}
          <ResizablePanel
            id="thread-panel"
            order={3}
            defaultSize={30}
            minSize={20}
            maxSize={40}
            className="bg-muted/20"
          >
            <ThreadPanel
              files={mockFilesTabData}
              threadMessages={mockChatTabData}
              threads={mockThreadsTabData}
              selectedThreadId={selectedThreadId}
              onFileSelect={(fileId) => {
                console.log("파일 선택:", fileId);
              }}
              onFileUpload={(files) => {
                console.log("파일 업로드:", files);
                // 파일 업로드 시 자동으로 스레드 생성
              }}
              onSendMessage={(message) => {
                console.log("메시지 전송:", message);
              }}
              onThreadSelect={handleThreadSelect}
              onTabChange={(tab) => {
                console.log("탭 변경:", tab);
              }}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
