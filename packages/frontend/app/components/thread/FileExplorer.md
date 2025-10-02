# FileExplorer Component

**Purpose**: A mini file explorer component inspired by Microsoft Teams' file management interface, providing comprehensive file and folder management capabilities within threads.

## 컴포넌트 목적

Microsoft Teams의 파일 탐색기를 모방한 미니 파일 관리 시스템입니다. 스레드 내에서 파일과 폴더를 체계적으로 관리할 수 있는 완전한 파일 탐색기 기능을 제공합니다.

## 내부 구조

### 레이아웃 구조 (개선된 스페이싱)

```
┌─────────────────────────────────────────────────────────────┐
│  📁 [문서 > 스레드명 > 현재폴더]                           │ ← 브레드크럼 (px-4 py-2, text-xs)
├─────────────────────────────────────────────────────────────┤
│  [📤 업로드] [⋮ 더보기]                          [🔍 검색] │ ← 액션 바 (p-3, h-7, w-56)
├─────────────────────────────────────────────────────────────┤
│  📁 주요 폴더들 (작은 아이콘)                              │ ← 폴더 오버뷰 (gap-4, p-3, w-8)
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │   📁    │ │   📁    │ │   📁    │ │   📁    │           │
│  │  폴더1  │ │  폴더2  │ │  폴더3  │ │  폴더4  │           │
│  │ 3개 파일│ │ 7개 파일│ │ 2개 파일│ │ 12개파일│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│  📋 파일 목록 (테이블 형태)                                │ ← 파일 목록 (px-4 py-2, text-xs)
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 이름          │ 수정된 날짜    │ 수정한 사람  │ 크기    │ │ ← 헤더 (gap-4)
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 📁 폴더명     │ 2024.01.15    │ 사용자명     │ -       │ │ ← 아이템 (gap-2)
│  │ 📄 파일명.pdf │ 2024.01.14    │ 사용자명     │ 2.3MB   │ │
│  │ 📊 데이터.xlsx│ 2024.01.13    │ 사용자명     │ 1.1MB   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 컴포넌트 구조 (개선된 스페이싱)

```tsx
<div className="h-full flex flex-col bg-background">
  {/* Breadcrumb Navigation */}
  <div className="px-4 py-2 border-b bg-muted/10">
    <div className="flex items-center gap-2">
      <Folder className="w-3 h-3 text-primary" />
      <span className="text-xs text-muted-foreground">
        문서 > 스레드명 > 현재폴더
      </span>
    </div>
  </div>

  {/* Action Bar */}
  <div className="p-3 border-b bg-muted/20">
    <div className="flex items-center justify-between">
      {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={handleFileUpload}>
            <Upload className="w-3 h-3 mr-1" />
            업로드
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                <MoreHorizontal className="w-3 h-3 mr-1" />
                더보기
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleCreateFolder}>
                <FolderPlus className="w-3 h-3 mr-2" />
                새 폴더
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareFiles}>
                <Share className="w-3 h-3 mr-2" />
                공유
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadFiles}>
                <Download className="w-3 h-3 mr-2" />
                다운로드
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      {/* Right Search Area */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            placeholder="파일 검색..."
            className="w-56 h-7 pl-7 text-xs"
          />
          <Filter className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </div>
  </div>

  {/* Folder Overview */}
  <div className="px-4 py-3 border-b bg-muted/5">
    <div className="grid grid-cols-4 gap-4">
      {majorFolders.map(folder => (
        <div key={folder.id} className="flex flex-col items-center cursor-pointer hover:bg-accent/30 rounded-lg p-3 transition-colors group">
          <Folder className="w-8 h-8 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
          <span className="text-xs mt-1 truncate w-full text-center font-medium">
            {folder.name}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {folder.fileCount}개 파일
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* File List */}
  <div className="flex-1 overflow-auto">
    <div className="border-t">
      {/* Header */}
      <div className="px-4 py-2 bg-muted/30 text-xs font-medium border-b">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6 cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
            이름
            <span className="text-xs">↑</span>
          </div>
          <div className="col-span-2 cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
            수정된 날짜
          </div>
          <div className="col-span-2 text-muted-foreground">수정한 사람</div>
          <div className="col-span-2 cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
            크기
          </div>
        </div>
      </div>

      {/* File Items */}
      <div className="divide-y divide-border/50">
        {files.map(file => (
          <div key={file.id} className="px-4 py-2 hover:bg-accent/30 cursor-pointer transition-colors">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 flex items-center gap-2">
                {getFileIcon(file)}
                <span className="text-xs truncate font-medium">{file.name}</span>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground flex items-center">
                {formatDate(file.modifiedAt)}
              </div>
              <div className="col-span-2 text-xs text-muted-foreground flex items-center">
                {file.modifiedBy}
              </div>
              <div className="col-span-2 text-xs text-muted-foreground flex items-center">
                {file.type === "file" && file.size ? formatFileSize(file.size) : "-"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
```

## Props Interface

```tsx
interface FileExplorerProps {
  files?: FileNode[];
  currentPath?: string;
  onFileSelect?: (fileId: string) => void;
  onFolderSelect?: (folderId: string) => void;
  onCreateFolder?: (name: string, parentId?: string) => void;
  onFileUpload?: (files: File[], targetFolderId?: string) => void;
  onFileDownload?: (fileId: string) => void;
  onFileShare?: (fileId: string) => void;
  onFileDelete?: (fileId: string) => void;
  onFileRename?: (fileId: string, newName: string) => void;
  onFileMove?: (fileId: string, targetFolderId: string) => void;
  onNavigate?: (path: string) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  sortBy?: "name" | "date" | "size" | "type";
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, order: string) => void;
  className?: string;
}

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modifiedAt: string;
  modifiedBy: string;
  parentId?: string;
  children?: FileNode[];
  mimeType?: string;
  downloadUrl?: string;
  shareUrl?: string;
  isShared?: boolean;
  permissions?: FilePermissions;
}

interface FilePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `Folder` - 폴더 아이콘
- `File`, `FileText`, `Image`, `FileSpreadsheet`, `Presentation` - 파일 타입별 아이콘
- `FolderPlus`, `Upload`, `Share`, `Download`, `Filter` - 액션 아이콘
- `Button` - 액션 버튼들
- `Input` - 검색 입력
- `ChevronRight` - 브레드크럼 구분자

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `~/components/ui/button` - 버튼 컴포넌트
- `~/components/ui/input` - 입력 컴포넌트
- `~/components/ui/context-menu` - 컨텍스트 메뉴
- `~/components/ui/dialog` - 다이얼로그
- `lucide-react` - 아이콘 라이브러리

## Props 설명

### onFileSelect (선택사항)

- **타입**: `(fileId: string) => void`
- **설명**: 파일 선택 시 실행할 함수
- **기본값**: `undefined`

### onFolderSelect (선택사항)

- **타입**: `(folderId: string) => void`
- **설명**: 폴더 선택 시 실행할 함수
- **기본값**: `undefined`

### onCreateFolder (선택사항)

- **타입**: `(name: string, parentId?: string) => void`
- **설명**: 새 폴더 생성 시 실행할 함수
- **기본값**: `undefined`

### onFileUpload (선택사항)

- **타입**: `(files: File[], targetFolderId?: string) => void`
- **설명**: 파일 업로드 시 실행할 함수
- **기본값**: `undefined`

### onFileDownload (선택사항)

- **타입**: `(fileId: string) => void`
- **설명**: 파일 다운로드 시 실행할 함수
- **기본값**: `undefined`

### onFileShare (선택사항)

- **타입**: `(fileId: string) => void`
- **설명**: 파일 공유 시 실행할 함수
- **기본값**: `undefined`

### onFileDelete (선택사항)

- **타입**: `(fileId: string) => void`
- **설명**: 파일 삭제 시 실행할 함수
- **기본값**: `undefined`

### onFileRename (선택사항)

- **타입**: `(fileId: string, newName: string) => void`
- **설명**: 파일 이름 변경 시 실행할 함수
- **기본값**: `undefined`

### onFileMove (선택사항)

- **타입**: `(fileId: string, targetFolderId: string) => void`
- **설명**: 파일 이동 시 실행할 함수
- **기본값**: `undefined`

### onNavigate (선택사항)

- **타입**: `(path: string) => void`
- **설명**: 경로 이동 시 실행할 함수
- **기본값**: `undefined`

### searchQuery (선택사항)

- **타입**: `string`
- **설명**: 현재 검색 쿼리
- **기본값**: `""`

### onSearch (선택사항)

- **타입**: `(query: string) => void`
- **설명**: 검색 실행 시 실행할 함수
- **기본값**: `undefined`

### sortBy (선택사항)

- **타입**: `"name" | "date" | "size" | "type"`
- **설명**: 정렬 기준
- **기본값**: `"name"`

### sortOrder (선택사항)

- **타입**: `"asc" | "desc"`
- **설명**: 정렬 순서
- **기본값**: `"asc"`

### onSortChange (선택사항)

- **타입**: `(sortBy: string, order: string) => void`
- **설명**: 정렬 변경 시 실행할 함수
- **기본값**: `undefined`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 상태 관리

### 내부 상태

- `currentPath` - 현재 경로
- `selectedItems` - 선택된 파일/폴더들
- `searchQuery` - 검색 쿼리
- `sortBy` - 정렬 기준
- `sortOrder` - 정렬 순서
- `viewMode` - 뷰 모드 (list/grid)
- `showHidden` - 숨김 파일 표시 여부

### 상태 전환

1. **초기 상태**: 루트 폴더 표시
2. **폴더 탐색**: 브레드크럼 업데이트, 파일 목록 변경
3. **검색**: 필터링된 결과 표시
4. **정렬**: 정렬 기준에 따른 목록 재정렬

## 스타일링 (개선된 스페이싱)

### 컨테이너 스타일

- `h-full flex flex-col bg-background` - 전체 높이, 세로 배치
- `border-b` - 섹션 구분선

### 브레드크럼 네비게이션 스타일

- `px-6 py-3` - 좌우 24px, 상하 12px 패딩
- `bg-muted/10` - 연한 배경색
- `gap-2` - 아이콘과 텍스트 간격

### 액션 바 스타일

- `p-4` - 전체 16px 패딩
- `bg-muted/20` - 연한 배경색으로 구분
- `gap-3` - 버튼 간 12px 간격 (기존 8px에서 증가)
- `h-8` - 버튼 높이 32px (일관성)
- `w-72` - 검색창 너비 288px (기존 256px에서 증가)

### 폴더 오버뷰 스타일

- `px-6 py-4` - 좌우 24px, 상하 16px 패딩
- `bg-muted/5` - 매우 연한 배경색
- `gap-6` - 폴더 간 24px 간격 (기존 16px에서 증가)
- `p-4` - 각 폴더 카드 내부 패딩
- `rounded-lg` - 둥근 모서리
- `group` - 호버 효과를 위한 그룹 클래스

### 파일 목록 헤더 스타일

- `px-6 py-3` - 좌우 24px, 상하 12px 패딩
- `bg-muted/30` - 헤더 배경색
- `text-sm font-medium` - 중간 크기, 중간 굵기
- `gap-6` - 컬럼 간 24px 간격 (기존 8px에서 대폭 증가)
- `hover:text-foreground` - 호버 시 텍스트 색상 변경

### 파일 아이템 스타일

- `px-6 py-3` - 좌우 24px, 상하 12px 패딩
- `gap-6` - 컬럼 간 24px 간격
- `gap-3` - 파일명 내부 아이콘과 텍스트 간격
- `hover:bg-accent/30` - 호버 시 연한 배경색
- `transition-colors` - 부드러운 색상 전환
- `divide-y divide-border/50` - 행 구분선

### 빈 상태 스타일 (컴팩트)

- `py-12` - 상하 48px 패딩 (컴팩트한 여백)
- `max-w-md` - 최대 너비 제한
- `text-sm font-medium` - 중간 텍스트, 중간 굵기
- `w-12 h-12` - 작은 아이콘 크기

## 새로운 기능

### 드롭다운 메뉴 통합

#### **액션 바 최적화**

- **업로드 버튼**: 메인 액션으로 유지 (가장 자주 사용)
- **더보기 드롭다운**: 나머지 액션들을 통합
  - 새 폴더 생성
  - 파일 공유
  - 파일 다운로드

#### **드롭다운 메뉴 구조**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button size="sm" variant="outline" className="h-8">
      <MoreHorizontal className="w-4 h-4 mr-2" />
      {t("fileExplorer.moreActions")}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuItem onClick={handleCreateFolder}>
      <FolderPlus className="w-4 h-4 mr-2" />
      {t("fileExplorer.newFolder")}
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleShareFiles}>
      <Share className="w-4 h-4 mr-2" />
      {t("fileExplorer.share")}
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDownloadFiles}>
      <Download className="w-4 h-4 mr-2" />
      {t("fileExplorer.download")}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 드래그 앤 드롭 기능

#### **전체 영역 드래그 앤 드롭**

- **드래그 오버 시**: 전체 영역에 점선 테두리와 배경색 변경
- **드롭 오버레이**: 중앙에 업로드 안내 메시지 표시
- **파일 처리**: 드롭된 파일들을 자동으로 업로드

#### **드래그 앤 드롭 구현**

```tsx
// 메인 컨테이너에 드래그 이벤트 추가
<div
  className={cn(
    "h-full flex flex-col bg-background relative",
    isDragOver && "bg-primary/5 border-2 border-dashed border-primary"
  )}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  {/* 드래그 오버레이 */}
  {isDragOver && (
    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-4 text-center shadow-lg">
        <div className="text-primary font-medium mb-1 text-sm">
          {t("fileExplorer.upload")}
        </div>
        <div className="text-xs text-muted-foreground">
          {t("fileExplorer.dropFilesHere")}
        </div>
      </div>
    </div>
  )}
</div>
```

#### **드래그 앤 드롭 핸들러**

```tsx
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(true);
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);

  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    onFileUpload(files);
  }
};
```

### 숨김 파일 입력

#### **접근성 개선**

- **숨김 파일 입력**: `ref`를 사용한 파일 선택
- **업로드 버튼**: 숨김 입력을 트리거
- **드래그 앤 드롭**: 동일한 `onFileUpload` 핸들러 사용

```tsx
{
  /* Hidden File Input */
}
<input
  type="file"
  ref={fileInputRef}
  multiple
  onChange={handleFileInputChange}
  className="hidden"
  aria-label={t("fileExplorer.upload")}
/>;

const handleFileUpload = () => {
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};
```

## UI 개선 사항

### 스페이싱 최적화

#### **이전 문제점**

- 액션 버튼들이 너무 붙어있어서 클릭하기 어려움
- 컬럼 헤더와 내용이 좁아서 가독성 저하
- 전체적으로 UI가 답답하고 조밀한 느낌

#### **개선된 사항**

- **액션 바**: `gap-2` → `gap-3` (8px → 12px)
- **컬럼 간격**: `gap-2` → `gap-6` (8px → 24px)
- **버튼 높이**: 일관된 `h-8` (32px)
- **패딩 증가**: `p-3` → `p-4` (12px → 16px)
- **검색창 너비**: `w-64` → `w-72` (256px → 288px)

### 시각적 개선

#### **배경색 구분**

- 브레드크럼: `bg-muted/10` - 연한 구분
- 액션 바: `bg-muted/20` - 중간 구분
- 폴더 오버뷰: `bg-muted/5` - 매우 연한 구분
- 파일 헤더: `bg-muted/30` - 명확한 구분

#### **호버 효과 강화**

- 폴더 카드: `group` 클래스로 아이콘과 텍스트 동시 변경
- 컬럼 헤더: `hover:text-foreground`로 명확한 피드백
- 파일 아이템: `hover:bg-accent/30`으로 부드러운 강조

#### **정렬 아이콘 개선**

- 정렬 방향 아이콘을 별도 `span`으로 분리
- 작은 크기(`text-xs`)로 부담스럽지 않게 표시
- 정렬되지 않은 컬럼에는 아이콘 숨김

### 접근성 개선

#### **터치 친화적**

- 버튼과 클릭 영역을 충분히 크게 설정
- 최소 32px 높이 보장

#### **시각적 계층**

- 텍스트 크기와 색상으로 정보 우선순위 명확화
- 아이콘과 텍스트의 적절한 간격으로 가독성 향상

## 사용 예시

### 기본 사용

```tsx
<FileExplorer
  files={files}
  currentPath="/documents/project"
  onFileSelect={(fileId) => {
    console.log("파일 선택:", fileId);
  }}
  onFolderSelect={(folderId) => {
    console.log("폴더 선택:", folderId);
  }}
  onFileUpload={(files, targetFolderId) => {
    console.log("파일 업로드:", files, "to", targetFolderId);
  }}
/>
```

### 파일 관리 기능

```tsx
<FileExplorer
  onCreateFolder={(name, parentId) => {
    createFolder(name, parentId);
  }}
  onFileUpload={(files, targetFolderId) => {
    uploadFiles(files, targetFolderId);
  }}
  onFileDownload={(fileId) => {
    downloadFile(fileId);
  }}
  onFileShare={(fileId) => {
    shareFile(fileId);
  }}
  onFileDelete={(fileId) => {
    deleteFile(fileId);
  }}
/>
```

### 검색 및 정렬

```tsx
<FileExplorer
  searchQuery={searchQuery}
  onSearch={(query) => {
    setSearchQuery(query);
  }}
  sortBy="date"
  sortOrder="desc"
  onSortChange={(sortBy, order) => {
    setSortBy(sortBy);
    setSortOrder(order);
  }}
/>
```

## 다양한 사용 사례

### 1. 기본 파일 탐색

```tsx
<FileExplorer
  files={threadFiles}
  currentPath={currentPath}
  onNavigate={(path) => {
    setCurrentPath(path);
    loadFiles(path);
  }}
/>
```

### 2. 파일 업로드 관리

```tsx
<FileExplorer
  onFileUpload={(files, targetFolderId) => {
    // 선택된 폴더에 파일 업로드
    uploadToFolder(files, targetFolderId || currentFolderId);
  }}
  onFileMove={(fileId, targetFolderId) => {
    // 드래그 앤 드롭으로 파일 이동
    moveFile(fileId, targetFolderId);
  }}
/>
```

### 3. 협업 기능

```tsx
<FileExplorer
  onFileShare={(fileId) => {
    // 파일 공유 링크 생성
    generateShareLink(fileId);
  }}
  onFileRename={(fileId, newName) => {
    // 파일 이름 변경
    renameFile(fileId, newName);
  }}
/>
```

## 파일 관리 기능

### 새 폴더 생성

```tsx
const handleCreateFolder = () => {
  const name = prompt("폴더 이름을 입력하세요:");
  if (name) {
    onCreateFolder?.(name, currentFolderId);
  }
};
```

### 파일 업로드

```tsx
const handleFileUpload = (files: File[]) => {
  // 현재 선택된 폴더 또는 루트에 업로드
  onFileUpload?.(files, selectedFolderId || "root");
};
```

### 파일 공유

```tsx
const handleFileShare = (fileId: string) => {
  // 공유 링크 생성 및 클립보드 복사
  const shareUrl = generateShareUrl(fileId);
  navigator.clipboard.writeText(shareUrl);
  toast.success("공유 링크가 복사되었습니다");
};
```

### 파일 이동

```tsx
const handleFileMove = (fileId: string, targetFolderId: string) => {
  // 파일을 다른 폴더로 이동
  onFileMove?.(fileId, targetFolderId);
};
```

## 검색 및 필터링

### 파일 검색

```tsx
const handleSearch = (query: string) => {
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(query.toLowerCase())
  );
  setFilteredFiles(filteredFiles);
};
```

### 정렬 기능

```tsx
const handleSort = (sortBy: string, order: string) => {
  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "date":
        comparison =
          new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
        break;
      case "size":
        comparison = (a.size || 0) - (b.size || 0);
        break;
    }
    return order === "asc" ? comparison : -comparison;
  });
  setSortedFiles(sortedFiles);
};
```

## 드래그 앤 드롭

### 파일 이동

```tsx
const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
  e.preventDefault();
  const fileId = e.dataTransfer.getData("text/plain");
  if (fileId && fileId !== targetFolderId) {
    onFileMove?.(fileId, targetFolderId);
  }
};
```

### 파일 업로드

```tsx
const handleFileDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    onFileUpload?.(files, currentFolderId);
  }
};
```

## 에러 처리

### 업로드 에러

```tsx
const handleUploadError = (error: string) => {
  toast.error(`업로드 실패: ${error}`);
};
```

### 권한 에러

```tsx
const handlePermissionError = () => {
  toast.error("파일을 수정할 권한이 없습니다");
};
```

## 접근성

### ARIA 속성

- `role="grid"` - 파일 목록 테이블
- `aria-label` - 각 액션 버튼의 라벨
- `aria-describedby` - 파일 정보 설명

### 키보드 네비게이션

- Tab 키로 액션 버튼 간 이동
- Enter/Space 키로 파일/폴더 선택
- Arrow 키로 파일 목록 탐색

## 성능 최적화

### 가상화

- `@tanstack/react-virtual`로 큰 파일 목록 가상화
- 화면에 보이는 항목만 렌더링

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- 파일 목록 정렬/필터링 결과 메모이제이션

## 다국어 지원

### i18n 키

- `fileExplorer.breadcrumb` - "문서 > 스레드명 > 현재폴더"
- `fileExplorer.newFolder` - "새 폴더"
- `fileExplorer.upload` - "업로드"
- `fileExplorer.share` - "공유"
- `fileExplorer.download` - "다운로드"
- `fileExplorer.search` - "파일 검색..."
- `fileExplorer.name` - "이름"
- `fileExplorer.modifiedDate` - "수정된 날짜"
- `fileExplorer.modifiedBy` - "수정한 사람"
- `fileExplorer.size` - "크기"
- `fileExplorer.filesCount` - "개 파일"

## 테마 지원

### 다크/라이트 모드

- `bg-background` - 테마에 따라 배경색 자동 변경
- `text-foreground` - 테마에 따라 텍스트 색상 자동 변경
- `border` - 테마에 따라 테두리 색상 자동 변경

## 관련 파일

- `app/components/thread/FileExplorer.tsx` - FileExplorer 컴포넌트
- `app/components/thread/FileItem.tsx` - 개별 파일 아이템
- `app/components/thread/FolderOverview.tsx` - 폴더 오버뷰
- `app/components/ui/context-menu.tsx` - 컨텍스트 메뉴
- `app/components/ui/dropdown-menu.tsx` - 드롭다운 메뉴
- `language.csv` - 다국어 키 정의

## 추가된 i18n 키

### 새로운 다국어 키

- `fileExplorer.moreActions` - "더보기" / "More Actions"
- `fileExplorer.dropFilesHere` - "파일을 여기에 놓으세요" / "Drop files here"

### 업데이트된 기능

- **드롭다운 메뉴**: 모든 액션을 "더보기" 드롭다운으로 통합
- **드래그 앤 드롭**: 전체 영역에서 파일 드래그 앤 드롭 지원
- **접근성**: 숨김 파일 입력과 aria-label 지원

## 컴팩트 UI 개선 (2024.01.15)

### 전체적인 크기 축소

#### **브레드크럼 네비게이션**

- 패딩: `px-6 py-3` → `px-4 py-2`
- 아이콘: `w-4 h-4` → `w-3 h-3`
- 텍스트: `text-sm` → `text-xs`

#### **액션 바**

- 패딩: `p-4` → `p-3`
- 버튼 높이: `h-8` → `h-7`
- 버튼 텍스트: `text-xs` 추가
- 아이콘: `w-4 h-4` → `w-3 h-3`
- 간격: `gap-3` → `gap-2`
- 검색창: `w-72 h-8` → `w-56 h-7`
- 검색 아이콘: `left-3` → `left-2`

#### **폴더 오버뷰**

- 패딩: `px-6 py-4` → `px-4 py-3`
- 간격: `gap-6` → `gap-4`
- 폴더 아이콘: `w-12 h-12` → `w-8 h-8`
- 폴더 텍스트: `text-sm` → `text-xs`
- 카드 패딩: `p-4` → `p-3`

#### **파일 목록 헤더**

- 패딩: `px-6 py-3` → `px-4 py-2`
- 텍스트: `text-sm` → `text-xs`
- 간격: `gap-6` → `gap-4`
- 정렬 아이콘: `gap-2` → `gap-1`

#### **파일 아이템**

- 패딩: `px-6 py-3` → `px-4 py-2`
- 텍스트: `text-sm` → `text-xs`
- 간격: `gap-6` → `gap-4`
- 아이콘: `w-4 h-4` → `w-3 h-3`
- 아이콘-텍스트 간격: `gap-3` → `gap-2`

#### **빈 상태**

- 패딩: `py-16` → `py-12`
- 아이콘: `w-16 h-16` → `w-12 h-12`
- 제목 텍스트: `text-lg` → `text-sm`
- 설명 텍스트: `text-sm` → `text-xs`

#### **드래그 오버레이**

- 패딩: `p-6` → `p-4`
- 제목 텍스트: `text-sm` → `text-xs`
- 설명 텍스트: `text-sm` → `text-xs`
- 간격: `mb-2` → `mb-1`

### 개선 효과

#### **공간 효율성**

- 더 많은 콘텐츠를 한 번에 표시
- 과도한 여백 제거로 정보 밀도 향상
- 모든 요소가 조화롭게 작은 크기로 통일

#### **사용성 향상**

- 작은 텍스트로 더 많은 정보를 빠르게 파악 가능
- 제한된 패널 공간을 최대한 활용
- Microsoft Teams와 유사한 컴팩트한 디자인
