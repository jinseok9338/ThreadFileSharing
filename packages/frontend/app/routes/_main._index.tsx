import type { Route } from "./+types/_main._index";
import MainPage from "~/pages/main";

export function meta({ matches }: Route.MetaArgs) {
  return [
    { title: "ThreadFileSharing - Main" },
    { name: "description", content: "File-centric chat with threads" },
  ];
}

export default function MainIndex() {
  return <MainPage />;
}
