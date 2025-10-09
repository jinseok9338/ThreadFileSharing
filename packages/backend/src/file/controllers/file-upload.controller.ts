import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChunkedUploadService } from '../services/chunked-upload.service';
import { StreamingUploadService } from '../services/streaming-upload.service';
import { UploadProgressService } from '../services/upload-progress.service';
import { InitiateUploadDto } from '../dto/initiate-upload.dto';
import { UploadChunkDto } from '../dto/upload-chunk.dto';
import { UploadSessionResponseDto } from '../dto/upload-session-response.dto';
import { ApiResponse as ApiResponseClass } from '../../common/dto/api-response.dto';

@ApiTags('File Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files/upload')
export class FileUploadController {
  constructor(
    private readonly chunkedUploadService: ChunkedUploadService,
    private readonly streamingUploadService: StreamingUploadService,
    private readonly uploadProgressService: UploadProgressService,
  ) {}

  @Post('initiate')
  @ApiOperation({
    summary: 'Initiate large file upload session',
    description: 'Creates a new upload session for chunked file upload',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'Upload session created successfully',
    type: ApiResponseClass<UploadSessionResponseDto>,
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request parameters',
  })
  @SwaggerApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async initiateUpload(
    @Body() initiateDto: InitiateUploadDto,
    @Request() req: any,
  ): Promise<UploadSessionResponseDto> {
    const uploadSession = await this.chunkedUploadService.initiateUpload(
      initiateDto,
      req.user.id,
    );

    return {
      sessionId: uploadSession.sessionId,
      fileName: uploadSession.originalFileName,
      totalSizeBytes: uploadSession.totalSizeBytes,
      uploadedChunks: uploadSession.uploadedChunks,
      totalChunks: uploadSession.totalChunks,
      uploadedBytes: uploadSession.uploadedBytes,
      progressPercentage: uploadSession.progressPercentage,
      status: uploadSession.status,
      createdAt: uploadSession.createdAt,
      updatedAt: uploadSession.updatedAt,
      completedAt: uploadSession.completedAt,
      expiresAt: uploadSession.expiresAt,
      chatroomId: uploadSession.chatroomId,
      threadId: uploadSession.threadId,
    };
  }

  @Post('chunk')
  @ApiOperation({
    summary: 'Upload file chunk',
    description: 'Uploads a single chunk of the file',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Chunk uploaded successfully',
    type: ApiResponseClass<UploadSessionResponseDto>,
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid chunk data or sequence',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upload session not found',
  })
  @HttpCode(HttpStatus.OK)
  async uploadChunk(@Body() chunkDto: UploadChunkDto): Promise<any> {
    const uploadSession = await this.chunkedUploadService.uploadChunk(chunkDto);

    const response: UploadSessionResponseDto = {
      sessionId: uploadSession.sessionId,
      fileName: uploadSession.originalFileName,
      totalSizeBytes: uploadSession.totalSizeBytes,
      uploadedChunks: uploadSession.uploadedChunks,
      totalChunks: uploadSession.totalChunks,
      uploadedBytes: uploadSession.uploadedBytes,
      progressPercentage: uploadSession.progressPercentage,
      status: uploadSession.status,
      createdAt: uploadSession.createdAt,
      updatedAt: uploadSession.updatedAt,
      completedAt: uploadSession.completedAt,
      expiresAt: uploadSession.expiresAt,
      chatroomId: uploadSession.chatroomId,
      threadId: uploadSession.threadId,
    };

    return {
      success: true,
      message: 'Chunk uploaded successfully',
      data: response,
    };
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get upload session status',
    description:
      'Retrieves the current status and progress of an upload session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: 'upload_session_123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Upload session status retrieved successfully',
    type: ApiResponseClass<UploadSessionResponseDto>,
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upload session not found',
  })
  async getUploadSession(
    @Param('sessionId') sessionId: string,
  ): Promise<UploadSessionResponseDto> {
    const uploadSession =
      await this.chunkedUploadService.getUploadSession(sessionId);

    return {
      sessionId: uploadSession.sessionId,
      fileName: uploadSession.originalFileName,
      totalSizeBytes: uploadSession.totalSizeBytes,
      uploadedChunks: uploadSession.uploadedChunks,
      totalChunks: uploadSession.totalChunks,
      uploadedBytes: uploadSession.uploadedBytes,
      progressPercentage: uploadSession.progressPercentage,
      status: uploadSession.status,
      createdAt: uploadSession.createdAt,
      updatedAt: uploadSession.updatedAt,
      completedAt: uploadSession.completedAt,
      expiresAt: uploadSession.expiresAt,
      chatroomId: uploadSession.chatroomId,
      threadId: uploadSession.threadId,
    };
  }

  @Delete('session/:sessionId')
  @ApiOperation({
    summary: 'Cancel upload session',
    description: 'Cancels an active upload session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: 'upload_session_123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Upload session cancelled successfully',
    type: ApiResponseClass<UploadSessionResponseDto>,
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel completed upload session',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upload session not found',
  })
  async cancelUpload(
    @Param('sessionId') sessionId: string,
  ): Promise<UploadSessionResponseDto> {
    const uploadSession =
      await this.chunkedUploadService.cancelUpload(sessionId);

    return {
      sessionId: uploadSession.sessionId,
      fileName: uploadSession.originalFileName,
      totalSizeBytes: uploadSession.totalSizeBytes,
      uploadedChunks: uploadSession.uploadedChunks,
      totalChunks: uploadSession.totalChunks,
      uploadedBytes: uploadSession.uploadedBytes,
      progressPercentage: uploadSession.progressPercentage,
      status: uploadSession.status,
      createdAt: uploadSession.createdAt,
      updatedAt: uploadSession.updatedAt,
      completedAt: uploadSession.completedAt,
      expiresAt: uploadSession.expiresAt,
      chatroomId: uploadSession.chatroomId,
      threadId: uploadSession.threadId,
    };
  }

  @Get('streaming/:sessionId/stats')
  @ApiOperation({
    summary: 'Get streaming upload statistics',
    description: 'Retrieves real-time statistics for streaming uploads',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: 'upload_session_123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Streaming statistics retrieved successfully',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upload session not found',
  })
  async getStreamingStats(@Param('sessionId') sessionId: string) {
    return this.streamingUploadService.getStreamingStats(sessionId);
  }

  @Post('streaming/:sessionId/resume')
  @ApiOperation({
    summary: 'Resume streaming upload',
    description: 'Resumes a paused streaming upload session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Upload session ID',
    example: 'upload_session_123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Upload session resume information retrieved',
  })
  @SwaggerApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot resume completed upload session',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Upload session not found',
  })
  async resumeStreamingUpload(@Param('sessionId') sessionId: string) {
    return this.streamingUploadService.resumeStreamingUpload(sessionId);
  }
}
