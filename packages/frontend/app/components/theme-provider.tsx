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

  // 초기 로딩 시 깜빡임 방지를 위한 스크립트는 Layout에서 처리
  useEffect(() => {
    // 이미 useTheme hook에서 HTML 속성을 동기화하지만,
    // 혹시 모를 동기화 문제를 방지하기 위해 한 번 더 확인
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isDark]);

  return <>{children}</>;
}

/**
 * 초기 테마 로딩 스크립트
 *
 * Layout의 <head>에 추가하여 깜빡임 방지
 * SSR/SSG 시 localStorage에서 테마를 미리 로드
 */
export const themeInitScript = `
(function() {
  try {
    const stored = localStorage.getItem('theme-storage');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.theme) {
        document.documentElement.setAttribute('data-theme', state.theme);
      }
      if (state?.isDark) {
        document.documentElement.classList.add('dark');
      }
    } else {
      // 기본값 설정
      document.documentElement.setAttribute('data-theme', 'default');
    }
  } catch (e) {
    console.error('Failed to load theme:', e);
  }
})();
`;
