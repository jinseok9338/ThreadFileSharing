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
import { File } from './file.entity';
import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { User } from '../../user/entities/user.entity';

export enum AccessType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  RESTRICTED = 'RESTRICTED',
}

@Entity('file_association')
@Index(['fileId'])
@Index(['chatroomId'])
@Index(['threadId'])
@Index(['sharedBy'])
export class FileAssociation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fileId: string;

  @Column({ type: 'uuid', nullable: true })
  chatroomId?: string;

  @Column({ type: 'uuid', nullable: true })
  threadId?: string;

  @Column({ type: 'uuid' })
  sharedBy: string;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.PRIVATE,
  })
  accessType: AccessType;

  @Column({ type: 'jsonb', nullable: true })
  permissions?: Record<string, unknown>;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => File, (file) => file.associations)
  @JoinColumn({ name: 'fileId' })
  file: File;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.fileAssociations)
  @JoinColumn({ name: 'chatroomId' })
  chatRoom?: ChatRoom;

  @ManyToOne(() => Thread, (thread) => thread.fileAssociations)
  @JoinColumn({ name: 'threadId' })
  thread?: Thread;

  @ManyToOne(() => User, (user) => user.sharedFiles)
  @JoinColumn({ name: 'sharedBy' })
  sharer: User;
}
