# AppLogo 컴포넌트

## 개요

ThreadFileSharing 애플리케이션의 로고/아이콘을 표시하는 컴포넌트입니다. Sidebar 상단에 위치하며, 앱의 브랜딩을 담당합니다.

## 목적

- 애플리케이션 브랜딩 표시
- 컴팩트한 80px 폭에 맞는 로고 디자인
- 클릭 시 홈으로 이동 기능
- 테마에 따른 로고 색상 변경

## 파일 위치

`packages/frontend/app/components/navigation/AppLogo.tsx`

## Props

```typescript
interface AppLogoProps {
  size?: "sm" | "md" | "lg"; // 로고 크기 (기본: "md")
  showText?: boolean; // 텍스트 표시 여부 (기본: false)
  onClick?: () => void; // 클릭 핸들러 (선택사항)
  className?: string; // 추가 CSS 클래스
}
```

## 내부 구조

### 컴포넌트 구조

```tsx
<div className={cn("flex items-center justify-center", className)}>
  <Link to="/main" className="flex items-center space-x-2">
    {/* 로고 아이콘 */}
    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
      <FileText className="w-5 h-5 text-primary-foreground" />
    </div>

    {/* 로고 텍스트 (조건부) */}
    {showText && (
      <span className="text-sm font-semibold text-foreground">TFS</span>
    )}
  </Link>
</div>
```

## 로고 디자인

### 아이콘 디자인

- **아이콘**: `FileText` (lucide-react) - 파일과 스레드 개념
- **배경**: `bg-primary` - 브랜드 컬러
- **크기**: 32px × 32px (w-8 h-8)
- **모양**: 둥근 모서리 (rounded-lg)

### 텍스트 디자인 (선택사항)

- **텍스트**: "TFS" (ThreadFileSharing 약자)
- **폰트**: `text-sm font-semibold`
- **색상**: `text-foreground` (테마에 따라 변경)

## 크기 변형

### Small (sm)

- 아이콘: 24px × 24px (w-6 h-6)
- 텍스트: `text-xs`

### Medium (md) - 기본

- 아이콘: 32px × 32px (w-8 h-8)
- 텍스트: `text-sm`

### Large (lg)

- 아이콘: 40px × 40px (w-10 h-10)
- 텍스트: `text-base`

## 사용되는 컴포넌트

### shadcn/ui 컴포넌트

- `Button` - 클릭 가능한 영역 (선택사항)

### 외부 라이브러리

- `FileText` - lucide-react 아이콘
- `Link` - React Router Link 컴포넌트
- `cn` - 클래스명 병합 유틸리티

## 스타일링

### 컨테이너 스타일

- `flex items-center justify-center` - 중앙 정렬
- `p-3` - 12px 패딩 (Sidebar 상단 영역)

### 아이콘 스타일

- `w-8 h-8` - 32px × 32px 크기
- `rounded-lg` - 둥근 모서리
- `bg-primary` - 브랜드 배경색
- `flex items-center justify-center` - 아이콘 중앙 정렬

### 텍스트 스타일

- `text-sm font-semibold` - 작은 크기, 굵은 글씨
- `text-foreground` - 테마에 따른 텍스트 색상

### 호버 효과

- `hover:scale-105` - 호버 시 살짝 확대
- `transition-transform` - 부드러운 변환 효과

## 상태 관리

### Props 기반 상태

- `size` prop으로 크기 제어
- `showText` prop으로 텍스트 표시 제어

### 내부 상태

- 현재는 내부 상태 없음
- 모든 상태는 props로 제어

## 라우팅 연동

### 홈 링크

- 클릭 시 `/main`으로 이동
- React Router Link 사용

### 링크 스타일

- 기본 링크 스타일 제거
- 커스텀 스타일링 적용

## 접근성

### 키보드 네비게이션

- Tab으로 포커스 가능
- Enter/Space로 활성화
- 링크 역할로 인식

### 스크린 리더 지원

- `aria-label="ThreadFileSharing 홈으로 이동"`
- 링크 역할 자동 인식

### 포커스 관리

- 포커스 시 명확한 시각적 피드백
- 키보드 네비게이션 순서 고려

## 테마 지원

### Light/Dark 테마

- CSS 변수를 통한 자동 테마 적용
- `bg-primary`, `text-foreground` 등 사용

### 색상 변화

- Primary 색상은 테마에 따라 변경
- 텍스트 색상은 자동으로 조정

## 성능 최적화

### 렌더링 최적화

- `memo` 사용으로 불필요한 리렌더링 방지
- 아이콘 컴포넌트 최적화

### 이미지 최적화

- SVG 아이콘 사용으로 선명도 보장
- 작은 크기로 빠른 로딩

## 사용 예시

### 기본 사용법

```tsx
<AppLogo />
```

### 텍스트 포함

```tsx
<AppLogo showText={true} />
```

### 크기 지정

```tsx
<AppLogo size="lg" showText={true} />
```

### Sidebar에서 사용

```tsx
<div className="p-3">
  <AppLogo />
</div>
```

## 테스트 시나리오

### 기본 렌더링

1. 아이콘이 올바르게 표시되는지 확인
2. 크기가 32px × 32px인지 확인
3. 둥근 모서리와 배경색이 적용되었는지 확인

### 크기 변형

1. `size` prop에 따른 크기 변화 확인
2. 텍스트 표시 시 레이아웃 변화 확인
3. 다양한 크기에서 정렬이 올바른지 확인

### 인터랙션

1. 클릭 시 `/main`으로 이동하는지 확인
2. 호버 효과가 작동하는지 확인
3. 키보드 네비게이션이 작동하는지 확인

### 접근성

1. 스크린 리더에서 링크로 인식하는지 확인
2. 키보드만으로 접근 가능한지 확인
3. 포커스 표시가 명확한지 확인

### 테마 지원

1. Light/Dark 테마에서 색상이 올바른지 확인
2. Primary 색상이 테마에 따라 변경되는지 확인
3. 텍스트 색상이 자동으로 조정되는지 확인
