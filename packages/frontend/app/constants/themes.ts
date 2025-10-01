/**
 * 테마 상수 정의
 * 프로젝트에서 사용 가능한 모든 테마 목록
 */

export const THEMES = {
  DEFAULT: "default",
  CLAUDE: "claude",
  CLEAN_SLATE: "clean-slate",
  VSCODE: "vscode",
  NATURE: "nature",
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    name: THEMES.DEFAULT,
    label: "Default",
    description: "기본 테마 - 깔끔하고 중립적인 디자인",
  },
  {
    name: THEMES.CLAUDE,
    label: "Claude",
    description: "Claude 테마 - 따뜻하고 편안한 색상",
  },
  {
    name: THEMES.CLEAN_SLATE,
    label: "Clean Slate",
    description: "Clean Slate 테마 - 미니멀하고 깨끗한 디자인",
  },
  {
    name: THEMES.VSCODE,
    label: "VSCode",
    description: "VSCode 테마 - 개발자 친화적인 색상",
  },
  {
    name: THEMES.NATURE,
    label: "Nature",
    description: "Nature 테마 - 자연스럽고 부드러운 색상",
  },
];

export const DEFAULT_THEME = THEMES.DEFAULT;
