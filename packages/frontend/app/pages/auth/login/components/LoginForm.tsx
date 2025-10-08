import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { loginSchema, type LoginFormData } from "../schemas/loginSchema";
import useLogin from "../hooks/useLogin";
import useUserStore from "~/stores/userStore";
import useTokenStore from "~/stores/tokenStore";
import { getServerErrorMessage } from "~/utils/api";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Heading1,
  BodyText,
  BodyTextSmall,
  Caption,
  Link,
} from "~/components/typography";

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync, isPending } = useLogin();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await mutateAsync(data);
      useUserStore.getState().login({
        user: response.user,
        company: response.company,
      });
      useTokenStore.getState().login({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      // Redirect to original path or home
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    } catch (error) {
      const message = await getServerErrorMessage(error, t);
      toast.error(message);
    }
  };

  return (
    <Card className="w-full p-8 bg-card rounded-lg shadow-lg">
      <Heading1 className="mb-2">{t("auth.loginTitle")}</Heading1>
      <BodyText className="text-muted-foreground mb-6">
        {t("auth.loginDescription")}
      </BodyText>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email Input */}
        <div>
          <Label htmlFor="email" className="mb-2">
            {t("auth.email")}
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className={errors.email ? "border-destructive" : ""}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email && (
            <Caption
              id="email-error"
              className="text-destructive mt-1"
              role="alert"
            >
              {t(errors.email.message as string)}
            </Caption>
          )}
        </div>

        {/* Password Input */}
        <div>
          <Label htmlFor="password" className="mb-2">
            {t("auth.password")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? t("auth.hidePassword") : t("auth.showPassword")
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <Caption
              id="password-error"
              className="text-destructive mt-1"
              role="alert"
            >
              {t(errors.password.message as string)}
            </Caption>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-describedby="login-button-description"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? t("auth.loggingIn") : t("auth.login")}
        </Button>
        <Caption id="login-button-description" className="sr-only">
          {isPending ? t("auth.loggingIn") : t("auth.login")}
        </Caption>
      </form>

      {/* Register Link */}
      <BodyTextSmall className="text-center mt-4">
        {t("auth.dontHaveAccount")}{" "}
        <Link href="/auth/register" className="hover:underline">
          {t("auth.register")}
        </Link>
      </BodyTextSmall>
    </Card>
  );
};

export default LoginForm;
