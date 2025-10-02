/**
 * Thread API Contracts
 *
 * RESTful API endpoints for thread management with file-centric design
 * All endpoints require JWT authentication and thread-level permissions
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateThreadDto {
  chatroomId: string;
  title: string;
  description?: string;
  fileId?: string; // Optional initial file attachment
}

export interface UpdateThreadDto {
  title?: string;
  description?: string;
}

export interface ThreadResponseDto {
  id: string;
  chatroomId: string;
  title: string;
  description?: string;
  createdBy: string;
  isArchived: boolean;
  participantCount: number;
  fileCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadListResponseDto {
  threads: ThreadResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AddThreadParticipantDto {
  userId: string;
  threadRole: "OWNER" | "MEMBER" | "VIEWER";
}

export interface ShareThreadDto {
  userId: string;
  threadRole: "VIEWER" | "MEMBER";
  message?: string;
}

export interface UpdateThreadParticipantDto {
  threadRole: "OWNER" | "MEMBER" | "VIEWER";
}

export interface ThreadParticipantDto {
  id: string;
  userId: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  threadRole: "OWNER" | "MEMBER" | "VIEWER";
  accessType: "MEMBER" | "SHARED";
  sharedByUserId?: string;
  sharedByUsername?: string;
  sharedAt?: string;
  joinedAt: string;
}

export interface ThreadParticipantsResponseDto {
  participants: ThreadParticipantDto[];
  total: number;
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * POST /api/v1/threads
 * Create a new thread in a chatroom
 *
 * Permissions: MEMBER (in chatroom)
 * Body: CreateThreadDto
 * Response: ThreadResponseDto
 */
export interface CreateThreadEndpoint {
  method: "POST";
  path: "/api/v1/threads";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  body: CreateThreadDto;
  response:
    | {
        status: 201;
        body: ThreadResponseDto;
      }
    | {
        status: 400;
        body: { code: string; message: string; details?: any };
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * GET /api/v1/threads
 * List threads for a chatroom
 *
 * Permissions: MEMBER (in chatroom)
 * Query: ?chatroomId=uuid&page=1&limit=20&search=term
 * Response: ThreadListResponseDto
 */
export interface ListThreadsEndpoint {
  method: "GET";
  path: "/api/v1/threads";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  query: {
    chatroomId: string;
    page?: number;
    limit?: number;
    search?: string;
  };
  response:
    | {
        status: 200;
        body: ThreadListResponseDto;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      };
}

/**
 * GET /api/v1/threads/:id
 * Get specific thread details
 *
 * Permissions: Thread participant (OWNER, MEMBER, VIEWER)
 * Response: ThreadResponseDto
 */
export interface GetThreadEndpoint {
  method: "GET";
  path: "/api/v1/threads/:id";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 200;
        body: ThreadResponseDto;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * PUT /api/v1/threads/:id
 * Update thread details
 *
 * Permissions: OWNER (thread owner)
 * Body: UpdateThreadDto
 * Response: ThreadResponseDto
 */
export interface UpdateThreadEndpoint {
  method: "PUT";
  path: "/api/v1/threads/:id";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  params: {
    id: string;
  };
  body: UpdateThreadDto;
  response:
    | {
        status: 200;
        body: ThreadResponseDto;
      }
    | {
        status: 400;
        body: { code: string; message: string; details?: any };
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * DELETE /api/v1/threads/:id
 * Delete a thread
 *
 * Permissions: OWNER (thread owner)
 * Response: Success confirmation
 */
export interface DeleteThreadEndpoint {
  method: "DELETE";
  path: "/api/v1/threads/:id";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 204;
        body: null;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * POST /api/v1/threads/:id/participants
 * Add participant to thread
 *
 * Permissions: OWNER, MEMBER (thread participants)
 * Body: AddThreadParticipantDto
 * Response: Success confirmation
 */
export interface AddThreadParticipantEndpoint {
  method: "POST";
  path: "/api/v1/threads/:id/participants";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  params: {
    id: string;
  };
  body: AddThreadParticipantDto;
  response:
    | {
        status: 201;
        body: { message: string };
      }
    | {
        status: 400;
        body: { code: string; message: string; details?: any };
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * PUT /api/v1/threads/:id/participants/:userId
 * Update thread participant role
 *
 * Permissions: OWNER (thread owner)
 * Body: UpdateThreadParticipantDto
 * Response: Success confirmation
 */
export interface UpdateThreadParticipantEndpoint {
  method: "PUT";
  path: "/api/v1/threads/:id/participants/:userId";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  params: {
    id: string;
    userId: string;
  };
  body: UpdateThreadParticipantDto;
  response:
    | {
        status: 200;
        body: { message: string };
      }
    | {
        status: 400;
        body: { code: string; message: string; details?: any };
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * DELETE /api/v1/threads/:id/participants/:userId
 * Remove participant from thread
 *
 * Permissions: OWNER (thread owner)
 * Response: Success confirmation
 */
export interface RemoveThreadParticipantEndpoint {
  method: "DELETE";
  path: "/api/v1/threads/:id/participants/:userId";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
    userId: string;
  };
  response:
    | {
        status: 204;
        body: null;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * GET /api/v1/threads/:id/participants
 * List thread participants
 *
 * Permissions: Thread participant (OWNER, MEMBER, VIEWER)
 * Query: ?page=1&limit=20
 * Response: ThreadParticipantsResponseDto
 */
export interface ListThreadParticipantsEndpoint {
  method: "GET";
  path: "/api/v1/threads/:id/participants";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  query?: {
    page?: number;
    limit?: number;
  };
  response:
    | {
        status: 200;
        body: ThreadParticipantsResponseDto;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * POST /api/v1/threads/:id/archive
 * Archive a thread
 *
 * Permissions: OWNER (thread owner)
 * Response: Success confirmation
 */
export interface ArchiveThreadEndpoint {
  method: "POST";
  path: "/api/v1/threads/:id/archive";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 200;
        body: { message: string };
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * POST /api/v1/threads/:id/unarchive
 * Unarchive a thread
 *
 * Permissions: OWNER (thread owner)
 * Response: Success confirmation
 */
export interface UnarchiveThreadEndpoint {
  method: "POST";
  path: "/api/v1/threads/:id/unarchive";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 200;
        body: { message: string };
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * POST /api/v1/threads/:id/share
 * Share a thread with another user
 *
 * Permissions: OWNER, MEMBER (thread participants)
 * Body: ShareThreadDto
 * Response: Success confirmation
 */
export interface ShareThreadEndpoint {
  method: "POST";
  path: "/api/v1/threads/:id/share";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  params: {
    id: string;
  };
  body: ShareThreadDto;
  response:
    | {
        status: 201;
        body: { message: string };
      }
    | {
        status: 400;
        body: { code: string; message: string; details?: any };
      }
    | {
        status: 401;
        body: { code: string; message: string };
      }
    | {
        status: 403;
        body: { code: string; message: string };
      }
    | {
        status: 404;
        body: { code: string; message: string };
      };
}

/**
 * GET /api/v1/threads/shared
 * List threads shared with the current user
 *
 * Permissions: Authenticated user
 * Query: ?page=1&limit=20&search=term
 * Response: ThreadListResponseDto
 */
export interface ListSharedThreadsEndpoint {
  method: "GET";
  path: "/api/v1/threads/shared";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  query?: {
    page?: number;
    limit?: number;
    search?: string;
  };
  response:
    | {
        status: 200;
        body: ThreadListResponseDto;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      };
}

// ============================================================================
// Error Codes
// ============================================================================

export const ThreadErrorCodes = {
  // Validation errors
  THREAD_TITLE_REQUIRED: "THREAD_TITLE_REQUIRED",
  THREAD_TITLE_TOO_LONG: "THREAD_TITLE_TOO_LONG",
  THREAD_DESCRIPTION_TOO_LONG: "THREAD_DESCRIPTION_TOO_LONG",
  INVALID_THREAD_ROLE: "INVALID_THREAD_ROLE",

  // Permission errors
  THREAD_ACCESS_DENIED: "THREAD_ACCESS_DENIED",
  THREAD_CREATE_PERMISSION_DENIED: "THREAD_CREATE_PERMISSION_DENIED",
  THREAD_UPDATE_PERMISSION_DENIED: "THREAD_UPDATE_PERMISSION_DENIED",
  THREAD_DELETE_PERMISSION_DENIED: "THREAD_DELETE_PERMISSION_DENIED",
  THREAD_PARTICIPANT_MANAGEMENT_DENIED: "THREAD_PARTICIPANT_MANAGEMENT_DENIED",

  // Business logic errors
  THREAD_NOT_FOUND: "THREAD_NOT_FOUND",
  CHATROOM_NOT_FOUND: "CHATROOM_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_PARTICIPANT: "USER_ALREADY_PARTICIPANT",
  USER_NOT_PARTICIPANT: "USER_NOT_PARTICIPANT",
  CANNOT_REMOVE_THREAD_OWNER: "CANNOT_REMOVE_THREAD_OWNER",
  THREAD_ALREADY_ARCHIVED: "THREAD_ALREADY_ARCHIVED",
  THREAD_NOT_ARCHIVED: "THREAD_NOT_ARCHIVED",

  // System errors
  THREAD_CREATE_FAILED: "THREAD_CREATE_FAILED",
  THREAD_UPDATE_FAILED: "THREAD_UPDATE_FAILED",
  THREAD_DELETE_FAILED: "THREAD_DELETE_FAILED",
} as const;

export type ThreadErrorCode =
  (typeof ThreadErrorCodes)[keyof typeof ThreadErrorCodes];
