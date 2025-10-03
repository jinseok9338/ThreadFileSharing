import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('storage_quota')
@Index(['companyId'], { unique: true })
export class StorageQuota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  companyId: string;

  @Column({ type: 'bigint' })
  storageLimitBytes: number;

  @Column({ type: 'bigint', default: 0 })
  storageUsedBytes: number;

  @Column({ type: 'integer', default: 0 })
  fileCount: number;

  @UpdateDateColumn()
  lastCalculatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Company, (company) => company.storageQuota)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Computed properties
  get storageUsedPercent(): number {
    if (this.storageLimitBytes === 0) return 0;
    return (this.storageUsedBytes / this.storageLimitBytes) * 100;
  }

  get storageRemainingBytes(): number {
    return Math.max(0, this.storageLimitBytes - this.storageUsedBytes);
  }

  get isQuotaExceeded(): boolean {
    return this.storageUsedBytes > this.storageLimitBytes;
  }

  get isQuotaWarning(): boolean {
    const warningThreshold = 0.8; // 80%
    return this.storageUsedPercent >= warningThreshold * 100;
  }
}
