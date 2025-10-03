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
import { MessageType } from '../../message/entities/message.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { User } from '../../user/entities/user.entity';

@Entity('thread_messages')
@Index(['threadId'])
@Index(['senderId'])
@Index(['createdAt'])
export class ThreadMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  threadId: string;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne('Thread', 'messages')
  @JoinColumn({ name: 'threadId' })
  thread: Thread;

  @ManyToOne('User', 'threadMessages')
  @JoinColumn({ name: 'senderId' })
  sender: User;
}
