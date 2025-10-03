import { Company } from '../../company/entities/company.entity';
import { User } from '../../user/entities/user.entity';
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
import { ChatRoomMember } from './chatroom-member.entity';
import { Thread } from '../../thread/entities/thread.entity';
import { Message } from '../../message/entities/message.entity';
import { File } from '../../file/entities/file.entity';
import { FileAssociation } from '../../file/entities/file-association.entity';

@Entity('chatrooms')
@Index(['companyId'])
@Index(['createdBy'])
@Index(['deletedAt'])
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'integer', default: 0 })
  memberCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne('Company', 'chatRooms')
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne('User', 'chatRooms')
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @OneToMany('ChatRoomMember', 'chatRoom')
  members: ChatRoomMember[];

  @OneToMany('Thread', 'chatRoom')
  threads: Thread[];

  @OneToMany('Message', 'chatRoom')
  messages: Message[];

  @OneToMany(() => File, (file) => file.chatRoom)
  files: File[];

  @OneToMany(
    () => FileAssociation,
    (fileAssociation) => fileAssociation.chatRoom,
  )
  fileAssociations: FileAssociation[];
}
