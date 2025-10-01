import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../user/entities/user.entity';

@Entity('team_members')
@Index(['team_id', 'user_id'], { unique: true })
@Index(['user_id'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  team_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn()
  joined_at: Date;

  // Relations
  @ManyToOne(() => Team, (team) => team.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, (user) => user.team_memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
