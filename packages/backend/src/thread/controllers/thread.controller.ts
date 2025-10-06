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
import { ThreadRoleGuard } from '../../auth/guards/thread-role.guard';
import { RequireThreadMember } from '../../auth/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.types';
import { ThreadService } from '../thread.service';
import { CreateThreadDto } from '../dto/create-thread.dto';
import { UpdateThreadDto } from '../dto/update-thread.dto';
import {
  ThreadResponseDto,
  ThreadDetailResponseDto,
  ThreadListResponseDto,
} from '../dto/thread-response.dto';
import { CursorPaginationQueryDto } from '../../common/dto';
import {
  ApiSuccessResponse,
  ApiSuccessCursorResponse,
} from '../../common/decorators';
import { FileResponseDto } from '../../file/dto/file-response.dto';
import { ThreadFileAssociationResponseDto } from '../dto/thread-file-association-response.dto';

@ApiTags('Threads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(
  ThreadResponseDto,
  ThreadDetailResponseDto,
  ThreadListResponseDto,
  FileResponseDto,
)
@Controller('threads')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a thread',
    description: 'Create a new thread in a chatroom',
  })
  @ApiSuccessResponse(ThreadResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Thread created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid thread data',
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
  async createThread(
    @Body() createThreadDto: CreateThreadDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const thread = await this.threadService.createThread(
      createThreadDto,
      req.user.id,
    );

    return {
      success: true,
      message: 'Thread created successfully',
      data: thread,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get threads',
    description: 'Get list of threads with pagination',
  })
  @ApiQuery({
    name: 'chatroomId',
    description: 'Filter by chatroom ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of threads to return',
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
  @ApiSuccessCursorResponse(ThreadResponseDto, {
    description: 'Threads retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getThreads(
    @Query() query: CursorPaginationQueryDto & { chatroomId?: string },
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const threads = await this.threadService.getThreads(req.user.id, query);

    return {
      success: true,
      message: 'Threads retrieved successfully',
      data: threads,
    };
  }

  @Get(':threadId')
  @ApiOperation({
    summary: 'Get a specific thread',
    description: 'Get a thread by its ID with participants',
  })
  @ApiParam({
    name: 'threadId',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thread retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Thread not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to thread',
  })
  async getThread(
    @Param('threadId') threadId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const thread = await this.threadService.getThreadById(
      threadId,
      req.user.id,
    );

    return {
      success: true,
      message: 'Thread retrieved successfully',
      data: thread,
    };
  }

  @Put(':threadId')
  @ApiOperation({
    summary: 'Update a thread',
    description: 'Update an existing thread',
  })
  @ApiParam({
    name: 'threadId',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thread updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Thread not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only update threads you have permission for',
  })
  @HttpCode(HttpStatus.OK)
  async updateThread(
    @Param('threadId') threadId: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    const thread = await this.threadService.updateThread(
      threadId,
      updateThreadDto,
      req.user.id,
    );

    return {
      success: true,
      message: 'Thread updated successfully',
      data: thread,
    };
  }

  @Delete(':threadId')
  @ApiOperation({
    summary: 'Delete a thread',
    description: 'Delete a thread (soft delete)',
  })
  @ApiParam({
    name: 'threadId',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Thread deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Thread not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only delete threads you have permission for',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteThread(
    @Param('threadId') threadId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.threadService.deleteThread(threadId, req.user.id);
  }

  @Post(':threadId/participants/:userId')
  @ApiOperation({
    summary: 'Add participant to thread',
    description: 'Add a user to a thread',
  })
  @ApiParam({
    name: 'threadId',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to add',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Participant added successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Thread or user not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'You can only add participants to threads you have permission for',
  })
  @HttpCode(HttpStatus.CREATED)
  async addParticipant(
    @Param('threadId') threadId: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    await this.threadService.addParticipant(threadId, userId, req.user.id);

    return {
      success: true,
      message: 'Participant added successfully',
    };
  }

  @Delete(':threadId/participants/:userId')
  @ApiOperation({
    summary: 'Remove participant from thread',
    description: 'Remove a user from a thread',
  })
  @ApiParam({
    name: 'threadId',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to remove',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Participant removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Thread or user not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'You can only remove participants from threads you have permission for',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeParticipant(
    @Param('threadId') threadId: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.threadService.removeParticipant(threadId, userId, req.user.id);
  }

  @Put(':threadId/archive')
  @ApiOperation({
    summary: 'Archive a thread',
    description: 'Archive a thread to hide it from active threads',
  })
  @ApiParam({
    name: 'threadId',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thread archived successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Thread not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to archive thread',
  })
  @HttpCode(HttpStatus.OK)
  async archiveThread(
    @Param('threadId') threadId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<any> {
    await this.threadService.archiveThread(threadId, req.user.id);

    return {
      success: true,
      message: 'Thread archived successfully',
    };
  }

  @Get(':id/files')
  @ApiOperation({ summary: 'Get files associated with thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Thread files retrieved successfully',
    type: [FileResponseDto],
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
  async getThreadFiles(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<FileResponseDto[]> {
    const userId = req.user.id;
    return this.threadService.getThreadFiles(id, userId);
  }

  @Post(':id/files')
  @ApiOperation({ summary: 'Associate file with thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'File associated with thread successfully',
    type: ThreadFileAssociationResponseDto,
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
    description: 'Thread or file not found',
  })
  async associateFileWithThread(
    @Param('id') id: string,
    @Body() body: { fileId: string },
    @Request() req: AuthenticatedRequest,
  ): Promise<ThreadFileAssociationResponseDto> {
    const userId = req.user.id;
    return this.threadService.associateFileWithThread(id, body.fileId, userId);
  }

  @Delete(':id/files/:fileId')
  @ApiOperation({ summary: 'Remove file association from thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'fileId',
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'File association removed successfully',
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
    description: 'Thread or file not found',
  })
  async removeFileFromThread(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    const userId = req.user.id;
    return this.threadService.removeFileFromThread(id, fileId, userId);
  }
}
