import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API Response wrapper
 * All API responses follow this structure
 */
export class ApiResponse<T = any> {
  @ApiProperty({
    description: 'Response status',
    enum: ['success', 'error'],
    example: 'success',
  })
  status: 'success' | 'error';

  @ApiProperty({
    description: 'Response timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  constructor(data: T, status: 'success' | 'error' = 'success') {
    this.status = status;
    this.timestamp = new Date().toISOString();
    this.data = data;
  }

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse(data, 'success');
  }
}

/**
 * Standard API Error Response
 * Used for all error responses
 */
export class ApiErrorResponse {
  @ApiProperty({
    description: 'Response status',
    enum: ['error'],
    example: 'error',
  })
  status: 'error';

  @ApiProperty({
    description: 'Response timestamp',
    example: '2025-10-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Error details',
    example: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: ['email must be a valid email'],
    },
  })
  error: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({ description: 'Request path', example: '/api/v1/auth/login' })
  path: string;

  constructor(code: string, message: string, path: string, details?: any) {
    this.status = 'error';
    this.timestamp = new Date().toISOString();
    this.error = {
      code,
      message,
      ...(details && { details }),
    };
    this.path = path;
  }
}

/**
 * Paginated Response Data
 * Used for list endpoints with pagination
 */
export class PaginatedData<T = any> {
  @ApiProperty({ description: 'Array of items' })
  items: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(items: T[], page: number, limit: number, total: number) {
    this.items = items;
    this.meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

/**
 * Message-only Response Data
 * Used for operations that don't return complex data
 */
export class MessageData {
  @ApiProperty({ description: 'Success message' })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

/**
 * Helper function to create Swagger response schema with wrapper
 */
export function createApiResponseSchema(dataType: any) {
  return {
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        example: 'success',
      },
      timestamp: {
        type: 'string',
        example: '2025-10-01T00:00:00.000Z',
      },
      data: {
        $ref: `#/components/schemas/${dataType.name}`,
      },
    },
  };
}
