# MainPage 컴포넌트

## 개요

메인 페이지 컴포넌트로, 채팅룸 내용과 스레드 패널을 표시합니다. `_main._index.tsx` 라우트에서 사용됩니다.

## 목적

- 채팅룸 내용 표시 영역
- 스레드 패널 표시 영역
- ResizablePanelGroup을 통한 패널 크기 조절
- 빈 상태 메시지 표시

## 파일 위치

`packages/frontend/app/pages/main/index.tsx`

## Props

현재는 Props를 받지 않습니다. 향후 채팅룸 데이터를 Props로 받을 예정입니다.

## 내부 구조

### 컴포넌트 구조

```tsx
<ResizablePanelGroup direction="horizontal" className="h-full">
  {/* Right Chat Content Panel */}
  <ResizablePanel defaultSize={400} minSize={300} maxSize={600}>
    <div className="h-full bg-background">
      <div className="p-4">
        <Heading3 className="text-muted-foreground">메시지</Heading3>
      </div>
      <div className="flex-1 p-4">
        <div className="text-center">
          <BodyTextSmall className="text-muted-foreground">
            채팅룸을 선택해주세요
          </BodyTextSmall>
        </div>
      </div>
    </div>
  </ResizablePanel>

  <ResizableHandle />

  {/* Thread Panel */}
  <ResizablePanel defaultSize={300} minSize={60} maxSize={400}>
    <div className="h-full border-l bg-background">
      <div className="p-4">
        <Heading3 className="text-muted-foreground">Threads</Heading3>
      </div>
      <div className="flex-1 p-4">
        <div className="text-center">
          <BodyTextSmall className="text-muted-foreground">
            스레드가 없습니다
          </BodyTextSmall>
        </div>
      </div>
    </div>
  </ResizablePanel>
</ResizablePanelGroup>
```

## 사용되는 컴포넌트

### Typography 컴포넌트

- `Heading3` - 패널 헤더 텍스트
- `BodyTextSmall` - 빈 상태 메시지

### shadcn/ui 컴포넌트

- `ResizablePanelGroup` - 패널 그룹 컨테이너
- `ResizablePanel` - 개별 패널
- `ResizableHandle` - 패널 크기 조절 핸들

## 스타일링

### 컨테이너 스타일

- `h-full` - 전체 높이 사용
- `bg-background` - 배경색

### 패널 스타일

- `p-4` - 16px 패딩
- `border-l` - 왼쪽 테두리 (Thread 패널)
- `text-center` - 텍스트 중앙 정렬

### 헤더 스타일

- `text-muted-foreground` - 보조 텍스트 색상

### 빈 상태 스타일

- `text-muted-foreground` - 보조 텍스트 색상
- `text-center` - 중앙 정렬

## 상태 관리

현재는 상태를 관리하지 않습니다. 향후 다음 상태들을 추가할 예정입니다:

- 선택된 채팅룸 데이터
- 메시지 목록
- 스레드 목록
- 로딩 상태

## 인터랙션

### 패널 크기 조절

- ResizableHandle을 통한 드래그로 패널 크기 조절
- 최소/최대 크기 제한

### 향후 인터랙션

- 채팅룸 선택 시 내용 표시
- 메시지 입력 및 전송
- 스레드 생성 및 관리
- 파일 업로드

## 접근성

### 키보드 네비게이션

- Tab으로 패널 간 이동
- 패널 크기 조절을 위한 키보드 단축키 (향후)

### 스크린 리더 지원

- 각 패널에 적절한 `role` 속성 (향후)
- 헤더와 내용의 구조적 관계 명시

## 성능 최적화

### 렌더링 최적화

- `memo` 사용으로 불필요한 리렌더링 방지 (향후)
- 가상화를 통한 대량 메시지 처리 (향후)

### 메모리 관리

- 채팅룸 변경 시 이전 데이터 정리 (향후)
- 이미지/파일 캐싱 최적화 (향후)

## 테마 지원

- `bg-background` - 테마별 배경색
- `text-muted-foreground` - 테마별 보조 텍스트 색상
- 다크/라이트 모드 자동 전환

## 반응형 디자인

현재는 데스크톱 전용으로 설계되어 있습니다. 향후 태블릿 지원을 고려할 수 있습니다.

## 테스트 시나리오

### 기본 렌더링

1. MainPage가 올바르게 렌더링되는지 확인
2. 두 개의 패널이 표시되는지 확인
3. 헤더와 빈 상태 메시지가 표시되는지 확인

### 패널 크기 조절

1. ResizableHandle을 드래그하여 패널 크기가 조절되는지 확인
2. 최소/최대 크기 제한이 작동하는지 확인
3. 크기 조절 후 레이아웃이 깨지지 않는지 확인

### 접근성

1. 키보드만으로 패널 간 이동이 가능한지 확인
2. 스크린 리더에서 패널 구조를 인식하는지 확인

### 테마 전환

1. 다크/라이트 모드 전환 시 스타일이 올바르게 적용되는지 확인
2. 색상 대비가 적절한지 확인

## 향후 개선 사항

### 기능 추가

- 실제 채팅룸 데이터 연동
- 메시지 표시 및 입력 기능
- 스레드 생성 및 관리
- 파일 업로드 및 공유
- 실시간 메시지 업데이트

### UI/UX 개선

- 로딩 상태 표시
- 에러 상태 처리
- 애니메이션 및 전환 효과
- 더 나은 빈 상태 디자인

### 성능 최적화

- 메시지 가상화
- 이미지 지연 로딩
- 메모리 사용량 최적화
- 번들 크기 최적화
