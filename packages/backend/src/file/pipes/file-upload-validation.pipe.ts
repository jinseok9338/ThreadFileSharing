import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadValidationPipe implements PipeTransform {
  constructor(private readonly configService: ConfigService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    // Validate file size if it's a file upload request
    if (value && typeof value === 'object' && value.file) {
      const maxSize = this.configService.get<number>(
        'FILE_UPLOAD_MAX_SIZE_BYTES',
        5368709120, // 5GB default
      );

      if (value.file.size > maxSize) {
        throw new BadRequestException(
          `File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`,
        );
      }

      // Validate MIME type
      const allowedMimeTypes = this.configService
        .get<string>('FILE_UPLOAD_ALLOWED_MIMETYPES', '')
        .split(',')
        .filter(Boolean);

      if (
        allowedMimeTypes.length > 0 &&
        !allowedMimeTypes.includes(value.file.mimetype)
      ) {
        throw new BadRequestException(
          `File type '${value.file.mimetype}' is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
        );
      }
    }

    return value;
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
