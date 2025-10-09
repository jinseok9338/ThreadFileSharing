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
import { ChatRoomService } from '../chatroom.service';
import { CreateChatroomDto } from '../dto/create-chatroom.dto';
import { UpdateChatroomDto } from '../dto/update-chatroom.dto';
import {
  ChatroomResponseDto,
  ChatroomListResponseDto,
} from '../dto/chatroom-response.dto';
import { CursorPaginationQueryDto } from '../../common/dto';
import {
  ApiSuccessResponse,
  ApiSuccessCursorResponse,
} from '../../common/decorators';

@ApiTags('Chatrooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(ChatroomResponseDto, ChatroomListResponseDto)
@Controller('chatrooms')
export class ChatroomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a chatroom',
    description: 'Create a new chatroom',
  })
  @ApiSuccessResponse(ChatroomResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Chatroom created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid chatroom data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  @HttpCode(HttpStatus.CREATED)
  async createChatroom(
    @Body() createChatroomDto: CreateChatroomDto,
    @Request() req: any,
  ): Promise<any> {
    return this.chatRoomService.createChatRoom(
      createChatroomDto,
      req.user.id,
      req.user.companyId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get chatrooms',
    description: 'Get list of chatrooms with pagination',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of chatrooms to return',
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
  @ApiSuccessCursorResponse(ChatroomResponseDto, {
    description: 'Chatrooms retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getChatrooms(
    @Query() query: CursorPaginationQueryDto,
    @Request() req: any,
  ): Promise<any> {
    return this.chatRoomService.getChatRoomsByCompany(
      req.user.companyId,
      query,
    );
  }

  @Get(':chatroomId')
  @ApiOperation({
    summary: 'Get a specific chatroom',
    description: 'Get a chatroom by its ID',
  })
  @ApiParam({
    name: 'chatroomId',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chatroom retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chatroom not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to chatroom',
  })
  async getChatroom(
    @Param('chatroomId') chatroomId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.chatRoomService.getChatRoomById(chatroomId, req.user.id);
  }

  @Put(':chatroomId')
  @ApiOperation({
    summary: 'Update a chatroom',
    description: 'Update an existing chatroom',
  })
  @ApiParam({
    name: 'chatroomId',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chatroom updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chatroom not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only update chatrooms you have permission for',
  })
  @HttpCode(HttpStatus.OK)
  async updateChatroom(
    @Param('chatroomId') chatroomId: string,
    @Body() updateChatroomDto: UpdateChatroomDto,
    @Request() req: any,
  ): Promise<any> {
    return this.chatRoomService.updateChatRoom(
      chatroomId,
      updateChatroomDto,
      req.user.id,
    );
  }

  @Delete(':chatroomId')
  @ApiOperation({
    summary: 'Delete a chatroom',
    description: 'Delete a chatroom (soft delete)',
  })
  @ApiParam({
    name: 'chatroomId',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Chatroom deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chatroom not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only delete chatrooms you have permission for',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChatroom(
    @Param('chatroomId') chatroomId: string,
    @Request() req: any,
  ): Promise<void> {
    await this.chatRoomService.deleteChatRoom(chatroomId, req.user.id);
  }

  @Post(':chatroomId/members/:userId')
  @ApiOperation({
    summary: 'Add member to chatroom',
    description: 'Add a user to a chatroom',
  })
  @ApiParam({
    name: 'chatroomId',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to add',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Member added successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chatroom or user not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'You can only add members to chatrooms you have permission for',
  })
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('chatroomId') chatroomId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<void> {
    await this.chatRoomService.addMember(chatroomId, userId, req.user.id);
  }

  @Delete(':chatroomId/members/:userId')
  @ApiOperation({
    summary: 'Remove member from chatroom',
    description: 'Remove a user from a chatroom',
  })
  @ApiParam({
    name: 'chatroomId',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to remove',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Member removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chatroom or user not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'You can only remove members from chatrooms you have permission for',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('chatroomId') chatroomId: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<void> {
    await this.chatRoomService.removeMember(chatroomId, userId, req.user.id);
  }
}
