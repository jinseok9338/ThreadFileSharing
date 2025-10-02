import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CompanyRole } from '../constants/permissions';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { MessageData } from '../common/dto';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
  ApiSuccessCursorResponse,
} from '../common/decorators';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Invitations')
@ApiExtraModels(InvitationResponseDto, UserResponseDto, MessageData)
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  /**
   * POST /invitations
   * Create a new invitation
   * Requires: Admin or Owner role
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create invitation' })
  @ApiSuccessResponse(InvitationResponseDto, {
    status: 201,
    description: 'Invitation created',
  })
  async createInvitation(
    @CurrentUser() user: User,
    @Body() createDto: CreateInvitationDto,
  ) {
    const invitation = await this.invitationService.createInvitation(
      createDto,
      user.companyId,
      user.id,
    );
    return InvitationResponseDto.fromEntity(invitation);
  }

  /**
   * GET /invitations
   * Get all invitations for current user's company
   * Requires: Authentication
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company invitations' })
  @ApiSuccessCursorResponse(InvitationResponseDto, {
    description: 'List of invitations',
  })
  async getCompanyInvitations(
    @CurrentUser() user: User,
    @Query() query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<InvitationResponseDto>> {
    return this.invitationService.getInvitationsByCompany(
      user.companyId,
      query,
    );
  }

  /**
   * GET /invitations/validate/:token
   * Validate invitation token
   * Public endpoint (no auth required)
   */
  @Get('validate/:token')
  @Public()
  @ApiOperation({ summary: 'Validate invitation token' })
  @ApiResponse({
    status: 200,
    description: 'Token validation result',
    schema: {
      properties: {
        valid: { type: 'boolean' },
        email: { type: 'string' },
        companyName: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'member'] },
      },
    },
  })
  async validateToken(@Param('token') token: string) {
    const invitation = await this.invitationService.validateToken(token);
    return {
      valid: true,
      email: invitation.email,
      companyName: invitation.company.name,
      role: invitation.role,
    };
  }

  /**
   * POST /invitations/accept
   * Accept invitation and create user account
   * Public endpoint (no auth required)
   */
  @Post('accept')
  @Public()
  @ApiOperation({ summary: 'Accept invitation' })
  @ApiResponse({
    status: 201,
    description: 'Invitation accepted',
    schema: {
      properties: {
        message: { type: 'string' },
        user: { type: 'object' },
      },
    },
  })
  async acceptInvitation(@Body() acceptDto: AcceptInvitationDto) {
    const user = await this.invitationService.acceptInvitation(
      acceptDto.token,
      {
        password: acceptDto.password,
        fullName: acceptDto.fullName,
      },
    );

    return {
      message: 'Invitation accepted successfully',
      user: UserResponseDto.fromEntity(user),
    };
  }

  /**
   * DELETE /invitations/:id
   * Revoke an invitation
   * Requires: Admin or Owner role
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(CompanyRole.ADMIN, CompanyRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke invitation' })
  @ApiSuccessResponse(MessageData, { description: 'Invitation revoked' })
  async revokeInvitation(@Param('id') id: string) {
    await this.invitationService.revokeInvitation(id);
    return new MessageData('Invitation revoked successfully');
  }
}
