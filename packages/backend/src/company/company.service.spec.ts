import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { Company, CompanyPlan } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { CompanyRole } from 'src/constants/permissions';

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepository: any;
  let userRepository: any;

  const mockCompanyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    companyRepository = module.get(getRepositoryToken(Company));
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const createDto = {
        name: 'Test Company',
        plan: CompanyPlan.FREE,
      };

      const mockCompany = {
        id: 'company-uuid',
        name: 'Test Company',
        slug: 'test-company',
        plan: CompanyPlan.FREE,
      };

      mockCompanyRepository.create.mockReturnValue(mockCompany);
      mockCompanyRepository.save.mockResolvedValue(mockCompany);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCompany);
      expect(mockCompanyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createDto.name,
          plan: createDto.plan,
          slug: expect.any(String),
        }),
      );
    });
  });

  describe('getMembers', () => {
    it('should return all company members', async () => {
      const companyId = 'company-uuid';

      const mockMembers = [
        {
          id: 'user-1',
          email: 'owner@company.com',
          company_role: CompanyRole.OWNER,
        },
        {
          id: 'user-2',
          email: 'admin@company.com',
          company_role: CompanyRole.ADMIN,
        },
        {
          id: 'user-3',
          email: 'member@company.com',
          company_role: CompanyRole.MEMBER,
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockMembers);

      const result = await service.getMembers(companyId, {
        limit: 20,
        lastIndex: undefined,
      });

      expect(result).toEqual(mockMembers);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { company_id: companyId, deleted_at: null },
        order: { created_at: 'ASC' },
      });
    });
  });

  describe('removeMember', () => {
    it('should remove a member from company', async () => {
      const userId = 'user-uuid';
      const companyId = 'company-uuid';

      const mockUser = {
        id: userId,
        company_id: companyId,
        company_role: CompanyRole.MEMBER,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.softDelete.mockResolvedValue({});

      await service.removeMember(userId, companyId);

      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw error when removing company owner', async () => {
      const userId = 'user-uuid';
      const companyId = 'company-uuid';

      const mockUser = {
        id: userId,
        company_id: companyId,
        company_role: CompanyRole.OWNER,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.removeMember(userId, companyId)).rejects.toThrow();
    });
  });

  describe('updateSettings', () => {
    it('should update company settings', async () => {
      const companyId = 'company-uuid';
      const updateDto = {
        name: 'Updated Company Name',
        plan: CompanyPlan.PRO,
      };

      const mockCompany = {
        id: companyId,
        name: 'Updated Company Name',
        plan: CompanyPlan.PRO,
      };

      mockCompanyRepository.update.mockResolvedValue({});
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.updateSettings(companyId, updateDto);

      expect(result).toEqual(mockCompany);
      expect(mockCompanyRepository.update).toHaveBeenCalledWith(
        companyId,
        updateDto,
      );
    });
  });
});
