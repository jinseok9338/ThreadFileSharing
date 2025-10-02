/**
 * File API Contracts
 *
 * RESTful API endpoints for file management with storage integration
 * All endpoints require JWT authentication and appropriate permissions
 */

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface FileUploadDto {
  chatroomId?: string;
  threadId?: string;
  action: "CREATE_THREAD" | "SHARE_FILE";
}

export interface FileResponseDto {
  id: string;
  threadId?: string;
  chatroomId?: string;
  uploadedBy: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  hash: string;
  metadata?: Record<string, any>;
  isProcessed: boolean;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileListResponseDto {
  files: FileResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface FileUploadProgressDto {
  fileId: string;
  progress: number; // 0-100
  status: "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";
  message?: string;
}

export interface FileMetadataDto {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  hash: string;
  metadata?: Record<string, any>;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StorageQuotaDto {
  companyId: string;
  storageLimitBytes: number;
  storageUsedBytes: number;
  storageAvailableBytes: number;
  fileCount: number;
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * POST /api/v1/files/upload
 * Upload file with automatic thread creation or sharing
 *
 * Permissions: MEMBER (in chatroom/thread)
 * Body: FormData with file + FileUploadDto
 * Response: FileResponseDto
 */
export interface UploadFileEndpoint {
  method: "POST";
  path: "/api/v1/files/upload";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "multipart/form-data";
  };
  body: FormData & {
    file: File;
    chatroomId?: string;
    threadId?: string;
    action: "CREATE_THREAD" | "SHARE_FILE";
  };
  response:
    | {
        status: 201;
        body: FileResponseDto & {
          threadId?: string; // If CREATE_THREAD action
        };
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
        status: 413;
        body: { code: string; message: string }; // File too large
      }
    | {
        status: 507;
        body: { code: string; message: string }; // Insufficient storage
      };
}

/**
 * GET /api/v1/files
 * List files for a chatroom or thread
 *
 * Permissions: MEMBER (in chatroom/thread)
 * Query: ?chatroomId=uuid&threadId=uuid&page=1&limit=20&search=term
 * Response: FileListResponseDto
 */
export interface ListFilesEndpoint {
  method: "GET";
  path: "/api/v1/files";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  query: {
    chatroomId?: string;
    threadId?: string;
    page?: number;
    limit?: number;
    search?: string;
    mimeType?: string;
  };
  response:
    | {
        status: 200;
        body: FileListResponseDto;
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
 * GET /api/v1/files/:id
 * Get file metadata
 *
 * Permissions: MEMBER (in chatroom/thread containing file)
 * Response: FileMetadataDto
 */
export interface GetFileEndpoint {
  method: "GET";
  path: "/api/v1/files/:id";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 200;
        body: FileMetadataDto;
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
 * GET /api/v1/files/:id/download
 * Get file download URL
 *
 * Permissions: MEMBER (in chatroom/thread containing file)
 * Response: Signed download URL
 */
export interface DownloadFileEndpoint {
  method: "GET";
  path: "/api/v1/files/:id/download";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 200;
        body: {
          downloadUrl: string;
          expiresAt: string;
          filename: string;
          mimeType: string;
          sizeBytes: number;
        };
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
 * DELETE /api/v1/files/:id
 * Delete a file
 *
 * Permissions: OWNER (file uploader), ADMIN, OWNER (company)
 * Response: Success confirmation
 */
export interface DeleteFileEndpoint {
  method: "DELETE";
  path: "/api/v1/files/:id";
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
 * POST /api/v1/files/:id/process
 * Trigger file processing (thumbnails, previews, etc.)
 *
 * Permissions: OWNER (file uploader), ADMIN, OWNER (company)
 * Response: Processing status
 */
export interface ProcessFileEndpoint {
  method: "POST";
  path: "/api/v1/files/:id/process";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    id: string;
  };
  response:
    | {
        status: 202;
        body: {
          message: string;
          processId: string;
        };
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
 * GET /api/v1/files/upload/progress/:fileId
 * Get file upload progress
 *
 * Permissions: File uploader
 * Response: Upload progress
 */
export interface GetUploadProgressEndpoint {
  method: "GET";
  path: "/api/v1/files/upload/progress/:fileId";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  params: {
    fileId: string;
  };
  response:
    | {
        status: 200;
        body: FileUploadProgressDto;
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
 * GET /api/v1/files/storage/quota
 * Get company storage quota information
 *
 * Permissions: MEMBER, ADMIN, OWNER (company)
 * Response: Storage quota details
 */
export interface GetStorageQuotaEndpoint {
  method: "GET";
  path: "/api/v1/files/storage/quota";
  headers: {
    Authorization: string; // Bearer {jwt_token}
  };
  response:
    | {
        status: 200;
        body: StorageQuotaDto;
      }
    | {
        status: 401;
        body: { code: string; message: string };
      };
}

/**
 * POST /api/v1/files/:id/metadata
 * Update file metadata
 *
 * Permissions: OWNER (file uploader), ADMIN, OWNER (company)
 * Body: Partial metadata
 * Response: Updated file metadata
 */
export interface UpdateFileMetadataEndpoint {
  method: "POST";
  path: "/api/v1/files/:id/metadata";
  headers: {
    Authorization: string; // Bearer {jwt_token}
    "Content-Type": "application/json";
  };
  params: {
    id: string;
  };
  body: {
    metadata?: Record<string, any>;
  };
  response:
    | {
        status: 200;
        body: FileMetadataDto;
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

// ============================================================================
// WebSocket Events (Real-time file operations)
// ============================================================================

export interface FileUploadProgressEvent {
  event: "file_upload_progress";
  data: {
    fileId: string;
    progress: number;
    status: "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";
    message?: string;
  };
}

export interface FileProcessedEvent {
  event: "file_processed";
  data: {
    fileId: string;
    threadId?: string;
    chatroomId?: string;
    processedData?: {
      thumbnails?: string[];
      previewUrl?: string;
      extractedText?: string;
    };
  };
}

export interface FileDeletedEvent {
  event: "file_deleted";
  data: {
    fileId: string;
    threadId?: string;
    chatroomId?: string;
    deletedBy: string;
  };
}

// ============================================================================
// Error Codes
// ============================================================================

export const FileErrorCodes = {
  // Validation errors
  FILE_REQUIRED: "FILE_REQUIRED",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  INVALID_UPLOAD_ACTION: "INVALID_UPLOAD_ACTION",
  FILE_NAME_TOO_LONG: "FILE_NAME_TOO_LONG",

  // Permission errors
  FILE_ACCESS_DENIED: "FILE_ACCESS_DENIED",
  FILE_UPLOAD_PERMISSION_DENIED: "FILE_UPLOAD_PERMISSION_DENIED",
  FILE_DELETE_PERMISSION_DENIED: "FILE_DELETE_PERMISSION_DENIED",
  FILE_METADATA_UPDATE_DENIED: "FILE_METADATA_UPDATE_DENIED",

  // Business logic errors
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  CHATROOM_NOT_FOUND: "CHATROOM_NOT_FOUND",
  THREAD_NOT_FOUND: "THREAD_NOT_FOUND",
  STORAGE_QUOTA_EXCEEDED: "STORAGE_QUOTA_EXCEEDED",
  FILE_ALREADY_EXISTS: "FILE_ALREADY_EXISTS",
  FILE_PROCESSING_FAILED: "FILE_PROCESSING_FAILED",
  FILE_PROCESSING_NOT_SUPPORTED: "FILE_PROCESSING_NOT_SUPPORTED",

  // Storage errors
  STORAGE_UPLOAD_FAILED: "STORAGE_UPLOAD_FAILED",
  STORAGE_DELETE_FAILED: "STORAGE_DELETE_FAILED",
  STORAGE_ACCESS_FAILED: "STORAGE_ACCESS_FAILED",
  SIGNED_URL_GENERATION_FAILED: "SIGNED_URL_GENERATION_FAILED",

  // System errors
  FILE_CREATE_FAILED: "FILE_CREATE_FAILED",
  FILE_UPDATE_FAILED: "FILE_UPDATE_FAILED",
  FILE_DELETE_FAILED: "FILE_DELETE_FAILED",
} as const;

export type FileErrorCode =
  (typeof FileErrorCodes)[keyof typeof FileErrorCodes];


