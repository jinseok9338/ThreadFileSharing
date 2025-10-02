import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { CompanyInvitation } from '../invitation/entities/company-invitation.entity';
import { ThreadParticipant } from '../thread/entities/thread-participant.entity';
import { Team } from '../team/entities/team.entity';
import { TeamMember } from '../team/entities/team-member.entity';
import { ChatRoom } from '../chatroom/entities/chatroom.entity';
import { ChatRoomMember } from '../chatroom/entities/chatroom-member.entity';
import { Thread } from '../thread/entities/thread.entity';
import { File } from '../file/entities/file.entity';
import { Message } from '../message/entities/message.entity';
import { ThreadMessage } from '../thread-message/entities/thread-message.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'password'),
        database: configService.get<string>(
          'DATABASE_NAME',
          'threadfilesharing',
        ),
        entities: [
          User,
          Company,
          RefreshToken,
          CompanyInvitation,
          ThreadParticipant,
          Team,
          TeamMember,
          ChatRoom,
          ChatRoomMember,
          Thread,
          ThreadParticipant,
          File,
          Message,
          ThreadMessage,
        ],
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'local',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
