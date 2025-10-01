import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ThreadRole {
  OWNER = 'owner',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

@Entity('thread_participants')
@Index(['thread_id', 'user_id'], { unique: true })
@Index(['user_id'])
export class ThreadParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  thread_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: ThreadRole,
    default: ThreadRole.MEMBER,
  })
  role: ThreadRole;

  @Column({ type: 'boolean', default: true })
  can_upload: boolean;

  @Column({ type: 'boolean', default: true })
  can_comment: boolean;

  @Column({ type: 'boolean', default: false })
  can_invite: boolean;

  @CreateDateColumn()
  joined_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_read_at: Date;

  // Relations
  // Note: Thread entity will be created in future feature
  // @ManyToOne(() => Thread, (thread) => thread.participants, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'thread_id' })
  // thread: Thread;

  @ManyToOne(() => User, (user) => user.thread_participations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
