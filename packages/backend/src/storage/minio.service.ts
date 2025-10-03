import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

/**
 * MinIO Service
 * Handles MinIO-specific operations for local development
 */
@Injectable()
export class MinIOService {
  private readonly logger = new Logger(MinIOService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;
  private readonly accessKey: string;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService
      .get<string>('MINIO_ENDPOINT', 'localhost')
      .replace('http://', '')
      .replace('https://', '');
    
    this.port = parseInt(
      this.configService.get<string>('MINIO_PORT', '9000'),
      10,
    );
    
    this.useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    this.accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    this.secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    this.bucketName = this.configService.get<string>(
      'MINIO_BUCKET_NAME',
      'threadfilesharing-local',
    );

    this.minioClient = new Minio.Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.accessKey,
      secretKey: this.secretKey,
    });

    this.logger.log(`MinIO client initialized for ${this.endpoint}:${this.port}`);
  }

  /**
   * Initialize MinIO bucket if it doesn't exist
   */
  async initializeBucket(): Promise<void> {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(
          `MinIO bucket '${this.bucketName}' created successfully`,
        );
      } else {
        this.logger.log(
          `MinIO bucket '${this.bucketName}' already exists`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to initialize MinIO bucket: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload file to MinIO
   */
  async uploadFile(
    objectKey: string,
    fileBuffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      await this.initializeBucket();
      
      const result = await this.minioClient.putObject(
        this.bucketName,
        objectKey,
        fileBuffer,
        fileBuffer.length,
        {
          'Content-Type': contentType,
          ...metadata,
        },
      );
      
      this.logger.debug(
        `File uploaded to MinIO: ${objectKey} (${fileBuffer.length} bytes)`,
      );
      
      return result.etag;
    } catch (error) {
      this.logger.error(`Failed to upload file to MinIO: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get file from MinIO
   */
  async getFile(objectKey: string): Promise<Readable> {
    try {
      const stream = await this.minioClient.getObject(this.bucketName, objectKey);
      this.logger.debug(`File retrieved from MinIO: ${objectKey}`);
      return stream;
    } catch (error) {
      this.logger.error(`Failed to get file from MinIO: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(objectKey: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectKey);
      this.logger.debug(`File deleted from MinIO: ${objectKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from MinIO: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate presigned URL for file download
   */
  async getPresignedDownloadUrl(
    objectKey: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        objectKey,
        expiresIn,
      );
      
      this.logger.debug(
        `Presigned download URL generated for MinIO: ${objectKey}`,
      );
      
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned URL from MinIO: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Generate presigned URL for file upload
   */
  async getPresignedUploadUrl(
    objectKey: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const url = await this.minioClient.presignedPutObject(
        this.bucketName,
        objectKey,
        expiresIn,
      );
      
      this.logger.debug(
        `Presigned upload URL generated for MinIO: ${objectKey}`,
      );
      
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned upload URL from MinIO: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Check if file exists in MinIO
   */
  async fileExists(objectKey: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectKey);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      this.logger.error(`Failed to check file existence in MinIO: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get file metadata from MinIO
   */
  async getFileMetadata(objectKey: string): Promise<Minio.BucketItemStat> {
    try {
      const stat = await this.minioClient.statObject(this.bucketName, objectKey);
      this.logger.debug(`File metadata retrieved from MinIO: ${objectKey}`);
      return stat;
    } catch (error) {
      this.logger.error(`Failed to get file metadata from MinIO: ${error.message}`);
      throw error;
    }
  }

  /**
   * List files in MinIO bucket with optional prefix
   */
  async listFiles(prefix?: string): Promise<Minio.BucketItem[]> {
    try {
      const files: Minio.BucketItem[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          // Convert ObjectInfo to BucketItem format
          if (obj.name) {
            files.push({
              name: obj.name,
              size: obj.size || 0,
              etag: obj.etag || '',
              lastModified: obj.lastModified || new Date(),
            });
          }
        });
        stream.on('error', (error) => {
          this.logger.error(`Failed to list files from MinIO: ${error.message}`);
          reject(error);
        });
        stream.on('end', () => {
          this.logger.debug(`Listed ${files.length} files from MinIO`);
          resolve(files);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to list files from MinIO: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get MinIO connection info for debugging
   */
  getConnectionInfo(): {
    endpoint: string;
    port: number;
    bucketName: string;
    useSSL: boolean;
  } {
    return {
      endpoint: this.endpoint,
      port: this.port,
      bucketName: this.bucketName,
      useSSL: this.useSSL,
    };
  }

  /**
   * Health check for MinIO connection
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    endpoint: string;
    bucketExists: boolean;
    error?: string;
  }> {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      
      return {
        status: 'healthy',
        endpoint: `${this.endpoint}:${this.port}`,
        bucketExists,
      };
    } catch (error) {
      this.logger.error(`MinIO health check failed: ${error.message}`);
      
      return {
        status: 'unhealthy',
        endpoint: `${this.endpoint}:${this.port}`,
        bucketExists: false,
        error: error.message,
      };
    }
  }
}
