import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  AuthenticatedSocket,
  RoomInfo,
} from '../interfaces/websocket-client.interface';

@Injectable()
export class WebSocketRoomService {
  private rooms: Map<string, RoomInfo> = new Map();
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set<roomId>

  /**
   * Generate room ID based on type and entity ID
   */
  generateRoomId(
    type: 'company' | 'chatroom' | 'thread' | 'upload_session' | 'user_session',
    id: string,
  ): string {
    return `${type}:${id}`;
  }

  /**
   * Parse room ID to get type and entity ID
   */
  parseRoomId(roomId: string): { type: string; id: string } | null {
    const parts = roomId.split(':');
    if (parts.length !== 2) {
      return null;
    }
    return { type: parts[0], id: parts[1] };
  }

  /**
   * Create or get room information
   */
  getOrCreateRoom(
    type: 'company' | 'chatroom' | 'thread' | 'upload_session' | 'user_session',
    id: string,
    metadata?: any,
  ): RoomInfo {
    const roomId = this.generateRoomId(type, id);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        type,
        participants: new Set(),
        metadata,
      });
    }

    return this.rooms.get(roomId)!;
  }

  /**
   * Join room with permission check
   */
  async joinRoom(
    socket: AuthenticatedSocket,
    type: 'company' | 'chatroom' | 'thread' | 'upload_session' | 'user_session',
    id: string,
    metadata?: any,
  ): Promise<RoomInfo> {
    const roomId = this.generateRoomId(type, id);

    // Permission check based on room type
    await this.validateRoomAccess(socket, type, id);

    const room = this.getOrCreateRoom(type, id, metadata);

    // Add user to room
    room.participants.add(socket.userId);

    // Add room to user's joined rooms
    if (!this.userRooms.has(socket.userId)) {
      this.userRooms.set(socket.userId, new Set());
    }
    this.userRooms.get(socket.userId)!.add(roomId);
    socket.joinedRooms.add(roomId);

    return room;
  }

  /**
   * Leave room
   */
  leaveRoom(socket: AuthenticatedSocket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.delete(socket.userId);
    }

    // Remove room from user's joined rooms
    const userRooms = this.userRooms.get(socket.userId);
    if (userRooms) {
      userRooms.delete(roomId);
    }
    socket.joinedRooms.delete(roomId);
  }

  /**
   * Get room information
   */
  getRoom(roomId: string): RoomInfo | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get all rooms for a user
   */
  getUserRooms(userId: string): Set<string> {
    return this.userRooms.get(userId) || new Set();
  }

  /**
   * Get all participants in a room
   */
  getRoomParticipants(roomId: string): Set<string> {
    const room = this.rooms.get(roomId);
    return room ? room.participants : new Set();
  }

  /**
   * Validate room access permissions
   */
  private async validateRoomAccess(
    socket: AuthenticatedSocket,
    type: 'company' | 'chatroom' | 'thread' | 'upload_session' | 'user_session',
    id: string,
  ): Promise<void> {
    switch (type) {
      case 'company':
        // Company rooms: only company members can join
        if (socket.companyId !== id) {
          throw new ForbiddenException(
            'Access denied: not a member of this company',
          );
        }
        break;

      case 'chatroom':
        // Chatroom rooms: only chatroom members can join
        // NOTE: For now, allow access if user is in the same company
        // TODO: Implement proper chatroom membership check when ChatroomService is available
        if (socket.companyId !== id) {
          throw new ForbiddenException(
            'Access denied: not a member of this chatroom',
          );
        }
        break;

      case 'thread':
        // Thread rooms: only thread participants can join
        // NOTE: For now, allow access if user is in the same company
        // TODO: Implement proper thread participation check when ThreadService is available
        if (socket.companyId !== id) {
          throw new ForbiddenException(
            'Access denied: not a participant of this thread',
          );
        }
        break;

      case 'upload_session':
        // Upload session rooms: session participants and observers can join
        // NOTE: For now, allow access if user is in the same company
        // TODO: Implement proper upload session access check when upload session service is available
        if (socket.companyId !== id) {
          throw new ForbiddenException(
            'Access denied: not authorized for this upload session',
          );
        }
        break;

      case 'user_session':
        // User session rooms: only the specific user can join
        if (socket.userId !== id) {
          throw new ForbiddenException(
            'Access denied: can only join your own user session',
          );
        }
        break;

      default:
        throw new ForbiddenException('Invalid room type');
    }
  }

  /**
   * Clean up empty rooms
   */
  cleanupEmptyRooms(): void {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  /**
   * Get room statistics
   */
  getRoomStats(): {
    totalRooms: number;
    roomsByType: Record<string, number>;
    totalParticipants: number;
  } {
    const roomsByType: Record<string, number> = {};
    let totalParticipants = 0;

    for (const room of this.rooms.values()) {
      roomsByType[room.type] = (roomsByType[room.type] || 0) + 1;
      totalParticipants += room.participants.size;
    }

    return {
      totalRooms: this.rooms.size,
      roomsByType,
      totalParticipants,
    };
  }
}
