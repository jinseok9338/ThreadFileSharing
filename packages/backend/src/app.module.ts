import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { InvitationModule } from './invitation/invitation.module';
import { ChatRoomModule } from './chatroom/chatroom.module';
import { ThreadModule } from './thread/thread.module';
import { MessageModule } from './message/message.module';
import { FileModule } from './file/file.module';
import { WebSocketModule } from './websocket/websocket.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Backend 프로젝트 내부의 환경 파일 사용
      envFilePath: [
        path.resolve(__dirname, '../.env.local'),
        path.resolve(__dirname, '../.env.development'),
        path.resolve(__dirname, '../.env.staging'),
        path.resolve(__dirname, '../.env.production'),
        path.resolve(__dirname, '../.env'),
      ],
      isGlobal: true, // 전역에서 사용 가능하도록 설정
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        {
          ttl: 60000, // 60 seconds
          limit: 100, // 100 requests per 60 seconds
        },
      ],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    CompanyModule,
    UserModule,
    InvitationModule,
    ChatRoomModule,
    ThreadModule,
    MessageModule,
    FileModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
