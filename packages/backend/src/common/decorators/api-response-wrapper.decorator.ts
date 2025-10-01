import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Custom decorator to apply standard API response wrapper to Swagger documentation
 * Wraps the response in { status, timestamp, data } structure
 */
export function ApiSuccessResponse<T>(
  dataType: Type<T>,
  options?: Omit<ApiResponseOptions, 'schema' | 'type'>,
) {
  return applyDecorators(
    ApiResponse({
      ...options,
      status: options?.status || 200,
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-01T00:00:00.000Z',
          },
          data: {
            $ref: getSchemaPath(dataType),
          },
        },
        required: ['status', 'timestamp', 'data'],
      },
    }),
  );
}

/**
 * Custom decorator for array responses
 */
export function ApiSuccessArrayResponse<T>(
  dataType: Type<T>,
  options?: Omit<ApiResponseOptions, 'schema' | 'type'>,
) {
  return applyDecorators(
    ApiResponse({
      ...options,
      status: options?.status || 200,
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            example: 'success',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-10-01T00:00:00.000Z',
          },
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(dataType),
            },
          },
        },
        required: ['status', 'timestamp', 'data'],
      },
    }),
  );
}
