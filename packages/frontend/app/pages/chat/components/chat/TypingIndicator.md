# TypingIndicator Component

**Purpose**: A component that displays who is currently typing in a chat room with animated dots and proper text formatting.

## 컴포넌트 목적

채팅방에서 현재 타이핑 중인 사용자들을 시각적으로 표시하는 컴포넌트입니다. 애니메이션이 적용된 점들과 함께 "누구누구가 입력 중..." 형태의 텍스트를 표시합니다.

## 내부 구조

### 레이아웃 구조

```
┌─────────────────────────────────────────┐
│ • • • Jane과 Bob이 입력 중...           │
└─────────────────────────────────────────┘
```

### 컴포넌트 구조

```tsx
<div className="px-4 py-2 border-t bg-muted/30">
  <BodyTextSmall className="text-muted-foreground text-xs flex items-center">
    <span className="flex items-center space-x-1">
      <span className="flex space-x-1">
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></span>
      </span>
      <span className="ml-2">{getTypingText()}</span>
    </span>
  </BodyTextSmall>
</div>
```

## Props Interface

```tsx
interface TypingIndicatorProps {
  users?: TypingUser[];
  className?: string;
}

interface TypingUser {
  id: string;
  name: string;
}
```

## 사용되는 컴포넌트

### 직접 사용

- `BodyTextSmall` - 타이핑 텍스트

### 의존성

- `~/components/typography` - 타이포그래피 컴포넌트
- `lucide-react` - 아이콘 라이브러리 (필요시)

## Props 설명

### users (선택사항)

- **타입**: `TypingUser[]`
- **설명**: 현재 타이핑 중인 사용자 목록
- **기본값**: `[]`

### className (선택사항)

- **타입**: `string`
- **설명**: 추가 CSS 클래스
- **기본값**: `undefined`

## 텍스트 표시 로직

### 1명 타이핑

```
"Jane이 입력 중..."
```

### 2명 타이핑

```
"Jane과 Bob이 입력 중..."
```

### 3명 이상 타이핑

```
"Jane과 2명이 입력 중..."
```

## 애니메이션

### 점 애니메이션

- **3개의 점**: 각각 다른 딜레이로 bounce 애니메이션
- **딜레이**: -0.3s, -0.15s, 0s
- **효과**: 연속적인 bounce 효과로 타이핑 느낌 연출

### CSS 클래스

```css
.animate-bounce {
  animation: bounce 1s infinite;
}

[animation-delay:-0.3s] {
  animation-delay: -0.3s;
}

[animation-delay:-0.15s] {
  animation-delay: -0.15s;
}
```

## 스타일링

### 컨테이너 스타일

- `px-4 py-2` - 좌우 패딩 16px, 상하 패딩 8px
- `border-t` - 상단 테두리
- `bg-muted/30` - 반투명 배경색

### 텍스트 스타일

- `text-muted-foreground text-xs` - 회색, 작은 크기
- `flex items-center` - 수직 중앙 정렬

### 점 스타일

- `w-1 h-1` - 4px 크기
- `bg-muted-foreground` - 회색
- `rounded-full` - 원형
- `animate-bounce` - bounce 애니메이션

## 사용 예시

### 기본 사용

```tsx
<TypingIndicator users={typingUsers} />
```

### Mock 데이터로 테스트

```tsx
const mockTypingUsers = [
  { id: "1", name: "Jane" },
  { id: "2", name: "Bob" },
];

<TypingIndicator users={mockTypingUsers} />;
```

### 조건부 렌더링

```tsx
{
  typingUsers.length > 0 && <TypingIndicator users={typingUsers} />;
}
```

## 다양한 사용 사례

### 1. 단일 사용자 타이핑

```tsx
const singleUser = [{ id: "1", name: "Alice" }];
<TypingIndicator users={singleUser} />;
// 결과: "• • • Alice가 입력 중..."
```

### 2. 다중 사용자 타이핑

```tsx
const multipleUsers = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];
<TypingIndicator users={multipleUsers} />;
// 결과: "• • • Alice과 2명이 입력 중..."
```

### 3. 빈 상태 (숨김)

```tsx
<TypingIndicator users={[]} />
// 결과: 렌더링되지 않음 (null 반환)
```

## 다국어 지원

### i18n 키 사용

- `chat.typing` - "이 입력 중..." / "is typing..."
- `chat.and` - "과" / "and"
- `chat.others` - "명" / "others"

### 언어별 결과

#### 한국어

```
"Jane과 Bob이 입력 중..."
"Jane과 2명이 입력 중..."
```

#### 영어

```
"Jane and Bob are typing..."
"Jane and 2 others are typing..."
```

## 성능 최적화

### 메모이제이션

- `React.memo`로 불필요한 리렌더링 방지
- users 배열 변경 시에만 리렌더링

### 애니메이션 최적화

- CSS 애니메이션 사용 (JavaScript보다 효율적)
- `transform` 속성 사용으로 GPU 가속

## 접근성

### 스크린 리더 지원

- `aria-live="polite"` - 상태 변경 시 알림
- `role="status"` - 상태 정보임을 명시

### 시각적 피드백

- 애니메이션으로 시각적 주의 집중
- 적절한 색상 대비로 가독성 확보

## 테마 지원

### 다크/라이트 모드

- `text-muted-foreground` - 테마에 따라 자동 색상 변경
- `bg-muted/30` - 테마에 따라 배경색 자동 변경

## 관련 파일

- `app/components/chat/ChatRoomContent.tsx` - 사용 예시
- `app/components/chat/MessageInput.tsx` - 타이핑 이벤트 연동
- `language.csv` - 다국어 키 정의
