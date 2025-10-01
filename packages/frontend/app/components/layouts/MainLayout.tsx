import { Outlet } from "react-router";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Sidebar } from "~/components/ui/sidebar";

export function MainLayout() {
  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        {/* Left Navigation Panel */}
        <ResizablePanel defaultSize={280} minSize={280} maxSize={280}>
          <Sidebar>
            <div className="flex h-full flex-col">
              <div className="p-4">
                <h1 className="text-lg font-semibold">ThreadFileSharing</h1>
              </div>
              <div className="flex-1 space-y-2 p-2">
                <div className="rounded-md bg-accent p-2">
                  <span className="text-sm font-medium">채팅</span>
                </div>
                <div className="rounded-md p-2 hover:bg-accent">
                  <span className="text-sm">세팅</span>
                </div>
              </div>
            </div>
          </Sidebar>
        </ResizablePanel>

        <ResizableHandle />

        {/* Middle Chat Room List Panel */}
        <ResizablePanel defaultSize={320} minSize={60} maxSize={500}>
          <div className="h-full border-r bg-background">
            <div className="p-4">
              <h2 className="text-sm font-medium text-muted-foreground">
                채팅
              </h2>
            </div>
            <div className="flex-1 p-4">
              <div className="text-center text-sm text-muted-foreground">
                채팅룸이 없습니다
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Page Content Area (Right + Thread Panels) */}
        <div className="flex-1">
          <Outlet />
        </div>
      </ResizablePanelGroup>
    </div>
  );
}
