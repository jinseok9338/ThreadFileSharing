import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  HealthResponseDto,
  DatabaseHealthResponseDto,
  ReadinessResponseDto,
  LivenessResponseDto,
} from './dto/health.dto';

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getHealth(): Promise<HealthResponseDto> {
    const uptime = process.uptime();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async getDatabaseHealth(): Promise<DatabaseHealthResponseDto> {
    try {
      const connectionInfo = await this.databaseService.getConnectionInfo();

      if (connectionInfo.connected) {
        return {
          status: 'ok',
          connection: connectionInfo,
          migrations: {
            pending: 0,
            executed: 0,
          },
        };
      } else {
        return {
          status: 'error',
          connection: connectionInfo,
          migrations: {
            pending: 0,
            executed: 0,
          },
        };
      }
    } catch (error) {
      return {
        status: 'error',
        connection: {
          connected: false,
          error: error.message,
        },
        migrations: {
          pending: 0,
          executed: 0,
        },
      };
    }
  }

  async getReadiness(): Promise<ReadinessResponseDto> {
    try {
      const isConnected = await this.databaseService.isConnected();

      return {
        ready: isConnected,
        checks: {
          database: isConnected,
          migrations: true, // 마이그레이션은 더 이상 체크하지 않음
        },
      };
    } catch (error) {
      return {
        ready: false,
        checks: {
          database: false,
          migrations: false,
        },
      };
    }
  }

  async getLiveness(): Promise<LivenessResponseDto> {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
    };
  }
}
