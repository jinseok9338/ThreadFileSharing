import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadController } from './controllers/thread.controller';
import { ThreadService } from './thread.service';
import { Thread } from './entities/thread.entity';
import { ThreadParticipant } from './entities/thread-participant.entity';
import { ChatRoomModule } from '../chatroom/chatroom.module';

import { User } from '../user/entities/user.entity';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Thread, ThreadParticipant, User]),
    forwardRef(() => ChatRoomModule),
    PermissionModule,
  ],
  controllers: [ThreadController],
  providers: [ThreadService],
  exports: [ThreadService],
})
export class ThreadModule {}
