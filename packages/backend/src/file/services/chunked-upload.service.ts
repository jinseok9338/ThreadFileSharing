import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  FileUploadSession,
  ChunkMetadata,
} from '../entities/file-upload-session.entity';
import { UploadStatus } from '../../common/enums/upload-status.enum';
import { InitiateUploadDto } from '../dto/initiate-upload.dto';
import { UploadChunkDto } from '../dto/upload-chunk.dto';
import { UploadProgressService } from './upload-progress.service';

@Injectable()
export class ChunkedUploadService {
  constructor(
    @InjectRepository(FileUploadSession)
    private readonly uploadSessionRepository: Repository<FileUploadSession>,
    private readonly uploadProgressService: UploadProgressService,
  ) {}

  async initiateUpload(
    initiateDto: InitiateUploadDto,
    userId: string,
  ): Promise<FileUploadSession> {
    // Calculate number of chunks
    const totalChunks = Math.ceil(
      initiateDto.totalSizeBytes / initiateDto.chunkSizeBytes,
    );

    // Generate unique session ID
    const sessionId = `upload_session_${randomUUID()}`;

    // Set expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create upload session
    const uploadSession = this.uploadSessionRepository.create({
      sessionId,
      originalFileName: initiateDto.fileName,
      totalSizeBytes: BigInt(initiateDto.totalSizeBytes),
      totalChunks,
      uploadedChunks: 0,
      uploadedBytes: BigInt(0),
      status: UploadStatus.PENDING,
      chunkMetadata: [],
      metadata: {
        mimeType: initiateDto.mimeType,
        originalSize: BigInt(initiateDto.totalSizeBytes),
        chunkSize: initiateDto.chunkSizeBytes,
        checksum: initiateDto.checksum,
        uploadStartedAt: new Date(),
      },
      uploadedById: userId,
      chatroomId: initiateDto.chatroomId,
      threadId: initiateDto.threadId,
      expiresAt,
    });

    const savedSession = await this.uploadSessionRepository.save(uploadSession);

    // Initialize progress tracking
    await this.uploadProgressService.updateProgress(savedSession);

    return savedSession;
  }

  async uploadChunk(chunkDto: UploadChunkDto): Promise<FileUploadSession> {
    // Find the upload session
    const uploadSession = await this.uploadSessionRepository.findOne({
      where: { sessionId: chunkDto.sessionId },
    });

    if (!uploadSession) {
      throw new NotFoundException('Upload session not found');
    }

    // Validate session status
    if (uploadSession.status === UploadStatus.COMPLETED) {
      throw new BadRequestException('Upload session already completed');
    }

    if (uploadSession.status === UploadStatus.CANCELLED) {
      throw new BadRequestException('Upload session has been cancelled');
    }

    if (uploadSession.isExpired) {
      throw new BadRequestException('Upload session has expired');
    }

    // Validate chunk sequence
    if (chunkDto.chunkIndex !== uploadSession.uploadedChunks) {
      throw new BadRequestException(
        `Invalid chunk sequence. Expected chunk ${uploadSession.uploadedChunks}, got ${chunkDto.chunkIndex}`,
      );
    }

    // Validate chunk size (except for the last chunk)
    if (
      !chunkDto.isFinalChunk &&
      chunkDto.chunkSizeBytes !== uploadSession.metadata.chunkSize
    ) {
      throw new BadRequestException('Invalid chunk size');
    }

    // TODO: Validate chunk checksum
    // const calculatedChecksum = await this.calculateChunkChecksum(chunkDto.chunkData);
    // if (calculatedChecksum !== chunkDto.chunkChecksum) {
    //   throw new BadRequestException("Chunk checksum validation failed");
    // }

    // Create chunk metadata
    const chunkMetadata: ChunkMetadata = {
      chunkIndex: chunkDto.chunkIndex,
      size: chunkDto.chunkSizeBytes,
      checksum: chunkDto.chunkChecksum,
      uploadedAt: new Date(),
    };

    // Update session
    const updatedChunkMetadata = [
      ...uploadSession.chunkMetadata,
      chunkMetadata,
    ];
    const newUploadedBytes =
      uploadSession.uploadedBytes + BigInt(chunkDto.chunkSizeBytes);
    const newUploadedChunks = uploadSession.uploadedChunks + 1;

    // Determine new status
    let newStatus: UploadStatus = uploadSession.status;
    if (newStatus === UploadStatus.PENDING) {
      newStatus = UploadStatus.IN_PROGRESS;
    }

    if (
      chunkDto.isFinalChunk ||
      newUploadedChunks === uploadSession.totalChunks
    ) {
      newStatus = UploadStatus.COMPLETED;
    }

    // Update the session
    await this.uploadSessionRepository.update(uploadSession.id, {
      uploadedChunks: newUploadedChunks,
      uploadedBytes: newUploadedBytes,
      chunkMetadata: updatedChunkMetadata,
      status: newStatus,
      completedAt:
        newStatus === UploadStatus.COMPLETED ? new Date() : undefined,
    });

    // Get updated session
    const updatedSession = await this.uploadSessionRepository.findOne({
      where: { id: uploadSession.id },
    });

    if (!updatedSession) {
      throw new BadRequestException('Failed to retrieve updated session');
    }

    // Update progress tracking
    await this.uploadProgressService.updateProgress(updatedSession);

    // Broadcast progress update
    await this.uploadProgressService.broadcastProgress(updatedSession);

    return updatedSession;
  }

  async getUploadSession(sessionId: string): Promise<FileUploadSession> {
    const uploadSession = await this.uploadSessionRepository.findOne({
      where: { sessionId },
    });

    if (!uploadSession) {
      throw new NotFoundException('Upload session not found');
    }

    return uploadSession;
  }

  async cancelUpload(sessionId: string): Promise<FileUploadSession> {
    const uploadSession = await this.uploadSessionRepository.findOne({
      where: { sessionId },
    });

    if (!uploadSession) {
      throw new NotFoundException('Upload session not found');
    }

    if (uploadSession.status === UploadStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed upload session');
    }

    // Update status to cancelled
    await this.uploadSessionRepository.update(uploadSession.id, {
      status: UploadStatus.CANCELLED,
    });

    // Get updated session
    const updatedSession = await this.uploadSessionRepository.findOne({
      where: { id: uploadSession.id },
    });

    if (!updatedSession) {
      throw new BadRequestException('Failed to retrieve updated session');
    }

    // Broadcast cancellation
    await this.uploadProgressService.broadcastProgress(updatedSession);

    return updatedSession;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.uploadSessionRepository.find({
      where: {
        expiresAt: LessThan(new Date()),
        status: In([UploadStatus.PENDING, UploadStatus.IN_PROGRESS]),
      },
    });

    if (expiredSessions.length > 0) {
      await this.uploadSessionRepository.update(
        { id: In(expiredSessions.map((s) => s.id)) },
        { status: UploadStatus.CANCELLED },
      );
    }

    return expiredSessions.length;
  }

  private async calculateChunkChecksum(chunkData: string): Promise<string> {
    // TODO: Implement actual checksum calculation
    // This would typically use crypto.createHash('sha256').update(buffer).digest('hex')
    return `sha256:${chunkData.slice(0, 16)}`;
  }
}
