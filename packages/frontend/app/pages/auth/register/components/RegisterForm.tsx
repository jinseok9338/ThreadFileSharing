import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/registerSchema";
import useRegister from "../hooks/useRegister";
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

const RegisterForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      password: "",
    },
  });

  const { mutateAsync, isPending } = useRegister();

  const onSubmit = async (data: RegisterFormData) => {
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
      // Redirect to home after successful registration
      navigate("/", { replace: true });
    } catch (error) {
      const message = await getServerErrorMessage(error, t);
      toast.error(message);
    }
  };

  return (
    <Card className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg">
      <Heading1 className="mb-2">{t("auth.registerTitle")}</Heading1>
      <BodyText className="text-muted-foreground mb-6">
        {t("auth.registerDescription")}
      </BodyText>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name Input */}
        <div>
          <Label htmlFor="fullName" className="mb-2">
            {t("auth.fullName")}
          </Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            className={errors.fullName ? "border-destructive" : ""}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            aria-invalid={errors.fullName ? "true" : "false"}
            {...register("fullName")}
          />
          {errors.fullName && (
            <Caption
              id="fullName-error"
              className="text-destructive mt-1"
              role="alert"
            >
              {t(errors.fullName.message as string)}
            </Caption>
          )}
        </div>

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

        {/* Company Name Input */}
        <div>
          <Label htmlFor="companyName" className="mb-2">
            {t("auth.companyName")}
          </Label>
          <Input
            id="companyName"
            type="text"
            autoComplete="organization"
            className={errors.companyName ? "border-destructive" : ""}
            aria-describedby={
              errors.companyName ? "companyName-error" : undefined
            }
            aria-invalid={errors.companyName ? "true" : "false"}
            {...register("companyName")}
          />
          {errors.companyName && (
            <Caption
              id="companyName-error"
              className="text-destructive mt-1"
              role="alert"
            >
              {t(errors.companyName.message as string)}
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
              autoComplete="new-password"
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
          aria-describedby="register-button-description"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? t("auth.registering") : t("auth.register")}
        </Button>
        <Caption id="register-button-description" className="sr-only">
          {isPending ? t("auth.registering") : t("auth.register")}
        </Caption>
      </form>

      {/* Login Link */}
      <BodyTextSmall className="text-center mt-4">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/auth/login" className="hover:underline">
          {t("auth.login")}
        </Link>
      </BodyTextSmall>
    </Card>
  );
};

export default RegisterForm;
