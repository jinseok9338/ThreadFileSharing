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
      },

      toggleDark: () => {
        set((state) => ({ isDark: !state.isDark }));
      },

      setDark: (isDark) => {
        set({ isDark });
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
