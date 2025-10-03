import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UploadProgressService } from '../../file/services/upload-progress.service';
import { WebSocketGateway } from '../../websocket/gateway/websocket.gateway';

import { UploadProgress } from '../../file/entities/upload-progress.entity';
import { UploadSession } from '../../file/entities/upload-session.entity';
import { File } from '../../file/entities/file.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

describe('UploadProgressService', () => {
  let service: UploadProgressService;
  let uploadProgressRepository: Repository<UploadProgress>;
  let uploadSessionRepository: Repository<UploadSession>;
  let fileRepository: Repository<File>;
  let userRepository: Repository<User>;
  let websocketGateway: WebSocketGateway;

  const mockUploadProgressRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUploadSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockFileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockWebSocketGateway = {
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadProgressService,
        {
          provide: getRepositoryToken(UploadProgress),
          useValue: mockUploadProgressRepository,
        },
        {
          provide: getRepositoryToken(UploadSession),
          useValue: mockUploadSessionRepository,
        },
        {
          provide: getRepositoryToken(File),
          useValue: mockFileRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: WebSocketGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<UploadProgressService>(UploadProgressService);
    uploadProgressRepository = module.get<Repository<UploadProgress>>(
      getRepositoryToken(UploadProgress),
    );
    uploadSessionRepository = module.get<Repository<UploadSession>>(
      getRepositoryToken(UploadSession),
    );
    fileRepository = module.get<Repository<File>>(getRepositoryToken(File));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    websocketGateway = module.get<WebSocketGateway>(WebSocketGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    it('should update upload progress successfully', async () => {
      const mockProgress = {
        id: 'progress-123',
        fileId: 'file-123',
        sessionId: 'session-123',
        status: 'IN_PROGRESS',
        progressPercent: 50,
        bytesUploaded: 512,
        totalBytes: 1024,
        userId: 'user-123',
      };

      mockUploadProgressRepository.findOne.mockResolvedValue(mockProgress);
      mockUploadProgressRepository.save.mockResolvedValue(mockProgress);

      const result = await service.updateProgress(
        'progress-123',
        {
          bytesUploaded: 512,
          uploadSpeed: 100,
          estimatedTimeRemaining: 5000,
          currentChunk: 5,
        },
        'user-123',
      );

      expect(result).toBeDefined();
      expect(mockUploadProgressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'progress-123', userId: 'user-123' },
        relations: ['uploadSession'],
      });
    });

    it('should handle progress not found', async () => {
      mockUploadProgressRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProgress(
          'nonexistent-progress',
          {
            bytesUploaded: 512,
          },
          'user-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsFailed', () => {
    it('should mark upload progress as failed', async () => {
      const mockProgress = {
        id: 'progress-123',
        fileId: 'file-123',
        sessionId: 'session-123',
        status: 'IN_PROGRESS',
        progressPercent: 50,
        bytesUploaded: 512,
        totalBytes: 1024,
        userId: 'user-123',
      };

      mockUploadProgressRepository.findOne.mockResolvedValue(mockProgress);
      mockUploadProgressRepository.save.mockResolvedValue(mockProgress);

      await service.markAsFailed('progress-123', 'Upload failed', 'user-123');

      expect(mockUploadProgressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'progress-123', userId: 'user-123' },
      });
    });

    it('should throw error when progress not found', async () => {
      mockUploadProgressRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markAsFailed(
          'nonexistent-progress',
          'Upload failed',
          'user-123',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsCancelled', () => {
    it('should mark upload progress as cancelled', async () => {
      const mockProgress = {
        id: 'progress-123',
        fileId: 'file-123',
        sessionId: 'session-123',
        status: 'IN_PROGRESS',
        progressPercent: 50,
        bytesUploaded: 512,
        totalBytes: 1024,
        userId: 'user-123',
      };

      mockUploadProgressRepository.findOne.mockResolvedValue(mockProgress);
      mockUploadProgressRepository.save.mockResolvedValue(mockProgress);

      await service.markAsCancelled('progress-123', 'user-123');

      expect(mockUploadProgressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'progress-123', userId: 'user-123' },
      });
    });

    it('should throw error when progress not found', async () => {
      mockUploadProgressRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markAsCancelled('nonexistent-progress', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUploadProgress', () => {
    it('should return upload progress', async () => {
      const mockProgress = {
        id: 'progress-123',
        fileId: 'file-123',
        status: 'IN_PROGRESS',
        progressPercent: 50,
        bytesUploaded: 512,
        totalBytes: 1024,
      };

      mockUploadProgressRepository.findOne.mockResolvedValue(mockProgress);

      const result = await service.getUploadProgress(
        'progress-123',
        'user-123',
      );

      expect(result).toBeDefined();
      expect(mockUploadProgressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'progress-123', userId: 'user-123' },
        relations: ['file', 'uploadSession', 'user'],
      });
    });

    it('should throw error when progress not found', async () => {
      mockUploadProgressRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getUploadProgress('nonexistent-progress', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSessionProgress', () => {
    it('should return session progress', async () => {
      const mockProgresses = [
        {
          id: 'progress-123',
          fileId: 'file-123',
          status: 'IN_PROGRESS',
          progressPercent: 50,
        },
      ];

      mockUploadProgressRepository.find.mockResolvedValue(mockProgresses);

      const result = await service.getSessionProgress(
        'session-123',
        'user-123',
      );

      expect(result).toBeDefined();
      expect(mockUploadProgressRepository.find).toHaveBeenCalledWith({
        where: { uploadSessionId: 'session-123', userId: 'user-123' },
        relations: ['file', 'uploadSession', 'user'],
        order: { id: 'ASC' },
      });
    });
  });

  describe('cleanupStaleProgress', () => {
    it('should clean up stale progress records', async () => {
      const mockStaleProgresses = [
        {
          id: 'progress-1',
          status: 'UPLOADING',
          lastUpdatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        },
        {
          id: 'progress-2',
          status: 'UPLOADING',
          lastUpdatedAt: new Date(Date.now() - 26 * 60 * 60 * 1000), // 26 hours ago
        },
      ];

      mockUploadProgressRepository.find.mockResolvedValue(mockStaleProgresses);
      mockUploadProgressRepository.save.mockResolvedValue({});

      const result = await service.cleanupStaleProgress();

      expect(result).toBeUndefined();
      expect(mockUploadProgressRepository.find).toHaveBeenCalledWith({
        where: {
          status: 'UPLOADING',
          lastUpdatedAt: expect.any(Object),
        },
      });
      expect(mockUploadProgressRepository.save).toHaveBeenCalledTimes(2);
    });
  });
});
