import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CompanyRole } from '../../constants/permissions';
import { Company } from '../../company/entities/company.entity';
import { ChatRoomMember } from '../../chatroom/entities/chatroom-member.entity';
import { ThreadParticipant } from '../../thread/entities/thread-participant.entity';
import { Message } from '../../message/entities/message.entity';
import { ThreadMessage } from '../../thread-message/entities/thread-message.entity';
import { File } from '../../file/entities/file.entity';
import { RefreshToken } from '../../refresh-token/entities/refresh-token.entity';
import { CompanyInvitation } from '../../invitation/entities/company-invitation.entity';
import { TeamMember } from '../../team/entities/team-member.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['companyId'])
@Index(['deletedAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: CompanyRole,
    default: CompanyRole.MEMBER,
  })
  companyRole: CompanyRole;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => ChatRoomMember, (chatRoomMember) => chatRoomMember.user)
  chatRoomMemberships: ChatRoomMember[];

  @OneToMany(
    () => ThreadParticipant,
    (threadParticipant) => threadParticipant.user,
  )
  threadParticipants: ThreadParticipant[];

  @OneToMany(
    () => ThreadParticipant,
    (threadParticipant) => threadParticipant.sharedBy,
  )
  sharedThreads: ThreadParticipant[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => ThreadMessage, (threadMessage) => threadMessage.sender)
  threadMessages: ThreadMessage[];

  @OneToMany(() => File, (file) => file.uploadedBy)
  files: File[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(
    () => CompanyInvitation,
    (companyInvitation) => companyInvitation.invitedBy,
  )
  createdInvitations: CompanyInvitation[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  teamMemberships: TeamMember[];
}
