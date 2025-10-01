import { Outlet } from "react-router";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Sidebar } from "~/components/navigation/Sidebar";
import { ChatRoomList } from "~/components/chat/ChatRoomList";

export function meta() {
  return [
    { title: "ThreadFileSharing - Main" },
    { name: "description", content: "File-centric chat with threads" },
  ];
}

export default function MainLayout() {
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string>();

  const handleChatRoomSelect = (chatRoomId: string) => {
    setSelectedChatRoomId(chatRoomId);
  };

  const handleCreateNewRoom = () => {
    // TODO: 새 채팅룸 생성 로직
    console.log("새 채팅룸 생성");
  };

  return (
    <div className="h-screen w-full flex">
      {/* Left Navigation Panel - Fixed 64px */}
      <div className="w-16 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Resizable Panel Group for Middle and Right */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
        {/* Middle Chat Room List Panel */}
        <ResizablePanel defaultSize={20} minSize={17} maxSize={35}>
          <ChatRoomList
            selectedChatRoomId={selectedChatRoomId}
            onChatRoomSelect={handleChatRoomSelect}
            onCreateNewRoom={handleCreateNewRoom}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Page Content Area */}
        <ResizablePanel defaultSize={85} minSize={65}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
