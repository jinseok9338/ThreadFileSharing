import { SetMetadata } from '@nestjs/common';
import { CompanyRole, ThreadRole } from '../../constants/permissions';

/**
 * Company Role Decorator
 * Specifies required company roles for endpoint access
 */
export const CompanyRoles = (...roles: CompanyRole[]) =>
  SetMetadata('company_roles', roles);

/**
 * Thread Role Decorator
 * Specifies required thread roles for endpoint access
 */
export const ThreadRoles = (...roles: ThreadRole[]) =>
  SetMetadata('thread_roles', roles);

/**
 * Permission Decorator
 * Combines company and thread role requirements
 */
export const RequirePermissions = (options: {
  companyRoles?: CompanyRole[];
  threadRoles?: ThreadRole[];
}) => {
  const decorators: ((
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => void)[] = [];

  if (options.companyRoles?.length) {
    decorators.push(CompanyRoles(...options.companyRoles));
  }

  if (options.threadRoles?.length) {
    decorators.push(ThreadRoles(...options.threadRoles));
  }

  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    decorators.forEach((decorator) => {
      decorator(target, propertyKey, descriptor);
    });
  };
};

/**
 * Convenience decorators for common permission patterns
 */

// Company-level permissions
export const RequireOwner = () => CompanyRoles(CompanyRole.OWNER);
export const RequireAdmin = () =>
  CompanyRoles(CompanyRole.ADMIN, CompanyRole.OWNER);
export const RequireMember = () =>
  CompanyRoles(CompanyRole.MEMBER, CompanyRole.ADMIN, CompanyRole.OWNER);

// Thread-level permissions
export const RequireThreadOwner = () => ThreadRoles(ThreadRole.OWNER);
export const RequireThreadMember = () =>
  ThreadRoles(ThreadRole.MEMBER, ThreadRole.OWNER);
export const RequireThreadViewer = () =>
  ThreadRoles(ThreadRole.VIEWER, ThreadRole.MEMBER, ThreadRole.OWNER);

// Combined permissions
export const RequireChatroomManagement = () =>
  RequirePermissions({
    companyRoles: [CompanyRole.ADMIN, CompanyRole.OWNER],
  });

export const RequireThreadManagement = () =>
  RequirePermissions({
    threadRoles: [ThreadRole.MEMBER, ThreadRole.OWNER],
  });

export const RequireFileManagement = () =>
  RequirePermissions({
    threadRoles: [ThreadRole.MEMBER, ThreadRole.OWNER],
  });

export const RequireFileViewing = () =>
  RequirePermissions({
    threadRoles: [ThreadRole.VIEWER, ThreadRole.MEMBER, ThreadRole.OWNER],
  });
