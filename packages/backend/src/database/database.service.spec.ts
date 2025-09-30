import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  let mockDataSource: any;

  beforeEach(async () => {
    mockDataSource = {
      get isInitialized() {
        return this._isInitialized;
      },
      set isInitialized(value) {
        this._isInitialized = value;
      },
      _isInitialized: true,
      options: {
        database: 'threadfilesharing_local',
        host: 'localhost',
        port: 5432,
      },
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isConnected', () => {
    it('should return true when database is initialized', async () => {
      mockDataSource.isInitialized = true;

      const result = await service.isConnected();

      expect(result).toBe(true);
    });

    it('should return false when database is not initialized', async () => {
      mockDataSource.isInitialized = false;

      const result = await service.isConnected();

      expect(result).toBe(false);
    });

    it('should handle connection errors gracefully', async () => {
      Object.defineProperty(mockDataSource, 'isInitialized', {
        get: jest.fn(() => {
          throw new Error('Connection failed');
        }),
      });

      const result = await service.isConnected();

      expect(result).toBe(false);
    });
  });

  describe('getConnectionInfo', () => {
    it('should return connection information when connected', async () => {
      const expectedInfo = {
        connected: true,
        database: 'threadfilesharing_local',
        host: 'localhost',
        port: 5432,
      };

      mockDataSource.isInitialized = true;

      const result = await service.getConnectionInfo();

      expect(result).toEqual(expectedInfo);
    });

    it('should return error information when not connected', async () => {
      const expectedInfo = {
        connected: false,
        error: 'Database not connected',
      };

      mockDataSource.isInitialized = false;

      const result = await service.getConnectionInfo();

      expect(result).toEqual(expectedInfo);
    });
  });

  describe('testConnection', () => {
    it('should test database connection by executing a simple query', async () => {
      mockDataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.testConnection();

      expect(result).toBe(true);
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when query fails', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Query failed'));

      const result = await service.testConnection();

      expect(result).toBe(false);
    });
  });
});
