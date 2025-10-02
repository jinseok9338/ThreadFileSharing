# ThreadPanel Component

**Purpose**: The main container component for the thread management panel with two tabs: file tree structure and chat messages.

## 컴포넌트 목적

채팅방에서 파일과 관련된 스레드들을 관리하는 메인 패널 컴포넌트입니다. 파일 트리 구조 탭과 채팅 메시지 탭으로 구성되어 있으며, 파일 업로드 시 자동으로 스레드가 생성됩니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│ [Files] [Chat]                          │
├─────────────────────────────────────────┤
│                                         │
│  [Tab Content Area]                     │
│                                         │
│  Files Tab:                             │
│  📁 Project Files                       │
│    ├── 📄 proposal.pdf                  │
│    ├── 🖼️ design.jpg                   │
│    └── 📊 budget.xlsx                   │
│                                         │
│  Chat Tab:                              │
│  💬 Thread Messages                     │
│  - John: This looks great!             │
│  - Jane: I'll review the details       │
│  - Bob: Budget approved                 │
│                                         │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="h-full flex flex-col bg-background border-l">
  {/* Tab Navigation */}
  <div className="flex border-b">
    <Button
      variant={activeTab === "files" ? "default" : "ghost"}
      onClick={() => setActiveTab("files")}
      className="flex-1 rounded-none text-xs h-8"
    >
      <Folder className="w-3 h-3 mr-1" />
      {t("thread.files")}
    </Button>
    <Button
      variant={activeTab === "chat" ? "default" : "ghost"}
      onClick={() => setActiveTab("chat")}
      className="flex-1 rounded-none text-xs h-8"
    >
      <MessageSquare className="w-3 h-3 mr-1" />
      {t("thread.chat")}
    </Button>
  </div>

  {/* Tab Content */}
  <div className="flex-1 overflow-hidden">
    {activeTab === "files" ? (
      <FileTreePanel
        files={files}
        onFileSelect={onFileSelect}
        onFileUpload={onFileUpload}
      />
    ) : (
      <ThreadChatPanel
        messages={threadMessages}
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
      />
    )}
  </div>
</div>
```

## Props Interface

```tsx
interface ThreadPanelProps {
  files?: FileNode[];
  threadMessages?: Message[];
  selectedFileId?: string;
  activeTab?: "files" | "chat";
  onFileSelect?: (fileId: string) => void;
  onFileUpload?: (files: File[]) => void;
  onSendMessage?: (message: string) => void;
  onTabChange?: (tab: "files" | "chat") => void;
  className?: string;
}

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: number;
  createdAt: string;
  uploadedBy: User;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `Button` - 탭 네비게이션 버튼
- `Folder` - 파일 트리 아이콘
- `MessageSquare` - 채팅 아이콘

### 하위 컴포넌트

- `FileTreePanel` - 파일 트리 구조 컴포넌트
- `ThreadChatPanel` - 스레드 채팅 컴포넌트

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `~/components/ui/button` - 버튼 컴포넌트
- `lucide-react` - 아이콘 라이브러리

## Props 설명

### files (선택사항)

- **타입**: `FileNode[]`
- **설명**: 파일 트리 구조 데이터
- **기본값**: `[]`

### threadMessages (선택사항)

- **타입**: `Message[]`
- **설명**: 스레드 채팅 메시지 목록
- **기본값**: `[]`

### selectedFileId (선택사항)

- **타입**: `string`
- **설명**: 현재 선택된 파일 ID
- **기본값**: `undefined`

### activeTab (선택사항)

- **타입**: `"files" | "chat"`
- **설명**: 현재 활성화된 탭
- **기본값**: `"files"`

### onFileSelect (선택사항)

- **타입**: `(fileId: string) => void`
- **설명**: 파일 선택 시 실행할 함수
- **기본값**: `undefined`

### onFileUpload (선택사항)

- **타입**: `(files: File[]) => void`
- **설명**: 파일 업로드 시 실행할 함수
- **기본값**: `undefined`

### onSendMessage (선택사항)

- **타입**: `(message: string) => void`
- **설명**: 메시지 전송 시 실행할 함수
- **기본값**: `undefined`

### onTabChange (선택사항)

- **타입**: `(tab: "files" | "chat") => void`
- **설명**: 탭 변경 시 실행할 함수
- **기본값**: `undefined`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 상태 관리

### 내부 상태

- `activeTab` - 현재 활성화된 탭 ("files" | "chat")
- `selectedFileId` - 현재 선택된 파일 ID

### 상태 전환

1. **초기 상태**: Files 탭 활성화
2. **탭 전환**: Files ↔ Chat 탭 간 전환
3. **파일 선택**: 파일 트리에서 파일 선택

## 스타일링

### 컨테이너 스타일

- `h-full flex flex-col` - 전체 높이, 세로 플렉스
- `bg-background border-l` - 배경색, 왼쪽 테두리

### 탭 네비게이션 스타일

- `flex border-b` - 가로 플렉스, 하단 테두리
- `flex-1 rounded-none` - 균등 분할, 모서리 제거

### 콘텐츠 영역 스타일

- `flex-1 overflow-hidden` - 남은 공간 차지, 오버플로우 숨김

## 사용 예시

### 기본 사용

```tsx
<ThreadPanel
  files={files}
  threadMessages={threadMessages}
  activeTab="files"
  onFileSelect={handleFileSelect}
  onFileUpload={handleFileUpload}
  onSendMessage={handleSendMessage}
  onTabChange={handleTabChange}
/>
```

### Mock 데이터로 테스트

```tsx
const mockFiles: FileNode[] = [
  {
    id: "1",
    name: "Project Files",
    type: "folder",
    children: [
      {
        id: "2",
        name: "proposal.pdf",
        type: "file",
        size: 2300000,
        createdAt: new Date().toISOString(),
        uploadedBy: { id: "1", displayName: "John", status: "online" },
      },
      {
        id: "3",
        name: "design.jpg",
        type: "file",
        size: 1500000,
        createdAt: new Date().toISOString(),
        uploadedBy: { id: "2", displayName: "Jane", status: "online" },
      },
    ],
    createdAt: new Date().toISOString(),
    uploadedBy: { id: "1", displayName: "John", status: "online" },
  },
];

<ThreadPanel files={mockFiles} />;
```

## 다양한 사용 사례

### 1. Files 탭 활성화

```tsx
<ThreadPanel files={files} activeTab="files" onFileSelect={handleFileSelect} />
// FileTreePanel이 표시됨
```

### 2. Chat 탭 활성화

```tsx
<ThreadPanel
  threadMessages={messages}
  activeTab="chat"
  onSendMessage={handleSendMessage}
/>
// ThreadChatPanel이 표시됨
```

### 3. 파일 선택

```tsx
<ThreadPanel
  files={files}
  selectedFileId="file-1"
  onFileSelect={(fileId) => {
    console.log("Selected file:", fileId);
  }}
/>
```

### 4. 파일 업로드

```tsx
<ThreadPanel
  files={files}
  onFileUpload={(files) => {
    // 파일 업로드 시 자동으로 스레드 생성
    uploadFiles(files);
  }}
/>
```

## 파일 타입별 아이콘

### 지원하는 파일 타입

- **PDF**: `FileText` 아이콘
- **이미지**: `Image` 아이콘
- **문서**: `File` 아이콘
- **프레젠테이션**: `Presentation` 아이콘
- **폴더**: `Folder` 아이콘
- **기타**: `File` 아이콘

### 폴더 구조 표시

```
📁 Project Files
├── 📄 proposal.pdf
├── 🖼️ design.jpg
└── 📊 budget.xlsx
```

## 다국어 지원

### i18n 키

- `thread.files` - "Files" / "파일"
- `thread.chat` - "Chat" / "채팅"
- `thread.noFiles` - "No files" / "파일이 없습니다"
- `thread.uploadFirst` - "Upload your first file" / "첫 번째 파일을 업로드해보세요"

## 접근성

### ARIA 속성

- `role="tablist"` - 탭 목록임을 명시
- `role="tab"` - 각 탭 버튼
- `role="tabpanel"` - 탭 콘텐츠 영역
- `aria-label="Thread panel"` - 패널 목적 명시

### 키보드 네비게이션

- Tab 키로 탭 간 이동
- Enter/Space 키로 탭 활성화
- Arrow 키로 탭 순서 변경

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- files 배열 변경 시에만 리렌더링

### 가상화

- 많은 파일이 있을 경우 `react-virtual` 사용 고려

## 테마 지원

### 다크/라이트 모드

- `bg-background` - 테마에 따라 배경색 자동 변경
- `border-l` - 테마에 따라 테두리 색상 자동 변경

## 컴팩트 UI 개선 (2024.01.15)

### 전체적인 크기 축소

#### **탭 네비게이션**

- 탭 높이: `h-8` 추가
- 아이콘: `w-4 h-4` → `w-3 h-3`
- 텍스트: `text-xs` 추가
- 아이콘-텍스트 간격: `mr-2` → `mr-1`

#### **스레드 목록**

- 빈 상태 패딩: `p-8` → `p-4`
- 빈 상태 텍스트: `text-sm` → `text-xs`
- 스레드 아이템 패딩: `p-3` → `p-2`
- 스레드 제목: `text-sm` → `text-xs`
- 스레드 설명: `text-xs` 유지
- 간격: `space-y-1` 유지

#### **채팅 패널**

- 헤더 패딩: `p-4` → `p-2`
- 헤더 텍스트: `text-sm` → `text-xs`
- 메시지 영역 패딩: `p-4` → `p-2`
- 빈 상태 텍스트: `text-sm` → `text-xs`
- 메시지 간격: `space-y-3` → `space-y-2`
- 메시지 패딩: `p-3` → `p-2`
- 메시지 텍스트: `text-sm` → `text-xs`

#### **입력 영역**

- 패딩: `p-4` → `p-2`
- 입력 필드: `px-3 py-2` → `px-2 py-1`
- 입력 텍스트: `text-sm` → `text-xs`
- 버튼 높이: `h-7` 추가
- 버튼 텍스트: `text-xs` 추가

### 개선 효과

#### **공간 효율성**

- 더 많은 스레드와 메시지를 한 번에 표시
- 과도한 여백 제거로 정보 밀도 향상
- 모든 요소가 조화롭게 작은 크기로 통일

#### **사용성 향상**

- 작은 텍스트로 더 많은 정보를 빠르게 파악 가능
- 제한된 패널 공간을 최대한 활용
- Microsoft Teams와 유사한 컴팩트한 디자인

## 관련 파일

- `app/components/thread/FileTreePanel.tsx` - 파일 트리 컴포넌트
- `app/components/thread/ThreadChatPanel.tsx` - 스레드 채팅 컴포넌트
- `app/pages/chat/types/types.ts` - Thread, FileNode 타입 정의
- `language.csv` - 다국어 키 정의
