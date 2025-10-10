import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChatRoom } from './chatroom.entity';
import { User } from '../../user/entities/user.entity';

@Entity('chatroom_members')
@Index(['chatroomId', 'userId'], { unique: true })
export class ChatRoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chatroomId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt: Date;

  // Relations
  @ManyToOne('ChatRoom', 'members')
  @JoinColumn({ name: 'chatroomId' })
  chatRoom: ChatRoom;

  @ManyToOne('User', 'chatRoomMemberships')
  @JoinColumn({ name: 'userId' })
  user: User;
}
