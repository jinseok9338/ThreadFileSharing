import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Company, CompanyPlan } from './entities/company.entity';
import { User, CompanyRole } from '../user/entities/user.entity';

interface CreateCompanyDto {
  name: string;
  plan?: CompanyPlan;
  max_users?: number;
  max_storage_bytes?: bigint;
}

interface UpdateCompanyDto {
  name?: string;
  plan?: CompanyPlan;
  max_users?: number;
  max_storage_bytes?: bigint;
}

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new company
   * - Generates slug from name
   * - Sets default plan and limits
   */
  async create(createDto: CreateCompanyDto): Promise<Company> {
    const slug = this.generateSlug(createDto.name);

    const company = this.companyRepository.create({
      name: createDto.name,
      slug,
      plan: createDto.plan || CompanyPlan.FREE,
      max_users: createDto.max_users || 100,
      max_storage_bytes: createDto.max_storage_bytes || BigInt(5368709120),
    });

    return this.companyRepository.save(company);
  }

  /**
   * Find company by ID
   */
  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  /**
   * Find company by slug
   */
  async findBySlug(slug: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { slug, deleted_at: IsNull() },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  /**
   * Get all members of a company
   * - Returns active users only
   * - Ordered by creation date
   */
  async getMembers(companyId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { company_id: companyId, deleted_at: IsNull() },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Remove a member from company
   * - Soft deletes user
   * - Cannot remove company owner
   */
  async removeMember(userId: string, companyId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, company_id: companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found in this company');
    }

    if (user.company_role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot remove company owner');
    }

    await this.userRepository.softDelete(userId);
  }

  /**
   * Update company settings
   * - Only owner can update plan
   * - Validates new limits
   */
  async updateSettings(
    companyId: string,
    updateDto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.companyRepository.update(companyId, updateDto);

    return this.findById(companyId);
  }

  /**
   * Get company usage statistics
   * - Current user count
   * - Current storage usage (placeholder)
   */
  async getUsageStats(companyId: string) {
    const company = await this.findById(companyId);
    const userCount = await this.userRepository.count({
      where: { company_id: companyId, deleted_at: IsNull() },
    });

    return {
      userCount,
      maxUsers: company.max_users,
      storageUsed: BigInt(0), // TODO: Calculate from files in future
      maxStorage: company.max_storage_bytes,
    };
  }

  /**
   * Generate URL-friendly slug from company name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
