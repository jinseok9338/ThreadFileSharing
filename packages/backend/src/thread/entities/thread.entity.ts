import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
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
import { ThreadParticipant } from './thread-participant.entity';
import { ThreadMessage } from '../../thread-message/entities/thread-message.entity';
import { User } from '../../user/entities/user.entity';
import { File } from '../../file/entities/file.entity';
import { FileAssociation } from '../../file/entities/file-association.entity';

@Entity('threads')
@Index(['chatroomId'])
@Index(['createdBy'])
@Index(['deletedAt'])
export class Thread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chatroomId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'integer', default: 0 })
  participantCount: number;

  @Column({ type: 'integer', default: 0 })
  fileCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne('ChatRoom', 'threads')
  @JoinColumn({ name: 'chatroomId' })
  chatRoom: ChatRoom;

  @ManyToOne('User', 'threads')
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @OneToMany('ThreadParticipant', 'thread')
  participants: ThreadParticipant[];

  @OneToMany('ThreadMessage', 'thread')
  messages: ThreadMessage[];

  @OneToMany('File', 'thread')
  files: File[];

  @OneToMany(() => FileAssociation, (fileAssociation) => fileAssociation.thread)
  fileAssociations: FileAssociation[];
}
