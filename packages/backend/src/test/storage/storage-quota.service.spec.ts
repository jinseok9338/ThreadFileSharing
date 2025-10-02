import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { StorageQuotaService } from '../../storage/storage-quota.service';
import { Company } from '../../company/entities/company.entity';
import { File } from '../../file/entities/file.entity';

describe('StorageQuotaService', () => {
  let service: StorageQuotaService;
  let companyRepository: Repository<Company>;
  let fileRepository: Repository<File>;

  const mockCompanyRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    update: jest.fn(),
  };

  const mockFileRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageQuotaService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
        {
          provide: getRepositoryToken(File),
          useValue: mockFileRepository,
        },
      ],
    }).compile();

    service = module.get<StorageQuotaService>(StorageQuotaService);
    companyRepository = module.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    fileRepository = module.get<Repository<File>>(getRepositoryToken(File));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStorageQuota', () => {
    it('should return storage quota information for company', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(1073741824), // 1GB
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(100);

      const result = await service.getStorageQuota('company-1');

      expect(result).toEqual({
        companyId: 'company-1',
        storageLimitBytes: 53687091200, // 50GB in bytes
        storageUsedBytes: 1073741824, // 1GB
        storageAvailableBytes: 52613349376, // 49GB
        storageUsedPercent: 2.0,
        fileCount: 100,
      });
    });

    it('should throw error for non-existent company', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(service.getStorageQuota('non-existent')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('canUploadFile', () => {
    it('should return true when file can be uploaded', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(1073741824), // 1GB
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(100);

      const result = await service.canUploadFile('company-1', 1048576); // 1MB

      expect(result).toBe(true);
    });

    it('should return false when file exceeds quota', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 1, // 1GB limit
        storageUsedBytes: BigInt(1073741824), // 1GB used
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(100);

      const result = await service.canUploadFile('company-1', 1048576); // 1MB

      expect(result).toBe(false);
    });
  });

  describe('validateFileUpload', () => {
    it('should not throw when file can be uploaded', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(1073741824), // 1GB
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(100);

      await expect(
        service.validateFileUpload('company-1', 1048576), // 1MB
      ).resolves.not.toThrow();
    });

    it('should throw when file exceeds quota', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 1, // 1GB limit
        storageUsedBytes: BigInt(1073741824), // 1GB used
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(100);

      await expect(
        service.validateFileUpload('company-1', 1048576), // 1MB
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addStorageUsage', () => {
    it('should increment storage usage', async () => {
      mockCompanyRepository.increment.mockResolvedValue({ affected: 1 });

      await service.addStorageUsage('company-1', 1048576); // 1MB

      expect(mockCompanyRepository.increment).toHaveBeenCalledWith(
        { id: 'company-1' },
        'storageUsedBytes',
        1048576,
      );
    });
  });

  describe('removeStorageUsage', () => {
    it('should decrement storage usage', async () => {
      mockCompanyRepository.decrement.mockResolvedValue({ affected: 1 });

      await service.removeStorageUsage('company-1', 1048576); // 1MB

      expect(mockCompanyRepository.decrement).toHaveBeenCalledWith(
        { id: 'company-1' },
        'storageUsedBytes',
        1048576,
      );
    });
  });

  describe('isNearQuotaLimit', () => {
    it('should return true when usage is above threshold', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 10,
        storageUsedBytes: BigInt(9 * 1024 * 1024 * 1024), // 9GB
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(100);

      const result = await service.isNearQuotaLimit('company-1', 90);

      expect(result).toBe(true);
    });

    it('should return false when usage is below threshold', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 10,
        storageUsedBytes: BigInt(5 * 1024 * 1024 * 1024), // 5GB
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(100);

      const result = await service.isNearQuotaLimit('company-1', 90);

      expect(result).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should return true for valid file size', () => {
      const result = service.validateFileSize(50 * 1024 * 1024); // 50MB
      expect(result).toBe(true);
    });

    it('should return false for oversized file', () => {
      const result = service.validateFileSize(200 * 1024 * 1024); // 200MB
      expect(result).toBe(false);
    });
  });

  describe('validateMultipleFileUpload', () => {
    it('should not throw for valid multiple files', async () => {
      const mockCompany = {
        id: 'company-1',
        storageLimitGb: 50,
        storageUsedBytes: BigInt(0),
      } as Company;

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockFileRepository.count.mockResolvedValue(0);

      const files = [
        { size: 1024 * 1024 }, // 1MB
        { size: 2 * 1024 * 1024 }, // 2MB
      ];

      await expect(
        service.validateMultipleFileUpload('company-1', files),
      ).resolves.not.toThrow();
    });

    it('should throw for too many files', async () => {
      const files = Array(15).fill({ size: 1024 }); // 15 files

      await expect(
        service.validateMultipleFileUpload('company-1', files),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw for oversized files', async () => {
      const files = [{ size: 200 * 1024 * 1024 }]; // 200MB

      await expect(
        service.validateMultipleFileUpload('company-1', files),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
