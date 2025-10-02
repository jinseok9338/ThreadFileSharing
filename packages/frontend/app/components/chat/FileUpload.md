# FileUpload Component

**Purpose**: A file upload component with drag-and-drop support, file preview, and upload progress indication.

## 컴포넌트 목적

파일 업로드 기능을 제공하는 컴포넌트입니다. 드래그 앤 드롭, 파일 선택, 업로드 진행률 표시, 파일 미리보기 등의 기능을 포함합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│  📁 Drag & Drop Area                    │
│                                         │
│  [파일을 여기에 드래그하거나 클릭하세요]    │
│                                         │
│  지원 형식: PDF, 이미지, 문서, 기타      │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
  <input
    type="file"
    multiple
    accept="*/*"
    onChange={handleFileSelect}
    className="hidden"
  />

  <div className="text-center">
    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
    <p className="text-sm text-muted-foreground mb-1">
      {t("fileUpload.dragDrop")}
    </p>
    <p className="text-xs text-muted-foreground">
      {t("fileUpload.supportedFormats")}
    </p>
  </div>
</div>
```

## Props Interface

```tsx
interface FileUploadProps {
  onFileSelect?: (files: File[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // bytes
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `Upload` - 업로드 아이콘
- `Button` - 파일 선택 버튼 (선택사항)
- `Progress` - 업로드 진행률 표시

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `~/components/ui/button` - 버튼 컴포넌트
- `~/components/ui/progress` - 진행률 컴포넌트
- `lucide-react` - 아이콘 라이브러리

## Props 설명

### onFileSelect (선택사항)

- **타입**: `(files: File[]) => void`
- **설명**: 파일 선택 시 실행할 함수
- **기본값**: `undefined`

### onUploadProgress (선택사항)

- **타입**: `(progress: number) => void`
- **설명**: 업로드 진행률 변경 시 실행할 함수 (0-100)
- **기본값**: `undefined`

### onUploadComplete (선택사항)

- **타입**: `(files: UploadedFile[]) => void`
- **설명**: 업로드 완료 시 실행할 함수
- **기본값**: `undefined`

### onUploadError (선택사항)

- **타입**: `(error: string) => void`
- **설명**: 업로드 에러 시 실행할 함수
- **기본값**: `undefined`

### maxFiles (선택사항)

- **타입**: `number`
- **설명**: 최대 파일 개수
- **기본값**: `10`

### maxFileSize (선택사항)

- **타입**: `number`
- **설명**: 최대 파일 크기 (바이트)
- **기본값**: `10485760` (10MB)

### acceptedTypes (선택사항)

- **타입**: `string[]`
- **설명**: 허용되는 파일 타입 (MIME 타입)
- **기본값**: `["*/*"]`

### disabled (선택사항)

- **타입**: `boolean`
- **설명**: 컴포넌트 비활성화 여부
- **기본값**: `false`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 상태 관리

### 내부 상태

- `isDragOver` - 드래그 오버 상태
- `isUploading` - 업로드 진행 중 상태
- `uploadProgress` - 업로드 진행률 (0-100)
- `selectedFiles` - 선택된 파일 목록

### 상태 전환

1. **초기 상태**: 드래그 앤 드롭 영역 표시
2. **드래그 오버**: 시각적 피드백 표시
3. **파일 선택**: 파일 검증 및 선택된 파일 표시
4. **업로드 중**: 진행률 표시
5. **완료/에러**: 결과 표시

## 스타일링

### 컨테이너 스타일

- `border-2 border-dashed border-muted-foreground/25` - 점선 테두리
- `rounded-lg p-6` - 모서리 둥글게, 패딩

### 드래그 오버 스타일

- `border-primary bg-primary/5` - 주요 색상 테두리, 배경
- `transition-colors` - 부드러운 색상 전환

### 업로드 중 스타일

- `opacity-50 pointer-events-none` - 비활성화 상태
- `cursor-not-allowed` - 금지 커서

## 사용 예시

### 기본 사용

```tsx
<FileUpload
  onFileSelect={(files) => {
    console.log("선택된 파일:", files);
  }}
  onUploadProgress={(progress) => {
    console.log("업로드 진행률:", progress);
  }}
  onUploadComplete={(files) => {
    console.log("업로드 완료:", files);
  }}
/>
```

### 제한된 파일 타입

```tsx
<FileUpload
  acceptedTypes={["image/*", ".pdf", ".doc", ".docx"]}
  maxFiles={5}
  maxFileSize={5242880} // 5MB
  onFileSelect={handleFileSelect}
/>
```

### 업로드 진행률 표시

```tsx
<FileUpload
  onUploadProgress={(progress) => {
    setUploadProgress(progress);
  }}
  onUploadComplete={() => {
    setUploadProgress(0);
    setIsUploading(false);
  }}
/>
```

## 다양한 사용 사례

### 1. 메인 채팅 파일 업로드

```tsx
<FileUpload
  onFileSelect={(files) => {
    // 파일 업로드 시 자동으로 스레드 생성
    uploadFiles(files);
  }}
  acceptedTypes={["*/*"]}
  maxFiles={10}
/>
```

### 2. 스레드 파일 업로드

```tsx
<FileUpload
  onFileSelect={(files) => {
    // 선택된 스레드에 파일 추가
    addFilesToThread(selectedThreadId, files);
  }}
  acceptedTypes={["image/*", ".pdf", ".doc", ".docx", ".xls", ".xlsx"]}
  maxFiles={5}
/>
```

### 3. 프로필 이미지 업로드

```tsx
<FileUpload
  acceptedTypes={["image/*"]}
  maxFiles={1}
  maxFileSize={2097152} // 2MB
  onFileSelect={(files) => {
    uploadProfileImage(files[0]);
  }}
/>
```

## 파일 검증

### 크기 검증

```tsx
const validateFileSize = (file: File, maxSize: number) => {
  if (file.size > maxSize) {
    throw new Error(
      `파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxSize)}까지 허용됩니다.`
    );
  }
};
```

### 타입 검증

```tsx
const validateFileType = (file: File, acceptedTypes: string[]) => {
  const isAccepted = acceptedTypes.some((type) => {
    if (type === "*/*") return true;
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type.match(type.replace("*", ".*"));
  });

  if (!isAccepted) {
    throw new Error(
      `지원되지 않는 파일 형식입니다. 허용된 형식: ${acceptedTypes.join(", ")}`
    );
  }
};
```

### 개수 검증

```tsx
const validateFileCount = (files: File[], maxFiles: number) => {
  if (files.length > maxFiles) {
    throw new Error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
  }
};
```

## 에러 처리

### 파일 검증 에러

- 파일 크기 초과
- 지원되지 않는 파일 형식
- 최대 파일 개수 초과

### 업로드 에러

- 네트워크 에러
- 서버 에러
- 권한 에러

## 접근성

### ARIA 속성

- `role="button"` - 클릭 가능한 영역
- `aria-label="파일 업로드"` - 접근성 라벨
- `aria-describedby` - 설명 텍스트 연결

### 키보드 네비게이션

- Tab 키로 포커스 이동
- Enter/Space 키로 파일 선택 대화상자 열기

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- 파일 검증 함수 메모이제이션

### 파일 미리보기

- 이미지 파일의 경우 썸네일 생성
- 큰 파일의 경우 압축된 미리보기

## 다국어 지원

### i18n 키

- `fileUpload.dragDrop` - "파일을 여기에 드래그하거나 클릭하세요"
- `fileUpload.supportedFormats` - "지원 형식: PDF, 이미지, 문서, 기타"
- `fileUpload.selectFiles` - "파일 선택"
- `fileUpload.uploading` - "업로드 중..."
- `fileUpload.complete` - "업로드 완료"
- `fileUpload.error` - "업로드 실패"

## 테마 지원

### 다크/라이트 모드

- `border-muted-foreground/25` - 테마에 따라 테두리 색상 자동 변경
- `text-muted-foreground` - 테마에 따라 텍스트 색상 자동 변경

## 관련 파일

- `app/components/chat/FileUpload.tsx` - FileUpload 컴포넌트
- `app/components/ui/progress.tsx` - Progress 컴포넌트
- `app/utils/fileUtils.ts` - 파일 유틸리티 함수
- `language.csv` - 다국어 키 정의
