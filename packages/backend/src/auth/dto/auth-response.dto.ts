import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { CompanyResponseDto } from '../../company/dto/company-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Company information',
    type: CompanyResponseDto,
  })
  company: CompanyResponseDto;

  @ApiProperty({
    description: 'JWT access token (valid for 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (valid for 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  static create(
    user: any,
    company: any,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    return {
      user: UserResponseDto.fromEntity(user),
      company: CompanyResponseDto.fromEntity(company),
      accessToken,
      refreshToken,
    };
  }
}
