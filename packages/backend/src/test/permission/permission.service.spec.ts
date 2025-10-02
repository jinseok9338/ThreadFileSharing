import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionService } from '../../permission/permission.service';
import { User } from '../../user/entities/user.entity';
import { ThreadParticipant } from '../../thread/entities/thread-participant.entity';
import { CompanyRole, ThreadRole } from '../../constants/permissions';

describe('PermissionService', () => {
  let service: PermissionService;
  let userRepository: Repository<User>;
  let threadParticipantRepository: Repository<ThreadParticipant>;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockThreadParticipantRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ThreadParticipant),
          useValue: mockThreadParticipantRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    threadParticipantRepository = module.get<Repository<ThreadParticipant>>(
      getRepositoryToken(ThreadParticipant),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hasCompanyPermission', () => {
    it('should return true for owner with CREATE_CHATROOM permission', async () => {
      const mockUser = {
        id: 'user-1',
        companyRole: CompanyRole.OWNER,
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.hasCompanyPermission(
        'user-1',
        'CREATE_CHATROOM',
      );

      expect(result).toBe(true);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return false for inactive user', async () => {
      const mockUser = {
        id: 'user-1',
        companyRole: CompanyRole.OWNER,
        isActive: false,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.hasCompanyPermission(
        'user-1',
        'CREATE_CHATROOM',
      );

      expect(result).toBe(false);
    });

    it('should return false for member without MANAGE_USERS permission', async () => {
      const mockUser = {
        id: 'user-1',
        companyRole: CompanyRole.MEMBER,
        isActive: true,
      } as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.hasCompanyPermission(
        'user-1',
        'MANAGE_USERS',
      );

      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.hasCompanyPermission(
        'non-existent',
        'CREATE_CHATROOM',
      );

      expect(result).toBe(false);
    });
  });

  describe('hasThreadPermission', () => {
    it('should return true for thread owner with SEND_MESSAGES permission', async () => {
      const mockParticipant = {
        userId: 'user-1',
        threadId: 'thread-1',
        threadRole: ThreadRole.OWNER,
      } as ThreadParticipant;

      mockThreadParticipantRepository.findOne.mockResolvedValue(
        mockParticipant,
      );

      const result = await service.hasThreadPermission(
        'user-1',
        'thread-1',
        'SEND_MESSAGES',
      );

      expect(result).toBe(true);
      expect(mockThreadParticipantRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', threadId: 'thread-1' },
      });
    });

    it('should return false for viewer without UPLOAD_FILES permission', async () => {
      const mockParticipant = {
        userId: 'user-1',
        threadId: 'thread-1',
        threadRole: ThreadRole.VIEWER,
      } as ThreadParticipant;

      mockThreadParticipantRepository.findOne.mockResolvedValue(
        mockParticipant,
      );

      const result = await service.hasThreadPermission(
        'user-1',
        'thread-1',
        'UPLOAD_FILES',
      );

      expect(result).toBe(false);
    });

    it('should return false for non-participant', async () => {
      mockThreadParticipantRepository.findOne.mockResolvedValue(null);

      const result = await service.hasThreadPermission(
        'user-1',
        'thread-1',
        'SEND_MESSAGES',
      );

      expect(result).toBe(false);
    });
  });

  describe('canAccessThread', () => {
    it('should return true for thread participant', async () => {
      const mockParticipant = {
        userId: 'user-1',
        threadId: 'thread-1',
      } as ThreadParticipant;

      mockThreadParticipantRepository.findOne.mockResolvedValue(
        mockParticipant,
      );

      const result = await service.canAccessThread('user-1', 'thread-1');

      expect(result).toBe(true);
    });

    it('should return false for non-participant', async () => {
      mockThreadParticipantRepository.findOne.mockResolvedValue(null);

      const result = await service.canAccessThread('user-1', 'thread-1');

      expect(result).toBe(false);
    });
  });

  describe('getUserThreadRole', () => {
    it('should return thread role for participant', async () => {
      const mockParticipant = {
        userId: 'user-1',
        threadId: 'thread-1',
        threadRole: ThreadRole.MEMBER,
      } as ThreadParticipant;

      mockThreadParticipantRepository.findOne.mockResolvedValue(
        mockParticipant,
      );

      const result = await service.getUserThreadRole('user-1', 'thread-1');

      expect(result).toBe(ThreadRole.MEMBER);
    });

    it('should return null for non-participant', async () => {
      mockThreadParticipantRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserThreadRole('user-1', 'thread-1');

      expect(result).toBeNull();
    });
  });
});
