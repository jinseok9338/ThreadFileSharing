import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class S3ClientService {
  private readonly logger = new Logger(S3ClientService.name);
  private readonly isMinio: boolean;
  private readonly s3Client: S3Client;
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.isMinio = this.configService.get<string>('NODE_ENV') === 'local';
    this.bucketName = this.isMinio
      ? this.configService.get<string>(
          'MINIO_BUCKET_NAME',
          'threadfilesharing-local',
        )
      : this.configService.get<string>(
          'AWS_S3_BUCKET_NAME',
          'threadfilesharing-prod',
        );

    if (this.isMinio) {
      this.minioClient = new Minio.Client({
        endPoint: this.configService
          .get<string>('MINIO_ENDPOINT', 'localhost')
          .replace('http://', '')
          .replace('https://', ''),
        port: parseInt(
          this.configService.get<string>('MINIO_PORT', '9000'),
          10,
        ),
        useSSL: false,
        accessKey: this.configService.get<string>(
          'MINIO_ACCESS_KEY',
          'minioadmin',
        ),
        secretKey: this.configService.get<string>(
          'MINIO_SECRET_KEY',
          'minioadmin',
        ),
      });
    } else {
      const region = this.configService.get<string>('AWS_S3_REGION');
      const accessKeyId = this.configService.get<string>(
        'AWS_S3_ACCESS_KEY_ID',
      );
      const secretAccessKey = this.configService.get<string>(
        'AWS_S3_SECRET_ACCESS_KEY',
      );

      if (!region || !accessKeyId || !secretAccessKey) {
        throw new Error('AWS S3 credentials are not properly configured');
      }

      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }

    this.initializeBucket();
  }

  private async initializeBucket(): Promise<void> {
    try {
      if (this.isMinio) {
        const bucketExists = await this.minioClient.bucketExists(
          this.bucketName,
        );
        if (!bucketExists) {
          await this.minioClient.makeBucket(this.bucketName);
          this.logger.log(
            `MinIO bucket '${this.bucketName}' created successfully`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to initialize bucket: ${error.message}`);
    }
  }

  async uploadFile(
    key: string,
    file: Buffer | Readable,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      if (this.isMinio) {
        await this.minioClient.putObject(
          this.bucketName,
          key,
          file,
          undefined,
          {
            'Content-Type': contentType,
            ...metadata,
          },
        );
      } else {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: contentType,
          Metadata: metadata,
        });
        await this.s3Client.send(command);
      }

      this.logger.log(`File uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}: ${error.message}`);
      throw error;
    }
  }

  async downloadFile(key: string): Promise<Readable> {
    try {
      if (this.isMinio) {
        return await this.minioClient.getObject(this.bucketName, key);
      } else {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        const response = await this.s3Client.send(command);
        return response.Body as Readable;
      }
    } catch (error) {
      this.logger.error(`Failed to download file ${key}: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (this.isMinio) {
        await this.minioClient.removeObject(this.bucketName, key);
      } else {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        await this.s3Client.send(command);
      }

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}: ${error.message}`);
      throw error;
    }
  }

  async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      if (this.isMinio) {
        // MinIO presigned URL
        return await this.minioClient.presignedGetObject(
          this.bucketName,
          key,
          expiresIn,
        );
      } else {
        // AWS S3 presigned URL
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        return await getSignedUrl(this.s3Client, command, { expiresIn });
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL for ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async getFileMetadata(key: string): Promise<any> {
    try {
      if (this.isMinio) {
        const stat = await this.minioClient.statObject(this.bucketName, key);
        return {
          size: stat.size,
          etag: stat.etag,
          lastModified: stat.lastModified,
          contentType: stat.metaData['content-type'],
          metadata: stat.metaData,
        };
      } else {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        const response = await this.s3Client.send(command);
        return {
          size: response.ContentLength,
          etag: response.ETag,
          lastModified: response.LastModified,
          contentType: response.ContentType,
          metadata: response.Metadata,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to get metadata for ${key}: ${error.message}`);
      throw error;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.getFileMetadata(key);
      return true;
    } catch (error) {
      return false;
    }
  }

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
}
