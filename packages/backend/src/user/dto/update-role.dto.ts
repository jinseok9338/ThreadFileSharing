import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from '../../constants/permissions';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Company role to assign',
    enum: CompanyRole,
    example: CompanyRole.ADMIN,
  })
  @IsEnum(CompanyRole)
  role: CompanyRole;
}
