import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getBasicHealth();
  }

  @Get('database')
  getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }

  @Get('ready')
  getReadiness() {
    return this.healthService.getReadiness();
  }

  @Get('live')
  getLiveness() {
    return this.healthService.getLiveness();
  }
}
