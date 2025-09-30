import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async isConnected(): Promise<boolean> {
    try {
      return this.dataSource.isInitialized;
    } catch (error) {
      return false;
    }
  }

  async getConnectionInfo(): Promise<{
    connected: boolean;
    database?: string;
    host?: string;
    port?: number;
    error?: string;
  }> {
    try {
      const isConnected = await this.isConnected();
      if (isConnected) {
        const options = this.dataSource.options as PostgresConnectionOptions;
        return {
          connected: true,
          database: options.database || 'unknown',
          host: options.host || 'unknown',
          port: options.port || 5432,
        };
      } else {
        return {
          connected: false,
          error: 'Database not connected',
        };
      }
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // 간단한 쿼리로 연결 테스트
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
