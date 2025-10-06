import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WebSocketGateway } from './gateway/websocket.gateway';
import { WebSocketAuthService } from './services/websocket-auth.service';
import { WebSocketRoomService } from './services/websocket-room.service';
import { ThreadModule } from '../thread/thread.module';
import { MessageModule } from '../message/message.module';
import { ChatRoomModule } from '../chatroom/chatroom.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => ThreadModule),
    forwardRef(() => MessageModule),
    forwardRef(() => ChatRoomModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION'),
        },
      }),
    }),
  ],
  providers: [WebSocketGateway, WebSocketAuthService, WebSocketRoomService],
  exports: [WebSocketGateway, WebSocketAuthService, WebSocketRoomService],
})
export class WebSocketModule {}
