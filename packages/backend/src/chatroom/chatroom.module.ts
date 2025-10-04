import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatroomController } from './controllers/chatroom.controller';
import { ChatRoomService } from './chatroom.service';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatRoomMember } from './entities/chatroom-member.entity';

import { User } from '../user/entities/user.entity';
import { ThreadParticipant } from '../thread/entities/thread-participant.entity';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom,
      ChatRoomMember,
      User,
      ThreadParticipant,
    ]),
    PermissionModule,
  ],
  controllers: [ChatroomController],
  providers: [ChatRoomService],
  exports: [ChatRoomService],
})
export class ChatRoomModule {}
