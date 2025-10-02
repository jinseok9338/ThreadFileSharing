import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../common/decorators';
import { HealthService } from './health.service';
import {
  HealthResponseDto,
  DatabaseHealthResponseDto,
  ReadinessResponseDto,
  LivenessResponseDto,
} from './dto/health.dto';

@ApiTags('health')
@ApiExtraModels(
  HealthResponseDto,
  DatabaseHealthResponseDto,
  ReadinessResponseDto,
  LivenessResponseDto,
)
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: '기본 헬스체크',
    description: '애플리케이션의 기본 상태를 확인합니다.',
  })
  @ApiSuccessResponse(HealthResponseDto, {
    status: 200,
    description: '애플리케이션이 정상 작동 중입니다.',
  })
  async getHealth(): Promise<HealthResponseDto> {
    return this.healthService.getHealth();
  }

  @Get('database')
  @ApiOperation({
    summary: '데이터베이스 헬스체크',
    description: '데이터베이스 연결 상태와 마이그레이션 정보를 확인합니다.',
  })
  @ApiSuccessResponse(DatabaseHealthResponseDto, {
    status: 200,
    description: '데이터베이스가 정상 작동 중입니다.',
  })
  async getDatabaseHealth(): Promise<DatabaseHealthResponseDto> {
    return this.healthService.getDatabaseHealth();
  }

  @Get('ready')
  @ApiOperation({
    summary: '준비 상태 확인',
    description: '애플리케이션이 요청을 처리할 준비가 되었는지 확인합니다.',
  })
  @ApiSuccessResponse(ReadinessResponseDto, {
    status: 200,
    description: '애플리케이션이 준비되었습니다.',
  })
  async getReadiness(): Promise<ReadinessResponseDto> {
    return this.healthService.getReadiness();
  }

  @Get('live')
  @ApiOperation({
    summary: '생존 상태 확인',
    description: '애플리케이션이 살아있는지 확인합니다.',
  })
  @ApiSuccessResponse(LivenessResponseDto, {
    status: 200,
    description: '애플리케이션이 살아있습니다.',
  })
  async getLiveness(): Promise<LivenessResponseDto> {
    return this.healthService.getLiveness();
  }
}
