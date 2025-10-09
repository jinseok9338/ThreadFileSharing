# Commands Component

**Purpose**: A command palette component that appears when file upload is triggered, allowing users to choose between creating a thread or sharing files directly.

## 컴포넌트 목적

파일 업로드 시 나타나는 명령 팔레트 컴포넌트입니다. 사용자가 "스레드 만들기" 또는 "파일 공유하기" 중에서 선택할 수 있습니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│  📁 파일 업로드                          │
│                                         │
│  [📄 스레드 만들기]                     │
│  파일로 새로운 스레드를 생성합니다        │
│                                         │
│  [📤 파일 공유하기]                     │
│  파일을 채팅에 직접 공유합니다           │
│                                         │
│  [❌ 취소]                             │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="bg-background border rounded-lg shadow-lg p-4">
  <div className="flex items-center mb-4">
    <FileText className="w-5 h-5 mr-2" />
    <Heading3>{t("commands.fileUpload")}</Heading3>
  </div>

  <div className="space-y-2">
    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-3"
      onClick={() => onSelect("create-thread")}
    >
      <div className="flex items-start space-x-3">
        <FileText className="w-5 h-5 mt-0.5" />
        <div className="text-left">
          <div className="font-medium">{t("commands.createThread")}</div>
          <div className="text-sm text-muted-foreground">
            {t("commands.createThreadDescription")}
          </div>
        </div>
      </div>
    </Button>

    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-3"
      onClick={() => onSelect("share-file")}
    >
      <div className="flex items-start space-x-3">
        <Share className="w-5 h-5 mt-0.5" />
        <div className="text-left">
          <div className="font-medium">{t("commands.shareFile")}</div>
          <div className="text-sm text-muted-foreground">
            {t("commands.shareFileDescription")}
          </div>
        </div>
      </div>
    </Button>
  </div>
</div>
```

## Props Interface

```tsx
interface CommandsProps {
  onSelect?: (command: "create-thread" | "share-file" | "cancel") => void;
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `FileText` - 스레드 만들기 아이콘
- `Share` - 파일 공유 아이콘
- `Button` - 명령 선택 버튼
- `Heading3` - 제목

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `~/components/ui/button` - 버튼 컴포넌트
- `lucide-react` - 아이콘 라이브러리

## Props 설명

### onSelect (선택사항)

- **타입**: `(command: "create-thread" | "share-file" | "cancel") => void`
- **설명**: 명령 선택 시 실행할 함수
- **기본값**: `undefined`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 상태 관리

### 내부 상태

- 없음 (stateless 컴포넌트)

### 명령 타입

- **create-thread**: 파일로 새로운 스레드 생성
- **share-file**: 파일을 채팅에 직접 공유
- **cancel**: 취소

## 스타일링

### 컨테이너 스타일

- `bg-background border rounded-lg shadow-lg p-4` - 배경, 테두리, 그림자
- `max-w-sm` - 최대 너비 제한

### 버튼 스타일

- `w-full justify-start h-auto p-3` - 전체 너비, 왼쪽 정렬, 자동 높이
- `hover:bg-accent` - 호버 시 배경색 변경

### 아이콘 스타일

- `w-5 h-5 mt-0.5` - 아이콘 크기 및 위치
- `text-primary` - 주요 색상

## 사용 예시

### 기본 사용

```tsx
<Commands
  onSelect={(command) => {
    switch (command) {
      case "create-thread":
        handleCreateThread();
        break;
      case "share-file":
        handleShareFile();
        break;
      case "cancel":
        handleCancel();
        break;
    }
  }}
/>
```

### 파일 업로드 플로우

```tsx
const [showCommands, setShowCommands] = useState(false);
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

const handleFileSelect = (files: File[]) => {
  setSelectedFiles(files);
  setShowCommands(true);
};

const handleCommandSelect = (command: string) => {
  switch (command) {
    case "create-thread":
      createThreadWithFiles(selectedFiles);
      break;
    case "share-file":
      shareFilesDirectly(selectedFiles);
      break;
    case "cancel":
      setSelectedFiles([]);
      break;
  }
  setShowCommands(false);
};

return (
  <>
    <FileUpload onFileSelect={handleFileSelect} />
    {showCommands && <Commands onSelect={handleCommandSelect} />}
  </>
);
```

## 다양한 사용 사례

### 1. 메인 채팅 파일 업로드

```tsx
// 파일 아이콘 클릭 시 Commands 표시
const handleFileIconClick = () => {
  // 파일 선택 후 Commands 표시
  setShowCommands(true);
};
```

### 2. 채팅창 드래그 앤 드롭

```tsx
// 채팅창에 파일 드롭 시 Commands 표시
const handleChatDrop = (files: File[]) => {
  setSelectedFiles(files);
  setShowCommands(true);
};
```

### 3. 파일 탭 직접 업로드

```tsx
// 파일 탭에서는 Commands 없이 직접 업로드
const handleFileTabUpload = (files: File[]) => {
  // 직접 파일 트리에 추가
  addFilesToTree(files);
};
```

## 접근성

### ARIA 속성

- `role="dialog"` - 대화상자 역할
- `aria-label="파일 업로드 명령"` - 접근성 라벨
- `aria-describedby` - 설명 텍스트 연결

### 키보드 네비게이션

- Tab 키로 버튼 간 이동
- Enter/Space 키로 명령 선택
- Escape 키로 취소

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지

## 다국어 지원

### i18n 키

- `commands.fileUpload` - "파일 업로드"
- `commands.createThread` - "스레드 만들기"
- `commands.createThreadDescription` - "파일로 새로운 스레드를 생성합니다"
- `commands.shareFile` - "파일 공유하기"
- `commands.shareFileDescription` - "파일을 채팅에 직접 공유합니다"
- `commands.cancel` - "취소"

## 테마 지원

### 다크/라이트 모드

- `bg-background` - 테마에 따라 배경색 자동 변경
- `border` - 테마에 따라 테두리 색상 자동 변경
- `shadow-lg` - 테마에 따라 그림자 자동 조정

## 관련 파일

- `app/components/chat/Commands.tsx` - Commands 컴포넌트
- `app/components/chat/FileUpload.tsx` - FileUpload 컴포넌트
- `app/components/chat/MessageInput.tsx` - MessageInput 컴포넌트
- `language.csv` - 다국어 키 정의
