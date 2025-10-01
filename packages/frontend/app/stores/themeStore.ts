import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeName } from "~/constants/themes";
import { DEFAULT_THEME } from "~/constants/themes";

interface ThemeStore {
  theme: ThemeName;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleDark: () => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      isDark: false,

      setTheme: (theme) => {
        set({ theme });
        // HTML data-theme 속성 업데이트
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },

      toggleDark: () => {
        set((state) => {
          const newIsDark = !state.isDark;
          // HTML class 업데이트
          if (typeof document !== "undefined") {
            if (newIsDark) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          return { isDark: newIsDark };
        });
      },

      setDark: (isDark) => {
        set({ isDark });
        // HTML class 업데이트
        if (typeof document !== "undefined") {
          if (isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },
    }),
    {
      name: "theme-storage",
      // localStorage에 저장할 항목만 선택
      partialize: (state) => ({
        theme: state.theme,
        isDark: state.isDark,
      }),
    }
  )
);
