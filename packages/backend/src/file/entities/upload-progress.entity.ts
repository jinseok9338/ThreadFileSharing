import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { File } from './file.entity';
import { UploadSession } from './upload-session.entity';
import { User } from '../../user/entities/user.entity';

export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('upload_progress')
@Index(['uploadSessionId'])
@Index(['fileId'])
@Index(['userId'])
@Index(['status'])
export class UploadProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  uploadSessionId: string;

  @Column({ type: 'uuid', nullable: true })
  fileId?: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: UploadStatus,
    default: UploadStatus.PENDING,
  })
  status: UploadStatus;

  @Column({
    type: 'integer',
    default: 0,
  })
  progressPercentage: number;

  @Column({ type: 'bigint', default: 0 })
  bytesUploaded: number;

  @Column({ type: 'bigint' })
  totalBytes: number;

  @Column({ type: 'bigint', default: 0 })
  uploadSpeed: number;

  @Column({ type: 'integer', default: 0 })
  estimatedTimeRemaining: number;

  @Column({ type: 'integer', default: 0 })
  currentChunk: number;

  @Column({ type: 'integer', default: 0 })
  totalChunks: number;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  // Relationships
  @ManyToOne(
    () => UploadSession,
    (uploadSession) => uploadSession.uploadProgresses,
  )
  @JoinColumn({ name: 'uploadSessionId' })
  uploadSession: UploadSession;

  @ManyToOne(() => File, (file) => file.uploadProgresses)
  @JoinColumn({ name: 'fileId' })
  file?: File;

  @ManyToOne(() => User, (user) => user.uploadProgresses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
