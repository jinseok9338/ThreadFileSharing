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

  return {
    theme,
    isDark,
    setTheme,
    toggleDark,
    setDark,
  };
}
