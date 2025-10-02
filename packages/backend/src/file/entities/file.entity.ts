import { ChatRoom } from 'src/chatroom/entities/chatroom.entity';
import { Thread } from 'src/thread/entities/thread.entity';
import { User } from 'src/user/entities/user.entity';
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

@Entity('files')
@Index(['uploadedBy'])
@Index(['threadId'])
@Index(['chatroomId'])
@Index(['deletedAt'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  threadId: string;

  @Column({ type: 'uuid', nullable: true })
  chatroomId: string;

  @Column({ type: 'uuid' })
  uploadedBy: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 500 })
  storageKey: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  sizeBytes: bigint;

  @Column({ type: 'varchar', length: 255 })
  hash: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isProcessed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne('Thread', 'files')
  @JoinColumn({ name: 'threadId' })
  thread: Thread;

  @ManyToOne('ChatRoom', 'files')
  @JoinColumn({ name: 'chatroomId' })
  chatRoom: ChatRoom;

  @ManyToOne('User', 'files')
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;
}
