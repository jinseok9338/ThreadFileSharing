import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, DatabaseService],
  exports: [HealthService],
})
export class HealthModule {}
