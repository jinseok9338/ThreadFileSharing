import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { AuthenticatedSocket } from '../interfaces/websocket-client.interface';

@Injectable()
export class WebSocketAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async authenticateSocket(socket: Socket): Promise<AuthenticatedSocket> {
    try {
      // Extract token from Authorization header or query params
      const token = this.extractToken(socket);

      if (!token) {
        throw new UnauthorizedException('No authentication token provided');
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);

      // Attach user information to socket
      const authenticatedSocket = socket as AuthenticatedSocket;
      authenticatedSocket.userId = payload.sub;
      authenticatedSocket.companyId = payload.companyId;
      authenticatedSocket.username = payload.username;
      authenticatedSocket.companyRole = payload.companyRole;
      authenticatedSocket.userStatus = 'online';
      authenticatedSocket.lastSeenAt = new Date();
      authenticatedSocket.joinedRooms = new Set();

      return authenticatedSocket;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractToken(socket: Socket): string | null {
    // Try Authorization header first
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try query parameters
    const token = socket.handshake.query.token as string;
    if (token) {
      return token;
    }

    return null;
  }

  updateUserStatus(
    socket: AuthenticatedSocket,
    status: 'online' | 'away' | 'busy' | 'offline',
  ): void {
    socket.userStatus = status;
    socket.lastSeenAt = new Date();
  }

  getSocketInfo(socket: AuthenticatedSocket) {
    return {
      userId: socket.userId,
      companyId: socket.companyId,
      username: socket.username,
      companyRole: socket.companyRole,
      userStatus: socket.userStatus,
      lastSeenAt: socket.lastSeenAt,
    };
  }
}
