import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadController } from './thread.controller';
import { ThreadService } from './thread.service';
import { Thread } from './entities/thread.entity';
import { ThreadParticipant } from './entities/thread-participant.entity';
import { ChatRoomModule } from '../chatroom/chatroom.module';
import { PermissionService } from '../permission/permission.service';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Thread, ThreadParticipant, User]),
    ChatRoomModule,
  ],
  controllers: [ThreadController],
  providers: [ThreadService, PermissionService],
  exports: [ThreadService],
})
export class ThreadModule {}
