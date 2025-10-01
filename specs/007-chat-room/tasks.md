# Tasks: Chat Room Layout

**Input**: Design documents from `/specs/007-chat-room/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure
2. Load design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, components
   → Integration: DB, middleware, Socket.io
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Workspace project**: `packages/shared/`, `packages/backend/`, `packages/frontend/`
- **Bruno tests**: `tests/bruno/` at repository root
- **Package tests**: `packages/*/test/` or `packages/*/**tests**/`
- Paths assume workspace structure from plan.md

## Phase 3.1: UI Setup

- [ ] T001 [P] Add @tanstack/react-virtual dependency to frontend `packages/frontend/package.json`
- [ ] T002 [P] Add next-themes dependency to frontend `packages/frontend/package.json`
- [ ] T003 [P] Add shadcn/ui ResizablePanelGroup component `packages/frontend/app/components/ui/resizable.tsx`
- [ ] T004 [P] Add shadcn/ui Sidebar component `packages/frontend/app/components/ui/sidebar.tsx`
- [ ] T005 [P] Add shadcn/ui ScrollArea component `packages/frontend/app/components/ui/scroll-area.tsx`
- [ ] T006 [P] Add shadcn/ui Progress component `packages/frontend/app/components/ui/progress.tsx`
- [ ] T007 [P] Add shadcn/ui Toast component `packages/frontend/app/components/ui/toast.tsx`
- [ ] T008 [P] Create basic chat types for UI in `packages/frontend/app/types/chat.ts`

## Phase 3.2: UI Component Tests

- [ ] T009 [P] Frontend component tests for main layout in `packages/frontend/app/components/layouts/**tests**/`
- [ ] T010 [P] Frontend component tests for chat components in `packages/frontend/app/components/chat/**tests**/`
- [ ] T011 [P] Frontend component tests for thread components in `packages/frontend/app/components/thread/**tests**/`
- [ ] T012 [P] Frontend component tests for navigation in `packages/frontend/app/components/navigation/**tests**/`

## Phase 3.3: UI Components Implementation

### Layout Components

- [ ] T013 [P] Main layout component in `packages/frontend/app/components/layouts/MainLayout.tsx`
- [ ] T014 [P] Sidebar navigation component in `packages/frontend/app/components/navigation/Sidebar.tsx`
- [ ] T015 [P] Collapsible panel wrapper in `packages/frontend/app/components/ui/CollapsiblePanel.tsx`

### Chat Components

- [ ] T016 [P] Chat room list component in `packages/frontend/app/components/chat/ChatRoomList.tsx`
- [ ] T017 [P] Chat room content component in `packages/frontend/app/components/chat/ChatRoomContent.tsx`
- [ ] T018 [P] Message list component in `packages/frontend/app/components/chat/MessageList.tsx`
- [ ] T019 [P] Message input component in `packages/frontend/app/components/chat/MessageInput.tsx`
- [ ] T020 [P] Message item component in `packages/frontend/app/components/chat/MessageItem.tsx`
- [ ] T021 [P] File upload component in `packages/frontend/app/components/chat/FileUpload.tsx`
- [ ] T022 [P] Typing indicator component in `packages/frontend/app/components/chat/TypingIndicator.tsx`

### Thread Components

- [ ] T023 [P] Thread panel component in `packages/frontend/app/components/thread/ThreadPanel.tsx`
- [ ] T024 [P] Thread list component in `packages/frontend/app/components/thread/ThreadList.tsx`
- [ ] T025 [P] Thread detail component in `packages/frontend/app/components/thread/ThreadDetail.tsx`
- [ ] T026 [P] Thread input component in `packages/frontend/app/components/thread/ThreadInput.tsx`

### UI Enhancement Components

- [ ] T027 [P] Empty state component in `packages/frontend/app/components/ui/EmptyState.tsx`
- [ ] T028 [P] Loading skeleton component in `packages/frontend/app/components/ui/LoadingSkeleton.tsx`
- [ ] T029 [P] File preview component in `packages/frontend/app/components/ui/FilePreview.tsx`
- [ ] T030 [P] Avatar component in `packages/frontend/app/components/ui/Avatar.tsx`

### Frontend Pages and Routing

- [ ] T031 [P] Main chat page in `packages/frontend/app/pages/chat/index.tsx`
- [ ] T032 [P] Settings page in `packages/frontend/app/pages/settings/index.tsx`
- [ ] T033 [P] Main chat route in `packages/frontend/app/routes/_chat._index.tsx`
- [ ] T034 [P] Settings route in `packages/frontend/app/routes/_settings._index.tsx`

## Phase 3.4: UI Integration

- [ ] T035 Setup ResizablePanelGroup layout in `packages/frontend/app/components/layouts/MainLayout.tsx`
- [ ] T036 Configure @tanstack/react-virtual for chat lists in `packages/frontend/app/components/chat/ChatRoomList.tsx`
- [ ] T037 Configure theme switching with next-themes in `packages/frontend/app/components/theme-provider.tsx`
- [ ] T038 Setup chat room state management with nuqs in `packages/frontend/app/hooks/useChatState.ts`
- [ ] T039 Configure collapsible panel state with localStorage in `packages/frontend/app/hooks/usePanelState.ts`
- [ ] T040 Configure file upload UI mockup in `packages/frontend/app/components/chat/FileUpload.tsx`
- [ ] T041 Setup mock data for UI development in `packages/frontend/app/data/mockData.ts`
- [ ] T042 Configure responsive layout behavior in `packages/frontend/app/components/layouts/MainLayout.tsx`

## Phase 3.5: UI Polish

- [ ] T043 [P] Frontend component tests for all chat components in `packages/frontend/app/components/chat/**tests**/`
- [ ] T044 [P] Frontend component tests for thread components in `packages/frontend/app/components/thread/**tests**/`
- [ ] T045 [P] Frontend component tests for layout components in `packages/frontend/app/components/layouts/**tests**/`
- [ ] T046 Performance optimization for large message lists with @tanstack/react-virtual
- [ ] T047 [P] Update screen wireframes with implementation details
- [ ] T048 Code refactoring and duplication removal in chat components
- [ ] T049 Type safety validation across all UI components
- [ ] T050 Accessibility testing for chat components with screen readers
- [ ] T051 Collapsible panel state persistence with localStorage
- [ ] T052 Responsive design testing for different screen sizes
- [ ] T053 Theme switching smooth transitions and persistence
- [ ] T054 File upload UI polish and progress indication
- [ ] T055 Empty state and loading skeleton improvements
- [ ] T056 Keyboard navigation and ARIA improvements

## Dependencies

- Tests (T009-T012) before implementation (T013-T034)
- T013-T015 (layout components) before T016-T022 (chat components)
- T023-T026 (thread components) can be parallel with chat components
- T027-T030 (UI enhancement components) can be parallel
- T031-T034 (pages/routes) after all components
- Implementation before integration (T035-T042)
- Integration before polish (T043-T056)

## Parallel Execution Examples

```
# Launch shadcn/ui component setup together:
Task: "Add shadcn/ui ResizablePanelGroup component in packages/frontend/app/components/ui/resizable.tsx"
Task: "Add shadcn/ui Sidebar component in packages/frontend/app/components/ui/sidebar.tsx"
Task: "Add shadcn/ui ScrollArea component in packages/frontend/app/components/ui/scroll-area.tsx"

# Launch chat component creation together:
Task: "Chat room list component in packages/frontend/app/components/chat/ChatRoomList.tsx"
Task: "Chat room content component in packages/frontend/app/components/chat/ChatRoomContent.tsx"
Task: "Message list component in packages/frontend/app/components/chat/MessageList.tsx"

# Launch thread component creation together:
Task: "Thread panel component in packages/frontend/app/components/thread/ThreadPanel.tsx"
Task: "Thread list component in packages/frontend/app/components/thread/ThreadList.tsx"
Task: "Thread detail component in packages/frontend/app/components/thread/ThreadDetail.tsx"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- **Focus on UI implementation first, backend logic later**
- All components must follow shadcn/ui design system
- Use @tanstack/react-virtual for performance optimization
- Mock data for UI development, real API integration later

## Task Generation Rules

_Applied during main() execution_

1. **UI-First Approach**: Components → Integration → Polish
2. **shadcn/ui Components**: All UI components use shadcn/ui design system
3. **@tanstack/react-virtual**: Performance optimization for lists
4. **Mock Data**: Use mock data for UI development
5. **Dependencies**: Block parallel execution when files are shared

## Validation Checklist

_GATE: Checked before returning_

- [x] All UI components have corresponding tests
- [x] All components follow shadcn/ui design system
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] UI-focused implementation with mock data
- [x] Collapsible panels for better space management
- [x] @tanstack/react-virtual for performance optimization
