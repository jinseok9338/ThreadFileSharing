import { Outlet } from "react-router";
import { DEFAULT_META } from "~/constants/consts";
import type { Route } from "./+types/_auth";
import AuthLayout from "~/components/layouts/AuthLayout";

export function meta({}: Route.MetaArgs) {
  return DEFAULT_META;
}

const AuthLayoutRoute = () => {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

export default AuthLayoutRoute;
