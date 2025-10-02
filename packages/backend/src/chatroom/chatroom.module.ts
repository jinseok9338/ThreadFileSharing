import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomController } from './chatroom.controller';
import { ChatRoomService } from './chatroom.service';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatRoomMember } from './entities/chatroom-member.entity';
import { PermissionService } from '../permission/permission.service';
import { User } from '../user/entities/user.entity';
import { ThreadParticipant } from '../thread/entities/thread-participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoom,
      ChatRoomMember,
      User,
      ThreadParticipant,
    ]),
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, PermissionService],
  exports: [ChatRoomService],
})
export class ChatRoomModule {}
