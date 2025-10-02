import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import {
  CompanyInvitation,
  InvitationRole,
  InvitationStatus,
} from './entities/company-invitation.entity';
import { User } from '../user/entities/user.entity';
import { CompanyRole } from '../constants/permissions';
import { Company } from '../company/entities/company.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

interface CreateInvitationDto {
  email: string;
  role: InvitationRole;
}

interface AcceptInvitationDto {
  password: string;
  fullName?: string;
}

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(CompanyInvitation)
    private invitationRepository: Repository<CompanyInvitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  /**
   * Create a new invitation
   * - Checks if email is already a user
   * - Generates secure token
   * - Sets expiration to 7 days
   */
  async createInvitation(
    createDto: CreateInvitationDto,
    companyId: string,
    invitedByUserId: string,
  ): Promise<CompanyInvitation> {
    // Check if email is already a user
    const existingUser = await this.userRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if there's already a pending invitation
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        companyId: companyId,
        email: createDto.email,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException(
        'Pending invitation already exists for this email',
      );
    }

    // Verify company exists
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Generate secure token
    const token = this.generateInvitationToken();

    // Set expiration to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      companyId: companyId,
      invitedByUserId: invitedByUserId,
      email: createDto.email,
      role: createDto.role,
      token,
      expiresAt: expiresAt,
      status: InvitationStatus.PENDING,
    });

    return this.invitationRepository.save(invitation);
  }

  /**
   * Validate invitation token
   * - Checks if token exists
   * - Checks if expired
   * - Checks if already accepted/revoked
   */
  async validateToken(token: string): Promise<CompanyInvitation> {
    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ['company'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      await this.invitationRepository.update(
        { id: invitation.id },
        { status: InvitationStatus.EXPIRED },
      );
      throw new BadRequestException('Invitation has expired');
    }

    // Check if already accepted
    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new BadRequestException('Invitation has already been accepted');
    }

    // Check if revoked
    if (invitation.status === InvitationStatus.REVOKED) {
      throw new BadRequestException('Invitation has been revoked');
    }

    return invitation;
  }

  /**
   * Accept invitation and create user
   * - Validates token
   * - Creates user with invited role
   * - Marks invitation as accepted
   */
  async acceptInvitation(
    token: string,
    acceptDto: AcceptInvitationDto,
  ): Promise<User> {
    const invitation = await this.validateToken(token);

    // Check if email is already taken (shouldn't happen but double-check)
    const existingUser = await this.userRepository.findOne({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(acceptDto.password, 12);

    // Map invitation role to company role
    const companyRole =
      invitation.role === InvitationRole.ADMIN
        ? CompanyRole.ADMIN
        : CompanyRole.MEMBER;

    // Create user
    const user = this.userRepository.create({
      email: invitation.email,
      password: passwordHash,
      fullName: acceptDto.fullName,
      companyId: invitation.companyId,
      companyRole: companyRole,
      emailVerified: true, // Auto-verify via invitation
      isActive: true,
    });

    await this.userRepository.save(user);

    // Mark invitation as accepted
    await this.invitationRepository.update(
      { id: invitation.id },
      {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    );

    return user;
  }

  /**
   * Revoke an invitation
   * - Only the inviter or admin can revoke
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be revoked');
    }

    await this.invitationRepository.update(
      { id: invitationId },
      { status: InvitationStatus.REVOKED },
    );
  }

  /**
   * Get all invitations for a company with cursor-based pagination
   */
  async getInvitationsByCompany(
    companyId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<InvitationResponseDto>> {
    const { limit = 20, lastIndex } = query;

    // Build where condition for cursor-based pagination
    const whereCondition: any = { companyId };
    if (lastIndex) {
      // Parse lastIndex as ISO date string and use it for cursor
      const lastDate = new Date(lastIndex);
      whereCondition.createdAt = MoreThan(lastDate);
    }

    // Fetch one more item than requested to determine hasNext
    const invitations = await this.invitationRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: limit + 1,
    });

    const hasNext = invitations.length > limit;
    const items = hasNext ? invitations.slice(0, limit) : invitations;

    // Convert to DTOs
    const invitationDtos = items.map((invitation) =>
      InvitationResponseDto.fromEntity(invitation),
    );

    // Get nextIndex from the last item's createdAt if there's a next page
    const nextIndex =
      hasNext && items.length > 0
        ? items[items.length - 1].createdAt.toISOString()
        : undefined;

    return new CursorBasedData(invitationDtos, hasNext, limit, nextIndex);
  }

  /**
   * Expire old invitations (for cron job)
   * - Marks invitations past expires_at as EXPIRED
   */
  async expireInvitations(): Promise<void> {
    const expiredInvitations = await this.invitationRepository.find({
      where: {
        status: InvitationStatus.PENDING,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const invitation of expiredInvitations) {
      await this.invitationRepository.update(
        { id: invitation.id },
        { status: InvitationStatus.EXPIRED },
      );
    }
  }

  /**
   * Generate secure invitation token
   * - 32 bytes random hex string
   */
  private generateInvitationToken(): string {
    return randomBytes(32).toString('hex');
  }
}
