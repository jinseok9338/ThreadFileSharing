import { ChatRoom } from '../../chatroom/entities/chatroom.entity';
import { CompanyInvitation } from '../../invitation/entities/company-invitation.entity';
import { Team } from '../../team/entities/team.entity';
import { User } from '../../user/entities/user.entity';
import { File } from '../../file/entities/file.entity';
import { UploadSession } from '../../file/entities/upload-session.entity';
import { StorageQuota } from '../../file/entities/storage-quota.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
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

  @Column({ type: 'bigint', default: 53687091200 }) // 50GB
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

  @OneToMany(() => File, (file) => file.company)
  files: File[];

  @OneToMany(() => UploadSession, (uploadSession) => uploadSession.company)
  uploadSessions: UploadSession[];

  @OneToOne(() => StorageQuota, (storageQuota) => storageQuota.company)
  storageQuota: StorageQuota;
}
