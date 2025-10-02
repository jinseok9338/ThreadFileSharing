import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ThreadRole, AccessType } from '../../constants/permissions';
import { User } from '../../user/entities/user.entity';

@Entity('thread_participants')
@Index(['threadId', 'userId'], { unique: true })
export class ThreadParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  threadId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['owner', 'member', 'viewer'],
    default: 'member',
  })
  role: string;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.MEMBER,
  })
  accessType: AccessType;

  @Column({
    type: 'enum',
    enum: ThreadRole,
    default: ThreadRole.MEMBER,
  })
  threadRole: ThreadRole;

  @Column({ type: 'boolean', default: true })
  canUpload: boolean;

  @Column({ type: 'boolean', default: true })
  canComment: boolean;

  @Column({ type: 'boolean', default: false })
  canInvite: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt: Date;

  @Column({ type: 'uuid', nullable: true })
  sharedByUserId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sharedByUsername: string;

  @Column({ type: 'timestamp', nullable: true })
  sharedAt: Date;

  // Relations
  // Note: Thread entity will be properly typed when Thread entity is fully defined
  // @ManyToOne(() => Thread, (thread) => thread.participants, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'threadId' })
  // thread: Thread;

  @ManyToOne(() => User, (user) => user.threadParticipants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, (user) => user.sharedThreads, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sharedByUserId' })
  sharedBy: User;
}
