import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { WebSocketGateway } from '../../websocket/gateway/websocket.gateway';
import { WebSocketAuthService } from '../../websocket/services/websocket-auth.service';
import { WebSocketRoomService } from '../../websocket/services/websocket-room.service';

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let authService: WebSocketAuthService;
  let roomService: WebSocketRoomService;
  let jwtService: JwtService;

  const mockAuthService = {
    validateToken: jest.fn(),
    getUserFromToken: jest.fn(),
    authenticateSocket: jest.fn(),
  };

  const mockRoomService = {
    joinRoom: jest.fn(),
    leaveRoom: jest.fn(),
    validateRoomAccess: jest.fn(),
    getUserRooms: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketGateway,
        {
          provide: WebSocketAuthService,
          useValue: mockAuthService,
        },
        {
          provide: WebSocketRoomService,
          useValue: mockRoomService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
    authService = module.get<WebSocketAuthService>(WebSocketAuthService);
    roomService = module.get<WebSocketRoomService>(WebSocketRoomService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should handle successful connection with valid token', async () => {
      const mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: {
            token: 'valid-jwt-token',
          },
        },
        join: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        data: {},
      } as any;

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        companyId: 'company-123',
        companyRole: 'MEMBER',
      };

      // Mock authenticateSocket to set up the socket data
      mockAuthService.authenticateSocket.mockImplementation((socket) => {
        socket.data = {
          user: mockUser,
          userId: 'user-123',
          companyId: 'company-123',
          username: 'test@example.com',
        };
        return Promise.resolve();
      });

      await gateway.handleConnection(mockSocket);

      expect(mockAuthService.authenticateSocket).toHaveBeenCalledWith(mockSocket);
      expect(mockSocket.data.user).toEqual(mockUser);
      expect(mockSocket.data.companyId).toBe('company-123');
      expect(mockSocket.join).toHaveBeenCalledWith('company-company-123');
    });

    it('should reject connection with invalid token', async () => {
      const mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: {
            token: 'invalid-token',
          },
        },
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      // Mock authenticateSocket to throw error
      mockAuthService.authenticateSocket.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockSocket);

      expect(mockAuthService.authenticateSocket).toHaveBeenCalledWith(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should reject connection without token', async () => {
      const mockSocket = {
        id: 'socket-123',
        handshake: {
          auth: {},
        },
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      // Mock authenticateSocket to throw error
      mockAuthService.authenticateSocket.mockRejectedValue(new Error('No token provided'));

      await gateway.handleConnection(mockSocket);

      expect(mockAuthService.authenticateSocket).toHaveBeenCalledWith(mockSocket);
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect and leave rooms', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        userId: 'user-123',
        username: 'test@example.com',
        joinedRooms: ['room-1', 'room-2'],
        leave: jest.fn(),
      } as any;

      await gateway.handleDisconnect(mockSocket);

      expect(mockSocket.leave).toHaveBeenCalledWith('room-1');
      expect(mockSocket.leave).toHaveBeenCalledWith('room-2');
      expect(mockRoomService.leaveRoom).toHaveBeenCalledWith(
        mockSocket,
        'room-1',
      );
      expect(mockRoomService.leaveRoom).toHaveBeenCalledWith(
        mockSocket,
        'room-2',
      );
    });
  });

  describe('join_company', () => {
    it('should join company room successfully', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      const joinData = { companyId: 'company-123' };

      await (gateway as any).handleJoinCompany(mockSocket, joinData);

      expect(mockSocket.join).toHaveBeenCalledWith('company-company-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('joined_company', {
        companyId: 'company-123',
        message: 'Successfully joined company room',
      });
    });

    it('should validate room access before joining', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        emit: jest.fn(),
      } as any;

      const joinData = { companyId: 'different-company' };
      mockRoomService.validateRoomAccess.mockResolvedValue(false);

      await (gateway as any).handleJoinCompany(mockSocket, joinData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied: not a member of this company',
        code: 'ACCESS_DENIED',
      });
    });
  });

  describe('join_chatroom', () => {
    it('should join chatroom successfully', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      const joinData = { chatroomId: 'chatroom-123' };
      mockRoomService.validateRoomAccess.mockResolvedValue(true);

      await (gateway as any).handleJoinChatroom(mockSocket, joinData);

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith(
        mockSocket,
        'chatroom',
        'chatroom-123',
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('joined_chatroom', {
        chatroomId: 'chatroom-123',
        message: 'Successfully joined chatroom',
      });
    });

    it('should handle access denied for chatroom', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        emit: jest.fn(),
      } as any;

      const joinData = { chatroomId: 'restricted-chatroom' };
      mockRoomService.validateRoomAccess.mockResolvedValue(false);

      await (gateway as any).handleJoinChatroom(mockSocket, joinData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied: not a member of this chatroom',
        code: 'ACCESS_DENIED',
      });
    });
  });

  describe('join_thread', () => {
    it('should join thread successfully', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      const joinData = { threadId: 'thread-123' };
      mockRoomService.validateRoomAccess.mockResolvedValue(true);

      await (gateway as any).handleJoinThread(mockSocket, joinData);

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith(
        mockSocket,
        'thread',
        'thread-123',
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('joined_thread', {
        threadId: 'thread-123',
        message: 'Successfully joined thread',
      });
    });
  });

  describe('join_upload_session', () => {
    it('should join upload session successfully', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      const joinData = { sessionId: 'session-123' };
      mockRoomService.validateRoomAccess.mockResolvedValue(true);

      await (gateway as any).handleJoinUploadSession(mockSocket, joinData);

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith(
        mockSocket,
        'upload_session',
        'session-123',
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('joined_upload_session', {
        sessionId: 'session-123',
        message: 'Successfully joined upload session',
      });
    });
  });

  describe('leave_company', () => {
    it('should leave company room successfully', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        leave: jest.fn(),
        emit: jest.fn(),
      } as any;

      const leaveData = { companyId: 'company-123' };

      await (gateway as any).handleLeaveCompany(mockSocket, leaveData);

      expect(mockSocket.leave).toHaveBeenCalledWith('company-company-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('left_company', {
        companyId: 'company-123',
        message: 'Successfully left company room',
      });
    });
  });

  describe('update_user_status', () => {
    it('should update user status', async () => {
      const mockSocket = {
        id: 'socket-123',
        data: {
          user: { id: 'user-123' },
          companyId: 'company-123',
        },
        emit: jest.fn(),
        to: jest.fn().mockReturnThis(),
      } as any;

      const statusData = { status: 'online' };

      await (gateway as any).handleUpdateUserStatus(mockSocket, statusData);

      expect(mockSocket.emit).toHaveBeenCalledWith('user_status_updated', {
        userId: 'user-123',
        status: 'online',
      });
    });
  });
});
