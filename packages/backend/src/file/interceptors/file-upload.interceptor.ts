import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FileUploadInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    // Log file upload attempts
    if (request.file || request.files) {
      const files = request.files || [request.file];
      const fileInfo = files.map((file: any) => ({
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      }));

      this.logger.log(
        `File upload attempt: ${method} ${url} - Files: ${JSON.stringify(fileInfo)}`,
      );
    }

    return next.handle().pipe(
      tap((data) => {
        // Log successful uploads
        if (data && (data.fileId || data.uploadSessionId)) {
          this.logger.log(
            `File upload successful: ${method} ${url} - Result: ${JSON.stringify(
              {
                fileId: data.fileId,
                uploadSessionId: data.uploadSessionId,
              },
            )}`,
          );
        }
      }),
    );
  }
}
