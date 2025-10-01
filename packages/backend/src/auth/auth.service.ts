import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, CompanyRole } from '../user/entities/user.entity';
import { Company, CompanyPlan } from '../company/entities/company.entity';
import { RefreshToken } from '../refresh-token/entities/refresh-token.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { CompanyResponseDto } from '../company/dto/company-response.dto';

interface RegisterDto {
  email: string;
  password: string;
  fullName?: string;
  companyName: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register new user and create company
   * - Creates company with auto-generated slug
   * - Creates first user as company owner
   * - Hashes password with bcrypt
   * - Returns user, company, and JWT tokens
   */
  async register(registerDto: RegisterDto) {
    const { email, password, fullName, companyName } = registerDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate company slug from name
    const slug = this.generateSlug(companyName);

    // Check if slug already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { slug },
    });

    if (existingCompany) {
      throw new ConflictException(
        'Company with similar name already exists. Please choose a different name.',
      );
    }

    // Create company
    const company = this.companyRepository.create({
      name: companyName,
      slug,
      plan: CompanyPlan.FREE,
      max_users: 100,
      max_storage_bytes: BigInt(5368709120), // 5GB
    });
    await this.companyRepository.save(company);

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create owner user
    const user = this.userRepository.create({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      company_id: company.id,
      company_role: CompanyRole.OWNER,
      email_verified: false,
      is_active: true,
    });
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      company.id,
      user.company_role,
    );

    return AuthResponseDto.create(
      user,
      company,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  /**
   * Login with email and password
   * - Validates credentials
   * - Checks account lock status
   * - Manages failed login attempts (5 attempts = 15min lock)
   * - Updates last_login_at on success
   * - Returns user, company, and JWT tokens
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with company relation
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['company'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${minutesLeft} minutes.`,
      );
    }

    // Check if user has password (not OAuth-only user)
    if (!user.password_hash) {
      throw new UnauthorizedException(
        'This account uses OAuth login. Please login with Google or Azure.',
      );
    }

    // Validate password
    const isPasswordValid = await this.comparePassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = user.failed_login_attempts + 1;
      const updateData: any = {
        failed_login_attempts: failedAttempts,
      };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        updateData.locked_until = lockUntil;
      }

      await this.userRepository.update({ id: user.id }, updateData);

      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Reset failed attempts and update last login
    await this.userRepository.update(
      { id: user.id },
      {
        failed_login_attempts: 0,
        locked_until: () => 'NULL',
        last_login_at: new Date(),
      },
    );

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.company_id,
      user.company_role,
    );

    return AuthResponseDto.create(
      user,
      user.company,
      tokens.accessToken,
      tokens.refreshToken,
    );
  }

  /**
   * Validate user credentials
   * - Used by LocalStrategy
   * - Returns user if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return null;
    }

    const isPasswordValid = await this.comparePassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Refresh access token using refresh token
   * - Validates refresh token (DB lookup + hash comparison)
   * - Checks expiration and revocation status
   * - Generates new access + refresh tokens (rotation)
   * - Revokes old refresh token
   */
  async refreshToken(refreshTokenString: string) {
    // Decode JWT to get user ID (without verification, just to find tokens)
    const decoded: any = this.jwtService.decode(refreshTokenString);

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find all non-revoked tokens for this user
    const userTokens = await this.refreshTokenRepository.find({
      where: {
        user_id: decoded.sub,
        revoked: false,
      },
    });

    // Compare with stored hashes
    let matchedToken = null;
    for (const token of userTokens) {
      const isMatch = await bcrypt.compare(
        refreshTokenString,
        token.token_hash,
      );
      if (isMatch) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date(matchedToken.expires_at) < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userRepository.findOne({
      where: { id: matchedToken.user_id },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old refresh token (rotation)
    await this.refreshTokenRepository.update(
      { id: matchedToken.id },
      {
        revoked: true,
        revoked_at: new Date(),
      },
    );

    // Generate new tokens
    const tokens = await this.generateTokens(
      user.id,
      user.company_id,
      user.company_role,
    );

    return tokens;
  }

  /**
   * Logout user by revoking refresh token
   * - Marks refresh token as revoked
   * - Prevents token reuse
   */
  async logout(refreshTokenString: string) {
    // Decode JWT to get user ID
    const decoded: any = this.jwtService.decode(refreshTokenString);

    if (!decoded || !decoded.sub) {
      return { message: 'Logged out successfully' };
    }

    // Find all non-revoked tokens for this user
    const userRefreshTokens = await this.refreshTokenRepository.find({
      where: {
        user_id: decoded.sub,
        revoked: false,
      },
    });

    // Compare with stored hashes and revoke if matched
    for (const token of userRefreshTokens) {
      const isMatch = await bcrypt.compare(
        refreshTokenString,
        token.token_hash,
      );
      if (isMatch) {
        await this.refreshTokenRepository.update(
          { id: token.id },
          {
            revoked: true,
            revoked_at: new Date(),
          },
        );
        break;
      }
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Generate JWT access and refresh tokens
   * - Access token: 15min, stateless (userId, companyId, role)
   * - Refresh token: 7 days, stored in DB (hashed)
   */
  async generateTokens(
    userId: string,
    companyId: string,
    companyRole: CompanyRole,
  ) {
    const payload = {
      sub: userId,
      companyId,
      companyRole,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
    });

    // Generate refresh token
    const refreshTokenValue = this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      },
    );

    // Hash and store refresh token
    const tokenHash = await bcrypt.hash(refreshTokenValue, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked: false,
    });
    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  /**
   * Hash password using bcrypt
   * - Uses BCRYPT_ROUNDS from config (default: 12)
   */
  async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(
      this.configService.get<string>('BCRYPT_ROUNDS') || '12',
      10,
    );
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare plain password with hashed password
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate URL-friendly slug from company name
   * - Converts to lowercase
   * - Replaces spaces with hyphens
   * - Removes special characters
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { password_hash, failed_login_attempts, locked_until, ...sanitized } =
      user;
    return sanitized;
  }

  /**
   * Remove sensitive data from company object
   */
  private sanitizeCompany(company: Company) {
    const { deleted_at, ...sanitized } = company;
    return sanitized;
  }
}
