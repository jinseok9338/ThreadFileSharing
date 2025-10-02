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
import { CompanyRole } from '../../constants/permissions';
import { Company } from 'src/company/entities/company.entity';
import { User } from 'src/user/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Entity('company_invitations')
@Index(['companyId'])
@Index(['email'])
@Index(['status'])
export class CompanyInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({
    type: 'enum',
    enum: CompanyRole,
    default: CompanyRole.MEMBER,
  })
  companyRole: CompanyRole;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ type: 'varchar', length: 255 })
  invitationToken: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  invitedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Company', 'invitations')
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne('User', 'sentInvitations')
  @JoinColumn({ name: 'invitedBy' })
  inviter: User;
}
