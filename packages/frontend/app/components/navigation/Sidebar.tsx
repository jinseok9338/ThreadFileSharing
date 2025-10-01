import { useLocation } from "react-router";
import { AppLogo } from "./AppLogo";
import { NavigationItem } from "./NavigationItem";
import { UserProfile } from "./UserProfile";

export function Sidebar() {
  const location = useLocation();

  const isChatActive =
    location.pathname === "/main" || location.pathname === "/";

  const isSettingsActive = location.pathname === "/settings";

  return (
    <div className="w-16 h-full flex flex-col bg-background border-r">
      {/* 상단: 앱 로고 */}
      <div className="p-2">
        <AppLogo size="sm" />
      </div>

      {/* 중간: 네비게이션 메뉴 */}
      <div className="flex-1 flex flex-col items-center space-y-1 py-2">
        <NavigationItem icon="chat" active={isChatActive} to="/main" />
        <NavigationItem
          icon="settings"
          active={isSettingsActive}
          to="/settings"
        />
      </div>

      {/* 하단: 사용자 프로필 */}
      <div className="p-2">
        <UserProfile />
      </div>
    </div>
  );
}
