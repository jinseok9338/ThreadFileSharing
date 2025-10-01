# shadcn/ui Component Specifications

**Feature**: Chat Room Layout  
**Date**: 2025-10-01  
**Scope**: Component specifications for main layout implementation

## Layout Components

### ResizablePanelGroup

**Purpose**: Main container for three-column layout with resizing capabilities

**Props**:

```tsx
interface ResizablePanelGroupProps {
  direction: "horizontal" | "vertical";
  className?: string;
}
```

**Usage**:

```tsx
<ResizablePanelGroup direction="horizontal" className="h-screen">
  {/* Left, Middle, Right panels */}
</ResizablePanelGroup>
```

**Styling**:

- `h-screen` - Full viewport height
- Default resize handles between panels

### ResizablePanel

**Purpose**: Individual resizable sections within the panel group

**Props**:

```tsx
interface ResizablePanelProps {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: React.ReactNode;
}
```

**Configuration**:

- **Left Panel**: `defaultSize={280} minSize={280} maxSize={280}` (fixed)
- **Middle Panel**: `defaultSize={320} minSize={250} maxSize={500}` (resizable)
- **Right Panel**: `defaultSize={undefined}` (flexible)

### ResizableHandle

**Purpose**: Drag handle between resizable panels

**Styling**:

- Width: 4px
- Background: `bg-border`
- Hover: `hover:bg-border-foreground/20`
- Active: `active:bg-border-foreground/40`

## Navigation Components

### Sidebar

**Purpose**: Left navigation container

**Props**:

```tsx
interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}
```

**Styling**:

- `bg-sidebar border-r`
- `p-4`
- Fixed width: 280px

### SidebarMenu

**Purpose**: Container for navigation menu items

**Usage**:

```tsx
<SidebarMenu>
  <SidebarMenuItem>
    <SidebarMenuButton>
      <Home className="h-4 w-4" />
      채팅
    </SidebarMenuButton>
  </SidebarMenuItem>
</SidebarMenu>
```

### SidebarMenuItem

**Purpose**: Individual navigation menu item

**States**:

- **Default**: `hover:bg-accent/50`
- **Active**: `bg-accent text-accent-foreground`
- **Icon**: `h-4 w-4`
- **Text**: `font-medium`

## Content Display Components

### ScrollArea

**Purpose**: Scrollable content areas with custom scrollbars

**Props**:

```tsx
interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}
```

**Usage**:

```tsx
<ScrollArea className="h-full">{/* Chat room list or messages */}</ScrollArea>
```

**Styling**:

- Custom scrollbar styling
- Smooth scrolling behavior
- `h-full` for full height

### Card

**Purpose**: Container for chat room items and messages

**Variants**:

- **Chat Room Item**: `hover:bg-accent/50 cursor-pointer p-3`
- **Message Bubble**: `max-w-[70%] p-3 rounded-lg`
- **Own Message**: `bg-primary text-primary-foreground ml-auto`
- **Other Message**: `bg-muted`

**Usage**:

```tsx
<Card className="hover:bg-accent/50 cursor-pointer p-3">
  <CardContent className="p-0">
    {/* Chat room or message content */}
  </CardContent>
</Card>
```

### Avatar

**Purpose**: User and room profile pictures

**Props**:

```tsx
interface AvatarProps {
  src?: string;
  alt: string;
  className?: string;
}
```

**Sizes**:

- **Chat Room**: `h-10 w-10`
- **Message**: `h-8 w-8`
- **Header**: `h-6 w-6`

**Usage**:

```tsx
<Avatar className="h-10 w-10">
  <AvatarImage src={avatarUrl} alt={name} />
  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
</Avatar>
```

### Badge

**Purpose**: Unread counts and status indicators

**Variants**:

- **Unread Count**: `bg-primary text-primary-foreground text-xs`
- **Member Count**: `bg-secondary text-secondary-foreground`
- **File Type**: `bg-muted text-muted-foreground`

**Usage**:

```tsx
<Badge variant="default" className="text-xs">
  {unreadCount}
</Badge>
```

## Input Components

### Textarea

**Purpose**: Message input field

**Props**:

```tsx
interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}
```

**Styling**:

- `min-h-[60px] max-h-[120px]`
- `resize-none`
- `border-t p-4` for container

### Button

**Purpose**: Action buttons throughout the interface

**Variants**:

- **Primary**: `bg-primary text-primary-foreground` (Send button)
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Ghost**: `text-muted-foreground hover:text-foreground` (Icon buttons)
- **Icon**: Icon-only buttons with hover states

**Sizes**:

- **Default**: Standard button size
- **Icon**: `h-8 w-8` for icon-only buttons
- **Small**: `h-8` for compact areas

### Progress

**Purpose**: File upload progress indication

**Props**:

```tsx
interface ProgressProps {
  value: number; // 0-100
  className?: string;
}
```

**Usage**:

```tsx
<Progress value={uploadProgress} className="w-full" />
```

## Utility Components

### Separator

**Purpose**: Visual separation between sections

**Usage**:

```tsx
<Separator className="my-4" />
```

**Styling**:

- `bg-border`
- `h-px` for horizontal
- `w-px` for vertical

### Switch

**Purpose**: Theme toggle and settings switches

**Props**:

```tsx
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
```

**Usage**:

```tsx
<Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
```

## Form Components

### Label

**Purpose**: Form field labels (for settings)

**Usage**:

```tsx
<Label htmlFor="theme-select">테마</Label>
```

### Select

**Purpose**: Dropdown selections (for settings)

**Usage**:

```tsx
<Select value={theme} onValueChange={setTheme}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">라이트</SelectItem>
    <SelectItem value="dark">다크</SelectItem>
  </SelectContent>
</Select>
```

## Notification Components

### Toast

**Purpose**: File upload notifications and system messages

**Variants**:

- **Success**: Green styling for successful uploads
- **Error**: Red styling for failed uploads
- **Info**: Blue styling for general information

**Usage**:

```tsx
toast.success("파일이 업로드되었습니다");
toast.error("업로드에 실패했습니다");
```

## Icon Components

### Lucide Icons

**Purpose**: Consistent iconography throughout the interface

**Chat Icons**:

- `Home` - 채팅 navigation
- `Settings` - 세팅 navigation
- `Search` - Search functionality (future)
- `Plus` - Create new chat
- `Paperclip` - File attachment
- `Send` - Send message
- `Smile` - Emoji picker
- `Camera` - Image upload
- `Video` - Video upload

**Status Icons**:

- `Circle` - Online status
- `Minus` - Away status
- `X` - Busy status
- `CircleDot` - Offline status

**Usage**:

```tsx
import { Home, Settings, Paperclip, Send } from "lucide-react";

<Home className="h-4 w-4" />
<Settings className="h-4 w-4" />
<Paperclip className="h-4 w-4" />
<Send className="h-4 w-4" />
```

## Component Composition Patterns

### Chat Room List Item

```tsx
<Card className="hover:bg-accent/50 cursor-pointer p-3">
  <CardContent className="flex items-center space-x-3 p-0">
    <Avatar className="h-10 w-10">
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="font-medium truncate">{name}</p>
        {unreadCount > 0 && (
          <Badge variant="default" className="text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
    </div>
    <p className="text-xs text-muted-foreground">{timestamp}</p>
  </CardContent>
</Card>
```

### Message Bubble

```tsx
<div className="flex flex-col space-y-2">
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
    <Card
      className={`max-w-[70%] p-3 rounded-lg ${
        isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
      }`}
    >
      <CardContent className="p-0">
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={avatar} alt={sender} />
              <AvatarFallback>{sender.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{sender}</span>
          </div>
        )}
        <p>{content}</p>
        {attachments && (
          <div className="mt-2 space-y-1">
            {attachments.map((attachment) => (
              <Badge key={attachment.id} variant="outline" className="text-xs">
                📎 {attachment.filename}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  <p
    className={`text-xs text-muted-foreground ${
      isOwn ? "text-right" : "text-left"
    }`}
  >
    {timestamp}
  </p>
</div>
```

### Message Input Area

```tsx
<div className="border-t p-4">
  <div className="flex items-center space-x-2 mb-2">
    <Button variant="ghost" size="icon" onClick={attachFile}>
      <Paperclip className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={showEmoji}>
      <Smile className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={attachImage}>
      <Camera className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={attachVideo}>
      <Video className="h-4 w-4" />
    </Button>
  </div>
  <div className="flex space-x-2">
    <Textarea
      placeholder="메시지를 입력하세요..."
      value={message}
      onChange={handleMessageChange}
      className="min-h-[60px] max-h-[120px] resize-none flex-1"
    />
    <Button onClick={sendMessage} disabled={!message.trim()}>
      <Send className="h-4 w-4" />
    </Button>
  </div>
</div>
```

## Theme Integration

All components automatically support light/dark themes through shadcn/ui's CSS variable system. No additional theme-specific styling is required.
