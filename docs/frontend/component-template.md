# [컴포넌트명]

> 이 템플릿을 복사하여 새로운 컴포넌트 문서를 작성하세요.

## 개요

- **목적**: [이 컴포넌트가 하는 일을 한 문장으로]
- **사용 위치**: [어느 페이지/부모 컴포넌트에서 사용되는지]

---

## 레이아웃

### Container

- **className**: `[전체 클래스명을 여기에]`
- **padding**: [예: p-4, px-6, py-3]
- **margin**: [예: m-0, mx-auto, my-4]
- **width**: [예: w-full, max-w-lg, w-[500px]]
- **height**: [예: h-auto, min-h-screen, h-[200px]]
- **background**: [예: bg-white, bg-gray-100]
- **border**: [예: border, border-b, rounded-lg]

### Flexbox/Grid

- **display**: [flex, grid 또는 없음]
- **direction**: [flex-row, flex-col 또는 grid-cols-2]
- **align**: [items-center, items-start, items-end]
- **justify**: [justify-between, justify-center, justify-start]
- **gap**: [gap-2, gap-4, space-y-4, space-x-2]

---

## 내부 구조

> ASCII 또는 들여쓰기로 컴포넌트 계층 구조를 표현하세요.

```
<Container> (flex flex-col gap-4 p-6 bg-white rounded-lg)
  ├─ <Header> (flex items-center justify-between mb-4)
  │    ├─ <Heading2>제목</Heading2>
  │    └─ <Button>액션</Button>
  │
  ├─ <Content> (flex-1 space-y-2)
  │    ├─ <BodyText>첫 번째 내용</BodyText>
  │    └─ <BodyText>두 번째 내용</BodyText>
  │
  └─ <Footer> (flex justify-end mt-4)
       └─ <Button>확인</Button>
```

---

## 사용 컴포넌트

### shadcn/ui

- **Button**:
  - variant: [default, destructive, outline, ghost]
  - size: [sm, md, lg]
  - 사용 위치: [어디에 사용되는지]
- **Input**:
  - placeholder: [예시 텍스트]
  - 사용 위치: [어디에 사용되는지]
- **[기타 shadcn 컴포넌트]**:
  - 옵션: [variant, size 등]
  - 사용 위치: [어디에 사용되는지]

### 폰트 컴포넌트

- **Heading1**: [사용되는 텍스트 - 예: "페이지 제목"]
- **Heading2**: [사용되는 텍스트]
- **BodyText**: [사용되는 텍스트]
- **Caption**: [사용되는 텍스트]
- **Label**: [사용되는 텍스트]

### 커스텀 컴포넌트

- **[컴포넌트명]**: [역할 및 위치]

---

## 상태 관리

> 상태 관리는 다음 우선순위로 선택하세요:
>
> 1. **nuqs (URL)** - URL과 동기화 필요 시 (필터, 탭, 검색 등) ⭐
> 2. **useState** - 컴포넌트 내부 임시 상태
> 3. **Zustand** - 전역 공유 필요 시
> 4. **TanStack Query** - 서버 데이터

### URL 상태 (nuqs) - 우선 고려 ⭐

> URL과 동기화가 필요한 상태는 nuqs를 사용하세요.
> 브라우저 뒤로가기, URL 공유, 새로고침 시 상태 유지가 가능합니다.
> **반드시 상수 정의 방식을 사용하세요.**

**1. 상수 정의** (constants/query-keys.ts):

```typescript
export const QUERY_KEYS = {
  FILTER: {
    key: "filter",
    defaultValue: "all",
  },
  PAGE: {
    key: "page",
    defaultValue: 1,
  },
  SEARCH: {
    key: "search",
    defaultValue: "",
  },
} as const;
```

**2. 사용 방법**:

- **[상태명]**: [타입] - [설명]
  - Query Key: `QUERY_KEYS.[상태명].key`
  - 기본값: `QUERY_KEYS.[상태명].defaultValue`
  - Parser: `parseAsString` | `parseAsInteger` | `parseAsBoolean`
  - 사용 예시:
    ```tsx
    const [filter, setFilter] = useQueryState(
      QUERY_KEYS.FILTER.key,
      parseAsString.withDefault(QUERY_KEYS.FILTER.defaultValue)
    );
    ```
  - URL: `?filter=active`

**사용 예시**:

```tsx
// parseAsString - 문자열 상태
const [filter, setFilter] = useQueryState(
  QUERY_KEYS.FILTER.key,
  parseAsString.withDefault(QUERY_KEYS.FILTER.defaultValue)
);

// parseAsInteger - 숫자 상태
const [page, setPage] = useQueryState(
  QUERY_KEYS.PAGE.key,
  parseAsInteger.withDefault(QUERY_KEYS.PAGE.defaultValue)
);

// parseAsBoolean - boolean 상태 (모달 등, 신중히 사용)
const IS_MODAL_OPEN = {
  key: "isModalOpen",
  defaultValue: false,
};
const [isOpen, setIsOpen] = useQueryState(
  IS_MODAL_OPEN.key,
  parseAsBoolean.withDefault(IS_MODAL_OPEN.defaultValue)
);
```

### 로컬 상태 (useState)

> URL과 동기화가 불필요한 임시 상태만 사용하세요.

- **[상태명]**: [타입] - [설명]
  - 초기값: `[초기값]`
  - 변경 시점: [언제 변경되는지]
  - 사용 이유: [왜 nuqs가 아닌 useState를 사용하는지 - 예: 모달 임시 상태]

### 전역 상태 (Zustand)

> 여러 컴포넌트에서 공유하는 클라이언트 상태에만 사용하세요.

- **Store**: [스토어 이름 - 예: useUserStore, useThemeStore]
  - 사용 상태: `[상태명]`
  - 사용 이유: [왜 전역 상태가 필요한지]

### 서버 상태 (TanStack Query)

> API 데이터는 TanStack Query로 관리하세요.

- **Query Key**: `[쿼리 키 배열]`
  - API: `[엔드포인트 - 예: GET /api/v1/threads]`
  - 의존성: [어떤 상태에 의존하는지 - nuqs 상태 포함]
  - 예시: `["threads", filter, search]`

**사용 예시**:

```tsx
// nuqs 상태를 TanStack Query 의존성으로 사용
const [filter] = useQueryState(
  QUERY_KEYS.FILTER.key,
  parseAsString.withDefault(QUERY_KEYS.FILTER.defaultValue)
);

const { data } = useQuery({
  queryKey: ["threads", filter], // nuqs 상태를 의존성으로 사용
  queryFn: () => fetchThreads(filter),
});
```

---

## 스타일 상세

### 색상

- **배경색**: [예: bg-white, bg-gray-50]
- **텍스트 색상**: [예: text-gray-900, text-gray-500]
- **강조 색상**: [예: text-blue-600, bg-blue-50]
- **테두리 색상**: [예: border-gray-200]

### 여백

- **외부 여백 (margin)**: [예: mx-auto (수평 가운데), my-4 (상하 16px)]
- **내부 여백 (padding)**: [예: px-6 (좌우 24px), py-4 (상하 16px)]
- **요소 간 간격 (gap)**: [예: gap-4 (16px), space-y-2 (수직 8px)]

### 크기

- **너비**: [예: w-full (100%), max-w-2xl (최대 672px)]
- **높이**: [예: h-auto (자동), min-h-[200px] (최소 200px)]

### 기타 스타일

- **그림자**: [예: shadow-sm, shadow-lg]
- **둥근 모서리**: [예: rounded-lg, rounded-full]
- **투명도**: [예: opacity-50, bg-black/20]

---

## 반응형 디자인

### 모바일 (< 640px)

- **레이아웃 변경**: [예: flex-col, gap-2]
- **패딩 조정**: [예: px-4, py-2]
- **폰트 크기**: [예: text-sm]
- **숨김/표시**: [예: hidden sm:block]

### 태블릿 (640px ~ 1024px)

- **레이아웃 변경**: [예: md:flex-row, md:gap-4]
- **패딩 조정**: [예: md:px-6, md:py-3]
- **그리드 컬럼**: [예: md:grid-cols-2]

### 데스크톱 (> 1024px)

- **레이아웃 변경**: [예: lg:flex-row, lg:gap-6]
- **최대 너비**: [예: lg:max-w-7xl]
- **그리드 컬럼**: [예: lg:grid-cols-3]

---

## 접근성

### ARIA 속성

- **aria-label**: [설명적 레이블]
- **aria-describedby**: [상세 설명 ID]
- **role**: [역할 - button, dialog, navigation 등]

### 키보드 네비게이션

- **Tab**: [Tab 키로 이동 가능한 요소]
- **Enter/Space**: [실행 가능한 액션]
- **Escape**: [닫기/취소 동작]
- **Arrow Keys**: [방향키 사용]

### 스크린 리더

- **sr-only**: [시각적으로 숨겨진 텍스트]
- **alt 텍스트**: [이미지 대체 텍스트]

---

## 상호작용

### 이벤트

- **onClick**: [클릭 시 동작]
- **onChange**: [변경 시 동작]
- **onSubmit**: [제출 시 동작]
- **onFocus/onBlur**: [포커스 이벤트]

### 호버 효과

- **hover:bg-gray-100**: [호버 시 배경색 변경]
- **hover:text-blue-600**: [호버 시 텍스트 색상 변경]

### 활성 상태

- **active:scale-95**: [클릭 시 크기 축소]
- **focus:ring-2**: [포커스 시 링 표시]

---

## 예시 코드

```tsx
// 기본 사용
<ComponentName />

// props와 함께 사용
<ComponentName
  title="제목"
  onAction={handleAction}
/>

// 조건부 렌더링
{isVisible && <ComponentName />}
```

---

## 참고 사항

- [특별히 주의해야 할 사항]
- [다른 컴포넌트와의 관계]
- [알려진 제약 사항]
- [향후 개선 계획]

---

## 변경 이력

- **YYYY-MM-DD**: [변경 내용]
