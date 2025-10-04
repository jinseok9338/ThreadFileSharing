import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { File } from '../../file/entities/file.entity';
import { UploadStatus } from '../../common/enums/upload-status.enum';

export interface ChunkMetadata {
  chunkIndex: number;
  size: number;
  checksum: string;
  uploadedAt: Date;
}

export interface FileMetadata {
  mimeType: string;
  originalSize: bigint;
  chunkSize: number;
  checksum: string;
  uploadStartedAt: Date;
  uploadCompletedAt?: Date;
}

@Entity('file_upload_sessions')
@Index(['uploadedById', 'status'])
@Index(['chatroomId', 'status'])
@Index(['threadId', 'status'])
@Index(['expiresAt'])
export class FileUploadSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sessionId: string;

  @Column()
  originalFileName: string;

  @Column({ type: 'bigint' })
  totalSizeBytes: bigint;

  @Column({ type: 'int', default: 0 })
  uploadedChunks: number;

  @Column({ type: 'int' })
  totalChunks: number;

  @Column({ type: 'bigint', default: 0 })
  uploadedBytes: bigint;

  @Column({ type: 'enum', enum: UploadStatus, default: UploadStatus.PENDING })
  status: UploadStatus;

  @Column({ type: 'jsonb', default: '[]' })
  chunkMetadata: ChunkMetadata[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: FileMetadata;

  @ManyToOne(() => User, (user) => user.uploadSessions)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ name: 'uploadedById' })
  uploadedById: string;

  @ManyToOne(() => ChatRoom, {
    nullable: true,
  })
  @JoinColumn({ name: 'chatroomId' })
  chatroom: ChatRoom;

  @Column({ name: 'chatroomId', nullable: true })
  chatroomId: string;

  @ManyToOne(() => Thread, {
    nullable: true,
  })
  @JoinColumn({ name: 'threadId' })
  thread: Thread;

  @Column({ name: 'threadId', nullable: true })
  threadId: string;

  @OneToOne(() => File, { nullable: true })
  file: File;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  // Helper methods
  get progressPercentage(): number {
    if (this.totalSizeBytes === BigInt(0)) return 0;
    const percentage = Number(
      (BigInt(this.uploadedBytes) * BigInt(100)) / BigInt(this.totalSizeBytes),
    );
    // Cap at 100% to prevent showing more than 100% progress
    return Math.min(percentage, 100);
  }

  get isCompleted(): boolean {
    return this.status === UploadStatus.COMPLETED;
  }

  get isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  get remainingBytes(): bigint {
    return BigInt(this.totalSizeBytes) - BigInt(this.uploadedBytes);
  }
}
