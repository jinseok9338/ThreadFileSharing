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
@Index(['teamId', 'userId'], { unique: true })
@Index(['userId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  joinedAt: Date;

  // Relations
  @ManyToOne(() => Team, (team) => team.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @ManyToOne(() => User, (user) => user.teamMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
