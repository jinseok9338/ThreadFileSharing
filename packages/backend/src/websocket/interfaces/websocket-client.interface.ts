import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  companyId: string;
  username: string;
  companyRole: 'owner' | 'admin' | 'member';
  userStatus: 'online' | 'away' | 'busy' | 'offline';
  lastSeenAt: Date;
  joinedRooms: Set<string>;
}

export interface WebSocketUser {
  id: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeenAt: Date;
  companyRole: 'owner' | 'admin' | 'member';
  socketId: string;
  joinedRooms: Set<string>;
}

export interface RoomInfo {
  id: string;
  type: 'company' | 'chatroom' | 'thread' | 'upload_session' | 'user_session';
  participants: Set<string>; // User IDs
  metadata?: {
    companyId?: string;
    chatroomId?: string;
    threadId?: string;
    sessionId?: string;
  };
}

export interface WebSocketEventContext {
  user: WebSocketUser;
  room: RoomInfo;
  timestamp: Date;
}
