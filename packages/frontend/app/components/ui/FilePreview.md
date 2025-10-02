# FilePreview Component

**Purpose**: Provides file preview functionality with icons, thumbnails, and modal preview for various file types.

## 컴포넌트 목적

다양한 파일 타입에 대한 미리보기 기능을 제공하는 컴포넌트입니다. 파일 아이콘, 썸네일, 다운로드 기능, 모달 미리보기를 포함합니다.

## Props

### FilePreview

```tsx
interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    size?: number;
    url?: string;
    thumbnail?: string;
  };
  showPreview?: boolean;
  showDownload?: boolean;
  showName?: boolean;
  showSize?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  onDownload?: (fileId: string) => void;
  onPreview?: (fileId: string) => void;
}
```

#### **file**

- `id`: 파일 고유 식별자
- `name`: 파일명
- `type`: 파일 MIME 타입
- `size`: 파일 크기 (바이트)
- `url`: 파일 다운로드 URL
- `thumbnail`: 썸네일 이미지 URL

#### **size**

- `sm`: 64x64px (h-16 w-16)
- `md`: 80x80px (h-20 w-20) - 기본값
- `lg`: 96x96px (h-24 w-24)

#### **showPreview/showDownload/showName/showSize**

- 각 UI 요소의 표시 여부를 제어

#### **onDownload/onPreview**

- 커스텀 다운로드/미리보기 핸들러

## 지원하는 파일 타입

### 이미지

- JPG, JPEG, PNG, GIF, WEBP
- 썸네일 표시 및 모달에서 확대 보기

### 문서

- PDF: 빨간색 아이콘
- DOC/DOCX: 파란색 아이콘
- XLS/XLSX: 초록색 아이콘
- PPT/PPTX: 주황색 아이콘

### 미디어

- MP4, AVI, MOV, WMV: 비디오 플레이어
- MP3, WAV, FLAC: 오디오 아이콘

### 압축 파일

- ZIP, RAR, 7Z: 아카이브 아이콘

### 기타

- 알 수 없는 타입: 기본 파일 아이콘

## 주요 기능

### 1. 파일 아이콘 표시

```tsx
// 파일 확장자에 따른 아이콘 자동 선택
const getFileIcon = () => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  // 파일 타입별 아이콘 반환
};
```

### 2. 썸네일 지원

```tsx
// 이미지 파일의 경우 썸네일 표시
{
  file.thumbnail && isImage() ? (
    <img src={file.thumbnail} alt={file.name} />
  ) : (
    <div>{getFileIcon()}</div>
  );
}
```

### 3. 파일 크기 포맷팅

```tsx
// 바이트를 읽기 쉬운 형태로 변환
const formatFileSize = (bytes: number): string => {
  // B, KB, MB, GB 단위로 변환
};
```

### 4. overlay-kit 기반 모달

- [overlay-kit](https://overlay-kit.slash.page/ko/docs/guides/introduction)을 사용한 모달 관리
- 이미지: 확대 보기
- 비디오: 비디오 플레이어
- 기타: 아이콘과 다운로드 버튼
- Promise 기반 API로 더 나은 상태 관리

### 5. 호버 효과

- 마우스 오버 시 반투명 오버레이
- 눈 아이콘 표시로 미리보기 가능함을 알림

## 사용 예시

### 기본 사용

```tsx
<FilePreview
  file={{
    id: "1",
    name: "document.pdf",
    type: "application/pdf",
    size: 1024000,
    url: "/files/document.pdf",
  }}
/>
```

### 작은 크기, 이름 숨김

```tsx
<FilePreview file={file} size="sm" showName={false} showSize={false} />
```

### 커스텀 핸들러

```tsx
<FilePreview
  file={file}
  onDownload={(fileId) => {
    console.log("다운로드:", fileId);
  }}
  onPreview={(fileId) => {
    console.log("미리보기:", fileId);
  }}
/>
```

## 스타일링

### 크기 변형

- `sm`: 컴팩트한 목록 뷰용
- `md`: 일반적인 그리드 뷰용 (기본값)
- `lg`: 상세 보기용

### 색상 시스템

- 파일 타입별 아이콘 색상
- 호버 상태 색상 변화
- 테마에 따른 배경색 자동 조정

### 애니메이션

- 호버 시 부드러운 전환 효과
- overlay-kit의 자동 애니메이션 관리
- 메모리 효율적인 모달 관리

## 접근성

- 키보드 네비게이션 지원
- 스크린 리더를 위한 적절한 라벨
- 컬러에만 의존하지 않는 시각적 구분

## 확장성

### 새로운 파일 타입 추가

```tsx
// getFileIcon 함수에 새로운 케이스 추가
case "newType":
  return <NewIcon className="w-full h-full text-new-color" />;
```

### 커스텀 미리보기

```tsx
// onPreview 핸들러로 커스텀 미리보기 로직 구현
onPreview={(fileId) => {
  // 커스텀 미리보기 로직
}}
```
