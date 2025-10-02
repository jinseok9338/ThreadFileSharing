import {
  Controller,
  Post,
  Get,
  Put,
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
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
  ApiSuccessCursorResponse,
} from '../common/decorators';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThreadRoleGuard } from '../auth/guards/thread-role.guard';
import { RequireThreadMember } from '../auth/decorators/permissions.decorator';

@ApiTags('Threads')
@ApiExtraModels(ThreadResponseDto)
@Controller('threads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiSuccessResponse(ThreadResponseDto, {
    status: 201,
    description: 'Thread created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of the chatroom',
  })
  async createThread(
    @Body() createThreadDto: CreateThreadDto,
    @Request() req: any,
  ): Promise<ThreadResponseDto> {
    const userId = req.user.id;
    return this.threadService.createThread(createThreadDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all threads for the current user' })
  @ApiSuccessCursorResponse(ThreadResponseDto, {
    status: 200,
    description: 'Threads retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getAllThreads(
    @Request() req: any,
    @Query() query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<ThreadResponseDto>> {
    const userId = req.user.id;
    return this.threadService.getAllThreads(userId, query);
  }

  @Get('chatroom/:chatroomId')
  @ApiOperation({ summary: 'Get all threads for a chatroom' })
  @ApiParam({
    name: 'chatroomId',
    description: 'Chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiSuccessCursorResponse(ThreadResponseDto, {
    status: 200,
    description: 'Threads retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getThreadsByChatRoom(
    @Param('chatroomId') chatroomId: string,
    @Query() query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<ThreadResponseDto>> {
    return this.threadService.getThreadsByChatRoom(chatroomId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get thread by ID' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiSuccessResponse(ThreadResponseDto, {
    status: 200,
    description: 'Thread retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Thread not found',
  })
  async getThreadById(
    @Param('id') id: string,
  ): Promise<ThreadResponseDto | null> {
    return this.threadService.getThreadById(id);
  }

  @Put(':id')
  @UseGuards(ThreadRoleGuard)
  @RequireThreadMember()
  @ApiOperation({ summary: 'Update thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiSuccessResponse(ThreadResponseDto, {
    status: 200,
    description: 'Thread updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Thread not found',
  })
  async updateThread(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateThreadDto>,
    @Request() req: any,
  ): Promise<ThreadResponseDto> {
    const userId = req.user.id;
    return this.threadService.updateThread(id, updateData, userId);
  }

  @Put(':id/archive')
  @UseGuards(ThreadRoleGuard)
  @RequireThreadMember()
  @ApiOperation({ summary: 'Archive thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiSuccessResponse(ThreadResponseDto, {
    status: 200,
    description: 'Thread archived successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Thread not found',
  })
  async archiveThread(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    return this.threadService.archiveThread(id, userId);
  }
}
