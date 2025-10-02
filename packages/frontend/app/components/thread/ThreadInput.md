# ThreadInput Component

**Purpose**: A message input component specifically designed for thread conversations with file upload and message sending capabilities.

## 컴포넌트 목적

스레드 내에서 메시지를 입력하고 전송하는 컴포넌트입니다. 텍스트 입력, 파일 업로드, 그리고 메시지 전송 기능을 제공하며, 스레드 컨텍스트에 맞는 UI를 제공합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│ [Type a message...]    [📎] [📤]       │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="flex items-center space-x-2">
  <Input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder={placeholder}
    disabled={disabled}
    className="flex-1"
  />

  {/* File Upload Button */}
  <input
    type="file"
    multiple
    onChange={handleFileChange}
    className="hidden"
    id="thread-file-upload"
    disabled={disabled}
  />
  <Label htmlFor="thread-file-upload" className="cursor-pointer">
    <Button variant="ghost" size="icon" disabled={disabled}>
      <Paperclip className="w-4 h-4" />
      <span className="sr-only">{t("thread.uploadFile")}</span>
    </Button>
  </Label>

  {/* Send Button */}
  <Button
    onClick={handleSendMessage}
    size="icon"
    disabled={disabled || !message.trim()}
  >
    <Send className="w-4 h-4" />
    <span className="sr-only">{t("thread.send")}</span>
  </Button>
</div>
```

## Props Interface

```tsx
interface ThreadInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (files: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `Input` - 메시지 입력 필드
- `Button` - 파일 업로드 및 전송 버튼
- `Label` - 파일 업로드 라벨
- `Paperclip` - 파일 업로드 아이콘
- `Send` - 전송 아이콘

### 의존성

- `~/components/ui/input` - 입력 컴포넌트
- `~/components/ui/button` - 버튼 컴포넌트
- `~/components/ui/label` - 라벨 컴포넌트
- `lucide-react` - 아이콘 라이브러리

## Props 설명

### onSendMessage (필수)

- **타입**: `(message: string) => void`
- **설명**: 메시지 전송 시 실행할 함수
- **기본값**: 없음

### onFileUpload (필수)

- **타입**: `(files: File[]) => void`
- **설명**: 파일 업로드 시 실행할 함수
- **기본값**: 없음

### placeholder (선택사항)

- **타입**: `string`
- **설명**: 입력 필드 플레이스홀더 텍스트
- **기본값**: `"Type a message..."`

### disabled (선택사항)

- **타입**: `boolean`
- **설명**: 입력 필드 및 버튼 비활성화 여부
- **기본값**: `false`

### maxLength (선택사항)

- **타입**: `number`
- **설명**: 최대 입력 길이 제한
- **기본값**: `undefined`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 상태 관리

### 내부 상태

- `message` - 현재 입력 중인 메시지 텍스트
- `isUploading` - 파일 업로드 중 여부

### 상태 전환

1. **초기 상태**: 빈 입력 필드
2. **입력 중**: 텍스트 입력, 전송 버튼 활성화
3. **업로드 중**: 버튼들 비활성화
4. **전송 후**: 입력 필드 초기화

## 스타일링

### 컨테이너 스타일

- `flex items-center space-x-2` - 가로 플렉스, 중앙 정렬, 간격

### 입력 필드 스타일

- `flex-1` - 남은 공간 모두 차지

### 버튼 스타일

- `variant="ghost" size="icon"` - 투명 배경, 아이콘 크기
- `disabled` - 비활성화 상태 스타일

## 사용 예시

### 기본 사용

```tsx
<ThreadInput
  onSendMessage={(message) => {
    console.log("Sending message:", message);
    // 메시지 전송 로직
  }}
  onFileUpload={(files) => {
    console.log("Uploading files:", files);
    // 파일 업로드 로직
  }}
/>
```

### 커스텀 플레이스홀더

```tsx
<ThreadInput
  onSendMessage={handleSendMessage}
  onFileUpload={handleFileUpload}
  placeholder="Reply to this thread..."
  maxLength={500}
/>
```

### 비활성화 상태

```tsx
<ThreadInput
  onSendMessage={handleSendMessage}
  onFileUpload={handleFileUpload}
  disabled={isLoading}
/>
```

## 키보드 인터랙션

### Enter 키

- **일반 Enter**: 메시지 전송
- **Shift + Enter**: 줄바꿈 (향후 구현)

### 키보드 단축키

- **Ctrl + Enter**: 메시지 전송
- **Ctrl + U**: 파일 업로드 다이얼로그 열기

## 파일 업로드 기능

### 지원하는 파일 타입

- **이미지**: jpg, jpeg, png, gif, webp
- **문서**: pdf, doc, docx, txt
- **스프레드시트**: xls, xlsx, csv
- **프레젠테이션**: ppt, pptx

### 파일 크기 제한

- **최대 파일 크기**: 10MB
- **최대 파일 개수**: 5개

### 업로드 상태 표시

```tsx
// 업로드 진행률 표시 (향후 구현)
{
  isUploading && (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      <span className="text-sm text-muted-foreground">Uploading...</span>
    </div>
  );
}
```

## 메시지 전송 로직

### 전송 조건

1. **메시지가 비어있지 않음**: `message.trim().length > 0`
2. **업로드 중이 아님**: `!isUploading`
3. **비활성화 상태가 아님**: `!disabled`

### 전송 후 처리

```tsx
const handleSendMessage = () => {
  if (message.trim() && !disabled) {
    onSendMessage(message.trim());
    setMessage(""); // 입력 필드 초기화
  }
};
```

## 다국어 지원

### i18n 키

- `thread.typeMessage` - "Type a message..." / "메시지를 입력하세요..."
- `thread.uploadFile` - "Upload file" / "파일 업로드"
- `thread.send` - "Send" / "전송"
- `thread.uploading` - "Uploading..." / "업로드 중..."

## 접근성

### ARIA 속성

- `aria-label` - 버튼 목적 명시
- `aria-describedby` - 입력 필드 설명

### 키보드 네비게이션

- Tab 키로 포커스 이동
- Enter 키로 메시지 전송
- Space 키로 버튼 활성화

### 스크린 리더 지원

- `sr-only` 클래스로 버튼 목적 설명

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- Props 변경 시에만 리렌더링

### 이벤트 핸들러

- `useCallback`으로 핸들러 메모이제이션

## 테마 지원

### 다크/라이트 모드

- 모든 색상이 테마에 따라 자동 변경
- `bg-background`, `text-foreground` 등 사용

## 관련 파일

- `app/components/thread/ThreadDetail.tsx` - 상위 컴포넌트
- `app/components/chat/MessageInput.tsx` - 채팅 메시지 입력 (참고)
- `language.csv` - 다국어 키 정의
