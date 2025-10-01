import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum CompanyPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('companies')
@Index(['slug'], { unique: true })
@Index(['plan'])
@Index(['deleted_at'])
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: CompanyPlan,
    default: CompanyPlan.FREE,
  })
  plan: CompanyPlan;

  @Column({ type: 'integer', default: 100 })
  max_users: number;

  @Column({ type: 'bigint', default: 5368709120 }) // 5GB
  max_storage_bytes: bigint;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relations
  @OneToMany('User', 'company')
  users: any[];

  @OneToMany('Team', 'company')
  teams: any[];

  @OneToMany('CompanyInvitation', 'company')
  invitations: any[];
}
