# 테마 CSS 파일 가이드

## 📁 이 폴더의 역할

각 테마의 CSS 변수를 정의하는 파일들이 저장됩니다.

## 🎨 테마 파일 형식

각 테마 파일은 다음 형식을 따라야 합니다:

```css
/* [테마명] Theme */

[data-theme="테마명"] {
  /* 라이트 모드 CSS 변수 */
  --background: #ffffff;
  --foreground: #000000;
  --card: #ffffff;
  --card-foreground: #000000;
  --popover: #ffffff;
  --popover-foreground: #000000;
  --primary: #0070f3;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #000000;
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  --accent: #f5f5f5;
  --accent-foreground: #000000;
  --destructive: #ef4444;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #0070f3;
  --chart-1: #3b82f6;
  --chart-2: #10b981;
  --chart-3: #f59e0b;
  --chart-4: #ef4444;
  --chart-5: #8b5cf6;
  --sidebar: #f9fafb;
  --sidebar-foreground: #000000;
  --sidebar-primary: #0070f3;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f5f5f5;
  --sidebar-accent-foreground: #000000;
  --sidebar-border: #e5e5e5;
  --sidebar-ring: #0070f3;
}

[data-theme="테마명"].dark {
  /* 다크 모드 CSS 변수 */
  --background: #000000;
  --foreground: #ffffff;
  /* ... 나머지 변수들 ... */
}
```

## 📝 현재 테마 목록

1. ✅ **default.css** - 기본 테마
2. ⏳ **claude.css** - Claude 테마 (CSS 추가 필요)
3. ⏳ **clean-slate.css** - Clean Slate 테마 (CSS 추가 필요)
4. ⏳ **vscode.css** - VSCode 테마 (CSS 추가 필요)
5. ⏳ **nature.css** - Nature 테마 (CSS 추가 필요)

## 🔧 새 테마 추가 방법

1. **테마 CSS 파일 생성**

   ```bash
   app/styles/themes/새테마명.css
   ```

2. **CSS 변수 정의**
   - `[data-theme="새테마명"]` 셀렉터 사용
   - 필수 변수 모두 포함
   - 라이트/다크 모드 모두 정의

3. **app.css에 import 추가**

   ```css
   @import "./styles/themes/새테마명.css";
   ```

4. **constants/themes.ts에 테마 추가**

   ```typescript
   export const THEMES = {
     // ...
     새테마명: "새테마명",
   } as const;

   export const THEME_OPTIONS: ThemeOption[] = [
     // ...
     {
       name: THEMES.새테마명,
       label: "새테마 표시명",
       description: "테마 설명",
     },
   ];
   ```

## 🎯 필수 CSS 변수 목록

모든 테마 파일은 다음 변수를 포함해야 합니다:

### 기본 색상

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`

### UI 요소

- `--border`
- `--input`
- `--ring`

### 차트 색상

- `--chart-1` ~ `--chart-5`

### 사이드바 (선택사항)

- `--sidebar`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

## 📚 참고

- [shadcn/ui Theme Generator](https://shadcnstudio.com/theme-generator)에서 테마 생성 및 export 가능
- Tailwind CSS 4 oklch() 색상 형식 지원
- Hex 색상도 사용 가능
