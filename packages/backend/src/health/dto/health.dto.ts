import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: '애플리케이션 상태',
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    description: '체크 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: '애플리케이션 실행 시간 (초)',
    example: 123.456,
  })
  uptime: number;

  @ApiProperty({
    description: '애플리케이션 버전',
    example: '1.0.0',
  })
  version: string;
}

export class DatabaseConnectionDto {
  @ApiProperty({
    description: '데이터베이스 연결 상태',
    example: true,
  })
  connected: boolean;

  @ApiProperty({
    description: '데이터베이스 이름',
    example: 'threadfilesharing_local',
  })
  database?: string;

  @ApiProperty({
    description: '데이터베이스 호스트',
    example: 'localhost',
  })
  host?: string;

  @ApiProperty({
    description: '데이터베이스 포트',
    example: 5432,
  })
  port?: number;

  @ApiProperty({
    description: '연결 오류 메시지',
    example: 'Connection failed',
    required: false,
  })
  error?: string;
}

export class MigrationStatusDto {
  @ApiProperty({
    description: '실행된 마이그레이션 수',
    example: 1,
  })
  executed: number;

  @ApiProperty({
    description: '대기 중인 마이그레이션 수',
    example: 0,
  })
  pending: number;

  @ApiProperty({
    description: '마이그레이션 목록',
    type: 'array',
    items: {
      type: 'object',
    },
    required: false,
  })
  migrations?: any[];
}

export class DatabaseHealthResponseDto {
  @ApiProperty({
    description: '데이터베이스 상태',
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    description: '데이터베이스 연결 정보',
    type: DatabaseConnectionDto,
  })
  connection: DatabaseConnectionDto;

  @ApiProperty({
    description: '마이그레이션 상태',
    type: MigrationStatusDto,
  })
  migrations: MigrationStatusDto;
}

export class ReadinessChecksDto {
  @ApiProperty({
    description: '데이터베이스 준비 상태',
    example: true,
  })
  database: boolean;

  @ApiProperty({
    description: '마이그레이션 준비 상태',
    example: true,
  })
  migrations: boolean;
}

export class ReadinessResponseDto {
  @ApiProperty({
    description: '애플리케이션 준비 상태',
    example: true,
  })
  ready: boolean;

  @ApiProperty({
    description: '각 구성 요소별 준비 상태',
    type: ReadinessChecksDto,
  })
  checks: ReadinessChecksDto;
}

export class LivenessResponseDto {
  @ApiProperty({
    description: '애플리케이션 생존 상태',
    example: true,
  })
  alive: boolean;

  @ApiProperty({
    description: '체크 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;
}
