import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FileManagementService } from '../services/file-management.service';
import { S3ClientService } from '../services/s3-client.service';

@ApiTags('File Download')
@Controller('files')
export class FileDownloadController {
  private readonly logger = new Logger(FileDownloadController.name);

  constructor(
    private readonly fileManagementService: FileManagementService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  @Get('download/:fileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download file by ID (authenticated)' })
  @ApiResponse({
    status: 200,
    description: 'File download initiated',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.OK)
  async downloadFile(
    @Param('fileId') fileId: string,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(
      `Authenticated file download request: ${fileId} from user ${req.user.id}`,
    );

    try {
      const file = await this.fileManagementService.getFileById(
        fileId,
        req.user.id,
      );

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Get download stream from S3/MinIO
      const downloadStream = await this.s3ClientService.downloadFile(
        file.storageKey,
      );

      // Set response headers
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.originalName}"`,
      );
      res.setHeader('Content-Length', file.sizeBytes.toString());

      // Track download in analytics
      await this.fileManagementService.trackDownload(fileId, req.user.id);

      // Pipe the stream to response
      downloadStream.pipe(res);

      this.logger.log(
        `File download initiated: ${fileId} for user ${req.user.id}`,
      );
    } catch (error) {
      this.logger.error(`Authenticated file download failed: ${error.message}`);
      throw error;
    }
  }

  @Get('download/token/:token')
  @ApiOperation({ summary: 'Download file using token (public)' })
  @ApiResponse({
    status: 200,
    description: 'File download initiated',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Token expired or invalid' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 429, description: 'Download limit exceeded' })
  @HttpCode(HttpStatus.OK)
  async downloadFileWithToken(
    @Param('token') token: string,
    @Request() req: any,
    @Res() res: Response,
    @Query('filename') filename?: string,
  ): Promise<void> {
    this.logger.log(`Token-based file download request: ${token}`);

    try {
      const downloadData = await this.fileManagementService.downloadFileByToken(
        token,
        req.ip,
        req.get('User-Agent'),
      );

      if (!downloadData.file) {
        throw new NotFoundException('File not found');
      }

      // Get download stream from S3/MinIO
      const downloadStream = await this.s3ClientService.downloadFile(
        downloadData.file.storageKey,
      );

      // Use provided filename or original filename
      const downloadFilename = filename || downloadData.file.originalName;

      // Set response headers
      res.setHeader('Content-Type', downloadData.file.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${downloadFilename}"`,
      );
      res.setHeader('Content-Length', downloadData.file.sizeBytes.toString());

      // Pipe the stream to response
      downloadStream.pipe(res);

      this.logger.log(
        `Token-based file download initiated: ${downloadData.file.id}`,
      );
    } catch (error) {
      this.logger.error(`Token-based file download failed: ${error.message}`);
      throw error;
    }
  }

  @Get('preview/:fileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preview file (for supported file types)' })
  @ApiResponse({
    status: 200,
    description: 'File preview initiated',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({
    status: 415,
    description: 'File type not supported for preview',
  })
  @HttpCode(HttpStatus.OK)
  async previewFile(
    @Param('fileId') fileId: string,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`File preview request: ${fileId} from user ${req.user.id}`);

    try {
      const file = await this.fileManagementService.getFileById(
        fileId,
        req.user.id,
      );

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Check if file type supports preview
      const previewableTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/json',
      ];

      if (!previewableTypes.includes(file.mimeType)) {
        throw new ForbiddenException('File type not supported for preview');
      }

      // Get download stream from S3/MinIO
      const downloadStream = await this.s3ClientService.downloadFile(
        file.storageKey,
      );

      // Set response headers for inline viewing
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${file.originalName}"`,
      );
      res.setHeader('Content-Length', file.sizeBytes.toString());

      // Add cache headers for preview
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Pipe the stream to response
      downloadStream.pipe(res);

      this.logger.log(
        `File preview initiated: ${fileId} for user ${req.user.id}`,
      );
    } catch (error) {
      this.logger.error(`File preview failed: ${error.message}`);
      throw error;
    }
  }

  @Get('download-url/:fileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pre-signed download URL' })
  @ApiResponse({
    status: 200,
    description: 'Pre-signed download URL generated',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: {
          type: 'string',
          description: 'Pre-signed download URL',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'URL expiration time',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @HttpCode(HttpStatus.OK)
  async getDownloadUrl(
    @Param('fileId') fileId: string,
    @Request() req: any,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    this.logger.log(
      `Get download URL request: ${fileId} from user ${req.user.id}`,
    );

    try {
      const file = await this.fileManagementService.getFileById(
        fileId,
        req.user.id,
      );

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Generate pre-signed URL
      const expirationMinutes = expiresIn ? parseInt(expiresIn, 10) : 60;
      const downloadUrl = await this.s3ClientService.getSignedDownloadUrl(
        file.storageKey,
        expirationMinutes * 60, // Convert minutes to seconds
      );

      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      this.logger.log(
        `Download URL generated: ${fileId} expires at ${expiresAt}`,
      );

      return {
        downloadUrl,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(`Get download URL failed: ${error.message}`);
      throw error;
    }
  }

  @Get('thumbnail/:fileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get file thumbnail (for image files)' })
  @ApiResponse({
    status: 200,
    description: 'File thumbnail generated',
    content: {
      'image/jpeg': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({
    status: 415,
    description: 'File type not supported for thumbnail',
  })
  @HttpCode(HttpStatus.OK)
  async getFileThumbnail(
    @Param('fileId') fileId: string,
    @Request() req: any,
    @Res() res: Response,
    @Query('size') size?: string,
  ): Promise<void> {
    this.logger.log(
      `File thumbnail request: ${fileId} from user ${req.user.id}`,
    );

    try {
      const file = await this.fileManagementService.getFileById(
        fileId,
        req.user.id,
      );

      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Check if file is an image
      if (!file.mimeType.startsWith('image/')) {
        throw new ForbiddenException('File type not supported for thumbnail');
      }

      // Parse thumbnail size (default: 200x200)
      const thumbnailSize = size || '200x200';
      const [width, height] = thumbnailSize.split('x').map(Number);

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        throw new ForbiddenException('Invalid thumbnail size');
      }

      // Get thumbnail stream from S3/MinIO (placeholder - implement in S3ClientService)
      const thumbnailStream = await this.s3ClientService.downloadFile(
        file.storageKey,
      );

      // Set response headers
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

      // Pipe the stream to response
      thumbnailStream.pipe(res);

      this.logger.log(`File thumbnail generated: ${fileId} (${thumbnailSize})`);
    } catch (error) {
      this.logger.error(`File thumbnail generation failed: ${error.message}`);
      throw error;
    }
  }
}
