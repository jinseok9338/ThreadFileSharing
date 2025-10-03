import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { UploadProgress } from './upload-progress.entity';

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity('upload_session')
@Index(['userId'])
@Index(['companyId'])
@Index(['status'])
export class UploadSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  sessionName?: string;

  @Column({ type: 'integer', default: 0 })
  totalFiles: number;

  @Column({ type: 'integer', default: 0 })
  completedFiles: number;

  @Column({ type: 'integer', default: 0 })
  failedFiles: number;

  @Column({ type: 'bigint', default: 0 })
  totalSize: number;

  @Column({ type: 'bigint', default: 0 })
  uploadedSize: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.uploadSessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Company, (company) => company.uploadSessions)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => UploadProgress, (progress) => progress.uploadSession)
  uploadProgresses: UploadProgress[];
}
