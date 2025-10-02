import { ChatRoom } from 'src/chatroom/entities/chatroom.entity';
import { CompanyInvitation } from 'src/invitation/entities/company-invitation.entity';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

export enum CompanyPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('companies')
@Index(['slug'], { unique: true })
@Index(['deletedAt'])
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: CompanyPlan,
    default: CompanyPlan.FREE,
  })
  plan: CompanyPlan;

  @Column({ type: 'integer', default: 100 })
  maxUsers: number;

  @Column({ type: 'bigint', default: 5368709120 }) // 5GB
  maxStorageBytes: bigint;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.company)
  chatRooms: ChatRoom[];

  @OneToMany(
    () => CompanyInvitation,
    (companyInvitation) => companyInvitation.company,
  )
  invitations: CompanyInvitation[];

  @OneToMany(() => Team, (team) => team.company)
  teams: Team[];
}
