import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
// import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FileUploadService } from '../services/file-upload.service';
import { UploadProgressService } from '../services/upload-progress.service';
import { FileUploadInterceptor } from '../interceptors/file-upload.interceptor';
// import { multerConfig } from '../config/multer.config'; // Fastify multipart 사용으로 불필요
import { ConfigService } from '@nestjs/config';
import { FileUploadRequestDto, FileUploadResponseDto } from '../dto';
import { UploadProgressDto } from '../dto/upload-progress.dto';

@ApiTags('File Upload')
@Controller('files/upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
// @UseInterceptors(FileUploadInterceptor) // 임시 비활성화
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly uploadProgressService: UploadProgressService,
    private readonly configService: ConfigService,
  ) {
    // Ensure configService is available
    if (!this.configService) {
      throw new Error('ConfigService is required');
    }
  }

  @Post('single')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 413, description: 'File too large' })
  @HttpCode(HttpStatus.CREATED)
  async uploadSingleFile(@Request() req: any): Promise<FileUploadResponseDto> {
    this.logger.log(`Single file upload request from user ${req.user.id}`);

    // Fastify multipart parsing
    const data = await req.file();

    if (!data) {
      throw new BadRequestException('No file provided');
    }

    // Extract form data from the file stream
    const uploadRequest: FileUploadRequestDto = {
      displayName: data.fields.displayName?.value || data.filename,
      accessType: data.fields.accessType?.value || 'PRIVATE',
      threadId: data.fields.threadId?.value,
      chatroomId: data.fields.chatroomId?.value,
      sessionName: data.fields.sessionName?.value,
      createThread: data.fields.createThread?.value === 'true',
      threadTitle: data.fields.threadTitle?.value,
      threadDescription: data.fields.threadDescription?.value,
    };

    try {
      const result = await this.fileUploadService.uploadSingleFile(
        data,
        uploadRequest,
        req.user.id,
      );

      this.logger.log(
        `Single file upload completed: ${result.file?.id || 'association created'}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Single file upload failed: ${error.message}`);
      throw error;
    }
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Create upload session for multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Upload session created successfully',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  // @UseInterceptors(FilesInterceptor('files', 10, multerConfig)) // Fastify multipart 사용
  async createUploadSession(
    @Body() uploadRequest: FileUploadRequestDto,
    @Request() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<FileUploadResponseDto> {
    this.logger.log(
      `Multiple file upload session request from user ${req.user.id} with ${files?.length || 0} files`,
    );

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const maxFiles = this.configService.get<number>(
      'FILE_UPLOAD_MAX_FILES',
      10,
    );
    if (files.length > maxFiles) {
      throw new BadRequestException(
        `Too many files. Maximum allowed: ${maxFiles}`,
      );
    }

    try {
      const result = await this.fileUploadService.createUploadSession(
        files,
        uploadRequest,
        req.user.id,
      );

      this.logger.log(`Upload session created: ${result.uploadSession?.id}`);

      return result;
    } catch (error) {
      this.logger.error(`Upload session creation failed: ${error.message}`);
      throw error;
    }
  }

  @Post('session/:sessionId')
  @ApiOperation({ summary: 'Upload file to existing session' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'File uploaded to session successfully',
    type: FileUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Upload session not found' })
  @HttpCode(HttpStatus.CREATED)
  // @UseInterceptors(FileInterceptor('file', multerConfig)) // Fastify multipart 사용
  async uploadFileToSession(
    @Body() uploadRequest: FileUploadRequestDto,
    @Request() req: any,
    @Body('sessionId') sessionId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<FileUploadResponseDto> {
    this.logger.log(
      `File upload to session request: session ${sessionId}, user ${req.user.id}`,
    );

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    try {
      const result = await this.fileUploadService.uploadFileToSession(
        file,
        sessionId,
        uploadRequest,
        req.user.id,
      );

      this.logger.log(`File uploaded to session: ${result.file?.id}`);

      return result;
    } catch (error) {
      this.logger.error(`File upload to session failed: ${error.message}`);
      throw error;
    }
  }

  @Post('progress/:progressId')
  @ApiOperation({ summary: 'Update upload progress' })
  @ApiResponse({
    status: 200,
    description: 'Upload progress updated successfully',
    type: UploadProgressDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Upload progress not found' })
  @HttpCode(HttpStatus.OK)
  async updateUploadProgress(
    @Body()
    progressData: {
      bytesUploaded: number;
      uploadSpeed?: number;
      estimatedTimeRemaining?: number;
      currentChunk?: number;
    },
    @Request() req: any,
    @Body('progressId') progressId: string,
  ): Promise<UploadProgressDto> {
    this.logger.log(
      `Upload progress update request: progress ${progressId}, user ${req.user.id}`,
    );

    if (!progressId) {
      throw new BadRequestException('Progress ID is required');
    }

    try {
      const result = await this.uploadProgressService.updateProgress(
        progressId,
        progressData,
        req.user.id,
      );

      this.logger.log(
        `Upload progress updated: ${progressId} - ${result.progressPercentage}%`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Upload progress update failed: ${error.message}`);
      throw error;
    }
  }

  @Post('progress/:progressId/fail')
  @ApiOperation({ summary: 'Mark upload progress as failed' })
  @ApiResponse({
    status: 200,
    description: 'Upload progress marked as failed',
    type: UploadProgressDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Upload progress not found' })
  @HttpCode(HttpStatus.OK)
  async markUploadProgressAsFailed(
    @Body() errorData: { errorMessage: string },
    @Request() req: any,
    @Body('progressId') progressId: string,
  ): Promise<UploadProgressDto> {
    this.logger.log(
      `Upload progress failure request: progress ${progressId}, user ${req.user.id}`,
    );

    if (!progressId) {
      throw new BadRequestException('Progress ID is required');
    }

    if (!errorData.errorMessage) {
      throw new BadRequestException('Error message is required');
    }

    try {
      const result = await this.uploadProgressService.markAsFailed(
        progressId,
        errorData.errorMessage,
        req.user.id,
      );

      this.logger.log(`Upload progress marked as failed: ${progressId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Upload progress failure marking failed: ${error.message}`,
      );
      throw error;
    }
  }

  @Post('progress/:progressId/cancel')
  @ApiOperation({ summary: 'Cancel upload progress' })
  @ApiResponse({
    status: 200,
    description: 'Upload progress cancelled',
    type: UploadProgressDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Upload progress not found' })
  @HttpCode(HttpStatus.OK)
  async cancelUploadProgress(
    @Request() req: any,
    @Body('progressId') progressId: string,
  ): Promise<UploadProgressDto> {
    this.logger.log(
      `Upload progress cancellation request: progress ${progressId}, user ${req.user.id}`,
    );

    if (!progressId) {
      throw new BadRequestException('Progress ID is required');
    }

    try {
      const result = await this.uploadProgressService.markAsCancelled(
        progressId,
        req.user.id,
      );

      this.logger.log(`Upload progress cancelled: ${progressId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Upload progress cancellation failed: ${error.message}`,
      );
      throw error;
    }
  }
}
