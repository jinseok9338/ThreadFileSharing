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

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
}

@Entity('messages')
@Index(['chatroomId'])
@Index(['senderId'])
@Index(['createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chatroomId: string;

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
  @ManyToOne('ChatRoom', 'messages')
  @JoinColumn({ name: 'chatroomId' })
  chatRoom: any;

  @ManyToOne('User', 'messages')
  @JoinColumn({ name: 'senderId' })
  sender: any;
}
