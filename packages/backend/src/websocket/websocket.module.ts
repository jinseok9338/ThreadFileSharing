import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { WebSocketGateway } from './gateway/websocket.gateway';
import { WebSocketAuthService } from './services/websocket-auth.service';
import { WebSocketRoomService } from './services/websocket-room.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}), // Will use global JWT configuration
  ],
  providers: [WebSocketGateway, WebSocketAuthService, WebSocketRoomService],
  exports: [WebSocketGateway, WebSocketAuthService, WebSocketRoomService],
})
export class WebSocketModule {}
