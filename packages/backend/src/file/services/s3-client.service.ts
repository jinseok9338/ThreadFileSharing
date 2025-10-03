import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

/**
 * S3 Client Service
 * Handles AWS S3 operations for production environment
 */
@Injectable()
export class S3ClientService {
  private readonly logger = new Logger(S3ClientService.name);
  private readonly s3Client?: S3Client;
  private readonly bucketName?: string;
  private readonly region?: string;

  constructor(private readonly configService: ConfigService) {
    const isLocal = this.configService.get<string>('NODE_ENV') === 'local';

    if (isLocal) {
      this.logger.log(
        'Local environment detected - S3ClientService will be initialized lazily when needed',
      );
      return;
    }

    this.region = this.configService.get<string>('AWS_S3_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>(
      'AWS_S3_BUCKET_NAME',
      'threadfilesharing-prod',
    );

    const accessKeyId = this.configService.get<string>('AWS_S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_S3_SECRET_ACCESS_KEY',
    );

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS S3 credentials are not properly configured');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(
      `AWS S3 client initialized for bucket: ${this.bucketName} in region: ${this.region}`,
    );
  }

  /**
   * Upload file to AWS S3
   */
  async uploadFile(
    key: string,
    file: Buffer | Readable,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'S3ClientService is not initialized for production environment',
      );
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);

      this.logger.log(`File uploaded successfully to AWS S3: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(
        `Failed to upload file to AWS S3 ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Download file from AWS S3
   */
  async downloadFile(key: string): Promise<Readable> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'S3ClientService is not initialized for production environment',
      );
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      this.logger.log(`File downloaded successfully from AWS S3: ${key}`);
      return response.Body as Readable;
    } catch (error) {
      this.logger.error(
        `Failed to download file from AWS S3 ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Delete file from AWS S3
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'S3ClientService is not initialized for production environment',
      );
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully from AWS S3: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file from AWS S3 ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Generate presigned URL for file download from AWS S3
   */
  async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'S3ClientService is not initialized for production environment',
      );
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.debug(`Presigned download URL generated for AWS S3: ${key}`);

      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL for AWS S3 ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Generate presigned URL for file upload to AWS S3
   */
  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'S3ClientService is not initialized for production environment',
      );
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.debug(`Presigned upload URL generated for AWS S3: ${key}`);

      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned upload URL for AWS S3 ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get file metadata from AWS S3
   */
  async getFileMetadata(key: string): Promise<{
    size?: number;
    etag?: string;
    lastModified?: Date;
    contentType?: string;
    metadata?: Record<string, string>;
  }> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'S3ClientService is not initialized for production environment',
      );
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      this.logger.debug(`File metadata retrieved from AWS S3: ${key}`);

      return {
        size: response.ContentLength,
        etag: response.ETag,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get metadata from AWS S3 ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Check if file exists in AWS S3
   */
  async fileExists(key: string): Promise<boolean> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        'S3ClientService is not initialized for production environment',
      );
    }

    try {
      await this.getFileMetadata(key);
      return true;
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      this.logger.error(
        `Failed to check file existence in AWS S3: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Generate storage key for AWS S3
   */
  generateStorageKey(
    companyId: string,
    userId: string,
    originalName: string,
    timestamp: number = Date.now(),
  ): string {
    const extension = originalName.split('.').pop();
    const filename = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `companies/${companyId}/users/${userId}/${timestamp}_${sanitizedFilename}.${extension}`;
  }

  /**
   * Get AWS S3 connection info for debugging
   */
  getConnectionInfo(): {
    region?: string;
    bucketName?: string;
    endpoint?: string;
  } {
    return {
      region: this.region,
      bucketName: this.bucketName,
    };
  }

  /**
   * Health check for AWS S3 connection
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    region?: string;
    bucketName?: string;
    error?: string;
  }> {
    if (!this.s3Client || !this.bucketName || !this.region) {
      return {
        status: 'unhealthy',
        error: 'S3ClientService is not initialized for production environment',
      };
    }

    try {
      // Try to list objects to verify connection
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: 'health-check',
      });

      try {
        await this.s3Client.send(command);
      } catch (error) {
        // File doesn't exist, but bucket is accessible
        if (
          error.name === 'NotFound' ||
          error.$metadata?.httpStatusCode === 404
        ) {
          // This is expected - bucket is accessible
        } else {
          throw error;
        }
      }

      return {
        status: 'healthy',
        region: this.region,
        bucketName: this.bucketName,
      };
    } catch (error) {
      this.logger.error(`AWS S3 health check failed: ${error.message}`);

      return {
        status: 'unhealthy',
        region: this.region,
        bucketName: this.bucketName,
        error: error.message,
      };
    }
  }
}
