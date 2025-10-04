import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { ChatRoomModule } from '../chatroom/chatroom.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    forwardRef(() => ChatRoomModule),
    PermissionModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
