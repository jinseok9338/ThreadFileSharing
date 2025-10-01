# ThreadFileSharing Frontend

React 19 기반의 파일 중심 팀 협업 플랫폼 프론트엔드 애플리케이션

## 기술 스택

- **React 19** - UI 라이브러리
- **React Router 7** - 라우팅
- **TypeScript 5.9+** - 타입 안정성
- **Vite 7** - 빌드 도구
- **Tailwind CSS 4** - 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **TanStack Query** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증
- **Socket.io Client** - 실시간 통신
- **ky** - HTTP 클라이언트

## 프로젝트 구조

### Co-location 패턴

각 페이지는 자체 리소스를 폴더 내에 포함합니다:

```
app/
├── routes/              # 라우트 정의
├── pages/               # 페이지별 폴더
│   └── {page-name}/
│       ├── index.tsx    # 페이지 컴포넌트
│       ├── components/  # 페이지 전용 컴포넌트
│       ├── hooks/       # 페이지 전용 훅
│       ├── services/    # 페이지 전용 서비스
│       └── utils/       # 페이지 전용 유틸
├── components/          # 전역 공통 컴포넌트
├── hooks/               # 전역 공통 훅
├── services/            # 전역 공통 서비스
├── stores/              # 전역 상태 관리
├── lib/                 # 라이브러리 설정
├── types/               # 전역 타입 정의
└── api/                 # API 클라이언트
```

## 시작하기

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

### 타입 체크

```bash
pnpm typecheck
```

## 테스트

### Unit 테스트 (Vitest)

```bash
# 테스트 실행
pnpm test

# UI 모드로 실행
pnpm test:ui

# 커버리지 리포트
pnpm test:coverage
```

### E2E 테스트 (Playwright)

```bash
# E2E 테스트 실행
pnpm test:e2e

# UI 모드로 실행
pnpm test:e2e:ui

# 디버그 모드
pnpm test:e2e:debug
```

## 환경 변수

`.env.local`, `.env.development`, `.env.production` 파일 사용:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
VITE_ENABLE_DEVTOOLS=true
```

## 주요 기능

- 🔐 **인증 시스템** - JWT 기반 인증 및 자동 토큰 갱신
- 📁 **파일 관리** - 파일 업로드, 다운로드, 메타데이터 관리
- 🧵 **스레드 시스템** - 파일 기반 자동 스레드 생성
- 💬 **실시간 채팅** - Socket.io 기반 실시간 메시징
- 🔗 **스레드 참조** - #스레드명 파싱 및 연결
- 🌐 **다국어 지원** - i18next (한국어, 영어)
- 🎨 **반응형 디자인** - Tailwind CSS 4 기반

## API 클라이언트

`app/api/ky.ts`에서 설정:

- 자동 Authorization 헤더 추가
- 401 응답 시 자동 토큰 갱신
- 재시도 로직
- 에러 핸들링

## Socket.io 클라이언트

`app/lib/socket.ts` 및 `app/hooks/useSocket.ts`:

```typescript
import { useSocket } from "~/hooks/useSocket";

function ChatComponent() {
  const { socket, isConnected, emit, on, off } = useSocket({
    autoConnect: true,
    token: accessToken,
  });

  useEffect(() => {
    on("message", handleMessage);
    return () => off("message", handleMessage);
  }, []);

  const sendMessage = () => {
    emit("send_message", { content: "Hello" });
  };
}
```

## TanStack Query

`app/providers/query-provider.tsx`에서 전역 설정:

```typescript
import { useQuery } from "@tanstack/react-query";

function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: () => api.get("threads").json(),
  });
}
```

## 개발 원칙

1. **Co-location**: 페이지별 리소스는 페이지 폴더 내에
2. **타입 안정성**: TypeScript strict mode 사용
3. **재사용성**: 전역 공통만 글로벌 폴더에
4. **테스트**: 단순 함수는 unit 테스트, 전체 플로우는 E2E 테스트
5. **성능**: React 19 기능 활용 (Suspense, Transition 등)

---

## 컴포넌트 개발 프로세스

### 문서 기반 개발 (Documentation-Driven Development)

**필수 순서**:

```
1. 📝 컴포넌트 문서 작성 (.md) → 2. 💻 컴포넌트 구현 (.tsx)
```

### 페이지 구성 원칙

- 페이지는 **컴포넌트 조합**으로 구성
- 페이지에서 **상태를 props로 넘겨주지 않음** (각 컴포넌트가 자체 상태 관리)
- 페이지는 **레이아웃과 배치**에만 집중

```tsx
// ✅ 좋은 예시
export default function ThreadsPage() {
  return (
    <div className="flex-1 bg-white min-h-[100dvh]">
      <ThreadHeader />
      <ThreadTabs />
      <ThreadList />
      <div className="fixed bottom-[74px] right-4 z-40">
        <CreateThreadButton />
      </div>
    </div>
  );
}
```

### 컴포넌트 문서 구조

각 컴포넌트 파일 옆에 `.md` 문서를 작성합니다:

```
app/pages/threads/components/
├── ThreadHeader.tsx
├── ThreadHeader.md        # 필수!
├── ThreadTabs.tsx
└── ThreadTabs.md          # 필수!
```

### 컴포넌트 문서에 필수 포함 내용

1. **레이아웃 정보**
   - padding, margin (예: `p-4`, `px-6`, `py-3`)
   - width, height (예: `w-full`, `min-h-screen`)
   - background, border (예: `bg-white`, `rounded-lg`)

2. **Flexbox/Grid 정보**
   - flex 여부 및 방향 (예: `flex`, `flex-col`)
   - 정렬 (예: `items-center`, `justify-between`)
   - 간격 (예: `gap-4`, `space-y-2`)

3. **내부 구조**
   - 컴포넌트 계층 구조
   - 각 요소의 위치 및 간격

4. **사용 컴포넌트**
   - shadcn/ui 컴포넌트
   - 폰트 컴포넌트
   - 커스텀 컴포넌트

5. **스타일 상세**
   - 색상, 여백, 크기
   - 반응형 디자인

### 폰트 컴포넌트 시스템

❌ **className으로 폰트 직접 정의 금지**

```tsx
// ❌ 나쁜 예시
<h1 className="text-3xl font-bold">제목</h1>
```

✅ **폰트 컴포넌트 사용**

```tsx
// ✅ 좋은 예시
<Heading1>제목</Heading1>
```

**폰트 컴포넌트 종류**:

- `<Heading1>`, `<Heading2>`, `<Heading3>` - 제목
- `<BodyText>`, `<BodyTextSmall>` - 본문
- `<Caption>` - 작은 텍스트
- `<Label>` - 라벨
- `<Link>` - 링크

### 상태 관리 전략

컴포넌트에서 올바른 상태 관리 도구를 선택하세요:

1. **nuqs (URL Query State)** - 적극 활용 ⭐

   ```tsx
   // 1. 상수 정의 (constants/query-keys.ts)
   export const QUERY_KEYS = {
     FILTER: { key: "filter", defaultValue: "all" },
   } as const;

   // 2. 사용 (상수 + parser)
   const [filter, setFilter] = useQueryState(
     QUERY_KEYS.FILTER.key,
     parseAsString.withDefault(QUERY_KEYS.FILTER.defaultValue)
   );
   // URL: /threads?filter=active
   ```

   - **사용 예시**: 필터, 탭, 검색어, 페이지네이션
   - **장점**: URL 공유, 북마크, 뒤로가기, 새로고침 시 상태 유지
   - **방식**: 상수 정의 + parser 사용 (타입 안전성)

2. **useState (로컬 상태)**
   - **사용 예시**: 모달 열림/닫힘, 드롭다운, 임시 폼 입력

3. **Zustand (전역 상태)**
   - **사용 예시**: 사용자 정보, 토큰, 테마 설정

4. **TanStack Query (서버 상태)**
   - **사용 예시**: API 데이터

   ```tsx
   // nuqs 상태를 TanStack Query와 함께 사용
   const [filter] = useQueryState(
     QUERY_KEYS.FILTER.key,
     parseAsString.withDefault(QUERY_KEYS.FILTER.defaultValue)
   );

   const { data } = useQuery({
     queryKey: ["threads", filter], // nuqs 상태를 의존성으로
     queryFn: () => fetchThreads(filter),
   });
   ```

### 상세 가이드

전체 컴포넌트 개발 가이드는 다음 문서를 참고하세요:

- [컴포넌트 개발 가이드](/docs/frontend/component-development-guide.md)
- [컴포넌트 문서 템플릿](/docs/frontend/component-template.md)
