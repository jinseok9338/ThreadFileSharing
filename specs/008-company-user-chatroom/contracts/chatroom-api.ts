/**
 * ChatRoom API Contracts
 *
 * RESTful API endpoints for chatroom management with permission-based access control
 * All endpoints require JWT authentication and appropriate role permissions
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateChatRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
  avatarUrl?: string;
}

export interface UpdateChatRoomDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export interface ChatRoomResponseDto {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  isPrivate: boolean;
  createdBy: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoomListResponseDto {
  chatrooms: ChatRoomResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface AddMemberDto {
  userId: string;
}

export interface RemoveMemberDto {
  userId: string;
}

export interface ChatRoomMemberDto {
  id: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface ChatRoomMembersResponseDto {
  members: ChatRoomMemberDto[];
  total: number;
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * POST /api/v1/chatrooms
 * Create a new chatroom in the user's company
 *
 * Permissions: MEMBER, ADMIN, OWNER
 * Body: CreateChatRoomDto
 * Response: ChatRoomResponseDto
 */
export interface CreateChatRoomEndpoint {
  method: "POST";
  path: "/api/v1/chatrooms";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  body: CreateChatRoomDto;
  response:
    | {
        status: 201;
        body: ChatRoomResponseDto;
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
      };
}

/**
 * GET /api/v1/chatrooms
 * List chatrooms for the user's company
 *
 * Permissions: MEMBER, ADMIN, OWNER
 * Query: ?page=1&limit=20&search=term
 * Response: ChatRoomListResponseDto
 */
export interface ListChatRoomsEndpoint {
  method: "GET";
  path: "/api/v1/chatrooms";
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
        body: ChatRoomListResponseDto;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      };
}

/**
 * GET /api/v1/chatrooms/:id
 * Get specific chatroom details
 *
 * Permissions: MEMBER (if public), ADMIN, OWNER
 * Response: ChatRoomResponseDto
 */
export interface GetChatRoomEndpoint {
  method: "GET";
  path: "/api/v1/chatrooms/:id";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 200;
        body: ChatRoomResponseDto;
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
 * PUT /api/v1/chatrooms/:id
 * Update chatroom details
 *
 * Permissions: ADMIN, OWNER (creator)
 * Body: UpdateChatRoomDto
 * Response: ChatRoomResponseDto
 */
export interface UpdateChatRoomEndpoint {
  method: "PUT";
  path: "/api/v1/chatrooms/:id";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  params: {
    id: string;
  };
  body: UpdateChatRoomDto;
  response:
    | {
        status: 200;
        body: ChatRoomResponseDto;
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
 * DELETE /api/v1/chatrooms/:id
 * Delete a chatroom
 *
 * Permissions: OWNER (creator only)
 * Response: Success confirmation
 */
export interface DeleteChatRoomEndpoint {
  method: "DELETE";
  path: "/api/v1/chatrooms/:id";
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
 * POST /api/v1/chatrooms/:id/members
 * Add member to chatroom
 *
 * Permissions: ADMIN, OWNER (creator)
 * Body: AddMemberDto
 * Response: Success confirmation
 */
export interface AddChatRoomMemberEndpoint {
  method: "POST";
  path: "/api/v1/chatrooms/:id/members";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  params: {
    id: string;
  };
  body: AddMemberDto;
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
 * DELETE /api/v1/chatrooms/:id/members/:userId
 * Remove member from chatroom
 *
 * Permissions: ADMIN, OWNER (creator)
 * Response: Success confirmation
 */
export interface RemoveChatRoomMemberEndpoint {
  method: "DELETE";
  path: "/api/v1/chatrooms/:id/members/:userId";
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
 * GET /api/v1/chatrooms/:id/members
 * List chatroom members
 *
 * Permissions: MEMBER (if public), ADMIN, OWNER
 * Query: ?page=1&limit=20
 * Response: ChatRoomMembersResponseDto
 */
export interface ListChatRoomMembersEndpoint {
  method: "GET";
  path: "/api/v1/chatrooms/:id/members";
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
        body: ChatRoomMembersResponseDto;
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

// ============================================================================
// Error Codes
// ============================================================================

export const ChatRoomErrorCodes = {
  // Validation errors
  CHATROOM_NAME_REQUIRED: "CHATROOM_NAME_REQUIRED",
  CHATROOM_NAME_TOO_LONG: "CHATROOM_NAME_TOO_LONG",
  CHATROOM_DESCRIPTION_TOO_LONG: "CHATROOM_DESCRIPTION_TOO_LONG",

  // Permission errors
  CHATROOM_ACCESS_DENIED: "CHATROOM_ACCESS_DENIED",
  CHATROOM_CREATE_PERMISSION_DENIED: "CHATROOM_CREATE_PERMISSION_DENIED",
  CHATROOM_UPDATE_PERMISSION_DENIED: "CHATROOM_UPDATE_PERMISSION_DENIED",
  CHATROOM_DELETE_PERMISSION_DENIED: "CHATROOM_DELETE_PERMISSION_DENIED",
  CHATROOM_MEMBER_MANAGEMENT_DENIED: "CHATROOM_MEMBER_MANAGEMENT_DENIED",

  // Business logic errors
  CHATROOM_NOT_FOUND: "CHATROOM_NOT_FOUND",
  CHATROOM_ALREADY_EXISTS: "CHATROOM_ALREADY_EXISTS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_MEMBER: "USER_ALREADY_MEMBER",
  USER_NOT_MEMBER: "USER_NOT_MEMBER",
  CANNOT_REMOVE_CREATOR: "CANNOT_REMOVE_CREATOR",

  // System errors
  CHATROOM_CREATE_FAILED: "CHATROOM_CREATE_FAILED",
  CHATROOM_UPDATE_FAILED: "CHATROOM_UPDATE_FAILED",
  CHATROOM_DELETE_FAILED: "CHATROOM_DELETE_FAILED",
} as const;

export type ChatRoomErrorCode =
  (typeof ChatRoomErrorCodes)[keyof typeof ChatRoomErrorCodes];
