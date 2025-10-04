import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChunkedUploadService } from '../../src/file/services/chunked-upload.service';
import { UploadProgressService } from '../../src/file/services/upload-progress.service';
import { FileUploadSession } from '../../src/file/entities/file-upload-session.entity';
import { UploadStatus } from '../../src/common/enums/upload-status.enum';
import { InitiateUploadDto } from '../../src/file/dto/initiate-upload.dto';
import { UploadChunkDto } from '../../src/file/dto/upload-chunk.dto';

describe('ChunkedUploadService', () => {
  let service: ChunkedUploadService;
  let uploadSessionRepository: Repository<FileUploadSession>;
  let uploadProgressService: UploadProgressService;

  const mockUploadSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUploadProgressService = {
    updateProgress: jest.fn(),
    broadcastProgress: jest.fn(),
    cleanupStaleSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChunkedUploadService,
        {
          provide: getRepositoryToken(FileUploadSession),
          useValue: mockUploadSessionRepository,
        },
        {
          provide: UploadProgressService,
          useValue: mockUploadProgressService,
        },
      ],
    }).compile();

    service = module.get<ChunkedUploadService>(ChunkedUploadService);
    uploadSessionRepository = module.get<Repository<FileUploadSession>>(
      getRepositoryToken(FileUploadSession),
    );
    uploadProgressService = module.get<UploadProgressService>(
      UploadProgressService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateUpload', () => {
    it('should create a new upload session', async () => {
      const initiateDto: InitiateUploadDto = {
        fileName: 'test-file.mp4',
        totalSizeBytes: 10485760, // 10MB
        mimeType: 'video/mp4',
        chunkSizeBytes: 1048576, // 1MB
        checksum: 'sha256:test123',
        chatroomId: 'chatroom-123',
      };

      const mockSession = {
        id: 'session-123',
        sessionId: 'upload_session_test123',
        originalFileName: initiateDto.fileName,
        totalSizeBytes: BigInt(initiateDto.totalSizeBytes),
        totalChunks: 10,
        status: UploadStatus.PENDING,
        uploadedById: 'user-123',
        chatroomId: initiateDto.chatroomId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      mockUploadSessionRepository.create.mockReturnValue(mockSession);
      mockUploadSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.initiateUpload(initiateDto, 'user-123');

      expect(mockUploadSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalFileName: initiateDto.fileName,
          totalSizeBytes: BigInt(initiateDto.totalSizeBytes),
          totalChunks: 10,
          status: UploadStatus.PENDING,
          uploadedById: 'user-123',
          chatroomId: initiateDto.chatroomId,
        }),
      );
      expect(mockUploadSessionRepository.save).toHaveBeenCalledWith(
        mockSession,
      );
      expect(result).toEqual(mockSession);
    });

    it('should calculate correct number of chunks', async () => {
      const initiateDto: InitiateUploadDto = {
        fileName: 'test-file.mp4',
        totalSizeBytes: 10485760, // 10MB
        mimeType: 'video/mp4',
        chunkSizeBytes: 1048576, // 1MB
        checksum: 'sha256:test123',
      };

      const mockSession = {
        totalChunks: 10,
        totalSizeBytes: BigInt(initiateDto.totalSizeBytes),
      };

      mockUploadSessionRepository.create.mockReturnValue(mockSession);
      mockUploadSessionRepository.save.mockResolvedValue(mockSession);

      await service.initiateUpload(initiateDto, 'user-123');

      expect(mockUploadSessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalChunks: 10, // 10MB / 1MB = 10 chunks
        }),
      );
    });
  });

  describe('uploadChunk', () => {
    it('should successfully upload a chunk', async () => {
      const chunkDto: UploadChunkDto = {
        sessionId: 'upload_session_test123',
        chunkIndex: 0,
        chunkSizeBytes: 1048576,
        chunkChecksum: 'sha256:chunk123',
        chunkData: 'base64data',
        isFinalChunk: false,
      };

      const mockSession = {
        id: 'session-123',
        sessionId: chunkDto.sessionId,
        originalFileName: 'test-file.mp4',
        totalSizeBytes: BigInt(10485760),
        totalChunks: 10,
        uploadedChunks: 0,
        uploadedBytes: BigInt(0),
        status: UploadStatus.PENDING,
        chunkMetadata: [],
      };

      mockUploadSessionRepository.findOne.mockResolvedValue(mockSession);
      mockUploadSessionRepository.save.mockResolvedValue({
        ...mockSession,
        uploadedChunks: 1,
        uploadedBytes: BigInt(chunkDto.chunkSizeBytes),
        status: UploadStatus.IN_PROGRESS,
      });

      const result = await service.uploadChunk(chunkDto);

      expect(mockUploadSessionRepository.findOne).toHaveBeenCalledWith({
        where: { sessionId: chunkDto.sessionId },
      });
      expect(mockUploadProgressService.updateProgress).toHaveBeenCalled();
      expect(result.status).toBe(UploadStatus.IN_PROGRESS);
    });

    it('should complete upload when final chunk is uploaded', async () => {
      const chunkDto: UploadChunkDto = {
        sessionId: 'upload_session_test123',
        chunkIndex: 9, // Last chunk
        chunkSizeBytes: 1048576,
        chunkChecksum: 'sha256:chunk123',
        chunkData: 'base64data',
        isFinalChunk: true,
      };

      const mockSession = {
        id: 'session-123',
        sessionId: chunkDto.sessionId,
        totalSizeBytes: BigInt(10485760),
        totalChunks: 10,
        uploadedChunks: 9,
        uploadedBytes: BigInt(9437184), // 9MB
        status: UploadStatus.IN_PROGRESS,
        chunkMetadata: [],
      };

      mockUploadSessionRepository.findOne.mockResolvedValue(mockSession);
      mockUploadSessionRepository.save.mockResolvedValue({
        ...mockSession,
        uploadedChunks: 10,
        uploadedBytes: BigInt(10485760),
        status: UploadStatus.COMPLETED,
        completedAt: new Date(),
      });

      const result = await service.uploadChunk(chunkDto);

      expect(result.status).toBe(UploadStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });

    it('should throw error for invalid chunk sequence', async () => {
      const chunkDto: UploadChunkDto = {
        sessionId: 'upload_session_test123',
        chunkIndex: 5, // Skipping chunks
        chunkSizeBytes: 1048576,
        chunkChecksum: 'sha256:chunk123',
        chunkData: 'base64data',
        isFinalChunk: false,
      };

      const mockSession = {
        uploadedChunks: 2, // Only 2 chunks uploaded so far
        totalChunks: 10,
        status: UploadStatus.IN_PROGRESS,
      };

      mockUploadSessionRepository.findOne.mockResolvedValue(mockSession);

      await expect(service.uploadChunk(chunkDto)).rejects.toThrow(
        'Invalid chunk sequence',
      );
    });

    it('should throw error for session not found', async () => {
      const chunkDto: UploadChunkDto = {
        sessionId: 'invalid_session',
        chunkIndex: 0,
        chunkSizeBytes: 1048576,
        chunkChecksum: 'sha256:chunk123',
        chunkData: 'base64data',
        isFinalChunk: false,
      };

      mockUploadSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.uploadChunk(chunkDto)).rejects.toThrow(
        'Upload session not found',
      );
    });
  });

  describe('getUploadSession', () => {
    it('should return upload session by sessionId', async () => {
      const mockSession = {
        sessionId: 'upload_session_test123',
        fileName: 'test-file.mp4',
        status: UploadStatus.IN_PROGRESS,
      };

      mockUploadSessionRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.getUploadSession('upload_session_test123');

      expect(mockUploadSessionRepository.findOne).toHaveBeenCalledWith({
        where: { sessionId: 'upload_session_test123' },
      });
      expect(result).toEqual(mockSession);
    });

    it('should throw error for non-existent session', async () => {
      mockUploadSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.getUploadSession('invalid_session')).rejects.toThrow(
        'Upload session not found',
      );
    });
  });

  describe('cancelUpload', () => {
    it('should cancel upload session', async () => {
      const mockSession = {
        sessionId: 'upload_session_test123',
        status: UploadStatus.IN_PROGRESS,
      };

      mockUploadSessionRepository.findOne.mockResolvedValue(mockSession);
      mockUploadSessionRepository.save.mockResolvedValue({
        ...mockSession,
        status: UploadStatus.CANCELLED,
      });

      const result = await service.cancelUpload('upload_session_test123');

      expect(mockUploadSessionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: UploadStatus.CANCELLED,
        }),
      );
      expect(result.status).toBe(UploadStatus.CANCELLED);
    });
  });
});
