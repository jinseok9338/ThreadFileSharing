import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Heading2, BodyText, BodyTextSmall } from "~/components/typography";
import { useTheme } from "~/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { THEME_OPTIONS } from "~/constants/themes";
import {
  Monitor,
  Moon,
  Sun,
  Palette,
  FileText,
  Code,
  Leaf,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, isDark, setTheme, setDark } = useTheme();
  const { t } = useTranslation();

  const handleThemeToggle = (checked: boolean) => {
    setDark(checked);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as any);
  };

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case "default":
        return <Monitor className="w-4 h-4" />;
      case "claude":
        return <Palette className="w-4 h-4" />;
      case "clean-slate":
        return <FileText className="w-4 h-4" />;
      case "vscode":
        return <Code className="w-4 h-4" />;
      case "nature":
        return <Leaf className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
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
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              {t("settings.theme")}
            </CardTitle>
            <CardDescription>{t("settings.themeDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 현재 테마 상태 표시 */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-blue-500" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <BodyText className="font-medium">현재 테마</BodyText>
                  <BodyTextSmall className="text-muted-foreground">
                    {theme} / {isDark ? "다크 모드" : "라이트 모드"}
                  </BodyTextSmall>
                </div>
              </div>
              <Badge variant={isDark ? "secondary" : "outline"}>
                {isDark ? "Dark" : "Light"}
              </Badge>
            </div>

            {/* 다크 모드 토글 */}
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

            {/* 테마 변경 버튼들 */}
            <div className="space-y-3">
              <Label>테마 변경 (디버깅용)</Label>
              <div className="grid grid-cols-2 gap-2">
                {THEME_OPTIONS.map((themeOption) => (
                  <Button
                    key={themeOption.name}
                    variant={theme === themeOption.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange(themeOption.name)}
                    className="flex items-center gap-2 justify-start"
                  >
                    {getThemeIcon(themeOption.name)}
                    {themeOption.label}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                각 테마별 설명:{" "}
                {THEME_OPTIONS.find((t) => t.name === theme)?.description}
              </div>
            </div>

            {/* 테마 정보 */}
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <div>디버깅 정보:</div>
              <div>• 현재 테마: {theme}</div>
              <div>• 다크 모드: {isDark ? "활성" : "비활성"}</div>
              <div>• CSS 변수: data-theme="{theme}"</div>
              <div>• 클래스: {isDark ? "dark" : "light"}</div>
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
