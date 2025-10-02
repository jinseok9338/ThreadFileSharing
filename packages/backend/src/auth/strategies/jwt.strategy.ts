import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  companyId: string;
  companyRole: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    // Verify user still exists and is active
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
        isActive: true,
        deletedAt: IsNull(),
      },
      relations: ['company'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new UnauthorizedException(
        `Account is locked until ${user.lockedUntil}`,
      );
    }

    // Return user data to be attached to request
    return {
      id: user.id,
      email: user.email,
      companyId: user.companyId,
      companyRole: user.companyRole,
      username: user.username,
      fullName: user.fullName,
    };
  }
}
