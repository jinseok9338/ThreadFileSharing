import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User, CompanyRole } from '../user/entities/user.entity';
import { Company, CompanyPlan } from '../company/entities/company.entity';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let companyRepository: any;
  let refreshTokenRepository: any;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockCompanyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        JWT_SECRET: 'test-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
        BCRYPT_ROUNDS: '10',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    companyRepository = module.get(getRepositoryToken(Company));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create new company and owner user', async () => {
      const registerDto = {
        email: 'owner@newcompany.com',
        password: 'Password123!',
        fullName: 'Owner User',
        companyName: 'New Company',
      };

      const mockCompany = {
        id: 'company-uuid',
        name: 'New Company',
        slug: 'new-company',
        plan: CompanyPlan.FREE,
      };

      const mockUser = {
        id: 'user-uuid',
        email: 'owner@newcompany.com',
        full_name: 'Owner User',
        company_id: 'company-uuid',
        company_role: CompanyRole.OWNER,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockCompanyRepository.create.mockReturnValue(mockCompany);
      mockCompanyRepository.save.mockResolvedValue(mockCompany);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('company');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockCompanyRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        fullName: 'Test User',
        companyName: 'Test Company',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'jinseok9338@gmail.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: 'user-uuid',
        email: 'jinseok9338@gmail.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        company_id: 'company-uuid',
        company_role: CompanyRole.OWNER,
        is_active: true,
        locked_until: null,
        failed_login_attempts: 0,
      };

      const mockCompany = {
        id: 'company-uuid',
        name: 'Anchors',
        slug: 'anchors',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockUserRepository.update.mockResolvedValue({});
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('company');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        expect.objectContaining({
          last_login_at: expect.any(Date),
          failed_login_attempts: 0,
        }),
      );
    });

    it('should throw error with invalid credentials', async () => {
      const loginDto = {
        email: 'jinseok9338@gmail.com',
        password: 'WrongPassword',
      };

      const mockUser = {
        id: 'user-uuid',
        email: 'jinseok9338@gmail.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        is_active: true,
        locked_until: null,
        failed_login_attempts: 0,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow();
    });

    it('should throw error if account is locked', async () => {
      const loginDto = {
        email: 'jinseok9338@gmail.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: 'user-uuid',
        email: 'jinseok9338@gmail.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        is_active: true,
        locked_until: new Date(Date.now() + 1000000), // Locked for future
        failed_login_attempts: 5,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'jinseok9338@gmail.com';
      const password = 'Password123!';

      const mockUser = {
        id: 'user-uuid',
        email: 'jinseok9338@gmail.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        is_active: true,
        locked_until: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
    });

    it('should return null if credentials are invalid', async () => {
      const email = 'jinseok9338@gmail.com';
      const password = 'WrongPassword';

      const mockUser = {
        id: 'user-uuid',
        email: 'jinseok9338@gmail.com',
        password_hash: await bcrypt.hash('Password123!', 10),
        is_active: true,
        locked_until: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens with valid refresh token', async () => {
      const refreshTokenString = 'valid-refresh-token';
      const tokenHash = await bcrypt.hash(refreshTokenString, 10);

      const mockRefreshToken = {
        id: 'token-uuid',
        user_id: 'user-uuid',
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 1000000),
        revoked: false,
      };

      const mockUser = {
        id: 'user-uuid',
        email: 'jinseok9338@gmail.com',
        company_id: 'company-uuid',
        company_role: CompanyRole.OWNER,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.update.mockResolvedValue({});
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshTokenString);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { id: mockRefreshToken.id },
        { revoked: true, revoked_at: expect.any(Date) },
      );
    });

    it('should throw error with expired token', async () => {
      const refreshTokenString = 'expired-refresh-token';

      const mockRefreshToken = {
        id: 'token-uuid',
        user_id: 'user-uuid',
        token_hash: await bcrypt.hash(refreshTokenString, 10),
        expires_at: new Date(Date.now() - 1000000), // Expired
        revoked: false,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      await expect(service.refreshToken(refreshTokenString)).rejects.toThrow();
    });

    it('should throw error with revoked token', async () => {
      const refreshTokenString = 'revoked-refresh-token';

      const mockRefreshToken = {
        id: 'token-uuid',
        user_id: 'user-uuid',
        token_hash: await bcrypt.hash(refreshTokenString, 10),
        expires_at: new Date(Date.now() + 1000000),
        revoked: true, // Already revoked
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      await expect(service.refreshToken(refreshTokenString)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      const refreshTokenString = 'valid-refresh-token';
      const tokenHash = await bcrypt.hash(refreshTokenString, 10);

      const mockRefreshToken = {
        id: 'token-uuid',
        user_id: 'user-uuid',
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 1000000),
        revoked: false,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      mockRefreshTokenRepository.update.mockResolvedValue({});

      await service.logout(refreshTokenString);

      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { id: mockRefreshToken.id },
        { revoked: true, revoked_at: expect.any(Date) },
      );
    });
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'Password123!';
      const hashed = await service.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toEqual(password);
      expect(await bcrypt.compare(password, hashed)).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'Password123!';
      const hash = await bcrypt.hash(password, 10);

      const result = await service.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'Password123!';
      const hash = await bcrypt.hash('DifferentPassword', 10);

      const result = await service.comparePassword(password, hash);

      expect(result).toBe(false);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = 'user-uuid';
      const companyId = 'company-uuid';
      const companyRole = CompanyRole.OWNER;

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue({ id: 'token-uuid' });
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await service.generateTokens(
        userId,
        companyId,
        companyRole,
      );

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
    });
  });
});
