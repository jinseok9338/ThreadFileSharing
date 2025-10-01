# SettingsPage 컴포넌트

## 개요

애플리케이션 설정을 관리하는 페이지입니다. 테마, 언어, 알림 등의 설정을 제공합니다.

## 목적

- 애플리케이션 설정 관리
- 다크모드 토글 기능
- 향후 언어 및 알림 설정 확장
- 사용자 경험 개선

## 파일 위치

`packages/frontend/app/pages/settings/index.tsx`

## Props

```typescript
// 현재는 props 없음 - 페이지 컴포넌트
```

## 내부 구조

### 컴포넌트 구조

```tsx
<div className="h-full p-6">
  <div className="max-w-2xl mx-auto space-y-6">
    {/* 페이지 헤더 */}
    <div>
      <Heading2>{t("settings.title")}</Heading2>
      <BodyText className="text-muted-foreground">
        {t("settings.description")}
      </BodyText>
    </div>

    {/* 테마 설정 카드 */}
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.theme")}</CardTitle>
        <CardDescription>{t("settings.themeDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-toggle">{t("settings.darkMode")}</Label>
            <BodyText className="text-sm text-muted-foreground">
              {t("settings.darkModeDescription")}
            </BodyText>
          </div>
          <Switch
            id="theme-toggle"
            checked={theme === "dark"}
            onCheckedChange={handleThemeToggle}
            aria-label={t("settings.darkMode")}
          />
        </div>
      </CardContent>
    </Card>

    {/* 언어 설정 카드 (향후 구현) */}
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.language")}</CardTitle>
        <CardDescription>{t("settings.languageDescription")}</CardDescription>
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

    {/* 알림 설정 카드 (향후 구현) */}
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
              새 메시지 알림을 받습니다
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
```

## 사용되는 컴포넌트

### Typography 컴포넌트

- `Heading2` - 페이지 제목
- `BodyText` - 설명 텍스트

### shadcn/ui 컴포넌트

- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` - 카드 레이아웃
- `Switch` - 다크모드 토글
- `Label` - 라벨 텍스트

### 외부 라이브러리

- `useTheme` - next-themes 테마 관리
- `useTranslation` - react-i18next 다국어 지원

## 스타일링

### 컨테이너 스타일

- `h-full p-6` - 전체 높이, 24px 패딩
- `max-w-2xl mx-auto space-y-6` - 최대 너비, 중앙 정렬, 카드 간 간격

### 카드 스타일

- `Card` - 기본 카드 스타일
- `CardHeader` - 카드 헤더 영역
- `CardContent` - 카드 내용 영역

### 설정 항목 스타일

- `flex items-center justify-between` - 양쪽 정렬
- `space-y-0.5` - 텍스트 간 간격

## 상태 관리

### 테마 상태

```typescript
const { theme, setTheme } = useTheme();

const handleThemeToggle = (checked: boolean) => {
  setTheme(checked ? "dark" : "light");
};
```

### 다국어 상태

```typescript
const { t } = useTranslation();
```

## 기능

### 다크모드 토글

- **현재 테마 감지**: `theme === "dark"`
- **토글 기능**: Switch 컴포넌트로 테마 변경
- **실시간 적용**: 즉시 테마 변경 반영

### 향후 기능

- **언어 설정**: 다국어 지원 확장
- **알림 설정**: 알림 관련 설정 관리

## 접근성

### 키보드 네비게이션

- Switch 컴포넌트에 `id` 및 `aria-label` 속성
- Label과 Switch 연결 (`htmlFor` 속성)

### 스크린 리더 지원

- `aria-label` 속성으로 토글 기능 설명
- 의미있는 라벨 텍스트

## 테마 지원

### Light/Dark 테마

- `useTheme` hook으로 현재 테마 감지
- `setTheme`으로 테마 변경
- 모든 컴포넌트가 자동으로 테마에 따라 스타일 변경

## 사용 예시

### 라우팅

```tsx
// _main.settings._index.tsx
export const Route: Route = {
  element: <SettingsPage />,
};
```

### 네비게이션

- 사이드바의 설정 아이콘 클릭
- `/settings` 경로로 이동

## 테스트 시나리오

### 다크모드 토글

1. 설정 페이지에서 Switch 토글 확인
2. 토글 클릭 시 테마 변경 확인
3. 페이지 새로고침 후 테마 유지 확인

### 접근성

1. 키보드로 Switch 포커스 및 토글 확인
2. 스크린 리더에서 설정 항목 인식 확인

### 반응형

1. 다양한 화면 크기에서 레이아웃 확인
2. 카드 레이아웃이 적절하게 조정되는지 확인

### 다국어

1. 모든 텍스트가 번역 키로 표시되는지 확인
2. 언어 변경 시 텍스트 업데이트 확인
