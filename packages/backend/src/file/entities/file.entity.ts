import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
import { User } from '../../user/entities/user.entity';
import { FileAssociation } from './file-association.entity';
import { UploadProgress } from './upload-progress.entity';
import { DownloadToken } from './download-token.entity';

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('files')
@Index(['companyId'])
@Index(['threadId'])
@Index(['chatroomId'])
@Index(['uploadedBy'])
@Index(['hash'])
@Index(['storageKey'])
@Index(['createdAt'])
@Index(['deletedAt'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  threadId?: string;

  @Column({ type: 'uuid', nullable: true })
  chatroomId?: string;

  @Column({ type: 'uuid' })
  uploadedBy: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayName?: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @Column({ type: 'varchar', length: 64 })
  hash: string;

  @Column({ type: 'varchar', length: 500 })
  storageKey: string;

  @Column({ type: 'varchar', length: 100 })
  storageBucket: string;

  @Column({ type: 'text', nullable: true })
  downloadUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'boolean', default: false })
  isProcessed: boolean;

  @Column({
    type: 'enum',
    enum: ProcessingStatus,
    default: ProcessingStatus.PENDING,
  })
  processingStatus: ProcessingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => Company, (company) => company.files)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Thread, (thread) => thread.files)
  @JoinColumn({ name: 'threadId' })
  thread?: Thread;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.files)
  @JoinColumn({ name: 'chatroomId' })
  chatRoom?: ChatRoom;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  @OneToMany(() => FileAssociation, (association) => association.file)
  associations: FileAssociation[];

  @OneToMany(() => UploadProgress, (progress) => progress.file)
  uploadProgresses: UploadProgress[];

  @OneToMany(() => DownloadToken, (token) => token.file)
  downloadTokens: DownloadToken[];
}
