import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { File } from './file.entity';
import { User } from '../../user/entities/user.entity';

@Entity('download_token')
@Index(['fileId'])
@Index(['userId'])
@Index(['token'], { unique: true })
@Index(['expiresAt'])
export class DownloadToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fileId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'integer', default: 0 })
  downloadCount: number;

  @Column({ type: 'integer', default: 1 })
  maxDownloads: number;

  @Column({ type: 'inet', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  // Relationships
  @ManyToOne(() => File, (file) => file.downloadTokens)
  @JoinColumn({ name: 'fileId' })
  file: File;

  @ManyToOne(() => User, (user) => user.downloadTokens)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Computed properties
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isMaxDownloadsReached(): boolean {
    return this.downloadCount >= this.maxDownloads;
  }

  get isValid(): boolean {
    return !this.isExpired && !this.isMaxDownloadsReached;
  }

  get remainingDownloads(): number {
    return Math.max(0, this.maxDownloads - this.downloadCount);
  }
}
