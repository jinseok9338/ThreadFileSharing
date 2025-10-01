import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Heading2, BodyText } from "~/components/typography";
import { useTheme } from "~/hooks/useTheme";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { isDark, setDark } = useTheme();
  const { t } = useTranslation();

  const handleThemeToggle = (checked: boolean) => {
    setDark(checked);
  };

  return (
    <div className="h-full p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <Heading2>{t("settings.title")}</Heading2>
          <BodyText className="text-muted-foreground">
            {t("settings.description")}
          </BodyText>
        </div>

        {/* 테마 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.theme")}</CardTitle>
            <CardDescription>{t("settings.themeDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-toggle">{t("settings.darkMode")}</Label>
                <BodyText className="text-sm text-muted-foreground">
                  {t("settings.darkModeDescription")}
                </BodyText>
              </div>
              <Switch
                id="theme-toggle"
                checked={isDark}
                onCheckedChange={handleThemeToggle}
                aria-label={t("settings.darkMode")}
              />
            </div>
          </CardContent>
        </Card>

        {/* 언어 설정 (향후 구현) */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
            <CardDescription>
              {t("settings.languageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.language")}</Label>
                <BodyText className="text-sm text-muted-foreground">
                  {t("settings.currentLanguage")}
                </BodyText>
              </div>
              <BodyText className="text-sm text-muted-foreground">
                {t("settings.comingSoon")}
              </BodyText>
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 (향후 구현) */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.notifications")}</CardTitle>
            <CardDescription>
              {t("settings.notificationsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.notifications")}</Label>
                <BodyText className="text-sm text-muted-foreground">
                  {t("settings.newMessageNotifications")}
                </BodyText>
              </div>
              <BodyText className="text-sm text-muted-foreground">
                {t("settings.comingSoon")}
              </BodyText>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
