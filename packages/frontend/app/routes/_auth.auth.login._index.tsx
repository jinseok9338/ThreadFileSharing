import { DEFAULT_META } from "~/constants/consts";
import AuthLoginPage from "~/pages/auth/login";
import type { Route } from "./+types/_auth.auth.login._index";

export function meta({}: Route.MetaArgs) {
  return DEFAULT_META;
}

const AuthLoginRoute = () => {
  return <AuthLoginPage />;
};

export default AuthLoginRoute;
