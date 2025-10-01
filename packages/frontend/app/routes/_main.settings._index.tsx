import type { Route } from "./+types/_main.settings._index";
import SettingsPage from "~/pages/settings";

export function meta({ matches }: Route.MetaArgs) {
  return [
    { title: "ThreadFileSharing - 설정" },
    { name: "description", content: "애플리케이션 설정 관리" },
  ];
}

const SettingsRoute = () => {
  return <SettingsPage />;
};

export default SettingsRoute;
