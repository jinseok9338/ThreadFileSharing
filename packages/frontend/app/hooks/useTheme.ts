import { useEffect } from "react";
import { useThemeStore } from "~/stores/themeStore";
import type { ThemeName } from "~/constants/themes";

/**
 * 테마 관리 Hook
 *
 * @example
 * ```tsx
 * function ThemeSwitcher() {
 *   const { theme, isDark, setTheme, toggleDark } = useTheme();
 *
 *   return (
 *     <div>
 *       <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}>
 *         <option value="default">Default</option>
 *         <option value="claude">Claude</option>
 *       </select>
 *       <button onClick={toggleDark}>
 *         {isDark ? "Light" : "Dark"}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const { theme, isDark, setTheme, toggleDark, setDark } = useThemeStore();

  // 컴포넌트 마운트 시 HTML 속성 동기화
  useEffect(() => {
    if (typeof document !== "undefined") {
      // data-theme 속성 설정
      document.documentElement.setAttribute("data-theme", theme);

      // dark class 설정
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isDark]);

  return {
    theme,
    isDark,
    setTheme,
    toggleDark,
    setDark,
  };
}
