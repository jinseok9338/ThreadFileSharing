import { Injectable } from '@nestjs/common';
import {
  CompanyRole,
  ThreadRole,
  COMPANY_ROLE_HIERARCHY,
  THREAD_ROLE_HIERARCHY,
} from '../constants/permissions';

/**
 * Role Hierarchy Service
 * Manages role inheritance and permission validation
 */
@Injectable()
export class RoleHierarchyService {
  /**
   * Get all roles that a company role can perform
   */
  getCompanyRolePermissions(role: CompanyRole): CompanyRole[] {
    const roleLevel = COMPANY_ROLE_HIERARCHY[role];
    if (typeof roleLevel === 'number') {
      // Return all roles with level >= current role level
      return Object.entries(COMPANY_ROLE_HIERARCHY)
        .filter(([_, level]) => level <= roleLevel)
        .map(([roleName]) => roleName as CompanyRole);
    }
    return [];
  }

  /**
   * Get all roles that a thread role can perform
   */
  getThreadRolePermissions(role: ThreadRole): ThreadRole[] {
    const roleLevel = THREAD_ROLE_HIERARCHY[role];
    if (typeof roleLevel === 'number') {
      // Return all roles with level <= current role level
      return Object.entries(THREAD_ROLE_HIERARCHY)
        .filter(([_, level]) => level <= roleLevel)
        .map(([roleName]) => roleName as ThreadRole);
    }
    return [];
  }

  /**
   * Check if user role can perform actions requiring target role
   */
  canPerformCompanyRole(
    userRole: CompanyRole,
    targetRole: CompanyRole,
  ): boolean {
    const userPermissions = this.getCompanyRolePermissions(userRole);
    return userPermissions.includes(targetRole);
  }

  /**
   * Check if user thread role can perform actions requiring target role
   */
  canPerformThreadRole(userRole: ThreadRole, targetRole: ThreadRole): boolean {
    const userPermissions = this.getThreadRolePermissions(userRole);
    return userPermissions.includes(targetRole);
  }

  /**
   * Get the highest role a user can assign to others in company
   */
  getMaxAssignableCompanyRole(userRole: CompanyRole): CompanyRole {
    switch (userRole) {
      case CompanyRole.OWNER:
        return CompanyRole.OWNER;
      case CompanyRole.ADMIN:
        return CompanyRole.ADMIN;
      case CompanyRole.MEMBER:
        return CompanyRole.MEMBER;
      default:
        return CompanyRole.MEMBER;
    }
  }

  /**
   * Get the highest role a user can assign to others in thread
   */
  getMaxAssignableThreadRole(userRole: ThreadRole): ThreadRole {
    switch (userRole) {
      case ThreadRole.OWNER:
        return ThreadRole.OWNER;
      case ThreadRole.MEMBER:
        return ThreadRole.MEMBER;
      case ThreadRole.VIEWER:
        return ThreadRole.VIEWER;
      default:
        return ThreadRole.VIEWER;
    }
  }

  /**
   * Validate if user can assign target role
   */
  canAssignCompanyRole(
    assignerRole: CompanyRole,
    targetRole: CompanyRole,
  ): boolean {
    const maxAssignable = this.getMaxAssignableCompanyRole(assignerRole);
    return this.canPerformCompanyRole(maxAssignable, targetRole);
  }

  /**
   * Validate if user can assign thread role
   */
  canAssignThreadRole(
    assignerRole: ThreadRole,
    targetRole: ThreadRole,
  ): boolean {
    const maxAssignable = this.getMaxAssignableThreadRole(assignerRole);
    return this.canPerformThreadRole(maxAssignable, targetRole);
  }

  /**
   * Get role hierarchy level (higher number = more permissions)
   */
  getCompanyRoleLevel(role: CompanyRole): number {
    return COMPANY_ROLE_HIERARCHY[role] || 0;
  }

  /**
   * Get thread role hierarchy level (higher number = more permissions)
   */
  getThreadRoleLevel(role: ThreadRole): number {
    return THREAD_ROLE_HIERARCHY[role] || 0;
  }

  /**
   * Check if role upgrade is valid
   */
  isValidCompanyRoleUpgrade(
    currentRole: CompanyRole,
    newRole: CompanyRole,
  ): boolean {
    const currentLevel = this.getCompanyRoleLevel(currentRole);
    const newLevel = this.getCompanyRoleLevel(newRole);

    // Can only upgrade to same or lower level (higher number = more permissions)
    return newLevel >= currentLevel;
  }

  /**
   * Check if thread role upgrade is valid
   */
  isValidThreadRoleUpgrade(
    currentRole: ThreadRole,
    newRole: ThreadRole,
  ): boolean {
    const currentLevel = this.getThreadRoleLevel(currentRole);
    const newLevel = this.getThreadRoleLevel(newRole);

    // Can only upgrade to same or lower level (higher number = more permissions)
    return newLevel >= currentLevel;
  }
}
