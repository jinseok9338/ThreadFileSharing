import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Readable } from "stream";
import { FileUploadSession } from "../entities/file-upload-session.entity";
import { UploadStatus } from "../../common/enums/upload-status.enum";
import { MinIOService } from "../../storage/minio.service";
import { S3ClientService } from "./s3-client.service";

@Injectable()
export class StreamingUploadService {
  private readonly logger = new Logger(StreamingUploadService.name);
  private readonly DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    @InjectRepository(FileUploadSession)
    private readonly uploadSessionRepository: Repository<FileUploadSession>,
    private readonly minioService: MinIOService,
    private readonly s3ClientService: S3ClientService,
  ) {}

  async uploadStream(
    sessionId: string,
    stream: Readable,
    totalSize: bigint,
  ): Promise<FileUploadSession> {
    const uploadSession = await this.uploadSessionRepository.findOne({
      where: { sessionId },
    });

    if (!uploadSession) {
      throw new BadRequestException("Upload session not found");
    }

    if (uploadSession.status === UploadStatus.COMPLETED) {
      throw new BadRequestException("Upload session already completed");
    }

    try {
      // Update status to in progress
      await this.uploadSessionRepository.update(uploadSession.id, {
        status: UploadStatus.IN_PROGRESS,
      });

      // Generate storage key
      const storageKey = this.generateStorageKey(uploadSession);
      const bucketName = this.getBucketName();

      // Upload stream to storage
      let uploadedBytes = 0n;
      const chunks: Buffer[] = [];
      let chunkIndex = 0;

      return new Promise((resolve, reject) => {
        stream.on("data", async (chunk: Buffer) => {
          chunks.push(chunk);
          uploadedBytes += BigInt(chunk.length);

          // Upload chunk when it reaches the chunk size
          if (uploadedBytes >= BigInt(this.DEFAULT_CHUNK_SIZE)) {
            try {
              const chunkBuffer = Buffer.concat(chunks);
              const chunkKey = `${storageKey}_chunk_${chunkIndex}`;

              // Upload chunk to storage
              if (process.env.NODE_ENV === "local") {
                await this.minioService.uploadFile(
                  chunkKey,
                  chunkBuffer,
                  uploadSession.metadata.mimeType,
                );
              } else {
                await this.s3ClientService.uploadFile(
                  chunkKey,
                  chunkBuffer,
                  uploadSession.metadata.mimeType,
                );
              }

              // Update progress
              await this.updateStreamProgress(uploadSession, chunkIndex, uploadedBytes);

              // Clear chunks and increment index
              chunks.length = 0;
              chunkIndex++;
            } catch (error) {
              this.logger.error(`Failed to upload chunk ${chunkIndex}:`, error);
              reject(error);
            }
          }
        });

        stream.on("end", async () => {
          try {
            // Upload remaining chunks
            if (chunks.length > 0) {
              const chunkBuffer = Buffer.concat(chunks);
              const chunkKey = `${storageKey}_chunk_${chunkIndex}`;

              if (process.env.NODE_ENV === "local") {
                await this.minioService.uploadFile(
                  chunkKey,
                  chunkBuffer,
                  uploadSession.metadata.mimeType,
                );
              } else {
                await this.s3ClientService.uploadFile(
                  chunkKey,
                  chunkBuffer,
                  uploadSession.metadata.mimeType,
                );
              }

              await this.updateStreamProgress(uploadSession, chunkIndex, uploadedBytes);
            }

            // Assemble file from chunks
            await this.assembleFileFromChunks(uploadSession, storageKey, bucketName);

            // Mark as completed
            await this.uploadSessionRepository.update(uploadSession.id, {
              status: UploadStatus.COMPLETED,
              completedAt: new Date(),
              uploadedBytes,
            });

            const completedSession = await this.uploadSessionRepository.findOne({
              where: { id: uploadSession.id },
            });

            this.logger.log(
              `Streaming upload completed for session ${sessionId}: ${uploadedBytes} bytes`,
            );

            resolve(completedSession!);
          } catch (error) {
            this.logger.error(`Failed to complete streaming upload for session ${sessionId}:`, error);
            reject(error);
          }
        });

        stream.on("error", (error) => {
          this.logger.error(`Stream error for session ${sessionId}:`, error);
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`Failed to upload stream for session ${sessionId}:`, error);
      
      // Mark as failed
      await this.uploadSessionRepository.update(uploadSession.id, {
        status: UploadStatus.FAILED,
      });

      throw error;
    }
  }

  async resumeStreamingUpload(sessionId: string): Promise<{
    resumePosition: bigint;
    chunkIndex: number;
  }> {
    const uploadSession = await this.uploadSessionRepository.findOne({
      where: { sessionId },
    });

    if (!uploadSession) {
      throw new BadRequestException("Upload session not found");
    }

    if (uploadSession.status === UploadStatus.COMPLETED) {
      throw new BadRequestException("Upload session already completed");
    }

    // Calculate resume position
    const resumePosition = uploadSession.uploadedBytes;
    const chunkIndex = Math.floor(Number(uploadSession.uploadedBytes) / this.DEFAULT_CHUNK_SIZE);

    this.logger.log(
      `Resuming streaming upload for session ${sessionId} at position ${resumePosition} (chunk ${chunkIndex})`,
    );

    return { resumePosition, chunkIndex };
  }

  private async updateStreamProgress(
    uploadSession: FileUploadSession,
    chunkIndex: number,
    uploadedBytes: bigint,
  ): Promise<void> {
    await this.uploadSessionRepository.update(uploadSession.id, {
      uploadedChunks: chunkIndex + 1,
      uploadedBytes,
      updatedAt: new Date(),
    });
  }

  private async assembleFileFromChunks(
    uploadSession: FileUploadSession,
    storageKey: string,
    bucketName: string,
  ): Promise<void> {
    const totalChunks = Math.ceil(Number(uploadSession.totalSizeBytes) / this.DEFAULT_CHUNK_SIZE);
    const chunks: Buffer[] = [];

    this.logger.log(
      `Assembling file from ${totalChunks} chunks for session ${uploadSession.sessionId}`,
    );

    // Download all chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunkKey = `${storageKey}_chunk_${i}`;
      
      let chunkBuffer: Buffer;
      if (process.env.NODE_ENV === "local") {
        const stream = await this.minioService.downloadFile(chunkKey);
        chunkBuffer = await this.streamToBuffer(stream);
      } else {
        const stream = await this.s3ClientService.downloadFile(chunkKey);
        chunkBuffer = await this.streamToBuffer(stream);
      }

      chunks.push(chunkBuffer);
    }

    // Combine chunks into final file
    const finalFile = Buffer.concat(chunks);

    // Upload final file
    if (process.env.NODE_ENV === "local") {
      await this.minioService.uploadFile(
        storageKey,
        finalFile,
        uploadSession.metadata.mimeType,
      );
    } else {
      await this.s3ClientService.uploadFile(
        storageKey,
        finalFile,
        uploadSession.metadata.mimeType,
      );
    }

    // Clean up chunk files
    await this.cleanupChunkFiles(storageKey, totalChunks);

    this.logger.log(
      `File assembly completed for session ${uploadSession.sessionId}: ${finalFile.length} bytes`,
    );
  }

  private async cleanupChunkFiles(storageKey: string, totalChunks: number): Promise<void> {
    for (let i = 0; i < totalChunks; i++) {
      const chunkKey = `${storageKey}_chunk_${i}`;
      
      try {
        if (process.env.NODE_ENV === "local") {
          await this.minioService.deleteFile(chunkKey);
        } else {
          await this.s3ClientService.deleteFile(chunkKey);
        }
      } catch (error) {
        this.logger.warn(`Failed to cleanup chunk file ${chunkKey}:`, error);
      }
    }
  }

  private generateStorageKey(uploadSession: FileUploadSession): string {
    const timestamp = uploadSession.createdAt.getTime();
    const randomId = uploadSession.sessionId.split("_").pop();
    return `uploads/${uploadSession.uploadedById}/${timestamp}_${randomId}_${uploadSession.originalFileName}`;
  }

  private getBucketName(): string {
    if (process.env.NODE_ENV === "local") {
      return process.env.MINIO_BUCKET_NAME || "files";
    } else {
      return process.env.AWS_S3_BUCKET_NAME || "files";
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  async getStreamingStats(sessionId: string): Promise<{
    sessionId: string;
    isStreaming: boolean;
    uploadedBytes: bigint;
    totalBytes: bigint;
    progressPercentage: number;
    estimatedTimeRemaining?: number;
    uploadSpeed?: number;
  }> {
    const uploadSession = await this.uploadSessionRepository.findOne({
      where: { sessionId },
    });

    if (!uploadSession) {
      throw new BadRequestException("Upload session not found");
    }

    const isStreaming = uploadSession.status === UploadStatus.IN_PROGRESS;
    const progressPercentage = uploadSession.progressPercentage;

    // Calculate upload speed and estimated time remaining
    let estimatedTimeRemaining: number | undefined;
    let uploadSpeed: number | undefined;

    if (isStreaming && uploadSession.uploadedBytes > 0n) {
      const timeElapsed = Date.now() - uploadSession.createdAt.getTime();
      const timeElapsedSeconds = timeElapsed / 1000;
      uploadSpeed = Number(uploadSession.uploadedBytes) / timeElapsedSeconds;

      const remainingBytes = uploadSession.totalSizeBytes - uploadSession.uploadedBytes;
      estimatedTimeRemaining = Number(remainingBytes) / uploadSpeed;
    }

    return {
      sessionId: uploadSession.sessionId,
      isStreaming,
      uploadedBytes: uploadSession.uploadedBytes,
      totalBytes: uploadSession.totalSizeBytes,
      progressPercentage,
      estimatedTimeRemaining,
      uploadSpeed,
    };
  }
}
