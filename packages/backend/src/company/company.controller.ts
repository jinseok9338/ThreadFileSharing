import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompanyRole } from '../user/entities/user.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { MessageData } from '../common/dto';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
} from '../common/decorators';

@ApiTags('Companies')
@ApiExtraModels(CompanyResponseDto, UserResponseDto, MessageData)
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * GET /companies/me
   * Get current user's company
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current company' })
  @ApiSuccessResponse(CompanyResponseDto, { description: 'Company info' })
  async getMyCompany(@CurrentUser() user: any) {
    const company = await this.companyService.findById(user.companyId);
    return CompanyResponseDto.fromEntity(company);
  }

  /**
   * GET /companies/me/members
   * Get all members of current user's company
   */
  @Get('me/members')
  @ApiOperation({ summary: 'Get company members' })
  @ApiSuccessArrayResponse(UserResponseDto, { description: 'List of members' })
  async getCompanyMembers(@CurrentUser() user: any) {
    const members = await this.companyService.getMembers(user.companyId);
    return members.map((member) => UserResponseDto.fromEntity(member));
  }

  /**
   * DELETE /companies/members/:userId
   * Remove a member from company
   * Requires: Admin or Owner role
   */
  @Delete('members/:userId')
  @UseGuards(RoleGuard)
  @Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @ApiOperation({ summary: 'Remove company member' })
  @ApiSuccessResponse(MessageData, { description: 'Member removed' })
  async removeMember(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    await this.companyService.removeMember(userId, user.companyId);
    return new MessageData('Member removed successfully');
  }

  /**
   * PUT /companies/me
   * Update company settings
   * Requires: Owner role
   */
  @Put('me')
  @UseGuards(RoleGuard)
  @Roles(CompanyRole.OWNER)
  @ApiOperation({ summary: 'Update company settings' })
  @ApiSuccessResponse(CompanyResponseDto, { description: 'Updated company' })
  async updateCompany(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateCompanyDto,
  ) {
    const company = await this.companyService.updateSettings(
      user.companyId,
      updateDto,
    );
    return CompanyResponseDto.fromEntity(company);
  }

  /**
   * GET /companies/me/usage
   * Get company usage statistics
   */
  @Get('me/usage')
  @ApiOperation({ summary: 'Get usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Usage stats',
    schema: {
      properties: {
        userCount: { type: 'number' },
        maxUsers: { type: 'number' },
        storageUsed: { type: 'string' },
        maxStorage: { type: 'string' },
      },
    },
  })
  async getUsageStats(@CurrentUser() user: any) {
    return this.companyService.getUsageStats(user.companyId);
  }
}
