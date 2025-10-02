/**
 * Permission Constants and Enums
 */

// Company-level roles
export enum CompanyRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

// Thread-level roles
export enum ThreadRole {
  OWNER = 'owner',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

// Access types for thread participants
export enum AccessType {
  MEMBER = 'member',
  SHARED = 'shared',
}

// Company-level role hierarchy
export const COMPANY_ROLE_HIERARCHY: Record<CompanyRole, number> = {
  [CompanyRole.OWNER]: 3,
  [CompanyRole.ADMIN]: 2,
  [CompanyRole.MEMBER]: 1,
};

// Thread-level role hierarchy
export const THREAD_ROLE_HIERARCHY: Record<ThreadRole, number> = {
  [ThreadRole.OWNER]: 3,
  [ThreadRole.MEMBER]: 2,
  [ThreadRole.VIEWER]: 1,
};

// Permission checks
export const hasCompanyRole = (
  userRole: CompanyRole,
  requiredRole: CompanyRole,
): boolean => {
  return (
    COMPANY_ROLE_HIERARCHY[userRole] >= COMPANY_ROLE_HIERARCHY[requiredRole]
  );
};

export const hasThreadRole = (
  userRole: ThreadRole,
  requiredRole: ThreadRole,
): boolean => {
  return THREAD_ROLE_HIERARCHY[userRole] >= THREAD_ROLE_HIERARCHY[requiredRole];
};

// Company-level permissions
export const COMPANY_PERMISSIONS = {
  CREATE_CHATROOM: [CompanyRole.MEMBER, CompanyRole.ADMIN, CompanyRole.OWNER],
  MANAGE_USERS: [CompanyRole.ADMIN, CompanyRole.OWNER],
  COMPANY_SETTINGS: [CompanyRole.OWNER],
  STORAGE_MANAGEMENT: [CompanyRole.OWNER],
  DELETE_CHATROOM: [CompanyRole.OWNER],
} as const;

// Thread-level permissions
export const THREAD_PERMISSIONS = {
  CREATE_THREAD: [ThreadRole.OWNER, ThreadRole.MEMBER],
  ADD_PARTICIPANTS: [ThreadRole.OWNER, ThreadRole.MEMBER],
  REMOVE_PARTICIPANTS: [ThreadRole.OWNER],
  DELETE_THREAD: [ThreadRole.OWNER],
  SEND_MESSAGES: [ThreadRole.OWNER, ThreadRole.MEMBER],
  VIEW_FILES: [ThreadRole.OWNER, ThreadRole.MEMBER, ThreadRole.VIEWER],
  UPLOAD_FILES: [ThreadRole.OWNER, ThreadRole.MEMBER],
  DELETE_FILES: [ThreadRole.OWNER],
  UPDATE_METADATA: [ThreadRole.OWNER, ThreadRole.MEMBER],
} as const;

// File access permissions
export const FILE_PERMISSIONS = {
  UPLOAD: [ThreadRole.OWNER, ThreadRole.MEMBER],
  DOWNLOAD: [ThreadRole.OWNER, ThreadRole.MEMBER, ThreadRole.VIEWER],
  DELETE: [ThreadRole.OWNER],
  UPDATE_METADATA: [ThreadRole.OWNER],
  UPDATE_THREAD: [ThreadRole.OWNER, ThreadRole.MEMBER],
  ARCHIVE_THREAD: [ThreadRole.OWNER, ThreadRole.MEMBER],
} as const;

// Storage quota constants
export const STORAGE_LIMITS = {
  DEFAULT_COMPANY_GB: 50,
  MAX_FILE_SIZE_MB: 100,
  MAX_FILES_PER_UPLOAD: 10,
} as const;

// Access type validation
export const isSharedAccess = (accessType: AccessType): boolean => {
  return accessType === AccessType.SHARED;
};

export const isMemberAccess = (accessType: AccessType): boolean => {
  return accessType === AccessType.MEMBER;
};
