import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import type { AuthenticatedSocket } from '../interfaces/websocket-client.interface';
import { WebSocketAuthService } from '../services/websocket-auth.service';
import { WebSocketRoomService } from '../services/websocket-room.service';
import { ThreadService } from '../../thread/thread.service';
import { MessageService } from '../../message/services/message.service';

// Client to Server DTOs
import {
  JoinCompanyDto,
  JoinChatroomDto,
  JoinThreadDto,
  JoinUploadSessionDto,
  LeaveRoomDto,
  SendChatroomMessageDto,
  SendThreadMessageDto,
  EditMessageDto,
  DeleteMessageDto,
  TypingIndicatorDto,
  ShareThreadDto,
  AddThreadParticipantDto,
  UpdateThreadParticipantDto,
  RemoveThreadParticipantDto,
  CancelUploadDto,
  UpdateUserStatusDto,
} from '../dto/websocket-events.dto';
import {
  ClientToServerEvent,
  ServerToClientEvent,
} from '../enums/websocket-events.enum';
import { ChatRoomService } from '../../chatroom/chatroom.service';

@NestWebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: WebSocketAuthService,
    private readonly roomService: WebSocketRoomService,
    private readonly threadService: ThreadService,
    private readonly messageService: MessageService,
    private readonly chatRoomService: ChatRoomService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Authenticate the socket
      const authenticatedSocket =
        await this.authService.authenticateSocket(client);

      this.logger.log(
        `User ${authenticatedSocket.username} connected (${authenticatedSocket.userId})`,
      );

      // Auto-join company room
      await this.handleJoinCompany(authenticatedSocket, {
        companyId: authenticatedSocket.companyId,
      });

      // Auto-join user session room
      const userRoomId = this.roomService.generateRoomId(
        'user_session',
        authenticatedSocket.userId,
      );
      await authenticatedSocket.join(userRoomId);

      // Send connection established event to client
      client.emit('connection_established', {
        userId: authenticatedSocket.userId,
        companyId: authenticatedSocket.companyId,
        username: authenticatedSocket.username,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const authenticatedSocket = client as AuthenticatedSocket;

      if (authenticatedSocket.userId) {
        this.logger.log(
          `User ${authenticatedSocket.username} disconnected (${authenticatedSocket.userId})`,
        );

        // Leave all joined rooms
        for (const roomId of authenticatedSocket.joinedRooms) {
          this.roomService.leaveRoom(authenticatedSocket, roomId);
          await client.leave(roomId);
        }

        // Clean up empty rooms
        this.roomService.cleanupEmptyRooms();
      }
    } catch (error) {
      this.logger.error(`Disconnect handling failed: ${error.message}`);
    }
  }

  // ===== Room Management =====

  @SubscribeMessage('join_company')
  async handleJoinCompany(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinCompanyDto,
  ) {
    try {
      const room = await this.roomService.joinRoom(
        client,
        'company',
        data.companyId,
      );
      await client.join(room.id);

      this.logger.log(
        `User ${client.username} joined company room: ${room.id}`,
      );

      // Notify the client that they joined the company
      client.emit('user_joined_company', {
        user: this.authService.getSocketInfo(client),
        joinedAt: new Date(),
      });

      // Notify others in the company
      client.to(room.id).emit('user_joined_company', {
        user: this.authService.getSocketInfo(client),
        joinedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to join company: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join_chatroom')
  async handleJoinChatroom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinChatroomDto,
  ) {
    try {
      const room = await this.roomService.joinRoom(
        client,
        'chatroom',
        data.chatroomId,
      );
      await client.join(room.id);

      this.logger.log(`User ${client.username} joined chatroom: ${room.id}`);

      // Notify the client that they joined the chatroom
      client.emit('user_joined_chatroom', {
        chatroomId: data.chatroomId,
        user: this.authService.getSocketInfo(client),
        joinedAt: new Date(),
      });

      // Notify others in the chatroom
      client.to(room.id).emit('user_joined_chatroom', {
        chatroomId: data.chatroomId,
        user: this.authService.getSocketInfo(client),
        joinedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to join chatroom: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join_thread')
  async handleJoinThread(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinThreadDto,
  ) {
    try {
      const room = await this.roomService.joinRoom(
        client,
        'thread',
        data.threadId,
      );
      await client.join(room.id);

      this.logger.log(`User ${client.username} joined thread: ${room.id}`);

      // Get actual user role from ThreadService
      const threadRole = await this.threadService.getUserRole(
        data.threadId,
        client.userId,
      );

      // Notify the client that they joined the thread
      client.emit('user_joined_thread', {
        threadId: data.threadId,
        user: this.authService.getSocketInfo(client),
        threadRole: threadRole,
        accessType: 'MEMBER',
        joinedAt: new Date(),
      });

      // Notify others in the thread
      client.to(room.id).emit('user_joined_thread', {
        threadId: data.threadId,
        user: this.authService.getSocketInfo(client),
        threadRole: threadRole,
        accessType: 'MEMBER',
        joinedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to join thread: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join_upload_session')
  async handleJoinUploadSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: JoinUploadSessionDto,
  ) {
    try {
      const room = await this.roomService.joinRoom(
        client,
        'upload_session',
        data.sessionId,
        { context: data.context },
      );
      await client.join(room.id);

      this.logger.log(
        `User ${client.username} joined upload session: ${room.id}`,
      );

      // Notify the client that they joined the upload session
      client.emit('room_joined', {
        roomId: room.id,
        roomType: 'upload_session',
        sessionId: data.sessionId,
        context: data.context,
        joinedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to join upload session: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_company')
  async handleLeaveCompany(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LeaveRoomDto,
  ) {
    await this.handleLeaveRoom(client, data);
  }

  @SubscribeMessage('leave_chatroom')
  async handleLeaveChatroom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LeaveRoomDto,
  ) {
    await this.handleLeaveRoom(client, data);
  }

  @SubscribeMessage('leave_thread')
  async handleLeaveThread(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LeaveRoomDto,
  ) {
    await this.handleLeaveRoom(client, data);
  }

  @SubscribeMessage('leave_upload_session')
  async handleLeaveUploadSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: LeaveRoomDto,
  ) {
    await this.handleLeaveRoom(client, data);
  }

  private async handleLeaveRoom(
    client: AuthenticatedSocket,
    data: LeaveRoomDto,
  ) {
    try {
      this.roomService.leaveRoom(client, data.roomId);
      await client.leave(data.roomId);

      this.logger.log(`User ${client.username} left room: ${data.roomId}`);

      // Notify others in the room
      client.to(data.roomId).emit('user_left_room', {
        roomId: data.roomId,
        user: this.authService.getSocketInfo(client),
        leftAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to leave room: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // ===== Realtime Data Sync =====

  @SubscribeMessage(ClientToServerEvent.SYNC_CHATROOM_REALTIME_DATA)
  async handleSyncChatroomRealtimeData(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatroomIds: string[] },
  ) {
    try {
      const realtimeData =
        await this.chatRoomService.getBulkChatroomRealtimeData(
          data.chatroomIds,
          client.userId,
        );

      client.emit(
        ServerToClientEvent.CHATROOM_REALTIME_DATA_SYNCED,
        realtimeData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync chatroom realtime data: ${error.message}`,
      );
      client.emit('error', { message: error.message });
    }
  }

  // ===== Messaging =====

  @SubscribeMessage('send_chatroom_message')
  async handleSendChatroomMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendChatroomMessageDto,
  ) {
    try {
      const roomId = this.roomService.generateRoomId(
        'chatroom',
        data.chatroomId,
      );

      // Save message to database via MessageService
      const sendMessageDto = {
        chatroomId: data.chatroomId,
        content: data.content,
        messageType: (data.messageType || 'TEXT') as any, // Convert to MessageType
        replyToId: data.replyToId,
      };

      const savedMessage = await this.messageService.sendMessage(
        sendMessageDto,
        client.userId,
      );

      // Send message confirmation to sender
      client.emit('chatroom_message_received', {
        messageId: savedMessage.id,
        chatroomId: data.chatroomId,
        sender: this.authService.getSocketInfo(client),
        content: data.content,
        messageType: data.messageType || 'TEXT',
        replyTo: data.replyToId
          ? {
              id: data.replyToId,
              content: 'Reply data will be implemented',
            }
          : undefined,
        createdAt: savedMessage.createdAt,
      });

      // Broadcast message to chatroom (excluding sender)
      client.to(roomId).emit('chatroom_message_received', {
        messageId: savedMessage.id,
        chatroomId: data.chatroomId,
        sender: this.authService.getSocketInfo(client),
        content: data.content,
        messageType: data.messageType || 'TEXT',
        replyTo: data.replyToId
          ? {
              id: data.replyToId,
              content: 'Reply data will be implemented',
            }
          : undefined,
        createdAt: savedMessage.createdAt,
      });
    } catch (error) {
      this.logger.error(`Failed to send chatroom message: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('send_thread_message')
  async handleSendThreadMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendThreadMessageDto,
  ) {
    try {
      const roomId = this.roomService.generateRoomId('thread', data.threadId);

      // Get thread info to get chatroomId
      const thread = await this.threadService.getThreadById(
        data.threadId,
        client.userId,
      );

      if (!thread) {
        throw new Error('Thread not found');
      }

      // Save message to database via MessageService
      const sendMessageDto = {
        chatroomId: thread.chatroomId,
        threadId: data.threadId,
        content: data.content,
        messageType: (data.messageType || 'TEXT') as any, // Convert to MessageType
        replyToId: data.replyToId,
      };

      const savedMessage = await this.messageService.sendMessage(
        sendMessageDto,
        client.userId,
      );

      // Send message confirmation to sender
      client.emit('thread_message_received', {
        messageId: savedMessage.id,
        threadId: data.threadId,
        sender: this.authService.getSocketInfo(client),
        content: data.content,
        messageType: data.messageType || 'TEXT',
        replyTo: data.replyToId
          ? {
              id: data.replyToId,
              content: 'Reply data will be implemented',
            }
          : undefined,
        createdAt: savedMessage.createdAt,
      });

      // Broadcast message to thread (excluding sender)
      client.to(roomId).emit('thread_message_received', {
        messageId: savedMessage.id,
        threadId: data.threadId,
        sender: this.authService.getSocketInfo(client),
        content: data.content,
        messageType: data.messageType || 'TEXT',
        replyTo: data.replyToId
          ? {
              id: data.replyToId,
              content: 'Reply data will be implemented',
            }
          : undefined,
        createdAt: savedMessage.createdAt,
      });
    } catch (error) {
      this.logger.error(`Failed to send thread message: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // ===== Typing Indicators =====

  @SubscribeMessage('chatroom_typing_start')
  async handleChatroomTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    const roomId = this.roomService.generateRoomId('chatroom', data.roomId);

    // Send typing confirmation to sender
    client.emit('chatroom_typing', {
      chatroomId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: true,
    });

    // Broadcast typing to others in chatroom
    client.to(roomId).emit('chatroom_typing', {
      chatroomId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: true,
    });
  }

  @SubscribeMessage('chatroom_typing_stop')
  async handleChatroomTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    const roomId = this.roomService.generateRoomId('chatroom', data.roomId);

    // Send typing stop confirmation to sender
    client.emit('chatroom_typing', {
      chatroomId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: false,
    });

    // Broadcast typing stop to others in chatroom
    client.to(roomId).emit('chatroom_typing', {
      chatroomId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: false,
    });
  }

  @SubscribeMessage('thread_typing_start')
  async handleThreadTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    const roomId = this.roomService.generateRoomId('thread', data.roomId);

    // Send typing confirmation to sender
    client.emit('thread_typing', {
      threadId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: true,
    });

    // Broadcast typing to others in thread
    client.to(roomId).emit('thread_typing', {
      threadId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: true,
    });
  }

  @SubscribeMessage('thread_typing_stop')
  async handleThreadTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingIndicatorDto,
  ) {
    const roomId = this.roomService.generateRoomId('thread', data.roomId);

    // Send typing stop confirmation to sender
    client.emit('thread_typing', {
      threadId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: false,
    });

    // Broadcast typing stop to others in thread
    client.to(roomId).emit('thread_typing', {
      threadId: data.roomId,
      user: this.authService.getSocketInfo(client),
      isTyping: false,
    });
  }

  // ===== User Status =====

  @SubscribeMessage('update_user_status')
  async handleUpdateUserStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: UpdateUserStatusDto,
  ) {
    try {
      // Update socket status
      this.authService.updateUserStatus(client, data.status);

      // Broadcast status change to company
      const companyRoomId = this.roomService.generateRoomId(
        'company',
        client.companyId,
      );
      this.server.to(companyRoomId).emit('user_status_changed', {
        user: this.authService.getSocketInfo(client),
        status: data.status,
        customMessage: data.customMessage,
        lastSeenAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to update user status: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  // ===== File Upload Events (Called by File Services) =====

  /**
   * Broadcast file upload progress to upload session room
   */
  broadcastFileUploadProgress(sessionId: string, progressData: any) {
    const roomId = this.roomService.generateRoomId('upload_session', sessionId);
    this.server.to(roomId).emit('file_upload_progress', progressData);
  }

  /**
   * Broadcast file upload completion to relevant rooms
   */
  broadcastFileUploadCompleted(completionData: any) {
    const { sessionId, context } = completionData;

    // Broadcast to upload session room
    const uploadRoomId = this.roomService.generateRoomId(
      'upload_session',
      sessionId,
    );
    this.server.to(uploadRoomId).emit('file_upload_completed', completionData);

    // Broadcast to context room (chatroom or thread)
    if (context.chatroomId) {
      const chatroomRoomId = this.roomService.generateRoomId(
        'chatroom',
        context.chatroomId,
      );
      this.server
        .to(chatroomRoomId)
        .emit('file_upload_completed', completionData);
    }

    if (context.threadId) {
      const threadRoomId = this.roomService.generateRoomId(
        'thread',
        context.threadId,
      );
      this.server
        .to(threadRoomId)
        .emit('file_upload_completed', completionData);
    }
  }

  /**
   * Broadcast file upload failure to upload session room
   */
  broadcastFileUploadFailed(sessionId: string, failureData: any) {
    const roomId = this.roomService.generateRoomId('upload_session', sessionId);
    this.server.to(roomId).emit('file_upload_failed', failureData);
  }

  /**
   * Broadcast file processing completion
   */
  broadcastFileProcessed(
    fileId: string,
    processingData: any,
    companyId?: string,
  ) {
    if (companyId) {
      // Broadcast to company room if company ID is provided
      const companyRoomId = this.roomService.generateRoomId(
        'company',
        companyId,
      );
      this.server.to(companyRoomId).emit('file_processed', {
        fileId,
        ...processingData,
      });
    } else {
      // Fallback: broadcast to all connected clients
      this.server.emit('file_processed', {
        fileId,
        ...processingData,
      });
    }
  }

  /**
   * Broadcast company notification
   */
  broadcastCompanyNotification(companyId: string, notificationData: any) {
    const roomId = this.roomService.generateRoomId('company', companyId);
    this.server.to(roomId).emit('company_notification', notificationData);
  }

  // ===== Utility Methods =====

  /**
   * Get connected users count for a room
   */
  getRoomUserCount(roomId: string): number {
    const room = this.server.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
  }

  /**
   * Get all connected users
   */
  getConnectedUsers(): string[] {
    const connectedUsers: string[] = [];

    for (const [socketId, socket] of this.server.sockets.sockets) {
      const authSocket = socket as AuthenticatedSocket;
      if (authSocket.userId) {
        connectedUsers.push(authSocket.userId);
      }
    }

    return connectedUsers;
  }
}
