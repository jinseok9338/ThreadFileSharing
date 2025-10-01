import { useTheme } from "~/hooks/useTheme";
import { THEME_OPTIONS } from "~/constants/themes";
import type { ThemeName } from "~/constants/themes";

/**
 * 테마 전환 컴포넌트
 *
 * 사용자가 테마와 다크모드를 선택할 수 있는 UI 제공
 */
export function ThemeSwitcher() {
  const { theme, isDark, setTheme, toggleDark } = useTheme();

  return (
    <div className="flex items-center gap-4">
      {/* 테마 선택 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="theme-select" className="text-sm font-medium">
          Theme
        </label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeName)}
          className="px-3 py-2 border rounded-md bg-background text-foreground"
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option.name} value={option.name}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 다크모드 토글 */}
      <div className="flex flex-col gap-1">
        <label htmlFor="dark-toggle" className="text-sm font-medium">
          Mode
        </label>
        <button
          id="dark-toggle"
          onClick={toggleDark}
          className="px-3 py-2 border rounded-md bg-background text-foreground hover:bg-accent"
        >
          {isDark ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </div>
  );
}

/**
 * 테마 카드 선택 컴포넌트 (더 나은 UX)
 *
 * 테마를 카드 형태로 보여주고 선택할 수 있는 UI
 */
export function ThemeCardSwitcher() {
  const { theme, isDark, setTheme, toggleDark } = useTheme();

  return (
    <div className="space-y-4">
      {/* 다크모드 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Appearance</span>
        <button
          onClick={toggleDark}
          className="px-4 py-2 border rounded-lg bg-background text-foreground hover:bg-accent transition-colors"
        >
          {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      {/* 테마 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.name}
            onClick={() => setTheme(option.name)}
            className={`
              p-4 border-2 rounded-lg text-left transition-all
              hover:border-primary hover:shadow-md
              ${
                theme === option.name
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              }
            `}
          >
            <div className="font-semibold text-sm mb-1">{option.label}</div>
            <div className="text-xs text-muted-foreground">
              {option.description}
            </div>
            {theme === option.name && (
              <div className="mt-2 text-xs text-primary font-medium">
                ✓ Active
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
