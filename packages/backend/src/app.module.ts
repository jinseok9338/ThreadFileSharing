import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      // 상위 디렉토리의 환경 파일들을 읽도록 설정
      envFilePath: [
        path.resolve(__dirname, '../../../.env.local'),
        path.resolve(__dirname, '../../../.env.development'),
        path.resolve(__dirname, '../../../.env.staging'),
        path.resolve(__dirname, '../../../.env.production'),
        path.resolve(__dirname, '../../../.env'),
      ],
      isGlobal: true, // 전역에서 사용 가능하도록 설정
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
