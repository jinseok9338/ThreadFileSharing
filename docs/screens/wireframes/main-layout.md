# Main Layout Wireframe

**Feature**: Chat Room Layout  
**Date**: 2025-10-01  
**Scope**: UI-focused four-column layout design with thread management

## Layout Overview

Teams-like four-column layout for desktop chat application with resizable panels and navigation, split into Layout and Page components for better routing structure.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ Header (Optional - App Branding)                                                            │
├──────────┬──────────────────────────────┬──────────────────────────────────┬────────────────┤
│          │                              │                                  │                │
│ Layout   │ Layout                       │ Page                             │ Page           │
│ Left     │ Middle                       │ Right                            │ Thread         │
│ Column   │ Column                       │ Column                           │ Column         │
│          │                              │                                  │                │
│ - Nav    │ - Chat Room List             │ - Chat Room Content              │ - Thread List  │
│ - Settings│ - Search (Future)            │ - Messages                       │ - Thread Detail│
│ - Theme  │ - Filters (Future)           │ - Input Area                     │ - Thread Files │
│          │                              │ - File Upload                    │                │
│          │                              │                                  │                │
└──────────┴──────────────────────────────┴──────────────────────────────────┴────────────────┘
```

## Left Column - Navigation Sidebar

### Layout Specifications

- **Width**: 64px (fixed)
- **Background**: `bg-sidebar`
- **Border**: Right border with `border-r`
- **Padding**: `p-2`

### Navigation Items

```
┌─────────────────────────┐
│ [🏠] 채팅               │ ← Active state
│ [⚙️] 세팅              │
└─────────────────────────┘
```

**Components Used**:

- `Sidebar` from shadcn/ui
- `SidebarMenu` with navigation items
- `SidebarMenuItem` for each navigation option
- `Lucide` icons (Home, Settings)

**Styling**:

- Active state: `bg-accent text-accent-foreground`
- Hover state: `hover:bg-accent/50`
- Icon size: `h-4 w-4`
- Text: `font-medium`

## Middle Column - Chat Room List

### Layout Specifications

- **Width**: 320px (resizable, min: 250px, max: 500px, collapsible)
- **Background**: `bg-background`
- **Border**: Right border with `border-r`
- **Collapsible**: Can be collapsed to show only icon strip

### Header Section

```
┌─────────────────────────┐
│ 채팅              [🔍]  │ ← Search icon (future)
│ [📝] New Chat    [←]    │ ← Create new chat button, Collapse button
└─────────────────────────┘
```

### Collapsed State

```
┌─────────┐
│ [🏠]    │ ← Chat icon
│ [👥]    │ ← Group chat icon
│ [📁]    │ ← Channel icon
│ [📝]    │ ← New chat icon
│ [🔍]    │ ← Search icon
└─────────┘
```

### Chat Room List

```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │ [👤] General Chat   │ │ ← Chat room item
│ │     Hello everyone! │ │
│ │     2분 전          │ │
│ │     (3)             │ │ ← Unread count
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [👥] Team Discussion│ │
│ │     Working on...   │ │
│ │     1시간 전        │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ [📁] Project Files  │ │
│ │     New document... │ │
│ │     3시간 전        │ │
│ │     (1)             │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Components Used**:

- `ScrollArea` for virtual scrolling
- `Card` for each chat room item
- `Avatar` for room icons
- `Badge` for unread counts
- `@tanstack/react-virtual` for performance

**Chat Room Item Styling**:

- Container: `p-3 hover:bg-accent/50 cursor-pointer`
- Selected state: `bg-accent text-accent-foreground`
- Avatar: `h-10 w-10`
- Unread badge: `bg-primary text-primary-foreground text-xs`

### Empty State

```
┌─────────────────────────┐
│                         │
│        [💬]             │ ← Large icon
│                         │
│    채팅이 없습니다       │
│                         │
│   [새 채팅 만들기]       │ ← Call-to-action button
│                         │
└─────────────────────────┘
```

## Right Column - Chat Room Content

### Layout Specifications

- **Width**: 400px (resizable, min: 300px, max: 600px)
- **Background**: `bg-background`
- **Display**: Flex column layout

### Chat Room Header

```
┌─────────────────────────────────────────────────────┐
│ [👤] General Chat                            [👥] 3 │
│ 5명의 멤버                                       │
└─────────────────────────────────────────────────────┘
```

**Components Used**:

- `Separator` for bottom border
- `Avatar` for room icon
- `Badge` for member count

### Messages Area

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [👤] 김철수                    오후 2:30        │ │
│ │ Hello everyone! How's the project going?       │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [👤] 이영희                    오후 2:32        │ │
│ │ Going well! I've finished the design mockups.  │ │
│ │ [📎] mockup-v2.fig                            │ │ ← File attachment
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [👤] 박민수                    오후 2:35        │ │
│ │ Great! I'll review them and start development  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [👤] 정수진이 입력중...                          │ │ ← Typing indicator
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Components Used**:

- `ScrollArea` for message list
- `Avatar` for user avatars
- `Card` for message bubbles
- `Badge` for file attachments
- `Separator` for message grouping

**Message Styling**:

- Container: `flex flex-col space-y-2 p-4`
- Message bubble: `max-w-[70%] p-3 rounded-lg`
- Own messages: `bg-primary text-primary-foreground ml-auto`
- Other messages: `bg-muted`
- Timestamp: `text-xs text-muted-foreground`
- Typing indicator: `text-sm text-muted-foreground italic`

### Message Input Area

```
┌─────────────────────────────────────────────────────┐
│ [📎] [😊] [📷] [🎥]                                │ ← Action buttons
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 메시지를 입력하세요...                           │ │ ← Input field
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [전송]                                              │ ← Send button
└─────────────────────────────────────────────────────┘
```

**Components Used**:

- `Textarea` for message input
- `Button` for send button
- `Button` with icons for file upload, emoji, etc.
- `Progress` for file upload progress

**Input Styling**:

- Container: `border-t p-4`
- Textarea: `min-h-[60px] max-h-[120px] resize-none`
- Send button: `bg-primary text-primary-foreground`
- Action buttons: `text-muted-foreground hover:text-foreground`

### File Upload Progress

```
┌─────────────────────────────────────────────────────┐
│ [📎] document.pdf 업로드 중...                      │
│ ████████████░░░░░░░░ 60%                           │ ← Progress bar
│                                                     │
│ [취소]                                              │ ← Cancel button
└─────────────────────────────────────────────────────┘
```

## Thread Column - Thread Management

### Layout Specifications

- **Width**: 300px (resizable, min: 250px, max: 400px, collapsible)
- **Background**: `bg-background`
- **Border**: Left border with `border-l`
- **Display**: Flex column layout
- **Collapsible**: Can be collapsed to show only thread icons

### Thread Header

```
┌─────────────────────────────────────┐
│ Threads                     [📝]    │ ← Create thread button
│ 3 threads                   [→]     │ ← Expand/collapse button
└─────────────────────────────────────┘
```

### Collapsed State

```
┌─────────┐
│ [📄]    │ ← Thread icon (mockup-v2.fig)
│ [📊]    │ ← Thread icon (project-report.pdf)
│ [🖼️]    │ ← Thread icon (design-assets.zip)
│ [📝]    │ ← Create thread icon
└─────────┘
```

### Thread List

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ [📄] mockup-v2.fig             │ │ ← Thread item
│ │     Created by 이영희           │ │
│ │     2시간 전                    │ │
│ │     (5 messages)               │ │ ← Message count
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [📊] project-report.pdf        │ │
│ │     Created by 김철수           │ │
│ │     1일 전                      │ │
│ │     (12 messages)              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [🖼️] design-assets.zip         │ │
│ │     Created by 박민수           │ │
│ │     3일 전                      │ │
│ │     (8 messages)               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Components Used**:

- `ScrollArea` for thread list
- `Card` for each thread item
- `Avatar` for thread icons
- `Badge` for message counts

**Thread Item Styling**:

- Container: `p-3 hover:bg-accent/50 cursor-pointer`
- Selected state: `bg-accent text-accent-foreground`
- Icon: File type based icons
- Message count: `bg-secondary text-secondary-foreground text-xs`

### Thread Detail (When Selected)

```
┌─────────────────────────────────────┐
│ [←] mockup-v2.fig                   │ ← Back button + thread title
│ Created by 이영희 • 2시간 전         │ ← Thread metadata
├─────────────────────────────────────┤
│                                     │
│ Thread Messages:                    │
│ ┌─────────────────────────────────┐ │
│ │ [👤] 이영희                    │ │
│ │ Here's the updated mockup      │ │
│ │ [📎] mockup-v2.fig            │ │
│ │ 2시간 전                       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [👤] 김철수                    │ │
│ │ Looks great! I'll review it.   │ │
│ │ 1시간 전                       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [👤] 박민수                    │ │
│ │ Can we discuss the layout?     │ │
│ │ 30분 전                        │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ [📎] [😊] Add to thread...        │ ← Thread input
│ [전송]                             │
└─────────────────────────────────────┘
```

**Components Used**:

- `ScrollArea` for thread messages
- `Card` for message bubbles
- `Avatar` for user avatars
- `Textarea` for thread input
- `Button` for send and back actions

### Empty State (No Threads)

```
┌─────────────────────────────────────┐
│                                     │
│        [📄]                         │ ← Large icon
│                                     │
│    스레드가 없습니다                │
│                                     │
│   [첫 번째 스레드 만들기]           │ ← Call-to-action button
│                                     │
└─────────────────────────────────────┘
```

### Empty State (No Thread Selected)

```
┌─────────────────────────────────────┐
│                                     │
│        [💬]                         │ ← Large icon
│                                     │
│    스레드를 선택하세요              │
│                                     │
│   선택한 스레드의 내용이            │
│   여기에 표시됩니다.                │
│                                     │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (Default)

- All four columns visible
- Resizable middle, right, and thread columns
- Full functionality available

### Collapsible Behavior

- **Middle Column**: Can collapse to 60px icon strip
- **Thread Column**: Can collapse to 60px icon strip
- **Collapsed State**: Shows only essential icons with tooltips
- **Expand**: Click icon or use keyboard shortcut (Ctrl+1, Ctrl+3)

### Window Resize

- Middle column: 60px (collapsed) - 500px (expanded)
- Right column: 300px - 600px (resizable)
- Thread column: 60px (collapsed) - 400px (expanded)
- Left column remains fixed at 64px

## Theme Support

### Light Theme

- Background: `bg-background`
- Sidebar: `bg-sidebar`
- Borders: `border-border`
- Text: `text-foreground`

### Dark Theme

- All colors automatically adjusted by shadcn/ui theme system
- Maintains contrast ratios
- Smooth transitions between themes

## Accessibility Features

### Keyboard Navigation

- Tab order: Left nav → Chat list → Messages → Thread list → Thread input
- Enter to send messages
- Arrow keys for chat list and thread navigation
- Escape to close modals
- **Ctrl+1**: Toggle middle column collapse
- **Ctrl+3**: Toggle thread column collapse

### Screen Reader Support

- All buttons have proper labels
- Message list and thread list have proper ARIA regions
- Typing indicators announce changes
- File uploads announce progress
- Thread selection announces changes
- Collapse/expand state announces changes
- Tooltips for collapsed icons

### Visual Accessibility

- High contrast mode support
- Focus indicators on all interactive elements
- Proper heading hierarchy
- Color is not the only indicator

## Component Dependencies

### shadcn/ui Components

- `Sidebar`, `SidebarMenu`, `SidebarMenuItem`
- `ScrollArea`
- `Card`, `CardContent`
- `Avatar`
- `Badge`
- `Button`
- `Textarea`
- `Progress`
- `Separator`
- `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`

### External Dependencies

- `@tanstack/react-virtual` - Virtual scrolling
- `lucide-react` - Icons
- `next-themes` - Theme management
- `socket.io-client` - Real-time communication

## Implementation Notes

### Layout Structure

**Main Layout (\_main.tsx) - Left + Middle Panels:**

```tsx
<ResizablePanelGroup direction="horizontal" className="min-h-screen">
  <ResizablePanel defaultSize={280} minSize={280} maxSize={280}>
    <Sidebar />
  </ResizablePanel>

  <ResizableHandle />

  <ResizablePanel
    defaultSize={320}
    minSize={60}
    maxSize={500}
    collapsible
    collapsedSize={60}
  >
    <CollapsiblePanel>
      <ChatRoomList />
    </CollapsiblePanel>
  </ResizablePanel>

  <ResizableHandle />

  {/* Page Content Area */}
  <div className="flex-1">
    <Outlet />
  </div>
</ResizablePanelGroup>
```

**Page Content (\_main.\_index.tsx) - Right + Thread Panels:**

```tsx
<ResizablePanelGroup direction="horizontal" className="h-full">
  <ResizablePanel defaultSize={400} minSize={300} maxSize={600}>
    <ChatRoomContent />
  </ResizablePanel>

  <ResizableHandle />

  <ResizablePanel
    defaultSize={300}
    minSize={60}
    maxSize={400}
    collapsible
    collapsedSize={60}
  >
    <CollapsiblePanel>
      <ThreadPanel />
    </CollapsiblePanel>
  </ResizablePanel>
</ResizablePanelGroup>
```

### Routing Structure

**Layout Route (\_main.tsx):**

- Handles Left Navigation and Middle Chat Room List
- Uses Outlet for page-specific content
- Common UI elements shared across all main pages

**Page Routes:**

- `_main._index.tsx` → Default chat page (Right + Thread panels)
- `_main.chat.$roomId.tsx` → Specific chat room page
- `_main.settings._index.tsx` → Settings page

### State Management

- Selected chat room: URL state with nuqs
- Selected thread: URL state with nuqs
- Middle column collapsed: localStorage with nuqs
- Thread column collapsed: localStorage with nuqs
- Theme preference: localStorage with next-themes
- Chat room list: TanStack Query
- Thread list: TanStack Query
- Real-time messages: Socket.io with React state

### Performance Considerations

- Virtual scrolling for large chat room lists
- Virtual scrolling for thread lists
- Message virtualization for long conversations
- Lazy loading of chat room and thread details
- Optimistic updates for message sending
- Collapsed panels reduce DOM complexity
- Smooth collapse/expand animations
