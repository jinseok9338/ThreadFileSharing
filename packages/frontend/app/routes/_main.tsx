import { Outlet } from "react-router";
import { Sidebar } from "~/components/navigation/Sidebar";

export function meta() {
  return [
    { title: "ThreadFileSharing - Main" },
    { name: "description", content: "File-centric chat with threads" },
  ];
}

export default function MainLayout() {
  return (
    <div className="h-screen w-full flex">
      {/* Left Navigation Panel - Fixed 64px */}
      <div className="w-16 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Page Content Area - Takes remaining space */}
      <div className="flex-1 h-full">
        <Outlet />
      </div>
    </div>
  );
}
