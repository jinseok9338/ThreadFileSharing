import { DEFAULT_META } from "~/constants/consts";
import AuthRegisterPage from "~/pages/auth/register";
import type { Route } from "./+types/_auth.auth.register._index";

export function meta({}: Route.MetaArgs) {
  return DEFAULT_META;
}

const AuthRegisterRoute = () => {
  return <AuthRegisterPage />;
};

export default AuthRegisterRoute;
