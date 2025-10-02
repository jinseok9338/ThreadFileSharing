import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: string[] | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        code = this.getErrorCode(status, responseObj.error as string);

        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          details = responseObj.message as string[];
          message = 'Validation failed';
        }
      } else {
        message = exceptionResponse;
        code = this.getErrorCode(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // Don't expose internal error details in production
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error';
      }
    }

    const errorResponse = new ApiErrorResponse(
      code,
      message,
      request.url,
      details,
    );

    response.status(status).send(errorResponse);
  }

  private getErrorCode(status: number, error?: string): string {
    // Map HTTP status codes to error codes
    const statusCodeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      423: 'LOCKED',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    // If error string is provided and looks like an error code, use it
    if (error && error.toUpperCase() === error.replace(/\s+/g, '_')) {
      return error.toUpperCase().replace(/\s+/g, '_');
    }

    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }
}
