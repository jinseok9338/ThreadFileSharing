# Research: Chat Room Layout Implementation

**Feature**: Chat Room Layout  
**Date**: 2025-10-01  
**Scope**: UI-focused implementation with real-time messaging and file upload capabilities

## Research Areas

### 1. Socket.io Integration Patterns for Real-time Chat

**Decision**: Use Socket.io with React hooks pattern for frontend, NestJS Gateway for backend  
**Rationale**:

- Socket.io provides reliable real-time communication with automatic reconnection
- React hooks pattern (useSocket, useChat) provides clean component integration
- NestJS Gateway decorators align with existing backend architecture
- Built-in typing support for TypeScript

**Alternatives considered**:

- WebSocket native: More complex error handling and reconnection logic
- Server-Sent Events: One-way communication only, not suitable for bidirectional chat
- WebRTC: Overkill for chat messaging, complex setup

**Implementation approach**:

- Frontend: Custom hooks for socket connection, message handling, typing indicators
- Backend: NestJS Gateway with room management and message broadcasting
- Shared types for socket events in shared package

### 2. shadcn/ui Component Selection for Three-Column Layout

**Decision**: Use ResizablePanelGroup, Sidebar, and ScrollArea components  
**Rationale**:

- ResizablePanelGroup provides Teams-like resizable columns
- Sidebar component handles navigation with proper ARIA support
- ScrollArea provides smooth scrolling with custom scrollbars
- All components are accessible and follow shadcn/ui design system

**Alternatives considered**:

- Custom CSS Grid: More complex responsive behavior
- Third-party layout libraries: Additional dependencies and potential conflicts
- Manual flexbox: More code maintenance and accessibility concerns

**Component mapping**:

- Left navigation: Sidebar with navigation items
- Middle chat list: ScrollArea with chat room cards
- Right chat area: ResizablePanel with message list and input
- Layout container: ResizablePanelGroup for three-column structure

### 3. File Upload Progress Indication Best Practices

**Decision**: Use Progress component with toast notifications and inline status  
**Rationale**:

- Progress component provides visual feedback for upload progress
- Toast notifications for success/error states
- Inline status in chat for file attachment preview
- Consistent with shadcn/ui design patterns

**Alternatives considered**:

- Custom progress bars: More development time, inconsistent styling
- Modal dialogs: Interrupts chat flow
- Background uploads only: Poor user experience without feedback

**Implementation approach**:

- Upload progress: Progress component in message input area
- Success/error: Toast notifications with retry options
- File preview: Inline attachment cards with download/thread links
- Thread creation: Automatic thread creation with file metadata

### 4. Theme Switching Implementation Patterns

**Decision**: Use next-themes with CSS custom properties and shadcn/ui theme system  
**Rationale**:

- next-themes provides robust theme management with SSR support
- CSS custom properties enable smooth theme transitions
- shadcn/ui theme system integrates seamlessly
- Persistent theme preferences with localStorage

**Alternatives considered**:

- Custom theme context: More complex state management
- CSS classes only: Less flexible, harder to maintain
- Third-party theme libraries: Additional dependencies

**Implementation approach**:

- Theme provider: next-themes ThemeProvider wrapping app
- Theme toggle: Switch component in settings sidebar
- CSS variables: Dark/light mode color schemes
- Persistence: localStorage with SSR hydration handling

### 5. Virtual Scrolling for Chat Room Lists

**Decision**: Use @tanstack/react-virtual for chat room list virtualization  
**Rationale**:

- Handles large lists of chat rooms efficiently
- Smooth scrolling performance with minimal DOM nodes
- Integrates well with React and existing state management
- Supports dynamic list heights and variable item sizes

**Alternatives considered**:

- react-window: Less flexible for dynamic content
- Manual virtualization: Complex implementation and maintenance
- No virtualization: Performance issues with large lists

**Implementation approach**:

- Virtual scrolling: @tanstack/react-virtual for chat room list
- Dynamic heights: Support for varying message preview lengths
- Smooth scrolling: Maintain scroll position during updates
- Integration: Works with existing chat room data structure

## Technical Decisions Summary

| Component               | Technology                        | Rationale                                        |
| ----------------------- | --------------------------------- | ------------------------------------------------ |
| Real-time Communication | Socket.io + React hooks           | Reliable, TypeScript support, NestJS integration |
| Layout System           | shadcn/ui ResizablePanelGroup     | Teams-like resizable columns, accessibility      |
| File Upload UI          | Progress + Toast + Inline preview | Clear feedback, non-disruptive flow              |
| Theme System            | next-themes + CSS variables       | SSR support, smooth transitions                  |
| List Performance        | @tanstack/react-virtual           | Efficient rendering of large chat lists          |

## Dependencies Added

- `@tanstack/react-virtual`: Virtual scrolling for chat room lists
- `next-themes`: Theme management (already available in shadcn/ui setup)
- `socket.io-client`: Real-time communication client
- `socket.io`: Real-time communication server (backend)

## Implementation Notes

- All UI components will follow shadcn/ui design system
- Real-time features will be implemented with proper error handling and reconnection
- File uploads will include progress indication and thread creation
- Theme switching will be immediate and persistent
- Virtual scrolling will handle dynamic content efficiently
