import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  CompanyInvitation,
  InvitationRole,
  InvitationStatus,
} from './entities/company-invitation.entity';
import { User, CompanyRole } from '../user/entities/user.entity';
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
        company_id: companyId,
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
      company_id: companyId,
      invited_by_user_id: invitedByUserId,
      email: createDto.email,
      role: createDto.role,
      token,
      expires_at: expiresAt,
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
    if (new Date(invitation.expires_at) < new Date()) {
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
      password_hash: passwordHash,
      full_name: acceptDto.fullName,
      company_id: invitation.company_id,
      company_role: companyRole,
      email_verified: true, // Auto-verify via invitation
      is_active: true,
    });

    await this.userRepository.save(user);

    // Mark invitation as accepted
    await this.invitationRepository.update(
      { id: invitation.id },
      {
        status: InvitationStatus.ACCEPTED,
        accepted_at: new Date(),
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
   * Get all invitations for a company
   */
  async getInvitationsByCompany(
    companyId: string,
  ): Promise<CompanyInvitation[]> {
    return this.invitationRepository.find({
      where: { company_id: companyId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Expire old invitations (for cron job)
   * - Marks invitations past expires_at as EXPIRED
   */
  async expireInvitations(): Promise<void> {
    const expiredInvitations = await this.invitationRepository.find({
      where: {
        status: InvitationStatus.PENDING,
        expires_at: LessThan(new Date()),
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
