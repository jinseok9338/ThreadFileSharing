import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseService } from '../database/database.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  const mockHealthService = {
    getHealth: jest.fn(),
    getDatabaseHealth: jest.fn(),
    getReadiness: jest.fn(),
    getLiveness: jest.fn(),
  };

  const mockDatabaseService = {
    isConnected: jest.fn(),
    getConnectionInfo: jest.fn(),
    getMigrationStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const expectedResponse = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 12345,
        version: '1.0.0',
      };

      mockHealthService.getHealth.mockResolvedValue(expectedResponse);

      const result = await controller.getHealth();

      expect(result).toEqual(expectedResponse);
      expect(healthService.getHealth).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      mockHealthService.getHealth.mockRejectedValue(new Error('Service error'));

      await expect(controller.getHealth()).rejects.toThrow('Service error');
    });
  });

  describe('GET /health/database', () => {
    it('should return database health status', async () => {
      const expectedResponse = {
        status: 'ok',
        connection: {
          connected: true,
          database: 'threadfilesharing_local',
          host: 'localhost',
          port: 5432,
        },
        migrations: {
          pending: 0,
          executed: 1,
        },
      };

      mockHealthService.getDatabaseHealth.mockResolvedValue(expectedResponse);

      const result = await controller.getDatabaseHealth();

      expect(result).toEqual(expectedResponse);
      expect(healthService.getDatabaseHealth).toHaveBeenCalledTimes(1);
    });

    it('should return error status when database is not connected', async () => {
      const expectedResponse = {
        status: 'error',
        connection: {
          connected: false,
          error: 'Connection failed',
        },
        migrations: {
          pending: 0,
          executed: 0,
        },
      };

      mockHealthService.getDatabaseHealth.mockResolvedValue(expectedResponse);

      const result = await controller.getDatabaseHealth();

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status when all checks pass', async () => {
      const expectedResponse = {
        ready: true,
        checks: {
          database: true,
          migrations: true,
        },
      };

      mockHealthService.getReadiness.mockResolvedValue(expectedResponse);

      const result = await controller.getReadiness();

      expect(result).toEqual(expectedResponse);
      expect(healthService.getReadiness).toHaveBeenCalledTimes(1);
    });

    it('should return not ready when database check fails', async () => {
      const expectedResponse = {
        ready: false,
        checks: {
          database: false,
          migrations: true,
        },
      };

      mockHealthService.getReadiness.mockResolvedValue(expectedResponse);

      const result = await controller.getReadiness();

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const expectedResponse = {
        alive: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      mockHealthService.getLiveness.mockResolvedValue(expectedResponse);

      const result = await controller.getLiveness();

      expect(result).toEqual(expectedResponse);
      expect(healthService.getLiveness).toHaveBeenCalledTimes(1);
    });

    it('should always return alive unless application is shutting down', async () => {
      const expectedResponse = {
        alive: true,
        timestamp: expect.any(String),
      };

      mockHealthService.getLiveness.mockResolvedValue(expectedResponse);

      const result = await controller.getLiveness();

      expect(result.alive).toBe(true);
      expect(result.timestamp).toBeDefined();
    });
  });
});
