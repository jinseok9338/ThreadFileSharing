import { useEffect } from "react";
import { useTheme } from "~/hooks/useTheme";

/**
 * 테마 Provider 컴포넌트
 *
 * App 최상위에서 사용하여 localStorage에서 테마를 로드하고
 * HTML 속성을 동기화합니다.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    // 클라이언트에서만 DOM 조작
    if (typeof window !== "undefined") {
      const html = document.documentElement;

      // 테마 속성 설정
      html.setAttribute("data-theme", theme);

      // 다크 모드 클래스 토글
      if (isDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }

      // color-scheme 설정
      html.style.colorScheme = isDark ? "dark" : "light";
    }
  }, [theme, isDark]);

  return <>{children}</>;
}
