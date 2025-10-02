import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { CompanyInvitation } from '../invitation/entities/company-invitation.entity';
import { ThreadParticipant } from '../thread/entities/thread-participant.entity';
import { Team } from '../team/entities/team.entity';
import { TeamMember } from '../team/entities/team-member.entity';

export default registerAs(
  'database',
  (): PostgresConnectionOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'threadfilesharing',
    synchronize: false, // Always use migrations
    logging: process.env.NODE_ENV === 'local',
    entities: [
      User,
      Company,
      RefreshToken,
      CompanyInvitation,
      ThreadParticipant,
      Team,
      TeamMember,
    ],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false, // Run migrations manually
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  }),
);
