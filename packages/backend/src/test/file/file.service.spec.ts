import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { FileUploadService } from '../../file/services/file-upload.service';
import { FileManagementService } from '../../file/services/file-management.service';
import { S3ClientService } from '../../file/services/s3-client.service';
import { StorageQuotaService } from '../../storage/storage-quota.service';
import { WebSocketGateway } from '../../websocket/gateway/websocket.gateway';
import { WebSocketRoomService } from '../../websocket/services/websocket-room.service';

import { File } from '../../file/entities/file.entity';
import { UploadProgress } from '../../file/entities/upload-progress.entity';
import { UploadSession } from '../../file/entities/upload-session.entity';
import { FileAssociation } from '../../file/entities/file-association.entity';
import { User } from '../../user/entities/user.entity';
import { Company } from '../../company/entities/company.entity';
import { StorageQuota } from '../../file/entities/storage-quota.entity';
import { DownloadToken } from '../../file/entities/download-token.entity';
import { AccessType } from '../../file/entities/file-association.entity';

describe('FileService', () => {
  let fileUploadService: FileUploadService;
  let fileManagementService: FileManagementService;
  let fileRepository: Repository<File>;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let s3ClientService: S3ClientService;
  let storageQuotaService: StorageQuotaService;

  const mockFileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

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

  const mockFileAssociationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockStorageQuotaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockDownloadTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCompanyRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockS3ClientService = {
    uploadFile: jest.fn(),
    getSignedDownloadUrl: jest.fn(),
    calculateFileHash: jest.fn(),
    deleteFile: jest.fn(),
    generateStorageKey: jest.fn(),
  };

  const mockStorageQuotaService = {
    validateFileUpload: jest.fn(),
    addStorageUsage: jest.fn(),
    removeStorageUsage: jest.fn(),
  };

  const mockWebSocketGateway = {
    emit: jest.fn(),
  };

  const mockWebSocketRoomService = {
    validateRoomAccess: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        FileManagementService,
        {
          provide: getRepositoryToken(File),
          useValue: mockFileRepository,
        },
        {
          provide: getRepositoryToken(UploadProgress),
          useValue: mockUploadProgressRepository,
        },
        {
          provide: getRepositoryToken(UploadSession),
          useValue: mockUploadSessionRepository,
        },
        {
          provide: getRepositoryToken(FileAssociation),
          useValue: mockFileAssociationRepository,
        },
        {
          provide: getRepositoryToken(StorageQuota),
          useValue: mockStorageQuotaRepository,
        },
        {
          provide: getRepositoryToken(DownloadToken),
          useValue: mockDownloadTokenRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
        {
          provide: S3ClientService,
          useValue: mockS3ClientService,
        },
        {
          provide: StorageQuotaService,
          useValue: mockStorageQuotaService,
        },
        {
          provide: WebSocketGateway,
          useValue: mockWebSocketGateway,
        },
        {
          provide: WebSocketRoomService,
          useValue: mockWebSocketRoomService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    fileUploadService = module.get<FileUploadService>(FileUploadService);
    fileManagementService = module.get<FileManagementService>(
      FileManagementService,
    );
    fileRepository = module.get<Repository<File>>(getRepositoryToken(File));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    companyRepository = module.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    s3ClientService = module.get<S3ClientService>(S3ClientService);
    storageQuotaService = module.get<StorageQuotaService>(StorageQuotaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('FileUploadService', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      company: {
        id: 'company-123',
        name: 'Test Company',
        maxStorageBytes: BigInt(1073741824), // 1GB
      },
    };

    const mockFileBuffer = Buffer.from('test file content');

    const mockFile = {
      toBuffer: jest.fn().mockResolvedValue(mockFileBuffer),
      originalname: 'test.txt',
      filename: 'test.txt',
      mimetype: 'text/plain',
      size: mockFileBuffer.length,
      buffer: mockFileBuffer,
      _buf: mockFileBuffer,
    };

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockS3ClientService.calculateFileHash.mockReturnValue('hash-123');
      mockS3ClientService.uploadFile.mockResolvedValue('storage-key-123');
      mockS3ClientService.getSignedDownloadUrl.mockResolvedValue(
        'https://example.com/download',
      );
      mockS3ClientService.generateStorageKey.mockReturnValue(
        'generated-storage-key-123',
      );
      mockConfigService.get.mockReturnValue('test-bucket');
    });

    describe('uploadSingleFile', () => {
      it('should upload a single file successfully', async () => {
        const uploadRequest = {
          originalName: 'test.txt',
          displayName: 'Test File',
          mimeType: 'text/plain',
          accessType: AccessType.PRIVATE,
          sessionName: 'Test Session',
          createThread: false,
        };

        const mockSavedFile = {
          id: 'file-123',
          originalName: 'test.txt',
          sizeBytes: mockFileBuffer.length,
          companyId: 'company-123',
          uploadedBy: 'user-123',
        };

        mockFileRepository.findOne.mockResolvedValue(null); // No existing file
        mockFileRepository.create.mockReturnValue(mockSavedFile);
        mockFileRepository.save.mockResolvedValue(mockSavedFile);
        mockStorageQuotaService.validateFileUpload.mockResolvedValue(undefined);

        const result = await fileUploadService.uploadSingleFile(
          mockFile,
          uploadRequest,
          'user-123',
        );

        expect(result.success).toBe(true);
        expect(result.file).toBeDefined();
        expect(mockStorageQuotaService.validateFileUpload).toHaveBeenCalledWith(
          'company-123',
          expect.any(BigInt),
        );
        expect(mockS3ClientService.generateStorageKey).toHaveBeenCalledWith(
          'company-123',
          'user-123',
          'test.txt',
        );
      });

      it('should handle existing file (deduplication)', async () => {
        const uploadRequest = {
          originalName: 'test.txt',
          displayName: 'Test File',
          mimeType: 'text/plain',
          accessType: AccessType.PRIVATE,
          sessionName: 'Test Session',
          createThread: false,
        };

        const existingFile = {
          id: 'existing-file-123',
          originalName: 'test.txt',
          sizeBytes: mockFileBuffer.length,
          companyId: 'company-123',
          uploadedBy: 'user-123',
        };

        mockFileRepository.findOne.mockResolvedValue(existingFile);
        mockStorageQuotaService.validateFileUpload.mockResolvedValue(undefined);

        const result = await fileUploadService.uploadSingleFile(
          mockFile,
          uploadRequest,
          'user-123',
        );

        expect(result.success).toBe(true);
        expect(result.message).toContain('already exists');
        expect(mockS3ClientService.uploadFile).not.toHaveBeenCalled();
      });

      it('should throw error when storage quota exceeded', async () => {
        const uploadRequest = {
          originalName: 'test.txt',
          displayName: 'Test File',
          mimeType: 'text/plain',
          accessType: AccessType.PRIVATE,
          sessionName: 'Test Session',
          createThread: false,
        };

        mockStorageQuotaService.validateFileUpload.mockRejectedValue(
          new BadRequestException('Storage quota exceeded'),
        );

        await expect(
          fileUploadService.uploadSingleFile(
            mockFile,
            uploadRequest,
            'user-123',
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw error when user not found', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);

        const uploadRequest = {
          originalName: 'test.txt',
          displayName: 'Test File',
          mimeType: 'text/plain',
          accessType: AccessType.PRIVATE,
          sessionName: 'Test Session',
          createThread: false,
        };

        await expect(
          fileUploadService.uploadSingleFile(
            mockFile,
            uploadRequest,
            'user-123',
          ),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('FileManagementService', () => {
    const mockFile = {
      id: 'file-123',
      originalName: 'test.txt',
      sizeBytes: 1024,
      companyId: 'company-123',
      uploadedBy: 'user-123',
      deletedAt: null,
      uploadedByUser: {
        id: 'user-123',
        company: { id: 'company-123' },
      },
      company: {
        id: 'company-123',
      },
    };

    const mockUser = {
      id: 'user-123',
      company: { id: 'company-123' },
      companyRole: 'MEMBER',
    };

    beforeEach(() => {
      mockFileRepository.findOne.mockResolvedValue(mockFile);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    describe('deleteFile', () => {
      it('should delete file successfully', async () => {
        mockFileRepository.softDelete.mockResolvedValue({ affected: 1 });

        await fileManagementService.deleteFile('file-123', 'user-123');

        expect(mockFileRepository.softDelete).toHaveBeenCalledWith('file-123');
        expect(mockStorageQuotaService.addStorageUsage).toHaveBeenCalledWith(
          'company-123',
          -1024,
        );
      });

      it('should throw error when file not found', async () => {
        mockFileRepository.findOne.mockResolvedValue(null);

        await expect(
          fileManagementService.deleteFile('nonexistent-file', 'user-123'),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw error when user not authorized', async () => {
        mockUserRepository.findOne.mockResolvedValue({
          id: 'different-user',
          company: { id: 'different-company' },
        });

        await expect(
          fileManagementService.deleteFile('file-123', 'different-user'),
        ).rejects.toThrow(ForbiddenException);
      });
    });
  });
});
