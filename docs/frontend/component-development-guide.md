# 프론트엔드 컴포넌트 개발 가이드

## 개요

ThreadFileSharing 프론트엔드는 **문서 기반 컴포넌트 개발(Documentation-Driven Component Development)** 방식을 따릅니다. 피그마 대신 마크다운 문서로 컴포넌트의 레이아웃, 스타일, 구조를 명확히 정의합니다.

---

## 페이지 구성 원칙

### 1. **컴포넌트 조합 방식**

페이지는 독립적인 컴포넌트들의 조합으로 구성됩니다:

```tsx
// ✅ 좋은 예시
export default function ComplaintsPage() {
  return (
    <div className="flex-1 bg-anc-neutral-white min-h-[100dvh]">
      <ComplaintHeader />
      <ComplaintsTabHeader />
      <ComplaintFilterAndSearch />
      <ComplaintList />
      {/* Floating Action Button */}
      <div className="fixed bottom-[74px] right-4 z-40">
        <CreateComplaintFloatingButton />
      </div>
    </div>
  );
}
```

### 2. **상태 관리 원칙**

- ❌ **페이지에서 props로 상태 전달 지양**
- ✅ **각 컴포넌트가 자체적으로 상태 관리**

#### 상태 관리 전략

올바른 상태 관리 도구를 선택하는 것이 중요합니다:

1. **nuqs (URL Query State)** - 적극 활용 ⭐
   - URL과 동기화가 필요한 모든 상태
   - **사용 예시**: 필터, 탭, 검색어, 페이지네이션, 정렬 순서
   - **장점**: 브라우저 뒤로가기, URL 공유, 새로고침 시 상태 유지
   - **사용 방식**: 상수 정의 + parser 사용
2. **useState (로컬 상태)**
   - 컴포넌트 내부의 임시 상태
   - **사용 예시**: 모달 열림/닫힘, 드롭다운 열림/닫힘, 폼 입력값 (제출 전)
3. **Zustand (전역 상태)**
   - 여러 컴포넌트에서 공유하는 클라이언트 상태
   - **사용 예시**: 사용자 정보, 토큰, 테마 설정
4. **TanStack Query (서버 상태)**
   - API로부터 가져온 데이터
   - **사용 예시**: 스레드 목록, 파일 목록, 사용자 프로필

```tsx
// ❌ 나쁜 예시 - 페이지에서 props로 상태 전달
export default function ComplaintsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <ComplaintFilterAndSearch
        filter={filter}
        setFilter={setFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <ComplaintList filter={filter} searchQuery={searchQuery} />
    </div>
  );
}

// ✅ 좋은 예시 - 각 컴포넌트가 nuqs로 자체적으로 상태 관리
export default function ComplaintsPage() {
  return (
    <div>
      <ComplaintFilterAndSearch />
      <ComplaintList />
    </div>
  );
}

// 1. 먼저 query state 상수를 정의합니다 (페이지 또는 컴포넌트 폴더 내)
// app/pages/complaints/constants/query-keys.ts
export const COMPLAINT_QUERY_KEYS = {
  FILTER: {
    key: "filter",
    defaultValue: "all",
  },
  SEARCH: {
    key: "search",
    defaultValue: "",
  },
  TAB: {
    key: "tab",
    defaultValue: "pending",
  },
  PAGE: {
    key: "page",
    defaultValue: 1,
  },
} as const;

// 2. ComplaintFilterAndSearch 컴포넌트에서 상수와 parser 사용
function ComplaintFilterAndSearch() {
  const [filter, setFilter] = useQueryState(
    COMPLAINT_QUERY_KEYS.FILTER.key,
    parseAsString.withDefault(COMPLAINT_QUERY_KEYS.FILTER.defaultValue)
  );

  const [searchQuery, setSearchQuery] = useQueryState(
    COMPLAINT_QUERY_KEYS.SEARCH.key,
    parseAsString.withDefault(COMPLAINT_QUERY_KEYS.SEARCH.defaultValue)
  );

  // URL: /complaints?filter=pending&search=keyword
  // 이제 URL과 상태가 자동으로 동기화됩니다!

  return (
    <div>
      <Select value={filter} onValueChange={setFilter}>
        {/* 필터 옵션 */}
      </Select>
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

// 3. ComplaintList 컴포넌트에서 같은 상수 사용
function ComplaintList() {
  const [filter] = useQueryState(
    COMPLAINT_QUERY_KEYS.FILTER.key,
    parseAsString.withDefault(COMPLAINT_QUERY_KEYS.FILTER.defaultValue)
  );

  const [searchQuery] = useQueryState(
    COMPLAINT_QUERY_KEYS.SEARCH.key,
    parseAsString.withDefault(COMPLAINT_QUERY_KEYS.SEARCH.defaultValue)
  );

  const [page] = useQueryState(
    COMPLAINT_QUERY_KEYS.PAGE.key,
    parseAsInteger.withDefault(COMPLAINT_QUERY_KEYS.PAGE.defaultValue)
  );

  // 같은 query key를 사용하면 자동으로 동기화됩니다!
  // 두 컴포넌트가 props 없이도 상태를 공유합니다.

  const { data } = useQuery({
    queryKey: ["complaints", filter, searchQuery, page],
    queryFn: () => fetchComplaints(filter, searchQuery, page),
  });

  return <div>{/* 목록 렌더링 */}</div>;
}

// 4. 모달 열림/닫힘 같은 boolean 상태도 가능 (하지만 권장하지 않음)
const MODAL_QUERY_KEYS = {
  IS_EDIT_MODAL_OPEN: {
    key: "isEditModalOpen",
    defaultValue: false,
  },
} as const;

function EditModal() {
  const [isOpen, setIsOpen] = useQueryState(
    MODAL_QUERY_KEYS.IS_EDIT_MODAL_OPEN.key,
    parseAsBoolean.withDefault(MODAL_QUERY_KEYS.IS_EDIT_MODAL_OPEN.defaultValue)
  );

  // URL: /complaints?isEditModalOpen=true
  // 권장: 모달은 URL 공유가 필요하다면 사용, 아니면 useState 사용
}
```

### 3. **페이지의 역할**

페이지는 다음에만 집중합니다:

- 컴포넌트 배치 및 레이아웃
- 전체 페이지 구조 (배경색, 여백, 스크롤 영역)
- 고정 요소 위치 (fixed, sticky)

---

## 컴포넌트 개발 프로세스

### **필수 순서**

```
1. 📝 컴포넌트 문서 작성 (.md)
   ↓
2. 📖 문서 리뷰 및 승인
   ↓
3. 💻 컴포넌트 구현 (.tsx)
   ↓
4. ✅ 문서와 구현 일치 확인
```

### **파일 구조**

```
app/pages/complaints/
├── components/
│   ├── ComplaintHeader.tsx          # 컴포넌트 구현
│   ├── ComplaintHeader.md           # 컴포넌트 문서 (필수!)
│   ├── ComplaintsTabHeader.tsx
│   ├── ComplaintsTabHeader.md       # 컴포넌트 문서 (필수!)
│   ├── ComplaintFilterAndSearch.tsx
│   ├── ComplaintFilterAndSearch.md  # 컴포넌트 문서 (필수!)
│   └── ...
```

---

## 컴포넌트 문서 작성 가이드

### **필수 포함 내용**

#### 1. **컴포넌트 개요**

- 컴포넌트 이름
- 목적 및 역할
- 사용 위치

#### 2. **레이아웃 정보**

- **Container 스타일**
  - `padding`: p-4, px-6, py-3 등
  - `margin`: m-0, mx-auto, my-4 등
  - `width/height`: w-full, h-screen, max-w-lg 등
  - `배경색`: bg-white, bg-gray-100 등
  - `테두리`: border, border-b, rounded-lg 등

#### 3. **Flexbox/Grid 정보**

- **Flex 여부**: flex, flex-col, flex-row
- **정렬**: items-center, justify-between
- **간격**: gap-2, gap-4, space-y-4, space-x-2

#### 4. **내부 구조**

- 하위 컴포넌트 목록
- 각 하위 컴포넌트의 배치 및 간격
- 조건부 렌더링 로직

#### 5. **사용하는 shadcn/ui 컴포넌트**

- Button, Input, Dialog, Card 등
- variant 및 size 정보

#### 6. **타이포그래피**

- 사용하는 폰트 컴포넌트
- 텍스트 색상, 크기, 굵기

#### 7. **상호작용**

- 클릭, 호버 등 이벤트
- 상태 변화
- API 호출

---

## 컴포넌트 문서 템플릿

```markdown
# [컴포넌트명]

## 개요

- **목적**: [이 컴포넌트가 하는 일]
- **사용 위치**: [어느 페이지/부모 컴포넌트에서 사용]

## 레이아웃

### Container

- **className**: `[전체 클래스명]`
- **padding**: [p-4, px-6 등]
- **margin**: [m-0, mx-auto 등]
- **width**: [w-full, max-w-lg 등]
- **height**: [h-auto, min-h-screen 등]
- **background**: [bg-white 등]
- **border**: [border, rounded-lg 등]

### Flexbox/Grid

- **display**: [flex, grid]
- **direction**: [flex-row, flex-col]
- **align**: [items-center, items-start 등]
- **justify**: [justify-between, justify-center 등]
- **gap**: [gap-4, space-y-2 등]

## 내부 구조
```

[컴포넌트 구조를 ASCII 또는 텍스트로 표현]

예:
<Container> (flex flex-col gap-4 p-6)
├─ <Heading1>제목</Heading1>
├─ <Divider /> (my-2)
└─ <Content> (flex-1)
├─ <BodyText>내용</BodyText>
└─ <Button>액션</Button> (mt-4)

````

## 사용 컴포넌트

### shadcn/ui
- **Button**: variant="default", size="md"
- **Input**: placeholder="검색..."
- [기타 shadcn 컴포넌트]

### 폰트 컴포넌트
- **Heading1**: 제목용
- **BodyText**: 본문용
- **Caption**: 작은 텍스트용

### 커스텀 컴포넌트
- [사용하는 다른 커스텀 컴포넌트]

## 상태 관리

### URL 상태 (nuqs) - 우선 고려 ⭐

> 상수 정의 방식을 사용하여 타입 안전성과 재사용성을 확보하세요.

**상수 정의** (constants/query-keys.ts):
```typescript
export const QUERY_KEYS = {
  TAB: {
    key: "tab",
    defaultValue: "all",
  },
  SEARCH: {
    key: "search",
    defaultValue: "",
  },
  PAGE: {
    key: "page",
    defaultValue: 1,
  },
} as const;
```

**사용 방법**:
- **[상태명]**: [타입] - [설명]
  - Query Key: `QUERY_KEYS.[상태명].key`
  - 기본값: `QUERY_KEYS.[상태명].defaultValue`
  - Parser: `parseAsString` | `parseAsInteger` | `parseAsBoolean` 등
  - 사용 예시:
    ```tsx
    const [tab, setTab] = useQueryState(
      QUERY_KEYS.TAB.key,
      parseAsString.withDefault(QUERY_KEYS.TAB.defaultValue)
    );
    ```
  - URL: `?tab=active`

**Parser 종류**:
- `parseAsString` - 문자열 (필터, 탭, 검색어)
- `parseAsInteger` - 숫자 (페이지, ID)
- `parseAsBoolean` - boolean (모달 상태 - 신중히 사용)
- `parseAsArrayOf(parseAsString)` - 배열 (다중 선택)

### 로컬 상태 (useState)
- **[상태명]**: [타입] - [설명]
  - 초기값: [초기값]
  - 변경 시점: [언제 변경되는지]
  - 사용 이유: [왜 nuqs가 아닌 useState를 사용하는지]

### 전역 상태 (Zustand)
- **Store**: [어떤 스토어 사용]
  - 사용 상태: [어떤 상태 사용]
  - 사용 이유: [왜 전역 상태가 필요한지]

### 서버 상태 (TanStack Query)
- **Query Key**: [쿼리 키]
  - API: [엔드포인트]
  - 의존성: [어떤 상태에 의존하는지 - nuqs 상태 포함]

## 스타일 상세

### 색상
- **배경**: bg-white
- **텍스트**: text-gray-900, text-gray-500
- **강조**: text-blue-600

### 여백
- **외부 여백**: mx-auto, my-4
- **내부 여백**: px-6, py-4

### 크기
- **너비**: w-full, max-w-2xl
- **높이**: h-auto, min-h-[200px]

## 반응형 디자인

- **모바일**: [sm: 이하 스타일]
- **태블릿**: [md: 스타일]
- **데스크톱**: [lg: 스타일]

## 접근성

- **ARIA**: [aria-label, role 등]
- **키보드**: [Tab 네비게이션, Enter/Space 핸들링]
- **스크린 리더**: [sr-only 텍스트 등]

## 예시 코드

```tsx
<ComplaintHeader />
````

## 참고 사항

- [기타 주의사항 또는 참고할 내용]

````

---

## 폰트 컴포넌트 시스템

### **원칙**

- ❌ **className으로 직접 폰트 스타일 정의하지 않음**
- ✅ **폰트 컴포넌트 사용**

### **폰트 컴포넌트 예시**

```tsx
// app/components/typography/Heading1.tsx
interface Heading1Props {
  children: React.ReactNode;
  className?: string;
}

export function Heading1({ children, className }: Heading1Props) {
  return (
    <h1 className={cn("text-3xl font-bold text-gray-900", className)}>
      {children}
    </h1>
  );
}

// 사용
<Heading1>페이지 제목</Heading1>
<Heading1 className="text-blue-600">커스터마이징</Heading1>
````

### **폰트 컴포넌트 종류**

```
app/components/typography/
├── Heading1.tsx       # 큰 제목 (text-3xl, font-bold)
├── Heading2.tsx       # 중간 제목 (text-2xl, font-semibold)
├── Heading3.tsx       # 작은 제목 (text-xl, font-semibold)
├── BodyText.tsx       # 본문 텍스트 (text-base, font-normal)
├── BodyTextSmall.tsx  # 작은 본문 (text-sm, font-normal)
├── Caption.tsx        # 설명 텍스트 (text-xs, text-gray-500)
├── Label.tsx          # 라벨 (text-sm, font-medium)
└── Link.tsx           # 링크 텍스트 (text-blue-600, underline)
```

---

## shadcn/ui 기반 개발

### **기본 원칙**

1. **기본 컴포넌트는 shadcn/ui 사용**

   ```bash
   npx shadcn add button
   npx shadcn add input
   npx shadcn add dialog
   ```

2. **조합 컴포넌트는 shadcn 기반으로 커스터마이징**

   ```tsx
   // shadcn Button 기반 커스텀 버튼
   import { Button } from "~/components/ui/button";

   export function PrimaryButton({ children, ...props }) {
     return (
       <Button variant="default" size="lg" {...props}>
         {children}
       </Button>
     );
   }
   ```

---

## 예시: ComplaintsTabHeader 문서

```markdown
# ComplaintsTabHeader

## 개요

- **목적**: 민원 목록 페이지의 탭 헤더 (전체, 진행중, 완료)
- **사용 위치**: ComplaintsPage

## 레이아웃

### Container

- **className**: `flex items-center gap-2 px-6 py-3 bg-white border-b`
- **padding**: px-6 (좌우 24px), py-3 (상하 12px)
- **background**: bg-white
- **border**: border-b (하단 테두리)

### Flexbox

- **display**: flex
- **align**: items-center
- **gap**: gap-2 (8px)

## 내부 구조
```

<Container> (flex items-center gap-2 px-6 py-3 bg-white border-b)
├─ <Button variant="ghost">전체</Button>
├─ <Button variant="ghost">진행중</Button>
└─ <Button variant="ghost">완료</Button>

````

## 사용 컴포넌트

### shadcn/ui
- **Button**: variant="ghost", size="sm"

## 상태 관리

### 상수 정의 (constants/query-keys.ts)

```typescript
export const TAB_QUERY_KEYS = {
  TAB: {
    key: "tab",
    defaultValue: "all",
  },
} as const;
````

### URL 상태 (nuqs) ⭐

- **tab**: string - 현재 선택된 탭
  - Query Key: `TAB_QUERY_KEYS.TAB.key`
  - 기본값: `TAB_QUERY_KEYS.TAB.defaultValue`
  - Parser: `parseAsString`
  - 사용 예시:
    ```tsx
    const [tab, setTab] = useQueryState(
      TAB_QUERY_KEYS.TAB.key,
      parseAsString.withDefault(TAB_QUERY_KEYS.TAB.defaultValue)
    );
    ```
  - URL: `/complaints?tab=pending`

**사용 이유**:

- 탭 선택 상태를 URL과 동기화하여 북마크 및 공유 가능
- 브라우저 뒤로가기로 이전 탭으로 이동 가능
- 상수 정의로 타입 안전성 확보 및 재사용성 향상

## 스타일 상세

### 색상

- **배경**: bg-white
- **활성 탭**: bg-blue-50, text-blue-600
- **비활성 탭**: text-gray-600

### 여백

- **외부**: border-b
- **내부**: px-6, py-3
- **탭 간격**: gap-2

## 반응형 디자인

- **모바일**: gap-1, px-4, text-sm
- **데스크톱**: gap-2, px-6, text-base

```

---

## 체크리스트

### 컴포넌트 문서 작성 시

- [ ] 컴포넌트 개요 작성
- [ ] Container 스타일 명시 (padding, margin, width, height, background, border)
- [ ] Flexbox/Grid 정보 명시 (direction, align, justify, gap)
- [ ] 내부 구조 시각화
- [ ] 사용 컴포넌트 목록 (shadcn/ui, 폰트, 커스텀)
- [ ] 상태 관리 방식 설명
- [ ] 스타일 상세 정보 (색상, 여백, 크기)
- [ ] 반응형 디자인 고려
- [ ] 접근성 고려

### 컴포넌트 구현 시

- [ ] 문서 먼저 작성 완료
- [ ] 문서와 구현 일치 확인
- [ ] 폰트 컴포넌트 사용 (className 직접 사용 지양)
- [ ] shadcn/ui 기반 구현
- [ ] props 최소화 (자체 상태 관리)
- [ ] 접근성 속성 추가 (aria-label, role 등)

---

## 참고 문서

- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [React 19 문서](https://react.dev)
```
