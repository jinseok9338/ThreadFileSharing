import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { MessageService } from '../services/message.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import {
  MessageResponseDto,
  MessageListResponseDto,
} from '../dto/message-response.dto';
import { CursorPaginationQueryDto } from '../../common/dto';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
  ApiSuccessCursorResponse,
} from '../../common/decorators';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(MessageResponseDto, MessageListResponseDto)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({
    summary: 'Send a message',
    description: 'Send a new message to a chatroom',
  })
  @ApiSuccessResponse(MessageResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Message sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid message data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to chatroom',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const message = await this.messageService.sendMessage(
      sendMessageDto,
      req.user.id,
    );

    return {
      success: true,
      message: 'Message sent successfully',
      data: message,
    };
  }

  @Get('chatroom/:chatroomId')
  @ApiOperation({
    summary: 'Get chatroom messages',
    description: 'Get messages for a specific chatroom with pagination',
  })
  @ApiParam({
    name: 'chatroomId',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of messages to return',
    example: 20,
    required: false,
  })
  @ApiQuery({
    name: 'lastIndex',
    description:
      'Cursor for pagination - Base64 encoded JSON containing createdAt and id',
    example:
      'eyJjcmVhdGVkQXQiOiIyMDIzLTEyLTAxVDEwOjAwOjAwLjAwMFoiLCJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9',
    required: false,
  })
  @ApiSuccessCursorResponse(MessageResponseDto, {
    description: 'Messages retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to chatroom',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getChatroomMessages(
    @Param('chatroomId') chatroomId: string,
    @Query() query: CursorPaginationQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const messages = await this.messageService.getChatroomMessages(
      chatroomId,
      req.user.id,
      query,
    );

    return {
      success: true,
      message: 'Messages retrieved successfully',
      data: messages,
    };
  }

  @Get(':messageId')
  @ApiOperation({
    summary: 'Get a specific message',
    description: 'Get a message by its ID',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Message ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiSuccessResponse(MessageResponseDto, {
    description: 'Message retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to message',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getMessage(
    @Param('messageId') messageId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const message = await this.messageService.getMessage(
      messageId,
      req.user.id,
    );

    return {
      success: true,
      message: 'Message retrieved successfully',
      data: message,
    };
  }

  @Put(':messageId')
  @ApiOperation({
    summary: 'Edit a message',
    description: 'Edit an existing message',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Message ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message edited successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only edit your own messages',
  })
  @HttpCode(HttpStatus.OK)
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() editMessageDto: EditMessageDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const message = await this.messageService.editMessage(
      messageId,
      editMessageDto,
      req.user.id,
    );

    return {
      success: true,
      message: 'Message edited successfully',
      data: message,
    };
  }

  @Delete(':messageId')
  @ApiOperation({
    summary: 'Delete a message',
    description: 'Delete a message (soft delete)',
  })
  @ApiParam({
    name: 'messageId',
    description: 'Message ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Message deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'You can only delete your own messages or need admin permissions',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.messageService.deleteMessage(messageId, req.user.id);
  }

  @Get('thread/:threadId')
  @ApiOperation({
    summary: 'Get thread messages',
    description: 'Get messages for a specific thread with pagination',
  })
  @ApiParam({
    name: 'threadId',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of messages to return',
    example: 20,
    required: false,
  })
  @ApiQuery({
    name: 'lastIndex',
    description:
      'Cursor for pagination - Base64 encoded JSON containing createdAt and id',
    example:
      'eyJjcmVhdGVkQXQiOiIyMDIzLTEyLTAxVDEwOjAwOjAwLjAwMFoiLCJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thread messages retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to thread',
  })
  async getThreadMessages(
    @Param('threadId') threadId: string,
    @Query() query: CursorPaginationQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const messages = await this.messageService.getThreadMessages(
      threadId,
      req.user.id,
      query,
    );

    return {
      success: true,
      message: 'Thread messages retrieved successfully',
      data: messages,
    };
  }
}
