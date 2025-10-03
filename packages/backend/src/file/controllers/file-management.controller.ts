import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FileManagementService } from '../services/file-management.service';
import { StorageQuotaService } from '../services/storage-quota.service';
import {
  FileQueryDto,
  FileResponseDto,
  FileListResponseDto,
  DownloadTokenRequestDto,
  DownloadTokenResponseDto,
  StorageQuotaResponseDto,
} from '../dto';
// import {
//   ApiSuccessResponse,
//   ApiSuccessArrayResponse,
//   ApiSuccessCursorResponse,
// } from '../../common/decorators/api-response.decorator';

@ApiTags('File Management')
@Controller('api/v1/files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileManagementController {
  private readonly logger = new Logger(FileManagementController.name);

  constructor(
    private readonly fileManagementService: FileManagementService,
    private readonly storageQuotaService: StorageQuotaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get files with filtering and pagination' })
  @ApiQuery({
    name: 'threadId',
    required: false,
    description: 'Filter by thread ID',
  })
  @ApiQuery({
    name: 'chatroomId',
    required: false,
    description: 'Filter by chatroom ID',
  })
  @ApiQuery({
    name: 'uploadedBy',
    required: false,
    description: 'Filter by uploader ID',
  })
  @ApiQuery({
    name: 'processingStatus',
    required: false,
    description: 'Filter by processing status',
  })
  @ApiQuery({
    name: 'mimeType',
    required: false,
    description: 'Filter by MIME type',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in file names',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of files to return',
  })
  @ApiQuery({
    name: 'lastIndex',
    required: false,
    description: 'Cursor for pagination',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    description: 'Include deleted files',
  })
  // @ApiSuccessCursorResponse(FileResponseDto, 'Files retrieved successfully')
  @HttpCode(HttpStatus.OK)
  async getFiles(
    @Query() query: FileQueryDto,
    @Request() req: any,
  ): Promise<FileListResponseDto> {
    this.logger.log(`Get files request from user ${req.user.id}`);

    try {
      const result = await this.fileManagementService.getFiles(
        query,
        req.user.id,
      );

      this.logger.log(
        `Files retrieved: ${result.files.length} files, total: ${result.total}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Get files failed: ${error.message}`);
      throw error;
    }
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({
    status: 200,
    description: 'File retrieved successfully',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.OK)
  async getFileById(
    @Param('fileId') fileId: string,
    @Request() req: any,
  ): Promise<FileResponseDto> {
    this.logger.log(`Get file request: ${fileId} from user ${req.user.id}`);

    try {
      const result = await this.fileManagementService.getFileById(
        fileId,
        req.user.id,
      );

      this.logger.log(`File retrieved: ${fileId}`);

      return result;
    } catch (error) {
      this.logger.error(`Get file failed: ${error.message}`);
      throw error;
    }
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({
    status: 204,
    description: 'File deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @Param('fileId') fileId: string,
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(`Delete file request: ${fileId} from user ${req.user.id}`);

    try {
      await this.fileManagementService.deleteFile(fileId, req.user.id);

      this.logger.log(`File deleted: ${fileId}`);
    } catch (error) {
      this.logger.error(`Delete file failed: ${error.message}`);
      throw error;
    }
  }

  @Put(':fileId/metadata')
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiResponse({
    status: 200,
    description: 'File metadata updated successfully',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.OK)
  async updateFileMetadata(
    @Param('fileId') fileId: string,
    @Body() metadata: Record<string, unknown>,
    @Request() req: any,
  ): Promise<FileResponseDto> {
    this.logger.log(
      `Update file metadata request: ${fileId} from user ${req.user.id}`,
    );

    try {
      const result = await this.fileManagementService.updateFileMetadata(
        fileId,
        metadata,
        req.user.id,
      );

      this.logger.log(`File metadata updated: ${fileId}`);

      return result;
    } catch (error) {
      this.logger.error(`Update file metadata failed: ${error.message}`);
      throw error;
    }
  }

  @Post(':fileId/download-token')
  @ApiOperation({ summary: 'Create download token for file' })
  @ApiResponse({
    status: 201,
    description: 'Download token created successfully',
    type: DownloadTokenResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.CREATED)
  async createDownloadToken(
    @Param('fileId') fileId: string,
    @Body() tokenRequest: DownloadTokenRequestDto,
    @Request() req: any,
  ): Promise<DownloadTokenResponseDto> {
    this.logger.log(
      `Create download token request: ${fileId} from user ${req.user.id}`,
    );

    try {
      const result = await this.fileManagementService.createDownloadToken(
        fileId,
        tokenRequest.maxDownloads,
        tokenRequest.expiresIn,
        req.user.id,
      );

      this.logger.log(
        `Download token created: ${result.id} for file ${fileId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Create download token failed: ${error.message}`);
      throw error;
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search files' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results to return',
  })
  // @ApiSuccessArrayResponse(FileResponseDto, 'Files found successfully')
  @HttpCode(HttpStatus.OK)
  async searchFiles(
    @Request() req: any,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: string,
  ): Promise<FileResponseDto[]> {
    this.logger.log(
      `Search files request: "${searchTerm}" from user ${req.user.id}`,
    );

    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    try {
      const result = await this.fileManagementService.searchFiles(
        searchTerm,
        req.user.id,
        limit ? parseInt(limit, 10) : 20,
      );

      this.logger.log(`Search completed: ${result.length} files found`);

      return result;
    } catch (error) {
      this.logger.error(`Search files failed: ${error.message}`);
      throw error;
    }
  }

  @Get('storage/quota')
  @ApiOperation({ summary: 'Get storage quota information' })
  @ApiResponse({
    status: 200,
    description: 'Storage quota retrieved successfully',
    type: StorageQuotaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getStorageQuota(@Request() req: any): Promise<StorageQuotaResponseDto> {
    this.logger.log(`Get storage quota request from user ${req.user.id}`);

    try {
      const result = await this.storageQuotaService.getStorageQuota(
        req.user.companyId,
      );

      this.logger.log(
        `Storage quota retrieved: ${result.storageUsedFormatted}/${result.storageLimitFormatted}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Get storage quota failed: ${error.message}`);
      throw error;
    }
  }

  @Post('storage/quota/recalculate')
  @ApiOperation({ summary: 'Recalculate storage quota' })
  @ApiResponse({
    status: 200,
    description: 'Storage quota recalculated successfully',
    type: StorageQuotaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async recalculateStorageQuota(
    @Request() req: any,
  ): Promise<StorageQuotaResponseDto> {
    this.logger.log(
      `Recalculate storage quota request from user ${req.user.id}`,
    );

    try {
      const result = await this.storageQuotaService.recalculateStorageQuota(
        req.user.companyId,
      );

      this.logger.log(
        `Storage quota recalculated: ${result.storageUsedFormatted}/${result.storageLimitFormatted}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Recalculate storage quota failed: ${error.message}`);
      throw error;
    }
  }

  @Get('storage/report')
  @ApiOperation({ summary: 'Get storage usage report' })
  @ApiResponse({
    status: 200,
    description: 'Storage usage report retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getStorageUsageReport(@Request() req: any): Promise<{
    quota: StorageQuotaResponseDto;
    topFiles: Array<{
      id: string;
      name: string;
      size: number;
      sizeFormatted: string;
    }>;
    usageByType: Record<
      string,
      {
        count: number;
        size: number;
        sizeFormatted: string;
      }
    >;
  }> {
    this.logger.log(
      `Get storage usage report request from user ${req.user.id}`,
    );

    try {
      const result = await this.storageQuotaService.getStorageUsageReport(
        req.user.companyId,
      );

      this.logger.log(
        `Storage usage report retrieved: ${result.quota.storageUsedFormatted}/${result.quota.storageLimitFormatted}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Get storage usage report failed: ${error.message}`);
      throw error;
    }
  }
}
