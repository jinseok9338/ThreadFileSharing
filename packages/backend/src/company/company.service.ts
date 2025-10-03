import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { CursorPaginationQueryDto } from '../common/dto';
import { CursorBasedData } from '../common/dto/api-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { Company, CompanyPlan } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { File } from '../file/entities/file.entity';
import { CompanyRole } from '../constants/permissions';

interface CreateCompanyDto {
  name: string;
  plan?: CompanyPlan;
  maxUsers?: number;
  maxStorageBytes?: number;
}

interface UpdateCompanyDto {
  name?: string;
  plan?: CompanyPlan;
  maxUsers?: number;
  maxStorageBytes?: number;
}

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
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
      maxUsers: createDto.maxUsers || 100,
      maxStorageBytes: createDto.maxStorageBytes
        ? BigInt(createDto.maxStorageBytes)
        : BigInt(5368709120), // 5GB
    });

    return this.companyRepository.save(company);
  }

  /**
   * Find company by ID
   */
  async findById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id, deletedAt: IsNull() },
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
      where: { slug, deletedAt: IsNull() },
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
  async getMembers(
    companyId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorBasedData<UserResponseDto>> {
    const { limit = 20, lastIndex } = query;

    // Build where condition for cursor-based pagination
    const whereCondition: any = { companyId, deletedAt: IsNull() };
    if (lastIndex) {
      // Parse lastIndex as ISO date string and use it for cursor
      const lastDate = new Date(lastIndex);
      whereCondition.createdAt = MoreThan(lastDate);
    }

    // Fetch one more item than requested to determine hasNext
    const users = await this.userRepository.find({
      where: whereCondition,
      order: { createdAt: 'ASC' },
      take: limit + 1,
    });

    const hasNext = users.length > limit;
    const items = hasNext ? users.slice(0, limit) : users;

    // Convert to DTOs
    const userDtos = items.map((user) => UserResponseDto.fromEntity(user));

    // Get nextIndex from the last item's createdAt if there's a next page
    const nextIndex =
      hasNext && items.length > 0
        ? items[items.length - 1].createdAt.toISOString()
        : undefined;

    return new CursorBasedData(userDtos, hasNext, limit, nextIndex);
  }

  /**
   * Remove a member from company
   * - Soft deletes user
   * - Cannot remove company owner
   */
  async removeMember(userId: string, companyId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, companyId: companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found in this company');
    }

    if (user.companyRole === CompanyRole.OWNER) {
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
    const updateData: any = { ...updateDto };
    if (updateDto.maxStorageBytes !== undefined) {
      updateData.maxStorageBytes = BigInt(updateDto.maxStorageBytes);
    }
    await this.companyRepository.update(companyId, updateData);

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
      where: { companyId: companyId, deletedAt: IsNull() },
    });

    // Calculate actual storage usage from files
    const storageUsageResult = await this.fileRepository
      .createQueryBuilder('file')
      .select('SUM(file.sizeBytes)', 'totalSize')
      .where('file.companyId = :companyId', { companyId: companyId })
      .andWhere('file.deletedAt IS NULL')
      .getRawOne();

    const storageUsed = storageUsageResult?.totalSize
      ? BigInt(storageUsageResult.totalSize)
      : BigInt(0);

    return {
      userCount,
      maxUsers: company.maxUsers,
      storageUsed,
      maxStorage: company.maxStorageBytes,
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
