import { Test, TestingModule } from '@nestjs/testing';
import { RoleHierarchyService } from '../../permission/role-hierarchy.service';
import { CompanyRole, ThreadRole } from '../../constants/permissions';

describe('RoleHierarchyService', () => {
  let service: RoleHierarchyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleHierarchyService],
    }).compile();

    service = module.get<RoleHierarchyService>(RoleHierarchyService);
  });

  describe('getCompanyRolePermissions', () => {
    it('should return all roles for owner', () => {
      const result = service.getCompanyRolePermissions(CompanyRole.OWNER);

      expect(result).toContain(CompanyRole.OWNER);
      expect(result).toContain(CompanyRole.ADMIN);
      expect(result).toContain(CompanyRole.MEMBER);
    });

    it('should return admin and member roles for admin', () => {
      const result = service.getCompanyRolePermissions(CompanyRole.ADMIN);

      expect(result).toContain(CompanyRole.ADMIN);
      expect(result).toContain(CompanyRole.MEMBER);
      expect(result).not.toContain(CompanyRole.OWNER);
    });

    it('should return only member role for member', () => {
      const result = service.getCompanyRolePermissions(CompanyRole.MEMBER);

      expect(result).toContain(CompanyRole.MEMBER);
      expect(result).not.toContain(CompanyRole.OWNER);
      expect(result).not.toContain(CompanyRole.ADMIN);
    });
  });

  describe('getThreadRolePermissions', () => {
    it('should return all roles for owner', () => {
      const result = service.getThreadRolePermissions(ThreadRole.OWNER);

      expect(result).toContain(ThreadRole.OWNER);
      expect(result).toContain(ThreadRole.MEMBER);
      expect(result).toContain(ThreadRole.VIEWER);
    });

    it('should return member and viewer roles for member', () => {
      const result = service.getThreadRolePermissions(ThreadRole.MEMBER);

      expect(result).toContain(ThreadRole.MEMBER);
      expect(result).toContain(ThreadRole.VIEWER);
      expect(result).not.toContain(ThreadRole.OWNER);
    });

    it('should return only viewer role for viewer', () => {
      const result = service.getThreadRolePermissions(ThreadRole.VIEWER);

      expect(result).toContain(ThreadRole.VIEWER);
      expect(result).not.toContain(ThreadRole.OWNER);
      expect(result).not.toContain(ThreadRole.MEMBER);
    });
  });

  describe('canPerformCompanyRole', () => {
    it('should return true when owner can perform admin role', () => {
      const result = service.canPerformCompanyRole(
        CompanyRole.OWNER,
        CompanyRole.ADMIN,
      );
      expect(result).toBe(true);
    });

    it('should return true when admin can perform member role', () => {
      const result = service.canPerformCompanyRole(
        CompanyRole.ADMIN,
        CompanyRole.MEMBER,
      );
      expect(result).toBe(true);
    });

    it('should return false when member cannot perform admin role', () => {
      const result = service.canPerformCompanyRole(
        CompanyRole.MEMBER,
        CompanyRole.ADMIN,
      );
      expect(result).toBe(false);
    });

    it('should return true when role can perform itself', () => {
      const result = service.canPerformCompanyRole(
        CompanyRole.MEMBER,
        CompanyRole.MEMBER,
      );
      expect(result).toBe(true);
    });
  });

  describe('canPerformThreadRole', () => {
    it('should return true when owner can perform member role', () => {
      const result = service.canPerformThreadRole(
        ThreadRole.OWNER,
        ThreadRole.MEMBER,
      );
      expect(result).toBe(true);
    });

    it('should return true when member can perform viewer role', () => {
      const result = service.canPerformThreadRole(
        ThreadRole.MEMBER,
        ThreadRole.VIEWER,
      );
      expect(result).toBe(true);
    });

    it('should return false when viewer cannot perform member role', () => {
      const result = service.canPerformThreadRole(
        ThreadRole.VIEWER,
        ThreadRole.MEMBER,
      );
      expect(result).toBe(false);
    });
  });

  describe('getMaxAssignableCompanyRole', () => {
    it('should return OWNER for owner', () => {
      const result = service.getMaxAssignableCompanyRole(CompanyRole.OWNER);
      expect(result).toBe(CompanyRole.OWNER);
    });

    it('should return ADMIN for admin', () => {
      const result = service.getMaxAssignableCompanyRole(CompanyRole.ADMIN);
      expect(result).toBe(CompanyRole.ADMIN);
    });

    it('should return MEMBER for member', () => {
      const result = service.getMaxAssignableCompanyRole(CompanyRole.MEMBER);
      expect(result).toBe(CompanyRole.MEMBER);
    });
  });

  describe('canAssignCompanyRole', () => {
    it('should return true when owner assigns admin role', () => {
      const result = service.canAssignCompanyRole(
        CompanyRole.OWNER,
        CompanyRole.ADMIN,
      );
      expect(result).toBe(true);
    });

    it('should return false when member assigns admin role', () => {
      const result = service.canAssignCompanyRole(
        CompanyRole.MEMBER,
        CompanyRole.ADMIN,
      );
      expect(result).toBe(false);
    });

    it('should return true when admin assigns member role', () => {
      const result = service.canAssignCompanyRole(
        CompanyRole.ADMIN,
        CompanyRole.MEMBER,
      );
      expect(result).toBe(true);
    });
  });

  describe('isValidCompanyRoleUpgrade', () => {
    it('should return true when upgrading member to admin', () => {
      const result = service.isValidCompanyRoleUpgrade(
        CompanyRole.MEMBER,
        CompanyRole.ADMIN,
      );
      expect(result).toBe(true);
    });

    it('should return false when downgrading admin to member', () => {
      const result = service.isValidCompanyRoleUpgrade(
        CompanyRole.ADMIN,
        CompanyRole.MEMBER,
      );
      expect(result).toBe(false);
    });

    it('should return true when keeping same role', () => {
      const result = service.isValidCompanyRoleUpgrade(
        CompanyRole.ADMIN,
        CompanyRole.ADMIN,
      );
      expect(result).toBe(true);
    });
  });
});
