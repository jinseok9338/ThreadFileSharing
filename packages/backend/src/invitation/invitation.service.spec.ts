import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InvitationService } from './invitation.service';
import {
  CompanyInvitation,
  InvitationRole,
  InvitationStatus,
} from './entities/company-invitation.entity';
import { User, CompanyRole } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';

describe('InvitationService', () => {
  let service: InvitationService;
  let invitationRepository: any;
  let userRepository: any;
  let companyRepository: any;

  const mockInvitationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCompanyRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: getRepositoryToken(CompanyInvitation),
          useValue: mockInvitationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
    invitationRepository = module.get(getRepositoryToken(CompanyInvitation));
    userRepository = module.get(getRepositoryToken(User));
    companyRepository = module.get(getRepositoryToken(Company));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvitation', () => {
    it('should create invitation with valid data', async () => {
      const createDto = {
        email: 'newuser@company.com',
        role: InvitationRole.MEMBER,
      };
      const companyId = 'company-uuid';
      const invitedByUserId = 'user-uuid';

      const mockCompany = {
        id: companyId,
        name: 'Test Company',
      };

      const mockInvitation = {
        id: 'invitation-uuid',
        company_id: companyId,
        invited_by_user_id: invitedByUserId,
        email: createDto.email,
        role: createDto.role,
        token: expect.any(String),
        expires_at: expect.any(Date),
        status: InvitationStatus.PENDING,
      };

      mockUserRepository.findOne.mockResolvedValue(null); // Email not taken
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockInvitationRepository.create.mockReturnValue(mockInvitation);
      mockInvitationRepository.save.mockResolvedValue(mockInvitation);

      const result = await service.createInvitation(
        createDto,
        companyId,
        invitedByUserId,
      );

      expect(result).toEqual(mockInvitation);
      expect(mockInvitationRepository.create).toHaveBeenCalled();
    });

    it('should throw error if email is already a user', async () => {
      const createDto = {
        email: 'existing@company.com',
        role: InvitationRole.MEMBER,
      };
      const companyId = 'company-uuid';
      const invitedByUserId = 'user-uuid';

      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.createInvitation(createDto, companyId, invitedByUserId),
      ).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('should return invitation with valid token', async () => {
      const token = 'valid-token';

      const mockInvitation = {
        id: 'invitation-uuid',
        token: token,
        status: InvitationStatus.PENDING,
        expires_at: new Date(Date.now() + 1000000), // Not expired
      };

      mockInvitationRepository.findOne.mockResolvedValue(mockInvitation);

      const result = await service.validateToken(token);

      expect(result).toEqual(mockInvitation);
    });

    it('should throw error with expired token', async () => {
      const token = 'expired-token';

      const mockInvitation = {
        id: 'invitation-uuid',
        token: token,
        status: InvitationStatus.PENDING,
        expires_at: new Date(Date.now() - 1000000), // Expired
      };

      mockInvitationRepository.findOne.mockResolvedValue(mockInvitation);

      await expect(service.validateToken(token)).rejects.toThrow();
    });

    it('should throw error with already accepted token', async () => {
      const token = 'accepted-token';

      const mockInvitation = {
        id: 'invitation-uuid',
        token: token,
        status: InvitationStatus.ACCEPTED,
        expires_at: new Date(Date.now() + 1000000),
      };

      mockInvitationRepository.findOne.mockResolvedValue(mockInvitation);

      await expect(service.validateToken(token)).rejects.toThrow();
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation and create user', async () => {
      const token = 'valid-token';
      const acceptDto = {
        password: 'Password123!',
        fullName: 'New Member',
      };

      const mockInvitation = {
        id: 'invitation-uuid',
        company_id: 'company-uuid',
        email: 'newmember@company.com',
        role: InvitationRole.MEMBER,
        token: token,
        status: InvitationStatus.PENDING,
        expires_at: new Date(Date.now() + 1000000),
      };

      const mockUser = {
        id: 'new-user-uuid',
        email: mockInvitation.email,
        company_id: mockInvitation.company_id,
        company_role: mockInvitation.role,
      };

      mockInvitationRepository.findOne.mockResolvedValue(mockInvitation);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockInvitationRepository.update.mockResolvedValue({});

      const result = await service.acceptInvitation(token, acceptDto);

      expect(result).toEqual(mockUser);
      expect(mockInvitationRepository.update).toHaveBeenCalledWith(
        { id: mockInvitation.id },
        {
          status: InvitationStatus.ACCEPTED,
          accepted_at: expect.any(Date),
        },
      );
    });
  });

  describe('expireInvitations', () => {
    it('should mark expired invitations', async () => {
      const mockExpiredInvitations = [
        {
          id: 'inv-1',
          expires_at: new Date(Date.now() - 1000000),
          status: InvitationStatus.PENDING,
        },
        {
          id: 'inv-2',
          expires_at: new Date(Date.now() - 2000000),
          status: InvitationStatus.PENDING,
        },
      ];

      mockInvitationRepository.find.mockResolvedValue(mockExpiredInvitations);
      mockInvitationRepository.update.mockResolvedValue({});

      await service.expireInvitations();

      expect(mockInvitationRepository.update).toHaveBeenCalledTimes(2);
      mockExpiredInvitations.forEach((inv) => {
        expect(mockInvitationRepository.update).toHaveBeenCalledWith(
          { id: inv.id },
          { status: InvitationStatus.EXPIRED },
        );
      });
    });
  });
});
